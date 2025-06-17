const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');
const validator = require('validator');
const winston = require('winston');
const { v4: uuidv4 } = require('uuid');

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/dry-mill.log' })
  ]
});

// Middleware for input sanitization
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = validator.trim(obj[key]);
        if (key.toLowerCase().includes('number') || key.toLowerCase().includes('id')) {
          obj[key] = validator.escape(obj[key]);
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };
  sanitize(req.body);
  sanitize(req.params);
  sanitize(req.query);
  next();
};

router.use(sanitizeInput);

// GET route for ProcessingTypes
router.get('/processing-types', async (req, res) => {
  try {
    const processingTypes = await sequelize.query(
      'SELECT id, "processingType", abbreviation FROM "ProcessingTypes" ORDER BY id',
      { type: sequelize.QueryTypes.SELECT }
    );
    logger.info('Fetched ProcessingTypes successfully', { user: req.body.createdBy || 'unknown' });
    res.status(200).json(processingTypes);
  } catch (error) {
    logger.error('Error fetching ProcessingTypes', { error: error.message, stack: error.stack, user: req.body.createdBy || 'unknown' });
    res.status(500).json({ error: 'Failed to fetch ProcessingTypes', details: error.message });
  }
});

// GET route for ProductLines
router.get('/product-lines', async (req, res) => {
  try {
    const productLines = await sequelize.query(
      'SELECT id, "productLine", abbreviation FROM "ProductLines" ORDER BY id',
      { type: sequelize.QueryTypes.SELECT }
    );
    logger.info('Fetched ProductLines successfully', { user: req.body.createdBy || 'unknown' });
    res.status(200).json(productLines);
  } catch (error) {
    logger.error('Error fetching ProductLines', { error: error.message, stack: error.stack, user: req.body.createdBy || 'unknown' });
    res.status(500).json({ error: 'Failed to fetch ProductLines', details: error.message });
  }
});

// GET route for ReferenceMappings
router.get('/reference-mappings', async (req, res) => {
  try {
    const referenceMappings = await sequelize.query(
      'SELECT id, "referenceNumber", "productLine", "processingType", producer, quality, type FROM "ReferenceMappings_duplicate" ORDER BY id',
      { type: sequelize.QueryTypes.SELECT }
    );
    logger.info('Fetched ReferenceMappings successfully', { user: req.body.createdBy || 'unknown' });
    res.status(200).json(referenceMappings);
  } catch (error) {
    logger.error('Error fetching ReferenceMappings', { error: error.message, stack: error.stack, user: req.body.createdBy || 'unknown' });
    res.status(500).json({ error: 'Failed to fetch ReferenceMappings', details: error.message });
  }
});

