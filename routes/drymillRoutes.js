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

// Helper function to validate lot number format
const validateLotNumber = (lotNumber) => {
  if (!lotNumber) return false;
  const hqRegex = /^HQ\d{2}[A-Z]+-[A-Z]+-\d{4}$/; // e.g., HQ12ABC-XYZ-2025
  const btmRegex = /^ID-BTM-[AR]-[A-Z](-S|-G[1-4]|-AS)?$/; // e.g., ID-BTM-A-Z or ID-BTM-A-Z-G4 or ID-BTM-A-Z-AS
  return hqRegex.test(lotNumber) || btmRegex.test(lotNumber);
};

// Helper function to validate reference number format
const validateReferenceNumber = (referenceNumber) => {
  if (referenceNumber === null) return true;
  const refRegex = /^ID-HEQA-[A-Z]+-\d{3}$/;
  return refRegex.test(referenceNumber);
};

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
      'SELECT id, "referenceNumber", "productLine", "processingType", producer, type FROM "ReferenceMappings_duplicate" ORDER BY id',
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
    let isGreenBeans = batch?.type === 'NA';

    if (isGreenBeans) {
      processingType = 'Dry';
      validProcessingType = { processingType: 'Dry' };
    } else {
      const [subBatch] = await sequelize.query(`
        SELECT "batchNumber", "parentBatchNumber", "quality", "processingType", "lotNumber", "referenceNumber"
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
          SELECT "processingType", "lotNumber", "referenceNumber"
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
          dg."subBatchId", dg.grade, dg.weight, dg.bagged_at, dg."storedDate",
          dg."lotNumber", dg."referenceNumber",
          ARRAY_AGG(bd.weight) FILTER (WHERE bd.weight IS NOT NULL) AS bagWeights,
          COALESCE(dg.temp_sequence, '0001') AS temp_sequence
        FROM "DryMillGrades" dg
        LEFT JOIN "BagDetails" bd ON LOWER(dg."subBatchId") = LOWER(bd.grade_id)
        WHERE dg."batchNumber" = :parentBatchNumber
          AND LOWER(dg.grade) = LOWER(:quality)
          AND dg.processing_type = :processingType
        GROUP BY dg."subBatchId", dg.grade, dg.weight, dg.bagged_at, dg."storedDate", 
                 dg."lotNumber", dg."referenceNumber", dg.temp_sequence
      `, {
        replacements: { parentBatchNumber: validProcessingType.parentBatchNumber, quality: validProcessingType.quality, processingType },
        type: sequelize.QueryTypes.SELECT,
        transaction: t
      });
    } else {
      grades = await sequelize.query(`
        SELECT 
          dg."subBatchId", dg.grade, dg.weight, dg.bagged_at, dg."storedDate",
          dg."lotNumber", dg."referenceNumber",
          ARRAY_AGG(bd.weight) FILTER (WHERE bd.weight IS NOT NULL) AS bagWeights,
          COALESCE(dg.temp_sequence, '0001') AS temp_sequence
        FROM "DryMillGrades" dg
        LEFT JOIN "BagDetails" bd ON LOWER(dg."subBatchId") = LOWER(bd.grade_id)
        WHERE dg."batchNumber" = :batchNumber
          AND dg.processing_type = :processingType
        GROUP BY dg."subBatchId", dg.grade, dg.weight, dg.bagged_at, dg."storedDate", 
                 dg."lotNumber", dg."referenceNumber", dg.temp_sequence
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
      storedDate: g.storedDate || null,
      lotNumber: g.lotNumber || validProcessingType?.lotNumber || 'N/A',
      referenceNumber: g.referenceNumber || validProcessingType?.referenceNumber || 'N/A',
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
        storedDate: null,
        lotNumber: validProcessingType?.lotNumber || 'N/A',
        referenceNumber: validProcessingType?.referenceNumber || 'N/A',
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
      SELECT "batchNumber", "type", "producer", "farmerName"
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

    const [dryMillEntry] = await sequelize.query(`
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

    if (!dryMillEntry) {
      await t.rollback();
      logger.warn('Batch not entered', { batchNumber, processingType, user: req.body.createdBy || 'unknown' });
      return res.status(400).json({ error: 'Batch must be entered into dry mill first.' });
    }

    let productLine = null;
    let producer = batch.producer;

    if (batch.type === 'NA') {
      processingType = 'Dry';
    } else {
      const [preprocessingData] = await sequelize.query(`
        SELECT "processingType", "productLine", "producer", "lotNumber", "referenceNumber"
        FROM "PreprocessingData"
        WHERE "batchNumber" = :batchNumber
        AND "processingType" = :processingType
        LIMIT 1
      `, {
        replacements: { batchNumber, processingType },
        type: sequelize.QueryTypes.SELECT,
        transaction: t
      });

      if (!preprocessingData) {
        await t.rollback();
        logger.warn('Invalid processing type', { batchNumber, processingType, user: req.body.createdBy || 'unknown' });
        return res.status(400).json({ error: 'Invalid processing type for this batch.' });
      }
      productLine = preprocessingData.productLine || null;
      producer = preprocessingData.producer || producer;
    }

    // Retrieve base lotNumber and referenceNumber from PreprocessingData
    let baseLotNumber, baseReferenceNumber;
    if (batch.type !== 'NA') {
      const [preprocessingData] = await sequelize.query(`
        SELECT "lotNumber", "referenceNumber"
        FROM "PreprocessingData"
        WHERE "batchNumber" = :batchNumber
        AND "processingType" = :processingType
        LIMIT 1
      `, {
        replacements: { batchNumber, processingType },
        type: sequelize.QueryTypes.SELECT,
        transaction: t
      });
      baseLotNumber = preprocessingData?.lotNumber;
      baseReferenceNumber = preprocessingData?.referenceNumber;
    } else {
      const [preprocessingData] = await sequelize.query(`
        SELECT "lotNumber", "referenceNumber"
        FROM "PreprocessingData"
        WHERE "batchNumber" = :batchNumber
        LIMIT 1
      `, {
        replacements: { batchNumber },
        type: sequelize.QueryTypes.SELECT,
        transaction: t
      });
      baseLotNumber = preprocessingData?.lotNumber;
      baseReferenceNumber = preprocessingData?.referenceNumber;
    }

    if (!baseLotNumber || !validateLotNumber(baseLotNumber)) {
      await t.rollback();
      logger.warn('Invalid or missing lot number', { batchNumber, processingType, user: req.body.createdBy || 'unknown' });
      return res.status(400).json({ error: 'Valid lot number not assigned in preprocessing.' });
    }

    if (!validateReferenceNumber(baseReferenceNumber)) {
      await t.rollback();
      logger.warn('Invalid reference number', { batchNumber, processingType, user: req.body.createdBy || 'unknown' });
      return res.status(400).json({ error: 'Valid reference number not assigned in preprocessing.' });
    }

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
      const formattedSequence = tempSequence || '0001';

      const subBatchId = `${batchNumber}-${grade.replace(/\s+/g, '-')}`;
      // Add suffixes to base lot and reference numbers based on grade
      let qualitySuffix;
      switch (grade) {
        case 'Specialty Grade':
          qualitySuffix = '-S';
          break;
        case 'Grade 1':
          qualitySuffix = '-G1';
          break;
        case 'Grade 2':
          qualitySuffix = '-G2';
          break;
        case 'Grade 3':
          qualitySuffix = '-G3';
          break;
        case 'Grade 4':
          qualitySuffix = '-G4';
          break;
        case 'Asalan':
          qualitySuffix = '-AS';
          break;
        default:
          await t.rollback();
          logger.warn('Invalid grade suffix', { batchNumber, processingType, grade, user: req.body.createdBy || 'unknown' });
          return res.status(400).json({ error: `Invalid grade: ${grade}.` });
      }

      const newLotNumber = `${baseLotNumber}${qualitySuffix}`;
      const newReferenceNumber = baseReferenceNumber ? `${baseReferenceNumber}${qualitySuffix}` : null;

      if (!validateLotNumber(newLotNumber)) {
        await t.rollback();
        logger.warn('Invalid generated lot number', { batchNumber, processingType, newLotNumber, user: req.body.createdBy || 'unknown' });
        return res.status(400).json({ error: `Invalid generated lot number: ${newLotNumber}.` });
      }

      if (!validateReferenceNumber(newReferenceNumber)) {
        await t.rollback();
        logger.warn('Invalid generated reference number', { batchNumber, processingType, newReferenceNumber, user: req.body.createdBy || 'unknown' });
        return res.status(400).json({ error: `Invalid generated reference number: ${newReferenceNumber}.` });
      }

      await sequelize.query(`
        INSERT INTO "DryMillGrades" (
          "batchNumber", "subBatchId", grade, weight, split_at, bagged_at, "storedDate", processing_type, temp_sequence, 
          "lotNumber", "referenceNumber"
        ) VALUES (
          :batchNumber, :subBatchId, :grade, :weight, NOW(), :bagged_at, NULL, :processingType, :tempSequence, 
          :lotNumber, :referenceNumber
        )
        ON CONFLICT ("subBatchId") DO UPDATE SET
          weight = :weight,
          bagged_at = :bagged_at
      `, {
        replacements: {
          batchNumber,
          subBatchId,
          grade,
          weight: totalWeight.toFixed(2),
          bagged_at: baggedAtValue,
          processingType: processingType,
          tempSequence: formattedSequence,
          lotNumber: newLotNumber,
          referenceNumber: newReferenceNumber
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
            grade_id, bag_number, weight, bagged_at
          ) VALUES (
            :gradeId, :bagNumber, :weight, :baggedAt
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

      // Check for existing sub-batch before insertion
      const [existingSubBatch] = await sequelize.query(`
        SELECT "batchNumber"
        FROM "PostprocessingData"
        WHERE "batchNumber" = :batchNumber
        AND "quality" = :quality
        AND "processingType" = :processingType
        LIMIT 1
      `, {
        replacements: {
          batchNumber: batchNumber,
          quality: grade,
          processingType: processingType
        },
        type: sequelize.QueryTypes.SELECT,
        transaction: t
      });

      if (existingSubBatch) {
        await sequelize.query(`
          UPDATE "PostprocessingData"
          SET weight = :weight,
              "totalBags" = :totalBags,
              "updatedAt" = NOW()
          WHERE "batchNumber" = :batchNumber
          AND "quality" = :quality
          AND "processingType" = :processingType
        `, {
          replacements: {
            batchNumber: batchNumber,
            quality: grade,
            processingType: processingType,
            weight: totalWeight.toFixed(2),
            totalBags: weights.length
          },
          type: sequelize.QueryTypes.UPDATE,
          transaction: t
        });
      } else {
        await sequelize.query(`
          INSERT INTO "PostprocessingData" (
            "batchNumber", "lotNumber", "referenceNumber", "processingType", weight, "totalBags", 
            notes, quality, producer, "parentBatchNumber", "createdAt", "updatedAt"
          ) VALUES (
            :batchNumber, :lotNumber, :referenceNumber, :processingType, :weight, :totalBags, 
            :notes, :quality, :producer, :parentBatchNumber, NOW(), NOW()
          )
        `, {
          replacements: {
            batchNumber: batchNumber,
            lotNumber: newLotNumber,
            referenceNumber: newReferenceNumber,
            processingType: processingType,
            weight: totalWeight.toFixed(2),
            totalBags: weights.length,
            notes: '',
            quality: grade,
            producer,
            parentBatchNumber: batchNumber
          },
          type: sequelize.QueryTypes.INSERT,
          transaction: t
        });
      }

      results.push({ subBatchId, grade, weight: totalWeight.toFixed(2), bagWeights: weights, bagged_at: baggedAtValue, lotNumber: newLotNumber, referenceNumber: newReferenceNumber });
      subBatches.push({ batchNumber: batchNumber, lotNumber: newLotNumber, referenceNumber: newReferenceNumber, quality: grade });
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
      SELECT "batchNumber", "type", "producer", "farmerName"
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
    let productLine = null;
    let producer = batch.producer;

    if (batch.type === 'NA') {
      validProcessingType = { processingType: 'Dry' };
    } else {
      [validProcessingType] = await sequelize.query(`
        SELECT "processingType", "lotNumber", "referenceNumber", "productLine", "producer"
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
      productLine = validProcessingType.productLine || null;
      producer = validProcessingType.producer || producer;
    }

    const [subBatch] = await sequelize.query(`
      SELECT "batchNumber", "parentBatchNumber", weight, quality, "processingType", "lotNumber", "referenceNumber"
      FROM "PostprocessingData"
      WHERE "batchNumber" = :batchNumber
      AND "quality" = :grade
      AND "processingType" = :processingType
      LIMIT 1
    `, {
      replacements: { batchNumber, grade, processingType: processingType },
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    if (!subBatch) {
      await t.rollback();
      logger.warn('Sub-batch not found', { batchNumber, grade, processingType, user: req.body.createdBy || 'unknown' });
      return res.status(404).json({ error: 'Sub-batch not found or grade/processingType does not match.' });
    }

    const parentBatchNumber = subBatch.parentBatchNumber || batchNumber;
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

    if (!validateLotNumber(subBatch.lotNumber)) {
      await t.rollback();
      logger.warn('Invalid lot number in sub-batch', { batchNumber, processingType, lotNumber: subBatch.lotNumber, user: req.body.createdBy || 'unknown' });
      return res.status(400).json({ error: `Invalid lot number in sub-batch: ${subBatch.lotNumber}.` });
    }

    if (!validateReferenceNumber(subBatch.referenceNumber)) {
      await t.rollback();
      logger.warn('Invalid reference number in sub-batch', { batchNumber, processingType, referenceNumber: subBatch.referenceNumber, user: req.body.createdBy || 'unknown' });
      return res.status(400).json({ error: `Invalid reference number in sub-batch: ${subBatch.referenceNumber}.` });
    }

    await sequelize.query(`
      DELETE FROM "BagDetails"
      WHERE grade_id = :subBatchId
    `, {
      replacements: { subBatchId },
      transaction: t
    });

    await sequelize.query(`
      INSERT INTO "DryMillGrades" (
        "batchNumber", "subBatchId", grade, weight, split_at, bagged_at, "storedDate", processing_type, 
        "lotNumber", "referenceNumber"
      ) VALUES (
        :parentBatchNumber, :subBatchId, :grade, :weight, NOW(), :bagged_at, NOW(), :processingType, 
        :lotNumber, :referenceNumber
      )
      ON CONFLICT ("subBatchId") DO UPDATE SET
        weight = :weight,
        bagged_at = :bagged_at,
        "storedDate" = NOW(),
    `, {
      replacements: {
        parentBatchNumber,
        subBatchId,
        grade,
        weight: totalWeight.toFixed(2),
        bagged_at: baggedAtValue,
        processingType: processingType,
        lotNumber: subBatch.lotNumber,
        referenceNumber: subBatch.referenceNumber
      },
      type: sequelize.QueryTypes.INSERT,
      transaction: t
    });

    for (let i = 0; i < weights.length; i++) {
      await sequelize.query(`
        INSERT INTO "BagDetails" (
          grade_id, bag_number, weight, bagged_at
        ) VALUES (
          :gradeId, :bagNumber, :weight, :baggedAt
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
        processingType: processingType
      },
      type: sequelize.QueryTypes.UPDATE,
      transaction: t
    });

    await t.commit();
    logger.info('Bags updated successfully', { batchNumber, grade, processingType, user: req.body.createdBy || 'unknown' });
    res.status(200).json({ 
      message: 'Bags updated successfully', 
      grade, 
      weight: totalWeight.toFixed(2), 
      bagWeights: weights, 
      lotNumber: subBatch.lotNumber, 
      referenceNumber: subBatch.referenceNumber 
    });
  } catch (error) {
    if (t) await t.rollback();
    logger.error('Error updating bags', { batchNumber, grade, processingType, error: error.message, stack: error.stack, user: req.body.createdBy || 'unknown' });
    res.status(500).json({ error: 'Failed to update bags', details: error.message });
  }
});

// POST route to complete a batch
router.post('/dry-mill/:batchNumber/complete', async (req, res) => {
  const { batchNumber } = req.params;
  const { createdBy, updatedBy, dryMillExited } = req.body;

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
    if (batch.type !== 'NA') {
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

      let hasAnyValidOrDefaultSplits = false;
      for (const pt of processingTypes) {
        const grades = await sequelize.query(`
          SELECT grade, weight, bagged_at, "storedDate", "lotNumber", "referenceNumber"
          FROM "DryMillGrades"
          WHERE "batchNumber" = :batchNumber
          AND processing_type = :processingType
        `, {
          replacements: { batchNumber, processingType: pt },
          type: sequelize.QueryTypes.SELECT,
          transaction: t
        });

        const hasValidSplits = grades.some(g => 
          (parseFloat(g.weight) >= 0 && g.bagged_at && !g.storedDate) || // Valid split or default with bagged_at
          (g.grade === 'Default' && parseFloat(g.weight) === 0 && !g.bagged_at && !g.storedDate) // Default placeholder
        );
        if (hasValidSplits) hasAnyValidOrDefaultSplits = true;

        for (const grade of grades) {
          if (!validateLotNumber(grade.lotNumber)) {
            await t.rollback();
            logger.warn('Invalid lot number in grade', { batchNumber, processingType: pt, lotNumber: grade.lotNumber, user: createdBy });
            return res.status(400).json({ error: `Invalid lot number in grade: ${grade.lotNumber}` });
          }
          if (!validateReferenceNumber(grade.referenceNumber)) {
            await t.rollback();
            logger.warn('Invalid reference number in grade', { batchNumber, processingType: pt, referenceNumber: grade.referenceNumber, user: createdBy });
            return res.status(400).json({ error: `Invalid reference number in grade: ${grade.referenceNumber}` });
          }
        }
      }

      if (!hasAnyValidOrDefaultSplits) {
        await t.rollback();
        logger.warn('No valid or default splits for any processing type', { batchNumber, user: createdBy });
        return res.status(400).json({ error: 'No valid or default splits for any processing type.' });
      }
    } else {
      const grades = await sequelize.query(`
        SELECT grade, weight, bagged_at, "storedDate", "lotNumber", "referenceNumber"
        FROM "DryMillGrades"
        WHERE "batchNumber" = :batchNumber
        AND processing_type = 'Dry'
      `, {
        replacements: { batchNumber },
        type: sequelize.QueryTypes.SELECT,
        transaction: t
      });

      // if (grades.length === 0) {
      //   await sequelize.query(`
      //     INSERT INTO "DryMillGrades" ("batchNumber", processing_type, grade, weight, bagged_at, "lotNumber")
      //     VALUES (:batchNumber, 'Dry', 'Default', 0, NULL, :lotNumber)
      //   `, {
      //     replacements: { batchNumber, lotNumber: batch.lotNumber || 'ID-BTM-A-N' },
      //     type: sequelize.QueryTypes.INSERT,
      //     transaction: t
      //   });
      //   grades.push({ grade: 'Default', weight: 0, bagged_at: null, storedDate: null });
      // }

      // const hasValidSplits = grades.some(g => 
      //   (parseFloat(g.weight) >= 0 && g.bagged_at && !g.storedDate) || // Valid split or default with bagged_at
      //   (g.grade === 'Default' && parseFloat(g.weight) === 0 && !g.bagged_at && !g.storedDate) // Default placeholder
      // );
      // if (!hasValidSplits) {
      //   await t.rollback();
      //   logger.warn('No valid splits for green beans', { batchNumber, user: createdBy });
      //   return res.status(400).json({ error: 'No valid splits for green beans.' });
      // }

      for (const grade of grades) {
        if (!validateLotNumber(grade.lotNumber)) {
          await t.rollback();
          logger.warn('Invalid lot number in grade', { batchNumber, lotNumber: grade.lotNumber, user: createdBy });
          return res.status(400).json({ error: `Invalid lot number in grade: ${grade.lotNumber}` });
        }
        if (!validateReferenceNumber(grade.referenceNumber)) {
          await t.rollback();
          logger.warn('Invalid reference number in grade', { batchNumber, referenceNumber: grade.referenceNumber, user: createdBy });
          return res.status(400).json({ error: `Invalid reference number in grade: ${grade.referenceNumber}` });
        }
      }
    }

    const exitedAt = dryMillExited || new Date().toISOString();
    const [result] = await sequelize.query(`
      UPDATE "DryMillData"
      SET exited_at = :exitedAt
      WHERE "batchNumber" = :batchNumber
      RETURNING exited_at
    `, {
      replacements: { batchNumber, exitedAt },
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
      SET rfid = NULL, "currentAssign" = 0, "updatedAt" = NOW()
      WHERE "batchNumber" = :batchNumber
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.UPDATE,
      transaction: t
    });

    const subBatches = await sequelize.query(`
      SELECT "batchNumber", weight, "processingType", quality, "lotNumber", "referenceNumber"
      FROM "PostprocessingData"
      WHERE "parentBatchNumber" = :batchNumber
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    for (const subBatch of subBatches) {
      if (!validateLotNumber(subBatch.lotNumber)) {
        await t.rollback();
        logger.warn('Invalid lot number in sub-batch', { batchNumber, lotNumber: subBatch.lotNumber, user: createdBy });
        return res.status(400).json({ error: `Invalid lot number in sub-batch: ${subBatch.lotNumber}` });
      }
      if (!validateReferenceNumber(subBatch.referenceNumber)) {
        await t.rollback();
        logger.warn('Invalid reference number in sub-batch', { batchNumber, referenceNumber: subBatch.referenceNumber, user: createdBy });
        return res.status(400).json({ error: `Invalid reference number in sub-batch: ${subBatch.referenceNumber}` });
      }

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
            "lotNumber", "referenceNumber", "createdAt", "updatedAt", "createdBy", "updatedBy"
          ) VALUES (
            :batchNumber, :processingType, :weight, :quality, 'Stored', NOW(), 
            :lotNumber, :referenceNumber, NOW(), NOW(), :createdBy, :updatedBy
          )
        `, {
          replacements: {
            batchNumber: subBatch.batchNumber,
            processingType: subBatch.processingType,
            weight: parseFloat(subBatch.weight).toFixed(2),
            quality: subBatch.quality,
            lotNumber: subBatch.lotNumber,
            referenceNumber: subBatch.referenceNumber,
            createdBy,
            updatedBy
          },
          type: sequelize.QueryTypes.INSERT,
          transaction: t
        });

        await sequelize.query(`
          INSERT INTO "GreenBeansInventoryMovements" (
            "batchNumber", "movementType", "lotNumber", "referenceNumber", "movedAt", "createdBy"
          ) VALUES (
            :batchNumber, 'Entry', :lotNumber, :referenceNumber, NOW(), :createdBy
          )
        `, {
          replacements: { 
            batchNumber: subBatch.batchNumber, 
            lotNumber: subBatch.lotNumber, 
            referenceNumber: subBatch.referenceNumber, 
            createdBy 
          },
          type: sequelize.QueryTypes.INSERT,
          transaction: t
        });
      }
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

// GET route for dry mill data (updated to include dryMillMerged)
router.get('/dry-mill-data', async (req, res) => {
  let t;
  try {
    t = await sequelize.transaction();

    const data = await sequelize.query(`
      WITH LatestDryingWeights AS (
        SELECT "batchNumber", "processingType", producer, SUM(weight) AS drying_weight
        FROM "DryingWeightMeasurements"
        GROUP BY "batchNumber", "processingType", producer
        ORDER BY "batchNumber" ASC
      ),
      BaseData AS (
        SELECT 
          rd."batchNumber" AS original_batch_number,
          COALESCE(pp."batchNumber", rd."batchNumber") AS batch_number,
          pp."parentBatchNumber" AS parent_batch_number,
          rd."type",
          CASE
            WHEN rd."type" = 'Green Beans' THEN 'Green Beans'
            ELSE COALESCE(pp."batchNumber", rd."batchNumber")
          END AS batch_type,
          dm."entered_at" AS "dryMillEntered",
          dm."exited_at" AS "dryMillExited",
          pp."storedDate" AS storeddatetrunc,
          COALESCE(pp.weight, rd.weight) AS weight,
          COALESCE(pp.quality, 'N/A') AS quality,
          rd.weight AS cherry_weight,
          COALESCE(ldw.drying_weight, 0.00) AS drying_weight,
          COALESCE(pd.producer, rd.producer) AS producer,
          rd."farmerName" AS "farmerName",
          pp."productLine" AS "productLine",
          pd."processingType" AS "processingType",
          pd."lotNumber" AS "lotNumber",
          COALESCE(pp."referenceNumber", pd."referenceNumber") AS "referenceNumber",
          CASE
            WHEN dm."entered_at" IS NOT NULL AND dm."exited_at" IS NULL THEN 'In Dry Mill'
            WHEN dm."exited_at" IS NOT NULL THEN 'Processed'
            ELSE 'Not Started'
          END AS status,
          COUNT(DISTINCT bd.bag_number) AS total_bags,
          COALESCE(pp.notes, rd.notes) AS notes,
          SUM(bd.weight) AS "drymillWeight",
          ARRAY_AGG(bd.weight) FILTER (WHERE bd.weight IS NOT NULL) AS bag_details,
          pp."storedDate" AS stored_date,
          rd.rfid,
          fm."farmVarieties",
          dm."dryMillMerged"
        FROM "ReceivingData" rd
        LEFT JOIN (SELECT "batchNumber", MIN(entered_at) AS entered_at, MAX(exited_at) AS exited_at, MIN(created_at) AS created_at, rfid, "dryMillMerged" FROM "DryMillData" GROUP BY "batchNumber", rfid, "dryMillMerged") dm ON rd."batchNumber" = dm."batchNumber"
        LEFT JOIN "PostprocessingData" pp ON rd."batchNumber" = pp."parentBatchNumber" OR rd."batchNumber" = pp."batchNumber"
        LEFT JOIN "PreprocessingData" pd ON rd."batchNumber" = pd."batchNumber"
        LEFT JOIN "DryMillGrades" dg ON (
          (pp."batchNumber" IS NOT NULL AND LOWER(dg."subBatchId") = LOWER(CONCAT(pp."parentBatchNumber", '-', REPLACE(pp.quality, ' ', '-'))))
          OR (pp."batchNumber" IS NULL AND dg."batchNumber" = rd."batchNumber")
        )
        LEFT JOIN "BagDetails" bd ON LOWER(dg."subBatchId") = LOWER(bd.grade_id)
        LEFT JOIN "Farmers" fm ON rd."farmerID" = fm."farmerID"
        LEFT JOIN LatestDryingWeights ldw 
          ON COALESCE(pp."batchNumber", rd."batchNumber") = ldw."batchNumber" 
          AND COALESCE(pp."processingType", pd."processingType") = ldw."processingType" 
          AND COALESCE(pd.producer, rd.producer, 'Unknown') = COALESCE(ldw.producer, 'Unknown')
        WHERE dm."entered_at" IS NOT NULL
        GROUP BY 
          rd."batchNumber", pp."batchNumber", pp."parentBatchNumber",
          rd."type",
          dm."entered_at", dm."exited_at", pp."storedDate",
          pp.weight, rd.weight, pp.quality,
          pd.producer, rd.producer, rd."farmerName",
          pp."productLine", pd."processingType",
          pd."lotNumber", COALESCE(pp."referenceNumber", pd."referenceNumber"),
          pp.notes, rd.notes,
          pp."storedDate", rd.rfid,
          fm."farmVarieties",
          dm."dryMillMerged",drying_weight
      ),
      FinalData AS (
        SELECT 
          batch_number AS "batchNumber",
          parent_batch_number AS "parentBatchNumber",
          type,
          batch_type AS "batchType",
          "dryMillEntered",
          "dryMillExited",
          storeddatetrunc,
          weight,
          quality,
          cherry_weight,
          drying_weight,
          producer,
          "farmerName",
          "productLine",
          "processingType",
          "lotNumber",
          "referenceNumber",
          status,
          total_bags AS "totalBags",
          notes,
          "drymillWeight",
          bag_details AS "bagDetails",
          stored_date AS "storedDate",
          rfid,
          "farmVarieties",
          "dryMillMerged"
        FROM BaseData
      )
      SELECT
        "batchNumber",
        "parentBatchNumber",
        type,
        "batchType",
        "dryMillEntered",
        "dryMillExited",
        storeddatetrunc,
        weight,
        quality,
        cherry_weight,
        drying_weight,
        producer,
        "farmerName",
        "productLine",
        "processingType",
        "lotNumber",
        "referenceNumber",
        status,
        "totalBags",
        notes,
        "drymillWeight",
        "bagDetails",
        "storedDate",
        rfid,
        "farmVarieties",
        "dryMillMerged"
      FROM FinalData
      ORDER BY "dryMillEntered" DESC
    `, {
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    for (const row of data) {
      if (row.lotNumber && !validateLotNumber(row.lotNumber)) {
        logger.warn('Invalid lot number in dry mill data', { batchNumber: row.batchNumber, lotNumber: row.lotNumber, user: req.body.createdBy || 'unknown' });
        row.lotNumber = 'N/A';
      }
      if (!validateReferenceNumber(row.referenceNumber)) {
        logger.warn('Invalid reference number in dry mill data', { batchNumber: row.batchNumber, referenceNumber: row.referenceNumber, user: req.body.createdBy || 'unknown' });
        row.referenceNumber = 'N/A';
      }
    }

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
      AND "currentAssign" = 1
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
      SELECT "batchNumber", "parentBatchNumber", weight, quality, "processingType", "lotNumber", "referenceNumber"
      FROM "PostprocessingData"
      WHERE "batchNumber" = :batchNumber
      AND "storedDate" IS NULL
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

    if (!validateLotNumber(subBatch.lotNumber)) {
      await t.rollback();
      logger.warn('Invalid lot number in sub-batch', { batchNumber, lotNumber: subBatch.lotNumber, user: req.body.createdBy || 'unknown' });
      return res.status(400).json({ error: `Invalid lot number in sub-batch: ${subBatch.lotNumber}` });
    }

    if (!validateReferenceNumber(subBatch.referenceNumber)) {
      await t.rollback();
      logger.warn('Invalid reference number in sub-batch', { batchNumber, referenceNumber: subBatch.referenceNumber, user: req.body.createdBy || 'unknown' });
      return res.status(400).json({ error: `Invalid reference number in sub-batch: ${subBatch.referenceNumber}` });
    }

    const [dryMillGrade] = await sequelize.query(`
      SELECT "subBatchId", "storedDate"
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

    if (!dryMillGrade || dryMillGrade.storedDate) {
      await t.rollback();
      logger.warn('Grade not found or already stored', { batchNumber, user: req.body.createdBy || 'unknown' });
      return res.status(400).json({ error: 'Grade not found or already stored.' });
    }

    await sequelize.query(`
      UPDATE "PostprocessingData"
      SET "storedDate" = NOW(), "updatedAt" = NOW()
      WHERE "batchNumber" = :batchNumber
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.UPDATE,
      transaction: t
    });

    await sequelize.query(`
      UPDATE "DryMillGrades"
      SET "storedDate" = NOW()
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
      SET bagged_at = NOW()
      WHERE grade_id = :subBatchId
    `, {
      replacements: { subBatchId: dryMillGrade.subBatchId },
      type: sequelize.QueryTypes.UPDATE,
      transaction: t
    });

    await sequelize.query(`
      INSERT INTO "GreenBeansInventoryStatus" (
        "batchNumber", "processingType", weight, quality, status, "enteredAt", 
        "lotNumber", "referenceNumber", "createdAt", "updatedAt", "createdBy"
      ) VALUES (
        :batchNumber, :processingType, :weight, :quality, 'Stored', NOW(), 
        :lotNumber, :referenceNumber, NOW(), NOW(), :createdBy
      )
      ON CONFLICT ("batchNumber", "processingType") DO UPDATE
      SET weight = :weight, "updatedAt" = NOW()
    `, {
      replacements: {
        batchNumber,
        processingType: subBatch.processingType,
        weight: parseFloat(subBatch.weight).toFixed(2),
        quality: subBatch.quality,
        lotNumber: subBatch.lotNumber,
        referenceNumber: subBatch.referenceNumber,
        createdBy: req.body.createdBy || 'unknown'
      },
      type: sequelize.QueryTypes.INSERT,
      transaction: t
    });

    await sequelize.query(`
      INSERT INTO "GreenBeansInventoryMovements" (
        "batchNumber", "movementType", "lotNumber", "referenceNumber", "movedAt", "createdBy"
      ) VALUES (
        :batchNumber, 'Entry', :lotNumber, :referenceNumber, NOW(), :createdBy
      )
    `, {
      replacements: { 
        batchNumber, 
        lotNumber: subBatch.lotNumber, 
        referenceNumber: subBatch.referenceNumber, 
        createdBy: req.body.createdBy || 'unknown' 
      },
      type: sequelize.QueryTypes.INSERT,
      transaction: t
    });

    await sequelize.query(`
      UPDATE "ReceivingData"
      SET "currentAssign" = 0, "updatedAt" = NOW()
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
      batchNumber,
      lotNumber: subBatch.lotNumber,
      referenceNumber: subBatch.referenceNumber
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
    logger.warn('Invalid RFID scan request', { rfid, batchNumber, user: req.body.createdBy || 'unknown' });
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
      SET rfid = :rfid, "currentAssign" = 1, "updatedAt" = NOW()
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

// GET route for sample history
router.get('/dry-mill/:batchNumber/sample-history', async (req, res) => {
  const { batchNumber } = req.params;

  if (!batchNumber) {
    logger.warn('Missing batchNumber', { user: req.body.createdBy || 'unknown' });
    return res.status(400).json({ error: 'batchNumber is required.' });
  }

  let t;
  try {
    t = await sequelize.transaction();

    const samples = await sequelize.query(`
      SELECT date_taken, weight_taken
      FROM "DryMillSamples"
      WHERE "batchNumber" = :batchNumber
      ORDER BY date_taken DESC
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    await t.commit();
    logger.info('Fetched sample history successfully', { batchNumber, user: req.body.createdBy || 'unknown' });
    res.status(200).json(samples);
  } catch (error) {
    if (t) await t.rollback();
    logger.error('Error fetching sample history', { batchNumber, error: error.message, stack: error.stack, user: req.body.createdBy || 'unknown' });
    res.status(500).json({ error: 'Failed to fetch sample history', details: error.message });
  }
});

// POST route to add a sample
router.post('/dry-mill/:batchNumber/add-sample', async (req, res) => {
  const { batchNumber } = req.params;
  const { dateTaken, weightTaken } = req.body;

  if (!batchNumber || !dateTaken || weightTaken === undefined) {
    logger.warn('Missing required parameters', { batchNumber, dateTaken, weightTaken, user: req.body.createdBy || 'unknown' });
    return res.status(400).json({ error: 'batchNumber, dateTaken, and weightTaken are required.' });
  }

  if (isNaN(parseFloat(weightTaken)) || parseFloat(weightTaken) <= 0) {
    logger.warn('Invalid weightTaken', { batchNumber, weightTaken, user: req.body.createdBy || 'unknown' });
    return res.status(400).json({ error: 'weightTaken must be a positive number.' });
  }

  const parsedDate = new Date(dateTaken);
  if (isNaN(parsedDate) || parsedDate > new Date()) {
    logger.warn('Invalid dateTaken', { batchNumber, dateTaken, user: req.body.createdBy || 'unknown' });
    return res.status(400).json({ error: 'dateTaken must be a valid past or present date.' });
  }

  let t;
  try {
    t = await sequelize.transaction();

    const [result] = await sequelize.query(`
      INSERT INTO "DryMillSamples" ("batchNumber", date_taken, weight_taken, created_at)
      VALUES (:batchNumber, :dateTaken, :weightTaken, NOW())
      RETURNING date_taken, weight_taken
    `, {
      replacements: { batchNumber, dateTaken, weightTaken: parseFloat(weightTaken).toFixed(2) },
      type: sequelize.QueryTypes.INSERT,
      transaction: t
    });

    await t.commit();
    logger.info('Sample added successfully', { batchNumber, user: req.body.createdBy || 'unknown' });
    res.status(201).json(result);
  } catch (error) {
    if (t) await t.rollback();
    logger.error('Error adding sample', { batchNumber, error: error.message, stack: error.stack, user: req.body.createdBy || 'unknown' });
    res.status(500).json({ error: 'Failed to add sample', details: error.message });
  }
});

// GET route for postprocessing data by batch number
router.get('/postprocessing-data/:batchNumber', async (req, res) => {
  const { batchNumber } = req.params;

  if (!batchNumber) {
    logger.warn('Missing batchNumber', { user: req.body.createdBy || 'unknown' });
    return res.status(400).json({ error: 'batchNumber is required.' });
  }

  let t;
  try {
    t = await sequelize.transaction();

    const data = await sequelize.query(
      `
      SELECT "batchNumber", "parentBatchNumber", weight, quality, "processingType", "lotNumber", "referenceNumber", "storedDate"
      FROM "PostprocessingData"
      WHERE "batchNumber" = :batchNumber
      OR "parentBatchNumber" = :batchNumber
      ORDER BY "processingType"
      `,
      {
        replacements: { batchNumber },
        type: sequelize.QueryTypes.SELECT,
        transaction: t
      }
    );

    if (data.length === 0) {
      await t.rollback();
      logger.warn('No postprocessing data found', { batchNumber, user: req.body.createdBy || 'unknown' });
      return res.status(404).json({ error: 'No postprocessing data found for this batch.' });
    }

    await t.commit();
    logger.info('Fetched postprocessing data successfully', { batchNumber, user: req.body.createdBy || 'unknown' });
    res.status(200).json(data);
  } catch (error) {
    if (t) await t.rollback();
    logger.error('Error fetching postprocessing data', { batchNumber, error: error.message, stack: error.stack, user: req.body.createdBy || 'unknown' });
    res.status(500).json({ error: 'Failed to fetch postprocessing data', details: error.message });
  }
});

// GET route for sample data
router.get('/sample-data', async (req, res) => {
  let t;
  try {
    t = await sequelize.transaction();

    const data = await sequelize.query(`
      SELECT 
        a."batchNumber", 
        b."lotNumber",
        b."referenceNumber",
        a."processingType",
        a.date_taken, 
        a.weight_taken,
        c.drying_weight - a.weight_taken total_current_weight
      FROM "DryMillSamples" a
      LEFT JOIN "PreprocessingData" b on a."batchNumber" = b."batchNumber" AND a."processingType" = b."processingType"
      LEFT JOIN (SELECT "batchNumber", "processingType", sum(weight) drying_weight FROM "DryingWeightMeasurements" GROUP BY "batchNumber", "processingType") c on a."batchNumber" = c."batchNumber" AND a."processingType" = c."processingType"
    `, {
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    for (const row of data) {
      if (row.lotNumber && !validateLotNumber(row.lotNumber)) {
        logger.warn('Invalid lot number in sample data', { batchNumber: row.batchNumber, lotNumber: row.lotNumber, user: req.body.createdBy || 'unknown' });
        row.lotNumber = 'N/A';
      }
      if (!validateReferenceNumber(row.referenceNumber)) {
        logger.warn('Invalid reference number in sample data', { batchNumber: row.batchNumber, referenceNumber: row.referenceNumber, user: req.body.createdBy || 'unknown' });
        row.referenceNumber = 'N/A';
      }
    }

    await t.commit();
    logger.info('Fetched sample data successfully', { user: req.body.createdBy || 'unknown' });
    res.status(200).json(data);
  } catch (error) {
    if (t) await t.rollback();
    logger.error('Error fetching sample data', { error: error.message, stack: error.stack, user: req.body.createdBy || 'unknown' });
    res.status(500).json({ error: 'Failed to fetch sample data', details: error.message });
  }
});

router.post('/dry-mill/merge', async (req, res) => {
  let t;
  try {
    const { batchNumbers, notes, createdBy } = req.body;
    if (!batchNumbers || !Array.isArray(batchNumbers) || batchNumbers.length < 2) {
      logger.warn('Invalid merge request', { batchNumbers, user: createdBy || 'unknown' });
      return res.status(400).json({ error: 'At least two batch numbers are required.' });
    }

    t = await sequelize.transaction();

    // Parse batchNumbers to extract batchNumber and processingType
    const parsedBatches = batchNumbers.map(id => {
      const [batchNumber, producer, ...processingTypeParts] = id.split('-');
      const processingType = processingTypeParts.join('-'); // Rejoin processingType parts in case it contains hyphens
      return { batchNumber, processingType };
    });

    // Validate that all batches have the same processingType
    const processingType = parsedBatches[0].processingType;
    if (!parsedBatches.every(b => b.processingType === processingType)) {
      await t.rollback();
      logger.warn('Mismatched processing types', { batchNumbers, user: createdBy || 'unknown' });
      return res.status(400).json({ error: 'All batches must have the same processing type.' });
    }

    // Fetch batches from DryMillData, allowing previously merged batches
    const batches = await sequelize.query(
      `SELECT rd."batchNumber", rd."type", rd."farmerName", rd."receivingDate", rd."totalBags",
              rd."commodityType", rd."rfid", rd."producer", pp."processingType",
              ldw.drying_weight AS weight, dm."entered_at" AS dryMillEntered,
              dm."exited_at" AS dryMillExited, dm."dryMillMerged"
       FROM "ReceivingData" rd
       LEFT JOIN "PreprocessingData" pp ON LOWER(rd."batchNumber") = LOWER(pp."batchNumber") AND pp."processingType" = :processingType
       LEFT JOIN (
         SELECT "batchNumber", "processingType", SUM(weight) AS drying_weight
         FROM "DryingWeightMeasurements"
         GROUP BY "batchNumber", "processingType"
       ) ldw ON LOWER(rd."batchNumber") = LOWER(ldw."batchNumber") AND ldw."processingType" = :processingType
       LEFT JOIN "DryMillData" dm ON LOWER(rd."batchNumber") = LOWER(dm."batchNumber")
       WHERE LOWER(rd."batchNumber") IN (:batchNumbers)
         AND rd."commodityType" != 'Green Bean'
         AND dm."entered_at" IS NOT NULL
         AND dm."exited_at" IS NULL
         AND pp."processingType" = :processingType`,
      {
        replacements: { 
          batchNumbers: parsedBatches.map(b => b.batchNumber.toLowerCase()),
          processingType
        },
        type: sequelize.QueryTypes.SELECT,
        transaction: t
      }
    );

    if (batches.length !== batchNumbers.length) {
      await t.rollback();
      logger.warn('Invalid batches selected', { batchNumbers, user: createdBy || 'unknown' });
      return res.status(400).json({ error: 'Some batches not found, already processed, are Green Bean, or do not match the processing type.' });
    }

    // Verify all batches have the same processingType (redundant but ensures data consistency)
    if (!batches.every(b => b.processingType === processingType)) {
      await t.rollback();
      logger.warn('Mismatched processing types in database', { batchNumbers, user: createdBy || 'unknown' });
      return res.status(400).json({ error: 'Batches must have the same processing type in the database.' });
    }

    const totalWeight = batches.reduce((sum, b) => sum + parseFloat(b.weight || 0), 0);
    if (totalWeight < 1000) {
      await t.rollback();
      logger.warn('Insufficient total weight', { totalWeight, batchNumbers, user: createdBy || 'unknown' });
      return res.status(400).json({ error: `Total weight (${totalWeight.toFixed(2)} kg) must be at least 1000 kg.` });
    }

    // Check for sub-batches
    const subBatches = await sequelize.query(
      `SELECT "batchNumber" FROM "PostprocessingData" WHERE "parentBatchNumber" IN (:batchNumbers) AND "processingType" = :processingType`,
      {
        replacements: { 
          batchNumbers: parsedBatches.map(b => b.batchNumber.toLowerCase()),
          processingType
        },
        type: sequelize.QueryTypes.SELECT,
        transaction: t
      }
    );
    if (subBatches.length > 0) {
      await t.rollback();
      logger.warn('Batches have sub-batches', { batchNumbers, user: createdBy || 'unknown' });
      return res.status(400).json({ error: 'Cannot merge batches that have sub-batches.' });
    }

    // Generate new batch number
    const today = new Date().toISOString().slice(0, 10);
    const [sequenceResult] = await sequelize.query(
      `SELECT latest_batch_number, last_updated_date 
       FROM latest_m_batch 
       WHERE id = 1 FOR UPDATE`,
      { type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    let sequenceNumber = sequenceResult.latest_batch_number;
    let lastUpdatedDate = sequenceResult.last_updated_date;
    if (lastUpdatedDate instanceof Date && !isNaN(lastUpdatedDate)) {
      lastUpdatedDate = lastUpdatedDate.toISOString().slice(0, 10);
    } else if (typeof lastUpdatedDate === 'string') {
      lastUpdatedDate = new Date(lastUpdatedDate).toISOString().slice(0, 10);
    } else {
      lastUpdatedDate = today;
    }

    if (lastUpdatedDate !== today) {
      sequenceNumber = 0;
    }
    sequenceNumber += 1;

    const formattedSequence = sequenceNumber.toString().padStart(4, '0');
    const newBatchNumber = `${today}-${formattedSequence}-MB`;

    await sequelize.query(
      `UPDATE latest_m_batch 
       SET latest_batch_number = :sequenceNumber, last_updated_date = :today 
       WHERE id = 1`,
      {
        replacements: { sequenceNumber, today },
        type: sequelize.QueryTypes.UPDATE,
        transaction: t
      }
    );

    const farmerNames = [...new Set(batches.map(b => b.farmerName).filter(Boolean))];
    const farmerNamesString = farmerNames.length > 0 ? farmerNames.join(', ') : 'Multiple';
    const earliestReceivingDate = batches.reduce((earliest, b) => {
      const date = new Date(b.receivingDate);
      return date < new Date(earliest) ? b.receivingDate : earliest;
    }, batches[0].receivingDate);
    const totalBags = batches.reduce((sum, b) => sum + (parseInt(b.totalBags) || 0), 0);
    const rfids = batches.flatMap(b => b.rfid ? b.rfid.split(',').map(s => s.trim()) : []).filter(Boolean);

    // Insert new batch into ReceivingData
    await sequelize.query(
      `INSERT INTO "ReceivingData" (
        "batchNumber", "weight", "farmerName", "receivingDate", "type", "totalBags", 
        "commodityType", "producer", merged, "createdAt", "updatedAt", "rfid", "currentAssign"
      ) VALUES (
        :batchNumber, :weight, :farmerName, :receivingDate, :type, :totalBags, 
        :commodityType, :producer, FALSE, :createdAt, :updatedAt, :rfid, 1
      )`,
      {
        replacements: {
          batchNumber: newBatchNumber,
          weight: totalWeight,
          farmerName: farmerNamesString,
          receivingDate: earliestReceivingDate,
          type: batches[0].type,
          totalBags: totalBags || null,
          commodityType: batches[0].commodityType,
          producer: batches[0].producer,
          createdAt: new Date(),
          updatedAt: new Date(),
          rfid: rfids.length > 0 ? rfids.join(',') : null
        },
        type: sequelize.QueryTypes.INSERT,
        transaction: t
      }
    );

    // Insert into PreprocessingData for the new batch
    await sequelize.query(
      `INSERT INTO "PreprocessingData" (
        "batchNumber", "processingType", "producer", "createdAt", "updatedAt", "createdBy"
      ) VALUES (
        :batchNumber, :processingType, :producer, :createdAt, :updatedAt, :createdBy
      )`,
      {
        replacements: {
          batchNumber: newBatchNumber,
          processingType,
          producer: batches[0].producer,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: createdBy || 'Unknown'
        },
        type: sequelize.QueryTypes.INSERT,
        transaction: t
      }
    );

    // Insert into DryMillData
    await sequelize.query(
      `INSERT INTO "DryMillData" (
        "batchNumber", "entered_at", "dryMillMerged"
      ) VALUES (
        :batchNumber, :enteredAt, FALSE
      )`,
      {
        replacements: {
          batchNumber: newBatchNumber,
          enteredAt: batches.reduce((min, b) => {
            const date = new Date(b.dryMillEntered);
            return date < new Date(min) ? b.dryMillEntered : min;
          }, batches[0].dryMillEntered),
        },
        type: sequelize.QueryTypes.INSERT,
        transaction: t
      }
    );

    // Update original batches in DryMillData
    await sequelize.query(
      `UPDATE "DryMillData" 
       SET "dryMillMerged" = TRUE 
       WHERE LOWER("batchNumber") IN (:batchNumbers)`,
      {
        replacements: { batchNumbers: parsedBatches.map(b => b.batchNumber.toLowerCase()) },
        type: sequelize.QueryTypes.UPDATE,
        transaction: t
      }
    );

    // Insert into DryMillBatchMerges
    await sequelize.query(
      `INSERT INTO "DryMillBatchMerges" (
        new_batch_number, original_batch_numbers, merged_at, created_by, notes, total_weight, processing_type
      ) VALUES (
        :newBatchNumber, ARRAY[:originalBatchNumbers], :mergedAt, :createdBy, :notes, :totalWeight, :processingType
      )`,
      {
        replacements: {
          newBatchNumber,
          originalBatchNumbers: parsedBatches.map(b => b.batchNumber),
          mergedAt: new Date(),
          createdBy: createdBy || 'Unknown',
          notes: notes || null,
          totalWeight: totalWeight.toFixed(2),
          processingType
        },
        type: sequelize.QueryTypes.INSERT,
        transaction: t
      }
    );

    await t.commit();
    logger.info('Batches merged successfully in dry mill', { newBatchNumber, batchNumbers, user: createdBy });
    res.json({
      success: true,
      newBatchNumber,
      totalWeight,
      farmerName: farmerNamesString,
      receivingDate: earliestReceivingDate,
      totalBags,
      rfid: rfids.length > 0 ? rfids.join(',') : null
    });
  } catch (err) {
    if (t) await t.rollback();
    logger.error('Error merging batches in dry mill', { error: err.message, stack: err.stack, user: createdBy || 'unknown' });
    res.status(400).json({ error: 'Failed to merge batches', details: err.message });
  }
});

module.exports = router;