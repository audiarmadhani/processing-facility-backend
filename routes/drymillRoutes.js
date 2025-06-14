const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');
const validator = require('validator');
const winston = require('winston');

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
    logger.info('Fetched ProcessingTypes successfully');
    res.status(200).json(processingTypes);
  } catch (error) {
    logger.error('Error fetching ProcessingTypes', { error: error.message, stack: error.stack });
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
    logger.info('Fetched ProductLines successfully');
    res.status(200).json(productLines);
  } catch (error) {
    logger.error('Error fetching ProductLines', { error: error.message, stack: error.stack });
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
    logger.info('Fetched ReferenceMappings successfully');
    res.status(200).json(referenceMappings);
  } catch (error) {
    logger.error('Error fetching ReferenceMappings', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch ReferenceMappings', details: error.message });
  }
});

// GET route for dry mill grades by batch number
router.get('/dry-mill-grades/:batchNumber', async (req, res) => {
  const { batchNumber } = req.params;
  let { processingType } = req.query;

  if (!batchNumber || !processingType) {
    logger.warn('Missing required parameters', { batchNumber, processingType });
    return res.status(400).json({ error: 'batchNumber and processingType query parameter are required.' });
  }

  let t;
  try {
    t = await sequelize.transaction();

    // Normalize processingType (optional, for robustness)
    processingType = processingType.replace(/\+/g, ' ').trim();

    // Check if batchNumber is a sub-batch
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

    let validProcessingType;

    if (subBatch && subBatch.parentBatchNumber) {
      // Sub-batch: Validate processingType in PostprocessingData
      validProcessingType = subBatch;
    } else {
      // Parent batch: Validate processingType in PreprocessingData
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
      logger.warn('Invalid processing type', { batchNumber, processingType });
      return res.status(400).json({ error: 'Invalid processing type for this batch.' });
    }

    let grades;
    let relevantBatchNumber = batchNumber;

    if (subBatch && subBatch.parentBatchNumber && subBatch.quality) {
      // Sub-batch: Fetch only the specific grade
      relevantBatchNumber = subBatch.parentBatchNumber;
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
        replacements: { parentBatchNumber: subBatch.parentBatchNumber, quality: subBatch.quality, processingType },
        type: sequelize.QueryTypes.SELECT,
        transaction: t
      });

      for (let grade of grades) {
        if (!grade.bagWeights || grade.bagWeights.length === 0 || grade.bagWeights[0] === null) {
          logger.debug(`No bagWeights for subBatchId: ${grade.subBatchId}, querying BagDetails directly`);
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
    } else {
      // Parent batch: Fetch all grades
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

      for (let grade of grades) {
        if (!grade.bagWeights || grade.bagWeights.length === 0 || grade.bagWeights[0] === null) {
          logger.debug(`No bagWeights for subBatchId: ${grade.subBatchId}, querying BagDetails directly`);
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
      if (subBatch && subBatch.quality && subBatch.parentBatchNumber) {
        const subBatchId = `${subBatch.parentBatchNumber}-${subBatch.quality.replace(/\s+/g, '-')}`;
        formattedGrades.push({
          subBatchId,
          grade: subBatch.quality,
          weight: '0.00',
          bagWeights: [],
          bagged_at: new Date().toISOString().split('T')[0],
          is_stored: false,
          tempSequence: '0001'
        });
      } else {
        const defaultGrades = ['Specialty Grade', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4'];
        formattedGrades.push(...defaultGrades.map(grade => ({
          subBatchId: `${relevantBatchNumber}-${grade.replace(/\s+/g, '-')}`,
          grade,
          weight: '0.00',
          bagWeights: [],
          bagged_at: new Date().toISOString().split('T')[0],
          is_stored: false,
          tempSequence: '0001'
        })));
      }
    }

    await t.commit();
    logger.info('Fetched grades successfully', { batchNumber, processingType });
    res.status(200).json(formattedGrades);
  } catch (error) {
    if (t) await t.rollback();
    logger.error('Error fetching grades', { batchNumber, processingType, error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch grades', details: error.message });
  }
});

// POST route for manual green bean splitting, weighing, and bagging
router.post('/dry-mill/:batchNumber/split', async (req, res) => {
  const { batchNumber } = req.params;
  const { grades, processingType } = req.body;

  if (!batchNumber || !grades || !Array.isArray(grades) || grades.length === 0 || !processingType) {
    logger.warn('Invalid split request', { batchNumber, gradesProvided: !!grades, processingType });
    return res.status(400).json({ error: 'Batch number, valid grades, and processingType are required.' });
  }

  const validGrades = grades.filter(g => Array.isArray(g.bagWeights) && g.bagWeights.length > 0);
  if (validGrades.length === 0) {
    logger.warn('No valid grades with bags', { batchNumber, processingType });
    return res.status(400).json({ error: 'At least one grade must have bags added.' });
  }

  let t;
  try {
    t = await sequelize.transaction();

    // Validate batch and processingType
    const [dryMillEntry] = await sequelize.query(`
      SELECT dm."entered_at", pp."processingType", pp."productLine", pp."producer", rd."type", rd."farmerName"
      FROM "DryMillData" dm
      JOIN "PreprocessingData" pp ON dm."batchNumber" = pp."batchNumber"
      JOIN "ReceivingData" rd ON dm."batchNumber" = rd."batchNumber"
      WHERE dm."batchNumber" = :batchNumber
      AND pp."processingType" = :processingType
      AND dm."entered_at" IS NOT NULL
      LIMIT 1
    `, {
      replacements: { batchNumber, processingType },
      transaction: t,
      type: sequelize.QueryTypes.SELECT
    });

    if (!dryMillEntry) {
      await t.rollback();
      logger.warn('Batch not found or not entered', { batchNumber, processingType });
      return res.status(400).json({ error: 'Batch must be entered into dry mill first or invalid processingType.' });
    }

    const parentBatch = dryMillEntry;

    // Clear existing data
    await sequelize.query(`
      DELETE FROM "BagDetails"
      WHERE grade_id IN (SELECT "subBatchId" FROM "DryMillGrades" WHERE "batchNumber" = :batchNumber AND processing_type = :processingType)
    `, { replacements: { batchNumber, processingType }, transaction: t });

    await sequelize.query(`
      DELETE FROM "DryMillGrades"
      WHERE "batchNumber" = :batchNumber AND processing_type = :processingType
    `, { replacements: { batchNumber, processingType }, transaction: t });

    await sequelize.query(`
      DELETE FROM "PostprocessingData"
      WHERE "parentBatchNumber" = :batchNumber AND "processingType" = :processingType
    `, { replacements: { batchNumber, processingType }, transaction: t });

    const results = [];
    const subBatches = [];
    const currentYear = new Date().getFullYear().toString().slice(-2);

    const [productResults] = await sequelize.query(
      'SELECT abbreviation FROM "ProductLines" WHERE "productLine" = :productLine LIMIT 1',
      { replacements: { productLine: parentBatch.productLine }, transaction: t, type: sequelize.QueryTypes.SELECT }
    );
    const [processingResults] = await sequelize.query(
      'SELECT abbreviation FROM "ProcessingTypes" WHERE "processingType" = :processingType LIMIT 1',
      { replacements: { processingType: parentBatch.processingType }, transaction: t, type: sequelize.QueryTypes.SELECT }
    );

    if (!productResults || !processingResults) {
      await t.rollback();
      logger.warn('Invalid product line or processing type', { batchNumber, processingType });
      return res.status(400).json({ error: 'Invalid product line or processing type' });
    }

    const productAbbreviation = productResults.abbreviation;
    const processingAbbreviation = processingResults.abbreviation;
    const batchPrefix = `${parentBatch.producer}${currentYear}${productAbbreviation}-${processingAbbreviation}`;

    for (const { grade, bagWeights, bagged_at, tempSequence } of validGrades) {
      if (!grade || typeof grade !== 'string' || grade.trim() === '') {
        await t.rollback();
        logger.warn('Invalid grade', { batchNumber, processingType, grade });
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
            producer: parentBatch.producer, 
            productLine: parentBatch.productLine, 
            processingType: parentBatch.processingType, 
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

      await sequelize.query(`
        INSERT INTO "DryMillGrades" ("batchNumber", "subBatchId", grade, weight, split_at, bagged_at, "is_stored", processing_type)
        VALUES (:batchNumber, :subBatchId, :grade, :weight, NOW(), :bagged_at, FALSE, :processingType)
      `, { 
        replacements: { 
          batchNumber, 
          subBatchId, 
          grade, 
          weight: totalWeight, 
          bagged_at: baggedAtValue,
          processingType
        }, 
        transaction: t,
        type: sequelize.QueryTypes.INSERT 
      });

      for (let i = 0; i < weights.length; i++) {
        await sequelize.query(`
          INSERT INTO "BagDetails" (grade_id, bag_number, weight, bagged_at, is_stored)
          VALUES (:gradeId, :bagNumber, :weight, :baggedAt, FALSE)
        `, {
          replacements: {
            gradeId: subBatchId,
            bagNumber: i + 1,
            weight: weights[i],
            baggedAt: baggedAtValue
          },
          transaction: t,
          type: sequelize.QueryTypes.INSERT
        });
      }

      results.push({ subBatchId, grade, weight: totalWeight, bagWeights: weights, bagged_at: baggedAtValue });

      const [referenceResults] = await sequelize.query(
        'SELECT "referenceNumber" FROM "ReferenceMappings_duplicate" WHERE "productLine" = :productLine AND "processingType" = :processingType AND "producer" = :producer AND "type" = :type LIMIT 1',
        {
          replacements: {
            productLine: parentBatch.productLine,
            processingType: parentBatch.processingType,
            producer: parentBatch.producer,
            type: parentBatch.type
          },
          transaction: t,
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (!referenceResults) {
        await t.rollback();
        logger.warn('No reference number found', { batchNumber, processingType, grade });
        return res.status(400).json({ error: `No matching reference number found for grade ${grade}` });
      }

      const baseReferenceNumber = referenceResults.referenceNumber;

      let qualitySuffix;
      switch (grade) {
        case 'Specialty Grade': qualitySuffix = '-S'; break;
        case 'Grade 1': qualitySuffix = '-G1'; break;
        case 'Grade 2': qualitySuffix = '-G2'; break;
        case 'Grade 3': qualitySuffix = '-G3'; break;
        case 'Grade 4': qualitySuffix = '-G4'; break;
        default:
          await t.rollback();
          logger.warn('Invalid grade suffix', { batchNumber, processingType, grade });
          return res.status(400).json({ error: `Invalid grade: ${grade}` });
      }

      const referenceNumber = `${baseReferenceNumber}${qualitySuffix}`;
      const newBatchNumber = `${batchPrefix}-${formattedSequence}${qualitySuffix}`;
      const totalBags = bagWeights.length;

      await sequelize.query(`
        INSERT INTO "PostprocessingData" ("batchNumber", "referenceNumber", "processingType", "productLine", weight, "totalBags", notes, quality, producer, "storedDate", "createdAt", "updatedAt", "parentBatchNumber")
        VALUES (:batchNumber, :referenceNumber, :processingType, :productLine, :weight, :totalBags, :notes, :quality, :producer, :storedDate, :createdAt, :updatedAt, :parentBatchNumber)
      `, {
        replacements: {
          batchNumber: newBatchNumber,
          referenceNumber,
          processingType: parentBatch.processingType,
          productLine: parentBatch.productLine,
          weight: totalWeight,
          totalBags,
          notes: '',
          quality: grade,
          producer: parentBatch.producer,
          storedDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          parentBatchNumber: batchNumber,
        },
        transaction: t,
        type: sequelize.QueryTypes.INSERT,
      });

      subBatches.push({
        batchNumber: newBatchNumber,
        referenceNumber,
        quality: grade,
      });

      await sequelize.query(
        `INSERT INTO "LotNumberSequences" (producer, productLine, processingType, year, grade, sequence) 
         VALUES (:producer, :productLine, :processingType, :year, :grade, :sequence)
         ON CONFLICT (producer, productLine, processingType, year, grade) 
         DO UPDATE SET sequence = :sequence`,
        { 
          replacements: { 
            producer: parentBatch.producer, 
            productLine: parentBatch.productLine, 
            processingType: parentBatch.processingType, 
            year: currentYear, 
            grade, 
            sequence: sequenceNumber + 1 
          }, 
          transaction: t,
          type: sequelize.QueryTypes.INSERT 
        }
      );
    }

    await t.commit();
    logger.info('Green bean splits saved successfully', { batchNumber, processingType, subBatches: subBatches.length });
    res.status(201).json({ message: 'Green bean splits saved successfully', grades: results, subBatches });
  } catch (error) {
    if (t) await t.rollback();
    logger.error('Error saving green bean splits', { batchNumber, processingType, error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to save green bean splits', details: error.message });
  }
});

// POST route to update bags for a specific grade (sub-batch)
router.post('/dry-mill/:batchNumber/update-bags', async (req, res) => {
  const { batchNumber } = req.params;
  const { grade, bagWeights, bagged_at, processingType } = req.body;

  if (!batchNumber || !grade || !Array.isArray(bagWeights) || !processingType) {
    logger.warn('Invalid update-bags request', { batchNumber, grade, bagWeightsProvided: !!bagWeights, processingType });
    return res.status(400).json({ error: 'Batch number, grade, bag weights, and processingType are required.' });
  }

  let t;
  try {
    t = await sequelize.transaction();

    // Validate processingType
    const [validProcessingType] = await sequelize.query(`
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
      logger.warn('Invalid processing type', { batchNumber, processingType });
      return res.status(400).json({ error: 'Invalid processing type for this batch.' });
    }

    // Verify sub-batch exists
    const [subBatch] = await sequelize.query(`
      SELECT "batchNumber", "parentBatchNumber", "quality", "processingType"
      FROM "PostprocessingData"
      WHERE "batchNumber" = :batchNumber
      AND "quality" = :grade
      AND "processingType" = :processingType
      LIMIT 1
    `, {
      replacements: { batchNumber, grade, processingType },
      transaction: t,
      type: sequelize.QueryTypes.SELECT
    });

    if (!subBatch) {
      await t.rollback();
      logger.warn('Sub-batch not found', { batchNumber, grade, processingType });
      return res.status(404).json({ error: 'Sub-batch not found or grade/processingType does not match.' });
    }

    const parentBatchNumber = subBatch.parentBatchNumber;
    const subBatchId = `${parentBatchNumber}-${grade.replace(/\s+/g, '-')}`;

    // Validate weights
    const weights = bagWeights.map(w => {
      const weightNum = parseFloat(w);
      if (isNaN(weightNum) || weightNum <= 0) {
        throw new Error(`Invalid weight for grade ${grade}: must be a positive number.`);
      }
      return weightNum;
    });
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const baggedAtValue = bagged_at || new Date().toISOString().split('T')[0];

    // Delete existing bags
    await sequelize.query(`
      DELETE FROM "BagDetails"
      WHERE grade_id = :subBatchId
    `, {
      replacements: { subBatchId },
      transaction: t
    });

    // Update or insert DryMillGrades
    await sequelize.query(`
      INSERT INTO "DryMillGrades" ("batchNumber", "subBatchId", grade, weight, split_at, bagged_at, "is_stored", processing_type)
      VALUES (:parentBatchNumber, :subBatchId, :grade, :weight, NOW(), :bagged_at, FALSE, :processingType)
      ON CONFLICT ("subBatchId")
      DO UPDATE SET
        weight = :weight,
        bagged_at = :bagged_at,
        is_stored = FALSE,
        processing_type = :processingType
    `, {
      replacements: {
        parentBatchNumber,
        subBatchId,
        grade,
        weight: totalWeight,
        bagged_at: baggedAtValue,
        processingType
      },
      transaction: t,
      type: sequelize.QueryTypes.INSERT
    });

    // Insert new bags
    for (let i = 0; i < weights.length; i++) {
      await sequelize.query(`
        INSERT INTO "BagDetails" (grade_id, bag_number, weight, bagged_at, is_stored)
        VALUES (:gradeId, :bagNumber, :weight, :baggedAt, FALSE)
      `, {
        replacements: {
          gradeId: subBatchId,
          bagNumber: i + 1,
          weight: weights[i],
          baggedAt: baggedAtValue
        },
        transaction: t,
        type: sequelize.QueryTypes.INSERT
      });
    }

    // Update PostprocessingData
    await sequelize.query(`
      UPDATE "PostprocessingData"
      SET weight = :weight, "totalBags" = :totalBags, "updatedAt" = NOW()
      WHERE "batchNumber" = :batchNumber AND "processingType" = :processingType
    `, {
      replacements: {
        batchNumber,
        weight: totalWeight,
        totalBags: weights.length,
        processingType
      },
      transaction: t,
      type: sequelize.QueryTypes.UPDATE
    });

    await t.commit();
    logger.info('Bags updated successfully', { batchNumber, grade, processingType });
    res.status(200).json({ message: 'Bags updated successfully', grade, weight: totalWeight, bagWeights: weights });
  } catch (error) {
    if (t) await t.rollback();
    logger.error('Error updating bags', { batchNumber, grade, processingType, error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to update bags', details: error.message });
  }
});

// POST route to complete a batch
router.post('/dry-mill/:batchNumber/complete', async (req, res) => {
  const { batchNumber } = req.params;
  const { createdBy, updatedBy } = req.body;

  if (!batchNumber) {
    logger.warn('Missing batch number', { batchNumber });
    return res.status(400).json({ error: 'Batch number is required.' });
  }
  if (!createdBy || !updatedBy) {
    logger.warn('Missing user information', { createdBy, updatedBy });
    return res.status(400).json({ error: 'createdBy and updatedBy are required for inventory operations.' });
  }

  let t;
  try {
    t = await sequelize.transaction();

    // Check if batch is in dry mill
    const [dryMillEntry] = await sequelize.query(`
      SELECT entered_at, exited_at
      FROM "DryMillData"
      WHERE "batchNumber" = :batchNumber
      AND "entered_at" IS NOT NULL
      AND "exited_at" IS NULL
      LIMIT 1
    `, {
      replacements: { batchNumber },
      transaction: t,
      type: sequelize.QueryTypes.SELECT
    });

    if (!dryMillEntry) {
      await t.rollback();
      logger.warn('Batch not in dry mill or already processed', { batchNumber });
      return res.status(400).json({ error: 'Batch is not in dry mill or already processed.' });
    }

    // Fetch all processing types for the batch from PreprocessingData
    const processingTypes = await sequelize.query(`
      SELECT DISTINCT "processingType"
      FROM "PreprocessingData"
      WHERE "batchNumber" = :batchNumber
    `, {
      replacements: { batchNumber },
      transaction: t,
      type: sequelize.QueryTypes.SELECT
    });

    if (!processingTypes.length) {
      await t.rollback();
      logger.warn('No processing types found for batch', { batchNumber });
      return res.status(400).json({ error: 'No processing types defined for this batch.' });
    }

    // Validate splits for each processing type
    for (const { processingType } of processingTypes) {
      const [splits] = await sequelize.query(`
        SELECT COUNT(*) AS total, SUM(CASE WHEN weight IS NOT NULL AND weight > 0 AND bagged_at IS NOT NULL THEN 1 ELSE 0 END) AS completed
        FROM "DryMillGrades"
        WHERE "batchNumber" = :batchNumber
        AND processing_type = :processingType
      `, {
        replacements: { batchNumber, processingType },
        transaction: t,
        type: sequelize.QueryTypes.SELECT
      });

      if (splits.total === 0 || splits.completed !== splits.total) {
        await t.rollback();
        logger.warn('Incomplete splits', { batchNumber, processingType, total: splits.total, completed: splits.completed });
        return res.status(400).json({
          error: `All splits for processing type ${processingType} must have weights and bagging dates before marking as processed.`
        });
      }
    }

    // Update DryMillData
    const [result] = await sequelize.query(`
      UPDATE "DryMillData"
      SET exited_at = NOW()
      WHERE "batchNumber" = :batchNumber
      AND "entered_at" IS NOT NULL
      AND "exited_at" IS NULL
      RETURNING *
    `, {
      replacements: { batchNumber },
      transaction: t,
      type: sequelize.QueryTypes.UPDATE
    });

    if (!result) {
      await t.rollback();
      logger.warn('No dry mill entries updated', { batchNumber });
      return res.status(400).json({ error: 'No valid dry mill entries found to complete.' });
    }

    // Update ReceivingData to free the RFID tag
    await sequelize.query(`
      UPDATE "ReceivingData"
      SET "currentAssign" = 0
      WHERE "batchNumber" = :batchNumber
    `, {
      replacements: { batchNumber },
      transaction: t,
      type: sequelize.QueryTypes.UPDATE
    });

    // Update DryMillGrades to mark as stored
    await sequelize.query(`
      UPDATE "DryMillGrades"
      SET "is_stored" = TRUE
      WHERE "batchNumber" = :batchNumber
    `, {
      replacements: { batchNumber },
      transaction: t,
      type: sequelize.QueryTypes.UPDATE
    });

    // Update BagDetails to mark all bags as stored
    await sequelize.query(`
      UPDATE "BagDetails"
      SET is_stored = TRUE
      WHERE grade_id IN (SELECT "subBatchId" FROM "DryMillGrades" WHERE "batchNumber" = :batchNumber)
    `, {
      replacements: { batchNumber },
      transaction: t,
      type: sequelize.QueryTypes.UPDATE
    });

    // Update PostprocessingData to set storedDate for sub-batches
    await sequelize.query(`
      UPDATE "PostprocessingData"
      SET "storedDate" = NOW()
      WHERE "parentBatchNumber" = :batchNumber
    `, {
      replacements: { batchNumber },
      transaction: t,
      type: sequelize.QueryTypes.UPDATE
    });

    // Handle CherryInventoryStatus
    const [cherryInventory] = await sequelize.query(
      `SELECT status, orderId FROM "CherryInventoryStatus" WHERE "batchNumber" = :batchNumber AND "exitedAt" IS NULL`,
      { replacements: { batchNumber }, transaction: t, type: sequelize.QueryTypes.SELECT }
    );

    if (cherryInventory) {
      if (cherryInventory.orderId) {
        await t.rollback();
        logger.warn('Batch reserved for order', { batchNumber, orderId: cherryInventory.orderId });
        return res.status(400).json({ error: 'Cannot complete batch: cherry batch is reserved for an order.' });
      }

      await sequelize.query(
        `UPDATE "CherryInventoryStatus"
         SET status = 'Picked', "exitedAt" = NOW(), "updatedAt" = NOW(), "updatedBy" = :updatedBy
         WHERE "batchNumber" = :batchNumber AND "exitedAt" IS NULL`,
        { replacements: { batchNumber, updatedBy }, transaction: t, type: sequelize.QueryTypes.UPDATE }
      );

      await sequelize.query(
        `INSERT INTO "CherryInventoryMovements" ("batchNumber", "movementType", "movedAt", "createdBy")
         VALUES (:batchNumber, 'Exit', NOW(), :createdBy)`,
        {
          replacements: { batchNumber, createdBy },
          transaction: t,
          type: sequelize.QueryTypes.INSERT
        }
      );
    }

    // Add green bean sub-batches to GreenBeansInventoryStatus
    const subBatches = await sequelize.query(
      `SELECT "batchNumber", "storedDate" FROM "PostprocessingData" WHERE "parentBatchNumber" = :batchNumber`,
      { replacements: { batchNumber }, transaction: t, type: sequelize.QueryTypes.SELECT }
    );

    for (const subBatch of subBatches) {
      const [existing] = await sequelize.query(
        `SELECT "batchNumber" FROM "GreenBeansInventoryStatus" WHERE "batchNumber" = :batchNumber`,
        { replacements: { batchNumber: subBatch.batchNumber }, transaction: t, type: sequelize.QueryTypes.SELECT }
      );

      if (!existing) {
        await sequelize.query(
          `INSERT INTO "GreenBeansInventoryStatus" ("batchNumber", status, "enteredAt", "createdAt", "updatedAt", "createdBy", "updatedBy")
           VALUES (:batchNumber, 'Stored', :enteredAt, NOW(), NOW(), :createdBy, :updatedBy)
           RETURNING *`,
          {
            replacements: {
              batchNumber: subBatch.batchNumber,
              enteredAt: subBatch.storedDate || new Date(),
              createdBy,
              updatedBy
            },
            transaction: t,
            type: sequelize.QueryTypes.INSERT
          }
        );

        await sequelize.query(
          `INSERT INTO "GreenBeansInventoryMovements" ("batchNumber", "movementType", "movedAt", "createdBy")
           VALUES (:batchNumber, 'Entry', NOW(), :createdBy)`,
          {
            replacements: { batchNumber: subBatch.batchNumber, createdBy },
            transaction: t,
            type: sequelize.QueryTypes.INSERT
          }
        );
      }
    }

    await t.commit();
    logger.info('Batch marked as processed successfully', { batchNumber });
    res.status(200).json({
      message: 'Batch marked as processed successfully, inventory updated',
      batchNumber,
      exited_at: result[0].exited_at
    });
  } catch (error) {
    if (t) await t.rollback();
    logger.error('Error marking batch as processed', { batchNumber, error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to mark batch as processed', details: error.message });
  }
});

// GET route for dry mill data
router.get('/dry-mill-data', async (req, res) => {
  let t;
  try {
    t = await sequelize.transaction();

    // Fetch parent batches
    const parentBatchesQuery = `
      SELECT 
        dm."batchNumber",
        ARRAY_AGG(DISTINCT pp."processingType") AS "processingTypes",
        pp."productLine",
        pp."producer",
        rd."type",
        SUM(pp."weightProcessed") AS "cherry_weight",
        rd.weight AS total_weight,
        rd."totalBags",
        rd."farmerName",
        NULL AS "notes",
        NULL AS "referenceNumber",
        NULL AS quality,
        NULL AS "storedDate",
        NULL AS "parentBatchNumber",
        dm.entered_at,
        dm.exited_at,
        dm.created_at
      FROM "DryMillData" dm
      LEFT JOIN (
        SELECT 
          "batchNumber",
          "productLine", 
          producer, 
          "processingType",
          "weightProcessed"
        FROM "PreprocessingData"
      ) pp ON dm."batchNumber" = pp."batchNumber"
      JOIN "ReceivingData" rd ON dm."batchNumber" = rd."batchNumber"
      GROUP BY dm."batchNumber", pp."productLine", pp."producer", rd."type",
               rd.weight, rd."totalBags", rd."farmerName", dm.entered_at, dm.exited_at, dm.created_at
      ORDER BY dm."batchNumber" DESC
    `;
    const parentBatchesResult = await sequelize.query(parentBatchesQuery, { type: sequelize.QueryTypes.SELECT, transaction: t });

    // Fetch sub-batches
    const subBatchesQuery = `
      SELECT 
        ppd."batchNumber",
        ppd."referenceNumber",
        COALESCE(rd."type", 'Unknown') AS type,
        ppd."processingType",
        ppd."productLine",
        ppd."weight",
        ppd."totalBags",
        ppd."notes",
        ppd."quality",
        ppd."producer",
        rd."farmerName",
        DATE(ppd."storedDate") AS storeddatetrunc,
        ppd."parentBatchNumber"
      FROM "PostprocessingData" ppd
      LEFT JOIN "ReceivingData" rd ON ppd."parentBatchNumber" = rd."batchNumber"
      ORDER BY ppd."batchNumber" DESC
    `;
    const subBatchesResult = await sequelize.query(subBatchesQuery, { type: sequelize.QueryTypes.SELECT, transaction: t });

    // Fetch additional data
    const dryMillGradesQuery = `
      SELECT dg."batchNumber", dg."subBatchId", dg.grade, dg.weight, dg.split_at, dg.bagged_at, dg."is_stored", dg.processing_type
      FROM "DryMillGrades" dg
      ORDER BY dg."batchNumber", dg."subBatchId"
    `;
    const dryMillGradesResult = await sequelize.query(dryMillGradesQuery, { type: sequelize.QueryTypes.SELECT, transaction: t });

    const bagDetailsQuery = `
      SELECT bd.*, dg."batchNumber", dg.processing_type
      FROM "BagDetails" bd
      JOIN "DryMillGrades" dg ON bd.grade_id = dg."subBatchId"
      ORDER BY dg."batchNumber", bd.bag_number
    `;
    const bagDetailsResult = await sequelize.query(bagDetailsQuery, { type: sequelize.QueryTypes.SELECT, transaction: t });

    const receivingDataQuery = `
      SELECT "batchNumber", rfid, "currentAssign"
      FROM "ReceivingData"
      ORDER BY "batchNumber"
    `;
    const receivingDataResult = await sequelize.query(receivingDataQuery, { type: sequelize.QueryTypes.SELECT, transaction: t });

    const data = [];

    // Process parent batches
    for (const batch of parentBatchesResult) {
      const status = batch.exited_at ? 'Processed' : (batch.entered_at ? 'In Dry Mill' : 'Not Started');
      const storedGrades = dryMillGradesResult.filter(grade => grade.batchNumber === batch.batchNumber && grade.is_stored);
      const isStored = storedGrades.length > 0;

      data.push({
        batchNumber: batch.batchNumber,
        processingTypes: batch.processingTypes || [],
        productLine: batch.productLine,
        producer: batch.producer,
        type: batch.type,
        cherry_weight: batch.cherry_weight ? parseFloat(batch.cherry_weight).toFixed(2) : '0.00',
        total_weight: batch.total_weight,
        totalBags: batch.totalBags,
        farmerName: batch.farmerName,
        notes: batch.notes,
        referenceNumber: batch.referenceNumber,
        quality: batch.quality,
        storedDate: batch.storedDate,
        parentBatchNumber: batch.parentBatchNumber,
        status,
        dryMillEntered: batch.entered_at ? new Date(batch.entered_at).toISOString().slice(0, 10) : 'N/A',
        dryMillExited: batch.exited_at ? new Date(batch.exited_at).toISOString().slice(0, 10) : 'N/A',
        rfid: receivingDataResult.find(r => r.batchNumber === batch.batchNumber)?.rfid || 'N/A',
        bagWeights: bagDetailsResult
          .filter(bag => dryMillGradesResult.some(g => g.subBatchId === bag.grade_id && g.batchNumber === batch.batchNumber))
          .map(b => b.weight),
        green_bean_splits: dryMillGradesResult
          .filter(g => g.batchNumber === batch.batchNumber)
          .map(g => `Grade: ${g.grade}, Weight: ${g.weight ? g.weight + ' kg' : 'N/A'}, Split: ${new Date(g.split_at).toISOString().slice(0, 19).replace('T', ' ')}, Bagged: ${g.bagged_at ? new Date(g.bagged_at).toISOString().slice(0, 10) : 'N/A'}, Stored: ${g.is_stored ? 'Yes' : 'No'}, Processing Type: ${g.processing_type}`)
          .join('; '),
        isStored
      });
    }

    // Process sub-batches
    for (const batch of subBatchesResult) {
      const parentDryMillData = parentBatchesResult.find(p => p.batchNumber === batch.parentBatchNumber);
      const status = parentDryMillData?.exited_at ? 'Processed' : (parentDryMillData?.entered_at ? 'In Dry Mill' : 'Not Started');
      const storedGrades = dryMillGradesResult.filter(grade => grade.batchNumber === batch.parentBatchNumber && grade.processing_type === batch.processingType && grade.is_stored);
      const isStored = storedGrades.length > 0;

      data.push({
        batchNumber: batch.batchNumber,
        referenceNumber: batch.referenceNumber,
        type: batch.type,
        processingType: batch.processingType,
        productLine: batch.productLine,
        weight: batch.weight,
        totalBags: batch.totalBags,
        notes: batch.notes,
        quality: batch.quality,
        producer: batch.producer,
        farmerName: batch.farmerName,
        storeddatetrunc: batch.storeddatetrunc,
        parentBatchNumber: batch.parentBatchNumber,
        status,
        dryMillEntered: parentDryMillData?.entered_at ? new Date(parentDryMillData.entered_at).toISOString().slice(0, 10) : 'N/A',
        dryMillExited: parentDryMillData?.exited_at ? new Date(parentDryMillData.exited_at).toISOString().slice(0, 10) : 'N/A',
        rfid: receivingDataResult.find(r => r.batchNumber === batch.parentBatchNumber)?.rfid || 'N/A',
        bagWeights: bagDetailsResult
          .filter(bag => dryMillGradesResult.some(g => g.subBatchId === bag.grade_id && g.batchNumber === batch.parentBatchNumber && g.processing_type === batch.processingType))
          .map(b => b.weight),
        green_bean_splits: dryMillGradesResult
          .filter(g => g.batchNumber === batch.parentBatchNumber && g.processing_type === batch.processingType)
          .map(g => `Grade: ${g.grade}, Weight: ${g.weight ? g.weight + ' kg' : 'N/A'}, Split: ${new Date(g.split_at).toISOString().slice(0, 19).replace('T', ' ')}, Bagged: ${g.bagged_at ? new Date(g.bagged_at).toISOString().slice(0, 10) : 'N/A'}, Stored: ${g.is_stored ? 'Yes' : 'No'}, Processing Type: ${g.processing_type}`)
          .join('; '),
        isStored
      });
    }

    await t.commit();
    logger.info('Fetched dry mill data successfully', { parentBatches: parentBatchesResult.length, subBatches: subBatchesResult.length });
    res.status(200).json(data);
  } catch (error) {
    if (t) await t.rollback();
    logger.error('Error fetching dry mill data', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch dry mill data', details: error.message });
  }
});

// POST route for warehouse RFID scan
router.post('/warehouse/scan', async (req, res) => {
  const { rfid, scanned_at, batchNumber } = req.body;

  if (!rfid || !batchNumber) {
    logger.warn('Missing RFID or batch number', { rfid, batchNumber });
    return res.status(400).json({ error: 'RFID tag and batch number are required.' });
  }

  if (!scanned_at || scanned_at !== 'Warehouse') {
    logger.warn('Invalid scanner identifier', { scanned_at });
    return res.status(400).json({ error: 'Invalid scanner identifier. Must be "Warehouse".' });
  }

  let t;
  try {
    t = await sequelize.transaction();

    // Verify RFID and batch
    const [batch] = await sequelize.query(`
      SELECT "batchNumber"
      FROM "ReceivingData"
      WHERE "rfid" = :rfid
      AND "batchNumber" = :batchNumber
      AND "currentAssign" = 1
      LIMIT 1
    `, {
      replacements: { rfid: validator.trim(rfid).toUpperCase(), batchNumber },
      transaction: t,
      type: sequelize.QueryTypes.SELECT
    });

    if (!batch) {
      await t.rollback();
      logger.warn('RFID not associated with batch', { rfid, batchNumber });
      return res.status(404).json({ error: 'RFID not associated with this batch or batch is not active.' });
    }

    // Verify batch has exited dry mill
    const [dryMillData] = await sequelize.query(`
      SELECT exited_at
      FROM "DryMillData"
      WHERE "batchNumber" = :batchNumber
      AND exited_at IS NOT NULL
      LIMIT 1
    `, {
      replacements: { batchNumber },
      transaction: t,
      type: sequelize.QueryTypes.SELECT
    });

    if (!dryMillData) {
      await t.rollback();
      logger.warn('Batch not exited dry mill', { batchNumber });
      return res.status(400).json({ error: 'Batch has not exited the dry mill.' });
    }

    // Update inventory
    await sequelize.query(`
      INSERT INTO "RfidScanned" (rfid, scanned_at, created_at, action)
      VALUES (:rfid, :scanned_at, NOW(), 'Stored')
    `, {
      replacements: { rfid: validator.trim(rfid).toUpperCase(), scanned_at },
      transaction: t,
      type: sequelize.QueryTypes.INSERT
    });

    await sequelize.query(`
      UPDATE "DryMillGrades"
      SET "is_stored" = TRUE
      WHERE "batchNumber" = :batchNumber
    `, {
      replacements: { batchNumber },
      transaction: t,
      type: sequelize.QueryTypes.UPDATE
    });

    await sequelize.query(`
      UPDATE "BagDetails"
      SET is_stored = TRUE
      WHERE grade_id IN (SELECT "subBatchId" FROM "DryMillGrades" WHERE "batchNumber" = :batchNumber)
    `, {
      replacements: { batchNumber },
      transaction: t,
      type: sequelize.QueryTypes.UPDATE
    });

    await sequelize.query(`
      UPDATE "ReceivingData"
      SET "currentAssign" = 0
      WHERE "batchNumber" = :batchNumber
    `, {
      replacements: { batchNumber },
      transaction: t,
      type: sequelize.QueryTypes.UPDATE
    });

    await sequelize.query(`
      UPDATE "PostprocessingData"
      SET "storedDate" = NOW()
      WHERE "parentBatchNumber" = :batchNumber
    `, {
      replacements: { batchNumber },
      transaction: t,
      type: sequelize.QueryTypes.UPDATE
    });

    await t.commit();
    logger.info('Green beans marked as stored', { batchNumber, rfid });
    res.status(200).json({
      message: 'Green beans marked as stored, RFID tag available for reuse',
      rfid,
      batchNumber
    });
  } catch (error) {
    if (t) await t.rollback();
    logger.error('Error processing warehouse RFID scan', { rfid, batchNumber, error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to process warehouse RFID scan', details: error.message });
  }
});

// POST route for RFID reuse
router.post('/rfid/reuse', async (req, res) => {
  const { batchNumber } = req.body;

  if (!batchNumber) {
    logger.warn('Missing batch number for RFID reuse', { batchNumber });
    return res.status(400).json({ error: 'Batch number is required.' });
  }

  let t;
  try {
    t = await sequelize.transaction();

    const [batch] = await sequelize.query(`
      SELECT "rfid", "currentAssign"
      FROM "ReceivingData"
      WHERE "batchNumber" = :batchNumber
      LIMIT 1
    `, {
      replacements: { batchNumber },
      transaction: t,
      type: sequelize.QueryTypes.SELECT
    });

    if (!batch) {
      await t.rollback();
      logger.warn('Batch not found for RFID reuse', { batchNumber });
      return res.status(404).json({ error: 'Batch not found.' });
    }

    if (batch.currentAssign !== 0) {
      await t.rollback();
      logger.warn('RFID not ready for reuse', { batchNumber, rfid: batch.rfid });
      return res.status(400).json({ error: 'RFID tag is not ready for reuse.' });
    }

    await sequelize.query(`
      UPDATE "ReceivingData"
      SET "currentAssign" = 1
      WHERE "batchNumber" = :batchNumber
    `, {
      replacements: { batchNumber },
      transaction: t,
      type: sequelize.QueryTypes.UPDATE
    });

    await t.commit();
    logger.info('RFID tag reused successfully', { batchNumber, rfid: batch.rfid });
    res.status(200).json({ message: 'RFID tag is now ready for reuse', batchNumber });
  } catch (error) {
    if (t) await t.rollback();
    logger.error('Error reusing RFID tag', { batchNumber, error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to reuse RFID tag', details: error.message });
  }
});

module.exports = router;