// GET route for dry mill grades by batch number
router.get('/dry-mill-grades/:batchNumber', async (req, res) => {
  const { batchNumber } = req.params;
  let { processingType } = req.query;

  if (!batchNumber || !processingType) {
    logger.warn('Missing required parameters', { batchNumber, processingType, user: req.body.createdBy || 'unknown' });
    return res.status(400).json({ error: 'batchNumber and processingType query parameter are required.' });
  }

  let t;
  try {
    t = await sequelize.transaction();

    processingType = processingType.replace(/\+/g, ' ').trim();

    const [batch] = await sequelize.query(`
      SELECT "batchNumber", "type"
      FROM "ReceivingData"
      WHERE "batchNumber" = :batchNumber
      LIMIT 1
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    let validProcessingType;
    let isGreenBeans = batch?.type === 'Green Beans';

    if (isGreenBeans) {
      processingType = 'Dry';
      validProcessingType = { processingType: 'Dry' };
    } else {
      const [subBatch] = await sequelize.query(`
        SELECT "batchNumber", "parentBatchNumber", "quality", "processingType"
        FROM "PostprocessingData"
        WHERE "batchNumber" = :batchNumber
        AND "processingType" = :processingType
        LIMIT 1
      `, {
        replacements: { batchNumber, processingType },
        type: sequelize.QueryTypes.SELECT,
        transaction: t
      });

      if (subBatch && subBatch.parentBatchNumber) {
        validProcessingType = subBatch;
      } else {
        [validProcessingType] = await sequelize.query(`
          SELECT "processingType"
          FROM "PreprocessingData"
          WHERE "batchNumber" = :batchNumber
          AND "processingType" = :processingType
          LIMIT 1
        `, {
          replacements: { batchNumber, processingType },
          type: sequelize.QueryTypes.SELECT,
          transaction: t
        });
      }

      if (!validProcessingType) {
        await t.rollback();
        logger.warn('Invalid processing type', { batchNumber, processingType, user: req.body.createdBy || 'unknown' });
        return res.status(400).json({ error: 'Invalid processing type for this batch.' });
      }
    }

    let grades;
    let relevantBatchNumber = batchNumber;

    if (!isGreenBeans && validProcessingType.parentBatchNumber) {
      relevantBatchNumber = validProcessingType.parentBatchNumber;
      grades = await sequelize.query(`
        SELECT 
          dg."subBatchId", dg.grade, dg.weight, dg.bagged_at, dg.is_stored,
          ARRAY_AGG(bd.weight) FILTER (WHERE bd.weight IS NOT NULL) AS bagWeights,
          COALESCE(dg.temp_sequence, '0001') AS temp_sequence
        FROM "DryMillGrades" dg
        LEFT JOIN "BagDetails" bd ON LOWER(dg."subBatchId") = LOWER(bd.grade_id)
        WHERE dg."batchNumber" = :parentBatchNumber
          AND LOWER(dg.grade) = LOWER(:quality)
          AND dg.processing_type = :processingType
        GROUP BY dg."subBatchId", dg.grade, dg.weight, dg.bagged_at, dg.is_stored, dg.temp_sequence
      `, {
        replacements: { parentBatchNumber: validProcessingType.parentBatchNumber, quality: validProcessingType.quality, processingType },
        type: sequelize.QueryTypes.SELECT,
        transaction: t
      });
    } else {
      grades = await sequelize.query(`
        SELECT 
          dg."subBatchId", dg.grade, dg.weight, dg.bagged_at, dg.is_stored,
          ARRAY_AGG(bd.weight) FILTER (WHERE bd.weight IS NOT NULL) AS bagWeights,
          COALESCE(dg.temp_sequence, '0001') AS temp_sequence
        FROM "DryMillGrades" dg
        LEFT JOIN "BagDetails" bd ON LOWER(dg."subBatchId") = LOWER(bd.grade_id)
        WHERE dg."batchNumber" = :batchNumber
          AND dg.processing_type = :processingType
        GROUP BY dg."subBatchId", dg.grade, dg.weight, dg.bagged_at, dg.is_stored, dg.temp_sequence
      `, {
        replacements: { batchNumber, processingType },
        type: sequelize.QueryTypes.SELECT,
        transaction: t
      });
    }

    for (let grade of grades) {
      if (!grade.bagWeights || grade.bagWeights.length === 0 || grade.bagWeights[0] === null) {
        const bagDetails = await sequelize.query(`
          SELECT weight
          FROM "BagDetails"
          WHERE LOWER(grade_id) = LOWER(:subBatchId)
          ORDER BY bag_number
        `, {
          replacements: { subBatchId: grade.subBatchId },
          type: sequelize.QueryTypes.SELECT,
          transaction: t
        });
        grade.bagWeights = bagDetails.map(bd => bd.weight).filter(w => w !== null);
      }
    }

    const formattedGrades = grades.map(g => ({
      subBatchId: g.subBatchId,
      grade: g.grade,
      weight: g.weight ? parseFloat(g.weight).toFixed(2) : '0.00',
      bagWeights: Array.isArray(g.bagWeights) && g.bagWeights.length > 0 && g.bagWeights[0] !== null ? g.bagWeights.map(w => String(w)) : [],
      bagged_at: g.bagged_at ? new Date(g.bagged_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      is_stored: g.is_stored || false,
      tempSequence: g.temp_sequence || '0001'
    }));

    if (formattedGrades.length === 0) {
      const subBatchIdPrefix = isGreenBeans ? batchNumber : relevantBatchNumber;
      const defaultGrades = ['Specialty Grade', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4'];
      formattedGrades.push(...defaultGrades.map(grade => ({
        subBatchId: `${subBatchIdPrefix}-${grade.replace(/\s+/g, '-')}`,
        grade,
        weight: '0.00',
        bagWeights: [],
        bagged_at: new Date().toISOString().split('T')[0],
        is_stored: false,
        tempSequence: '0001'
      })));
    }

    await t.commit();
    logger.info('Fetched grades successfully', { batchNumber, processingType, user: req.body.createdBy || 'unknown' });
    res.status(200).json(formattedGrades);
  } catch (error) {
    if (t) await t.rollback();
    logger.error('Error fetching grades', { batchNumber, processingType, error: error.message, stack: error.stack, user: req.body.createdBy || 'unknown' });
    res.status(500).json({ error: 'Failed to fetch grades', details: error.message });
  }
});

// POST route for manual green bean splitting, weighing, and bagging
router.post('/dry-mill/:batchNumber/split', async (req, res) => {
  const { batchNumber } = req.params;
  const { grades, processingType } = req.body;

  if (!batchNumber || !grades || !Array.isArray(grades) || grades.length === 0 || !processingType) {
    logger.warn('Invalid split request', { batchNumber, gradesProvided: !!grades, processingType, user: req.body.createdBy || 'unknown' });
    return res.status(400).json({ error: 'Batch number, valid grades, and processingType are required.' });
  }

  const validGrades = grades.filter(g => Array.isArray(g.bagWeights) && g.bagWeights.length > 0);
  if (validGrades.length === 0) {
    logger.warn('No valid grades with bags', { batchNumber, processingType, user: req.body.createdBy || 'unknown' });
    return res.status(400).json({ error: 'At least one grade must have bags added.' });
  }

  let t;
  try {
    t = await sequelize.transaction();

    const [batch] = await sequelize.query(`
      SELECT "batchNumber", "type", "producer", "farmerName", "productLine"
      FROM "ReceivingData"
      WHERE "batchNumber" = :batchNumber
      LIMIT 1
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    if (!batch) {
      await t.rollback();
      logger.warn('Batch not found', { batchNumber, user: req.body.createdBy || 'unknown' });
      return res.status(404).json({ error: 'Batch not found.' });
    }

    let dryMillEntry;
    let productLine = batch.productLine;
    let producer = batch.producer;

    if (batch.type === 'Green Beans') {
      [dryMillEntry] = await sequelize.query(`
        SELECT "entered_at"
        FROM "DryMillData"
        WHERE "batchNumber" = :batchNumber
        AND "entered_at" IS NOT NULL
        LIMIT 1
      `, {
        replacements: { batchNumber },
        type: sequelize.QueryTypes.SELECT,
        transaction: t
      });
    } else {
      [dryMillEntry] = await sequelize.query(`
        SELECT dm."entered_at", pp."processingType", pp."productLine", pp."producer"
        FROM "DryMillData" dm
        JOIN "PreprocessingData" pp ON dm."batchNumber" = pp."batchNumber"
        WHERE dm."batchNumber" = :batchNumber
        AND pp."processingType" = :processingType
        AND dm."entered_at" IS NOT NULL
        LIMIT 1
      `, {
        replacements: { batchNumber, processingType },
        type: sequelize.QueryTypes.SELECT,
        transaction: t
      });
      productLine = dryMillEntry?.productLine || productLine;
      producer = dryMillEntry?.producer || producer;
    }

    if (!dryMillEntry) {
      await t.rollback();
      logger.warn('Batch not entered', { batchNumber, processingType, user: req.body.createdBy || 'unknown' });
      return res.status(400).json({ error: 'Batch must be entered into dry mill first.' });
    }

    const currentYear = new Date().getFullYear().toString().slice(-2);
    const [productLineEntry] = await sequelize.query(`
      SELECT abbreviation
      FROM "ProductLines"
      WHERE "productLine" = :productLine
      LIMIT 1
    `, {
      replacements: { productLine },
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    const [processingTypeEntry] = await sequelize.query(`
      SELECT abbreviation
      FROM "ProcessingTypes"
      WHERE "processingType" = :processingType
      LIMIT 1
    `, {
      replacements: { processingType: batch.type === 'Green Beans' ? 'Dry' : processingType },
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    if (!productLineEntry || !processingTypeEntry) {
      await t.rollback();
      logger.warn('Invalid product line or processing type', { batchNumber, processingType, user: req.body.createdBy || 'unknown' });
      return res.status(400).json({ error: 'Invalid product line or processing type.' });
    }

    const producerAbbreviation = producer === 'BTM' ? 'BTM' : 'HQ';
    const productLineAbbreviation = productLineEntry.abbreviation;
    const processingTypeAbbreviation = processingTypeEntry.abbreviation;
    const batchPrefix = `${producerAbbreviation}${currentYear}${productLineAbbreviation}-${processingTypeAbbreviation}`;

    const results = [];
    const subBatches = [];

    for (const { grade, bagWeights, bagged_at, tempSequence } of validGrades) {
      if (!grade || typeof grade !== 'string' || grade.trim() === '') {
        await t.rollback();
        logger.warn('Invalid grade', { batchNumber, processingType, grade, user: req.body.createdBy || 'unknown' });
        return res.status(400).json({ error: 'Each entry must have a valid grade.' });
      }

      const weights = bagWeights.map(w => {
        const weightNum = parseFloat(w);
        if (isNaN(weightNum) || weightNum <= 0) {
          throw new Error(`Invalid weight for grade ${grade}: must be a positive number.`);
        }
        return weightNum;
      });
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      const baggedAtValue = bagged_at || new Date().toISOString().split('T')[0];
      const subBatchId = `${batchNumber}-${grade.replace(/\s+/g, '-')}`;

      let sequenceNumber = parseInt(tempSequence, 10) || 1;
      const [sequenceResult] = await sequelize.query(
        `SELECT sequence FROM "LotNumberSequences" 
         WHERE producer = :producer AND productLine = :productLine 
         AND processingType = :processingType AND year = :year AND grade = :grade 
         FOR UPDATE`,
        { 
          replacements: { 
            producer, 
            productLine, 
            processingType: batch.type === 'Green Beans' ? 'Dry' : processingType, 
            year: currentYear,
            grade
          }, 
          transaction: t,
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (sequenceResult) {
        sequenceNumber = Math.max(sequenceNumber, sequenceResult.sequence);
      }

      const formattedSequence = String(sequenceNumber).padStart(4, '0');
      const qualityAbbreviation = grade === 'Specialty Grade' ? 'S' : grade.replace('Grade ', 'G');
      const newBatchNumber = `${batchPrefix}-${formattedSequence}-${qualityAbbreviation}`;

      await sequelize.query(`
        INSERT INTO "DryMillGrades" (
          "batchNumber", "subBatchId", grade, weight, split_at, bagged_at, is_stored, processing_type, temp_sequence, "createdAt", "updatedAt"
        ) VALUES (
          :batchNumber, :subBatchId, :grade, :weight, NOW(), :bagged_at, FALSE, :processingType, :tempSequence, NOW(), NOW()
        )
        ON CONFLICT ("subBatchId") DO UPDATE SET
          weight = :weight,
          bagged_at = :bagged_at,
          temp_sequence = :tempSequence,
          is_stored = FALSE,
          processing_type = :processingType,
          "updatedAt" = NOW()
      `, {
        replacements: {
          batchNumber,
          subBatchId,
          grade,
          weight: totalWeight.toFixed(2),
          bagged_at: baggedAtValue,
          processingType: batch.type === 'Green Beans' ? 'Dry' : processingType,
          tempSequence: formattedSequence
        },
        type: sequelize.QueryTypes.INSERT,
        transaction: t
      });

      await sequelize.query(`
        DELETE FROM "BagDetails"
        WHERE grade_id = :subBatchId
      `, {
        replacements: { subBatchId },
        transaction: t
      });

      for (let i = 0; i < weights.length; i++) {
        await sequelize.query(`
          INSERT INTO "BagDetails" (
            grade_id, bag_number, weight, bagged_at, is_stored, "createdAt", "updatedAt"
          ) VALUES (
            :gradeId, :bagNumber, :weight, :baggedAt, FALSE, NOW(), NOW()
          )
        `, {
          replacements: {
            gradeId: subBatchId,
            bagNumber: i + 1,
            weight: weights[i].toFixed(2),
            baggedAt: baggedAtValue
          },
          type: sequelize.QueryTypes.INSERT,
          transaction: t
        });
      }

      const [referenceResult] = await sequelize.query(`
        SELECT "referenceNumber"
        FROM "ReferenceMappings_duplicate"
        WHERE "productLine" = :productLine
        AND "processingType" = :processingType
        AND "producer" = :producer
        AND "type" = :type
        LIMIT 1
      `, {
        replacements: {
          productLine,
          processingType: batch.type === 'Green Beans' ? 'Dry' : processingType,
          producer,
          type: batch.type
        },
        type: sequelize.QueryTypes.SELECT,
        transaction: t
      });

      if (!referenceResult) {
        await t.rollback();
        logger.warn('No reference number found', { batchNumber, processingType, grade, user: req.body.createdBy || 'unknown' });
        return res.status(400).json({ error: `No matching reference number found for grade ${grade}.` });
      }

      let qualitySuffix;
      switch (grade) {
        case 'Specialty Grade': qualitySuffix = '-S'; break;
        case 'Grade 1': qualitySuffix = '-G1'; break;
        case 'Grade 2': qualitySuffix = '-G2'; break;
        case 'Grade 3': qualitySuffix = '-G3'; break;
        case 'Grade 4': qualitySuffix = '-G4'; break;
        default:
          await t.rollback();
          logger.warn('Invalid grade suffix', { batchNumber, processingType, grade, user: req.body.createdBy || 'unknown' });
          return res.status(400).json({ error: `Invalid grade: ${grade}.` });
      }

      const referenceNumber = `${referenceResult.referenceNumber}${qualitySuffix}`;

      await sequelize.query(`
        INSERT INTO "PostprocessingData" (
          "batchNumber", "referenceNumber", "processingType", "productLine", weight, "totalBags", 
          notes, quality, producer, "farmerName", "parentBatchNumber", "createdAt", "updatedAt"
        ) VALUES (
          :batchNumber, :referenceNumber, :processingType, :productLine, :weight, :totalBags, 
          :notes, :quality, :producer, :farmerName, :parentBatchNumber, NOW(), NOW()
        )
        ON CONFLICT ("batchNumber") DO UPDATE SET
          weight = :weight,
          "totalBags" = :totalBags,
          "updatedAt" = NOW()
      `, {
        replacements: {
          batchNumber: newBatchNumber,
          referenceNumber,
          processingType: batch.type === 'Green Beans' ? 'Dry' : processingType,
          productLine,
          weight: totalWeight.toFixed(2),
          totalBags: weights.length,
          notes: '',
          quality: grade,
          producer,
          farmerName: batch.farmerName,
          parentBatchNumber: batchNumber
        },
        type: sequelize.QueryTypes.INSERT,
        transaction: t
      });

      await sequelize.query(`
        INSERT INTO "LotNumberSequences" (
          producer, productLine, processingType, year, grade, sequence
        ) VALUES (
          :producer, :productLine, :processingType, :year, :grade, :sequence
        )
        ON CONFLICT (producer, productLine, processingType, year, grade) 
        DO UPDATE SET sequence = :sequence
      `, {
        replacements: {
          producer,
          productLine,
          processingType: batch.type === 'Green Beans' ? 'Dry' : processingType,
          year: currentYear,
          grade,
          sequence: sequenceNumber + 1
        },
        type: sequelize.QueryTypes.INSERT,
        transaction: t
      });

      results.push({ subBatchId, grade, weight: totalWeight.toFixed(2), bagWeights: weights, bagged_at: baggedAtValue });
      subBatches.push({ batchNumber: newBatchNumber, referenceNumber, quality: grade });
    }

    await t.commit();
    logger.info('Green bean splits saved successfully', { batchNumber, processingType, subBatches: subBatches.length, user: req.body.createdBy || 'unknown' });
    res.status(201).json({ message: 'Green bean splits saved successfully', grades: results, subBatches });
  } catch (error) {
    if (t) await t.rollback();
    logger.error('Error saving green bean splits', { batchNumber, processingType, error: error.message, stack: error.stack, user: req.body.createdBy || 'unknown' });
    res.status(500).json({ error: 'Failed to save green bean splits', details: error.message });
  }
});

// POST route to update bags for a specific grade (sub-batch)
router.post('/dry-mill/:batchNumber/update-bags', async (req, res) => {
  const { batchNumber } = req.params;
  const { grade, bagWeights, bagged_at, processingType } = req.body;

  if (!batchNumber || !grade || !Array.isArray(bagWeights) || !processingType) {
    logger.warn('Invalid update-bags request', { batchNumber, grade, bagWeightsProvided: !!bagWeights, processingType, user: req.body.createdBy || 'unknown' });
    return res.status(400).json({ error: 'Batch number, grade, bag weights, and processingType are required.' });
  }

  let t;
  try {
    t = await sequelize.transaction();

    const [batch] = await sequelize.query(`
      SELECT "batchNumber", "type"
      FROM "ReceivingData"
      WHERE "batchNumber" = :batchNumber
      LIMIT 1
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    if (!batch) {
      await t.rollback();
      logger.warn('Batch not found', { batchNumber, user: req.body.createdBy || 'unknown' });
      return res.status(404).json({ error: 'Batch not found.' });
    }

    let validProcessingType;
    if (batch.type === 'Green Beans') {
      validProcessingType = { processingType: 'Dry' };
    } else {
      [validProcessingType] = await sequelize.query(`
        SELECT "processingType"
        FROM "PreprocessingData"
        WHERE "batchNumber" = :batchNumber
        AND "processingType" = :processingType
        LIMIT 1
      `, {
        replacements: { batchNumber, processingType },
        type: sequelize.QueryTypes.SELECT,
        transaction: t
      });

      if (!validProcessingType) {
        await t.rollback();
        logger.warn('Invalid processing type', { batchNumber, processingType, user: req.body.createdBy || 'unknown' });
        return res.status(400).json({ error: 'Invalid processing type for this batch.' });
      }
    }

    const [subBatch] = await sequelize.query(`
      SELECT "batchNumber", "parentBatchNumber", "quality", "processingType"
      FROM "PostprocessingData"
      WHERE "batchNumber" = :batchNumber
      AND "quality" = :grade
      AND "processingType" = :processingType
      LIMIT 1
    `, {
      replacements: { batchNumber, grade, processingType: batch.type === 'Green Beans' ? 'Dry' : processingType },
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    if (!subBatch) {
      await t.rollback();
      logger.warn('Sub-batch not found', { batchNumber, grade, processingType, user: req.body.createdBy || 'unknown' });
      return res.status(404).json({ error: 'Sub-batch not found or grade/processingType does not match.' });
    }

    const parentBatchNumber = subBatch.parentBatchNumber;
    const subBatchId = `${parentBatchNumber}-${grade.replace(/\s+/g, '-')}`;

    const weights = bagWeights.map(w => {
      const weightNum = parseFloat(w);
      if (isNaN(weightNum) || weightNum <= 0) {
        throw new Error(`Invalid weight for grade ${grade}: must be a positive number.`);
      }
      return weightNum;
    });
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const baggedAtValue = bagged_at || new Date().toISOString().split('T')[0];

    await sequelize.query(`
      DELETE FROM "BagDetails"
      WHERE grade_id = :subBatchId
    `, {
      replacements: { subBatchId },
      transaction: t
    });

    await sequelize.query(`
      INSERT INTO "DryMillGrades" (
        "batchNumber", "subBatchId", grade, weight, split_at, bagged_at, is_stored, processing_type, "createdAt", "updatedAt"
      ) VALUES (
        :parentBatchNumber, :subBatchId, :grade, :weight, NOW(), :bagged_at, FALSE, :processingType, NOW(), NOW()
      )
      ON CONFLICT ("subBatchId") DO UPDATE SET
        weight = :weight,
        bagged_at = :bagged_at,
        is_stored = FALSE,
        processing_type = :processingType,
        "updatedAt" = NOW()
    `, {
      replacements: {
        parentBatchNumber,
        subBatchId,
        grade,
        weight: totalWeight.toFixed(2),
        bagged_at: baggedAtValue,
        processingType: batch.type === 'Green Beans' ? 'Dry' : processingType
      },
      type: sequelize.QueryTypes.INSERT,
      transaction: t
    });

    for (let i = 0; i < weights.length; i++) {
      await sequelize.query(`
        INSERT INTO "BagDetails" (
          grade_id, bag_number, weight, bagged_at, is_stored, "createdAt", "updatedAt"
        ) VALUES (
          :gradeId, :bagNumber, :weight, :baggedAt, FALSE, NOW(), NOW()
        )
      `, {
        replacements: {
          gradeId: subBatchId,
          bagNumber: i + 1,
          weight: weights[i].toFixed(2),
          baggedAt: baggedAtValue
        },
        type: sequelize.QueryTypes.INSERT,
        transaction: t
      });
    }

    await sequelize.query(`
      UPDATE "PostprocessingData"
      SET weight = :weight, "totalBags" = :totalBags, "updatedAt" = NOW()
      WHERE "batchNumber" = :batchNumber AND "processingType" = :processingType
    `, {
      replacements: {
        batchNumber,
        weight: totalWeight.toFixed(2),
        totalBags: weights.length,
        processingType: batch.type === 'Green Beans' ? 'Dry' : processingType
      },
      type: sequelize.QueryTypes.UPDATE,
      transaction: t
    });

    await t.commit();
    logger.info('Bags updated successfully', { batchNumber, grade, processingType, user: req.body.createdBy || 'unknown' });
    res.status(200).json({ message: 'Bags updated successfully', grade, weight: totalWeight.toFixed(2), bagWeights: weights });
  } catch (error) {
    if (t) await t.rollback();
    logger.error('Error updating bags', { batchNumber, grade, processingType, error: error.message, stack: error.stack, user: req.body.createdBy || 'unknown' });
    res.status(500).json({ error: 'Failed to update bags', details: error.message });
  }
});

// POST route to complete a batch
router.post('/dry-mill/:batchNumber/complete', async (req, res) => {
  const { batchNumber } = req.params;
  const { createdBy, updatedBy } = req.body;

  if (!batchNumber || !createdBy || !updatedBy) {
    logger.warn('Missing required parameters', { batchNumber, createdBy, updatedBy, user: createdBy || 'unknown' });
    return res.status(400).json({ error: 'batchNumber, createdBy, and updatedBy are required.' });
  }

  let t;
  try {
    t = await sequelize.transaction();

    const [batch] = await sequelize.query(`
      SELECT "batchNumber", "type", rfid
      FROM "ReceivingData"
      WHERE "batchNumber" = :batchNumber
      LIMIT 1
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    if (!batch) {
      await t.rollback();
      logger.warn('Batch not found', { batchNumber, user: createdBy });
      return res.status(404).json({ error: 'Batch not found.' });
    }

    const [dryMillEntry] = await sequelize.query(`
      SELECT entered_at, exited_at
      FROM "DryMillData"
      WHERE "batchNumber" = :batchNumber
      LIMIT 1
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    if (!dryMillEntry || dryMillEntry.exited_at) {
      await t.rollback();
      logger.warn('Batch not in dry mill or already processed', { batchNumber, user: createdBy });
      return res.status(400).json({ error: 'Batch is not in dry mill or already processed.' });
    }

    let processingTypes = [];
    if (batch.type !== 'Green Beans') {
      processingTypes = await sequelize.query(`
        SELECT DISTINCT "processingType"
        FROM "PreprocessingData"
        WHERE "batchNumber" = :batchNumber
      `, {
        replacements: { batchNumber },
        type: sequelize.QueryTypes.SELECT,
        transaction: t
      }).then(results => results.map(pt => pt.processingType));

      const subBatchTypes = await sequelize.query(`
        SELECT DISTINCT "processingType"
        FROM "PostprocessingData"
        WHERE "parentBatchNumber" = :batchNumber
      `, {
        replacements: { batchNumber },
        type: sequelize.QueryTypes.SELECT,
        transaction: t
      }).then(results => results.map(sb => sb.processingType));

      const missingTypes = processingTypes.filter(pt => !subBatchTypes.includes(pt));
      if (missingTypes.length > 0) {
        await t.rollback();
        logger.warn('Missing sub-batches for processing types', { batchNumber, missingTypes, user: createdBy });
        return res.status(400).json({ error: `Missing sub-batches for processing types: ${missingTypes.join(', ')}` });
      }

      for (const pt of processingTypes) {
        const grades = await sequelize.query(`
          SELECT grade, weight, bagged_at, is_stored
          FROM "DryMillGrades"
          WHERE "batchNumber" = :batchNumber
          AND processing_type = :processingType
        `, {
          replacements: { batchNumber, processingType: pt },
          type: sequelize.QueryTypes.SELECT,
          transaction: t
        });

        const hasValidSplits = grades.some(g => parseFloat(g.weight) > 0 && g.bagged_at && !g.is_stored);
        if (!hasValidSplits) {
          await t.rollback();
          logger.warn('No valid splits for processing type', { batchNumber, processingType: pt, user: createdBy });
          return res.status(400).json({ error: `No valid splits for processing type ${pt}.` });
        }
      }
    } else {
      const grades = await sequelize.query(`
        SELECT grade, weight, bagged_at, is_stored
        FROM "DryMillGrades"
        WHERE "batchNumber" = :batchNumber
        AND processing_type = 'Dry'
      `, {
        replacements: { batchNumber },
        type: sequelize.QueryTypes.SELECT,
        transaction: t
      });

      const hasValidSplits = grades.some(g => parseFloat(g.weight) > 0 && g.bagged_at && !g.is_stored);
      if (!hasValidSplits) {
        await t.rollback();
        logger.warn('No valid splits for green beans', { batchNumber, user: createdBy });
        return res.status(400).json({ error: 'No valid splits for green beans.' });
      }
    }

    const [cherryInventory] = await sequelize.query(`
      SELECT status, orderId
      FROM "CherryInventoryStatus"
      WHERE "batchNumber" = :batchNumber
      AND "exitedAt" IS NULL
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    if (cherryInventory && cherryInventory.orderId) {
      await t.rollback();
      logger.warn('Batch reserved for order', { batchNumber, orderId: cherryInventory.orderId, user: createdBy });
      return res.status(400).json({ error: 'Cannot complete batch: cherry batch is reserved for an order.' });
    }

    const [result] = await sequelize.query(`
      UPDATE "DryMillData"
      SET exited_at = NOW(), "updatedAt" = NOW()
      WHERE "batchNumber" = :batchNumber
      RETURNING exited_at
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.UPDATE,
      transaction: t
    });

    if (!result) {
      await t.rollback();
      logger.warn('No dry mill entries updated', { batchNumber, user: createdBy });
      return res.status(400).json({ error: 'No valid dry mill entries found to complete.' });
    }

    await sequelize.query(`
      UPDATE "ReceivingData"
      SET rfid = NULL, "currentAssign" = FALSE, "updatedAt" = NOW()
      WHERE "batchNumber" = :batchNumber
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.UPDATE,
      transaction: t
    });

    const subBatches = await sequelize.query(`
      SELECT "batchNumber", weight, "processingType", quality
      FROM "PostprocessingData"
      WHERE "parentBatchNumber" = :batchNumber
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    for (const subBatch of subBatches) {
      const [existing] = await sequelize.query(`
        SELECT "batchNumber"
        FROM "GreenBeansInventoryStatus"
        WHERE "batchNumber" = :batchNumber
      `, {
        replacements: { batchNumber: subBatch.batchNumber },
        type: sequelize.QueryTypes.SELECT,
        transaction: t
      });

      if (!existing) {
        await sequelize.query(`
          INSERT INTO "GreenBeansInventoryStatus" (
            "batchNumber", "processingType", weight, quality, status, "enteredAt", 
            "createdAt", "updatedAt", "createdBy", "updatedBy"
          ) VALUES (
            :batchNumber, :processingType, :weight, :quality, 'Stored', NOW(), 
            NOW(), NOW(), :createdBy, :updatedBy
          )
        `, {
          replacements: {
            batchNumber: subBatch.batchNumber,
            processingType: subBatch.processingType,
            weight: parseFloat(subBatch.weight).toFixed(2),
            quality: subBatch.quality,
            createdBy,
            updatedBy
          },
          type: sequelize.QueryTypes.INSERT,
          transaction: t
        });

        await sequelize.query(`
          INSERT INTO "GreenBeansInventoryMovements" (
            "batchNumber", "movementType", "movedAt", "createdBy"
          ) VALUES (
            :batchNumber, 'Entry', NOW(), :createdBy
          )
        `, {
          replacements: { batchNumber: subBatch.batchNumber, createdBy },
          type: sequelize.QueryTypes.INSERT,
          transaction: t
        });
      }
    }

    if (cherryInventory) {
      await sequelize.query(`
        UPDATE "CherryInventoryStatus"
        SET status = 'Picked', "exitedAt" = NOW(), "updatedAt" = NOW(), "updatedBy" = :updatedBy
        WHERE "batchNumber" = :batchNumber AND "exitedAt" IS NULL
      `, {
        replacements: { batchNumber, updatedBy },
        type: sequelize.QueryTypes.UPDATE,
        transaction: t
      });

      await sequelize.query(`
        INSERT INTO "CherryInventoryMovements" (
          "batchNumber", "movementType", "movedAt", "createdBy"
        ) VALUES (
          :batchNumber, 'Exit', NOW(), :createdBy
        )
      `, {
        replacements: { batchNumber, createdBy },
        type: sequelize.QueryTypes.INSERT,
        transaction: t
      });
    }

    await t.commit();
    logger.info('Batch marked as processed successfully', { batchNumber, user: createdBy });
    res.status(200).json({
      message: 'Batch marked as processed successfully, inventory updated',
      batchNumber,
      exited_at: result.exited_at
    });
  } catch (error) {
    if (t) await t.rollback();
    logger.error('Error marking batch as processed', { batchNumber, error: error.message, stack: error.stack, user: createdBy });
    res.status(500).json({ error: 'Failed to mark batch as processed', details: error.message });
  }
});

// GET route for dry mill data
router.get('/dry-mill-data', async (req, res) => {
  let t;
  try {
    t = await sequelize.transaction();

    const data = await sequelize.query(`
      SELECT 
        rd."batchNumber",
        COALESCE(pp."parentBatchNumber", rd."batchNumber") AS parentBatchNumber,
        rd."type",
        CASE
          WHEN rd."type" = 'Green Beans' THEN 'Green Beans'
          ELSE COALESCE(pp."batchNumber", rd."batchNumber")
        END AS batchType,
        dm."entered_at" AS "dryMillEntered",
        dm."exited_at" AS "dryMillExited",
        pp."storedDate" AS storeddatetrunc,
        COALESCE(pp.weight, rd.weight) AS weight,
        COALESCE(pp.quality, 'N/A') AS quality,
        rd.weight AS cherry_weight,
        COALESCE(pp.producer, rd.producer) AS producer,
        rd."farmerName" AS "farmerName",
        pp."productLine" AS "productLine",
        pp."processingType",
        pp."referenceNumber",
        CASE
          WHEN dm."entered_at" IS NOT NULL AND dm."exited_at" IS NULL THEN 'In Dry Mill'
          WHEN dm."exited_at" IS NOT NULL THEN 'Processed'
          ELSE 'Not Started'
        END AS status,
        ARRAY_AGG(DISTINCT pd."processingType") FILTER (WHERE pd."processingType" IS NOT NULL) AS processingTypes,
        COUNT(DISTINCT bd.bag_number) AS totalBags,
        COALESCE(pp.notes, rd.notes) AS notes,
        ARRAY_AGG(bd.weight) FILTER (WHERE bd.weight IS NOT NULL) AS bagWeights,
        pp."storedDate" AS "storedDate",
        rd.rfid,
        fm."farmVarieties"
      FROM "ReceivingData" rd
      LEFT JOIN "DryMillData" dm ON rd."batchNumber" = dm."batchNumber"
      LEFT JOIN "PostprocessingData" pp ON rd."batchNumber" = pp."parentBatchNumber"
      LEFT JOIN "PreprocessingData" pd ON rd."batchNumber" = pd."batchNumber"
      LEFT JOIN "DryMillGrades" dg ON 
        (pp."batchNumber" IS NOT NULL AND LOWER(dg."subBatchId") = LOWER(CONCAT(pp."parentBatchNumber", '-', REPLACE(pp.quality, ' ', '-')))
        OR (pp."batchNumber" IS NULL AND dg."batchNumber" = rd."batchNumber"))
      LEFT JOIN "BagDetails" bd ON LOWER(dg."subBatchId") = LOWER(bd.grade_id)
      LEFT JOIN "Farmers" fm on rd."farmerID" = fm."farmerID"
      WHERE dm."entered_at" IS NOT NULL
      GROUP BY 
        rd."batchNumber", pp."batchNumber", pp."parentBatchNumber",
        dm."entered_at", dm."exited_at", pp."storedDate",
        pp.weight, rd.weight, pp.quality,
        pp.producer, rd.producer, rd."farmerName",
        pp."productLine", pp."processingType",
        pp."referenceNumber", pp.notes, rd.notes, rd."type",
        pp."storedDate", rd.rfid,
        fm."farmVarieties"
      ORDER BY dm."entered_at" DESC
    `, {
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    await t.commit();
    logger.info('Fetched dry mill data successfully', { user: req.body.createdBy || 'unknown' });
    res.status(200).json(data);
  } catch (error) {
    if (t) await t.rollback();
    logger.error('Error fetching dry mill data', { error: error.message, stack: error.stack, user: req.body.createdBy || 'unknown' });
    res.status(500).json({ error: 'Failed to fetch dry mill data', details: error.message });
  }
});

// POST route for warehouse RFID scan
router.post('/warehouse/scan', async (req, res) => {
  const { rfid, scanned_at, batchNumber } = req.body;

  if (!rfid || !batchNumber || !scanned_at || scanned_at !== 'Warehouse') {
    logger.warn('Invalid warehouse scan request', { rfid, scanned_at, batchNumber, user: req.body.createdBy || 'unknown' });
    return res.status(400).json({ error: 'rfid, scanned_at (Warehouse), and batchNumber are required.' });
  }

  let t;
  try {
    t = await sequelize.transaction();

    const [batch] = await sequelize.query(`
      SELECT "batchNumber"
      FROM "ReceivingData"
      WHERE rfid = :rfid
      AND "batchNumber" = :batchNumber
      AND "currentAssign" = TRUE
      LIMIT 1
    `, {
      replacements: { rfid: validator.trim(rfid).toUpperCase(), batchNumber },
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    if (!batch) {
      await t.rollback();
      logger.warn('RFID not associated with batch', { rfid, batchNumber, user: req.body.createdBy || 'unknown' });
      return res.status(404).json({ error: 'RFID not associated with this batch or batch is not active.' });
    }

    const [dryMillData] = await sequelize.query(`
      SELECT exited_at
      FROM "DryMillData"
      WHERE "batchNumber" = :batchNumber
      AND exited_at IS NOT NULL
      LIMIT 1
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    if (!dryMillData) {
      await t.rollback();
      logger.warn('Batch not exited dry mill', { batchNumber, user: req.body.createdBy || 'unknown' });
      return res.status(400).json({ error: 'Batch has not exited the dry mill.' });
    }

    const [subBatch] = await sequelize.query(`
      SELECT "batchNumber", "parentBatchNumber", weight, quality, "processingType"
      FROM "PostprocessingData"
      WHERE "batchNumber" = :batchNumber
      AND "isStored" = FALSE
      LIMIT 1
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    if (!subBatch) {
      await t.rollback();
      logger.warn('Sub-batch not found or already stored', { batchNumber, user: req.body.createdBy || 'unknown' });
      return res.status(404).json({ error: 'Sub-batch not found or already stored.' });
    }

    const [dryMillGrade] = await sequelize.query(`
      SELECT "subBatchId", is_stored
      FROM "DryMillGrades"
      WHERE "subBatchId" = :subBatchId
      AND processing_type = :processingType
      LIMIT 1
    `, {
      replacements: {
        subBatchId: `${subBatch.parentBatchNumber}-${subBatch.quality.replace(/\s+/g, '-')}`,
        processingType: subBatch.processingType
      },
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    if (!dryMillGrade || dryMillGrade.is_stored) {
      await t.rollback();
      logger.warn('Grade not found or already stored', { batchNumber, user: req.body.createdBy || 'unknown' });
      return res.status(400).json({ error: 'Grade not found or already stored.' });
    }

    await sequelize.query(`
      UPDATE "PostprocessingData"
      SET "isStored" = TRUE, "storedDate" = NOW(), "updatedAt" = NOW()
      WHERE "batchNumber" = :batchNumber
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.UPDATE,
      transaction: t
    });

    await sequelize.query(`
      UPDATE "DryMillGrades"
      SET is_stored = TRUE, "updatedAt" = NOW()
      WHERE "subBatchId" = :subBatchId
      AND processing_type = :processingType
    `, {
      replacements: {
        subBatchId: dryMillGrade.subBatchId,
        processingType: subBatch.processingType
      },
      type: sequelize.QueryTypes.UPDATE,
      transaction: t
    });

    await sequelize.query(`
      UPDATE "BagDetails"
      SET is_stored = TRUE, "updatedAt" = NOW()
      WHERE grade_id = :subBatchId
    `, {
      replacements: { subBatchId: dryMillGrade.subBatchId },
      type: sequelize.QueryTypes.UPDATE,
      transaction: t
    });

    await sequelize.query(`
      INSERT INTO "GreenBeansInventoryStatus" (
        "batchNumber", "processingType", weight, quality, status, "enteredAt", 
        "createdAt", "updatedAt", "createdBy"
      ) VALUES (
        :batchNumber, :processingType, :weight, :quality, 'Stored', NOW(), 
        NOW(), NOW(), :createdBy
      )
      ON CONFLICT ("batchNumber", "processingType") DO UPDATE
      SET weight = :weight, "updatedAt" = NOW()
    `, {
      replacements: {
        batchNumber,
        processingType: subBatch.processingType,
        weight: parseFloat(subBatch.weight).toFixed(2),
        quality: subBatch.quality,
        createdBy: req.body.createdBy || 'unknown'
      },
      type: sequelize.QueryTypes.INSERT,
      transaction: t
    });

    await sequelize.query(`
      INSERT INTO "GreenBeansInventoryMovements" (
        "batchNumber", "movementType", "movedAt", "createdBy"
      ) VALUES (
        :batchNumber, 'Entry', NOW(), :createdBy
      )
    `, {
      replacements: { batchNumber, createdBy: req.body.createdBy || 'unknown' },
      type: sequelize.QueryTypes.INSERT,
      transaction: t
    });

    await sequelize.query(`
      UPDATE "ReceivingData"
      SET rfid = NULL, "currentAssign" = FALSE, "updatedAt" = NOW()
      WHERE "batchNumber" = :batchNumber
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.UPDATE,
      transaction: t
    });

    await sequelize.query(`
      INSERT INTO "RfidScanned" (
        rfid, scanned_at, "batchNumber", created_at, action
      ) VALUES (
        :rfid, :scanned_at, :batchNumber, NOW(), 'Stored'
      )
    `, {
      replacements: { rfid: validator.trim(rfid).toUpperCase(), scanned_at, batchNumber },
      type: sequelize.QueryTypes.INSERT,
      transaction: t
    });

    await t.commit();
    logger.info('Green beans marked as stored', { batchNumber, rfid, user: req.body.createdBy || 'unknown' });
    res.status(200).json({
      message: 'Green beans marked as stored, RFID tag available for reuse',
      rfid,
      batchNumber
    });
  } catch (error) {
    if (t) await t.rollback();
    logger.error('Error processing warehouse RFID scan', { rfid, batchNumber, error: error.message, stack: error.stack, user: req.body.createdBy || 'unknown' });
    res.status(500).json({ error: 'Failed to process warehouse RFID scan', details: error.message });
  }
});

// POST route for RFID reuse
router.post('/rfid/reuse', async (req, res) => {
  const { rfid, batchNumber } = req.body;

  if (!rfid || !batchNumber) {
    logger.warn('Invalid RFID reuse request', { rfid, batchNumber, user: req.body.createdBy || 'unknown' });
    return res.status(400).json({ error: 'rfid and batchNumber are required.' });
  }

  let t;
  try {
    t = await sequelize.transaction();

    const [existingRfid] = await sequelize.query(`
      SELECT rfid, "currentAssign"
      FROM "ReceivingData"
      WHERE rfid = :rfid
      LIMIT 1
    `, {
      replacements: { rfid: validator.trim(rfid).toUpperCase() },
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    if (existingRfid && existingRfid.currentAssign) {
      await t.rollback();
      logger.warn('RFID already assigned', { rfid, batchNumber, user: req.body.createdBy || 'unknown' });
      return res.status(400).json({ error: 'RFID is already assigned to another batch.' });
    }

    const [batch] = await sequelize.query(`
      SELECT "batchNumber"
      FROM "ReceivingData"
      WHERE "batchNumber" = :batchNumber
      LIMIT 1
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    if (!batch) {
      await t.rollback();
      logger.warn('Batch not found for RFID reuse', { batchNumber, user: req.body.createdBy || 'unknown' });
      return res.status(404).json({ error: 'Batch not found.' });
    }

    await sequelize.query(`
      UPDATE "ReceivingData"
      SET rfid = :rfid, "currentAssign" = TRUE, "updatedAt" = NOW()
      WHERE "batchNumber" = :batchNumber
    `, {
      replacements: { rfid: validator.trim(rfid).toUpperCase(), batchNumber },
      type: sequelize.QueryTypes.UPDATE,
      transaction: t
    });

    await t.commit();
    logger.info('RFID tag reused successfully', { rfid, batchNumber, user: req.body.createdBy || 'unknown' });
    res.status(200).json({ message: 'RFID tag is now ready for reuse', batchNumber });
  } catch (error) {
    if (t) await t.rollback();
    logger.error('Error reusing RFID tag', { rfid, batchNumber, error: error.message, stack: error.stack, user: req.body.createdBy || 'unknown' });
    res.status(500).json({ error: 'Failed to reuse RFID tag', details: error.message });
  }
});

module.exports = router;