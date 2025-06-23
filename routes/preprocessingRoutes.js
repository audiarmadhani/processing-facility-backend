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
    new winston.transports.File({ filename: 'logs/preprocessing.log' })
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

// Route for creating preprocessing data
router.post('/preprocessing', async (req, res) => {
  let t;
  try {
    const { batchNumber, weightProcessed, processingDate, producer, productLine, processingType, quality, createdBy, notes } = req.body;

    if (!batchNumber || weightProcessed === undefined || !producer || !productLine || !processingType || !quality) {
      logger.warn('Missing required parameters', { batchNumber, user: createdBy || 'unknown' });
      return res.status(400).json({ error: 'Batch number, weight processed, producer, product line, processing type, and quality are required.' });
    }

    if (isNaN(weightProcessed) || weightProcessed <= 0) {
      logger.warn('Invalid weight processed', { batchNumber, weightProcessed, user: createdBy || 'unknown' });
      return res.status(400).json({ error: 'Weight processed must be a positive number.' });
    }

    t = await sequelize.transaction();

    // Check available weight and retrieve type
    const [batch] = await sequelize.query(
      `SELECT weight, "type", "farmerName" FROM "ReceivingData" WHERE LOWER("batchNumber") = LOWER(:batchNumber)`,
      { replacements: { batchNumber: batchNumber.trim() }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    if (!batch) {
      await t.rollback();
      logger.warn('Batch not found', { batchNumber, user: createdBy || 'unknown' });
      throw new Error('Batch not found.');
    }

    const totalWeight = parseFloat(batch.weight);
    const batchType = batch.type; // Retrieve type (Arabica or Robusta)
    const [processed] = await sequelize.query(
      `SELECT SUM("weightProcessed") AS totalWeightProcessed, COALESCE(BOOL_OR(finished), FALSE) AS finished 
       FROM "PreprocessingData" 
       WHERE LOWER("batchNumber") = LOWER(:batchNumber)`,
      { replacements: { batchNumber: batchNumber.trim() }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    const totalWeightProcessed = parseFloat(processed.totalWeightProcessed || 0);
    const isFinished = processed.finished;
    const weightAvailable = totalWeight - totalWeightProcessed;

    if (isFinished) {
      await t.rollback();
      logger.warn('Batch already finished', { batchNumber, user: createdBy || 'unknown' });
      throw new Error('Batch is already marked as finished.');
    }

    if (weightProcessed > weightAvailable) {
      await t.rollback();
      logger.warn('Insufficient weight available', { batchNumber, weightProcessed, weightAvailable, user: createdBy || 'unknown' });
      throw new Error(`Cannot process ${weightProcessed} kg. Only ${weightAvailable} kg available.`);
    }

    // Fetch product line and processing type abbreviations
    const [productLineEntry] = await sequelize.query(
      `SELECT abbreviation FROM "ProductLines" WHERE "productLine" = :productLine LIMIT 1`,
      { replacements: { productLine }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    const [processingTypeEntry] = await sequelize.query(
      `SELECT "processingType" FROM "ProcessingTypes" WHERE abbreviation = :processingType LIMIT 1`, // Changed to select processingType
      { replacements: { processingType }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    if (!productLineEntry || !processingTypeEntry) {
      await t.rollback();
      logger.warn('Invalid product line or processing type', { batchNumber, productLine, processingType, user: createdBy || 'unknown' });
      throw new Error('Invalid product line or processing type.');
    }

    const productLineAbbreviation = productLineEntry.abbreviation;
    const processingTypeAbbreviation = processingTypeEntry.processingType; // Use processingType (e.g., N, W, CMN)
    const currentYear = processingDate ? new Date(processingDate).getFullYear().toString().slice(-2) : new Date().getFullYear().toString().slice(-2); // Use processingDate if provided

    let lotNumber, referenceNumber;

    if (producer === 'HQ') {
      // Generate lot number for HQ: HQ{Year}{ProductLineAbbreviation}-{ProcessingTypeAbbreviation}-{SequentialNumber}
      const batchPrefix = `HQ${currentYear}${productLineAbbreviation}-${processingTypeAbbreviation}`;
      
      let sequenceNumber = 1;
      const [sequenceResult] = await sequelize.query(
        `SELECT sequence FROM "LotNumberSequences" 
         WHERE producer = :producer AND productLine = :productLine 
         AND processingType = :processingType AND year = :year 
         FOR UPDATE`,
        { 
          replacements: { producer, productLine, processingType, year: currentYear }, 
          type: sequelize.QueryTypes.SELECT, 
          transaction: t 
        }
      );

      if (sequenceResult) {
        sequenceNumber = sequenceResult.sequence;
      }

      const formattedSequence = sequenceNumber.toString().padStart(4, '0');
      lotNumber = `${batchPrefix}-${formattedSequence}`;

      // Update LotNumberSequences
      await sequelize.query(
        `INSERT INTO "LotNumberSequences" (
          producer, productLine, processingType, year, sequence
        ) VALUES (
          :producer, :productLine, :processingType, :year, :sequence
        )
        ON CONFLICT (producer, productLine, processingType, year) 
        DO UPDATE SET sequence = :sequence`,
        {
          replacements: { producer, productLine, processingType, year: currentYear, sequence: sequenceNumber + 1 },
          type: sequelize.QueryTypes.INSERT,
          transaction: t
        }
      );

      // Fetch reference number for HQ
      const [referenceResult] = await sequelize.query(
        `SELECT "referenceNumber" FROM "ReferenceMappings_duplicate"
         WHERE "productLine" = :productLine
         AND "processingType" = :processingType
         AND "producer" = :producer
         AND "type" = :type
         LIMIT 1`,
        {
          replacements: { productLine, processingType, producer, type: batchType },
          type: sequelize.QueryTypes.SELECT,
          transaction: t
        }
      );

      if (!referenceResult) {
        await t.rollback();
        logger.warn('No reference number found', { batchNumber, productLine, processingType, producer, type: batchType, user: createdBy || 'unknown' });
        throw new Error('No matching reference number found.');
      }

      referenceNumber = referenceResult.referenceNumber;
    } else if (producer === 'BTM') {
      // Generate lot number for BTM: ID-BTM-{Type}-{ProcessingTypeAbbreviation}
      const typeAbbreviation = batchType === 'Arabica' ? 'A' : 'R';
      lotNumber = `ID-BTM-${typeAbbreviation}-${processingTypeAbbreviation}`;
      referenceNumber = null; // BTM does not use reference numbers
    } else {
      await t.rollback();
      logger.warn('Invalid producer', { batchNumber, producer, user: createdBy || 'unknown' });
      throw new Error('Invalid producer.');
    }

    // Format date
    const now = new Date();
    const formattedProcessingDate = processingDate ? new Date(processingDate) : now;

    // Insert data into PreprocessingData table
    const [preprocessingData] = await sequelize.query(
      `INSERT INTO "PreprocessingData" (
        "batchNumber", "weightProcessed", "processingDate", "producer", 
        "productLine", "processingType", "quality", "lotNumber", "referenceNumber",
        "createdAt", "updatedAt", "createdBy", notes, finished
      ) VALUES (
        :batchNumber, :weightProcessed, :processingDate, :producer, 
        :productLine, :processingType, :quality, :lotNumber, :referenceNumber,
        :createdAt, :updatedAt, :createdBy, :notes, :finished
      ) 
      RETURNING *`,
      {
        replacements: {
          batchNumber: batchNumber.trim(),
          weightProcessed,
          processingDate: formattedProcessingDate,
          producer,
          productLine,
          processingType,
          quality,
          lotNumber,
          referenceNumber,
          createdAt: now,
          updatedAt: now,
          createdBy,
          notes: notes || null,
          finished: false
        },
        type: sequelize.QueryTypes.INSERT,
        transaction: t
      }
    );

    await t.commit();
    logger.info('Preprocessing data created successfully', { batchNumber, lotNumber, referenceNumber, user: createdBy || 'unknown' });
    res.status(201).json({
      message: 'Preprocessing data created successfully.',
      preprocessingData,
    });
  } catch (err) {
    if (t) await t.rollback();
    logger.error('Error creating preprocessing data', { batchNumber, error: err.message, stack: err.stack, user: req.body.createdBy || 'unknown' });
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Route for marking a batch as complete
router.put('/preprocessing/:batchNumber/finish', async (req, res) => {
  let t;
  try {
    const { batchNumber } = req.params;
    const { createdBy } = req.body; // Added to log user
    if (!batchNumber) {
      logger.warn('Missing batch number', { user: createdBy || 'unknown' });
      return res.status(400).json({ error: 'Batch number is required.' });
    }

    t = await sequelize.transaction();

    // Check if batch exists in ReceivingData and get type
    const [batch] = await sequelize.query(
      `SELECT "batchNumber", "type" FROM "ReceivingData" WHERE LOWER("batchNumber") = LOWER(:batchNumber)`,
      { replacements: { batchNumber: batchNumber.trim() }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    if (!batch) {
      await t.rollback();
      logger.warn('Batch not found', { batchNumber, user: createdBy || 'unknown' });
      return res.status(404).json({ error: 'Batch not found in receiving data.' });
    }

    const batchType = batch.type;

    // Check if batch is already finished
    const [processed] = await sequelize.query(
      `SELECT COALESCE(BOOL_OR(finished), FALSE) AS finished 
       FROM "PreprocessingData" 
       WHERE LOWER("batchNumber") = LOWER(:batchNumber)`,
      { replacements: { batchNumber: batchNumber.trim() }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    if (processed.finished) {
      await t.rollback();
      logger.warn('Batch already finished', { batchNumber, user: createdBy || 'unknown' });
      return res.status(400).json({ error: 'Batch is already marked as finished.' });
    }

    // Check if preprocessing data exists
    const [existingRows] = await sequelize.query(
      `SELECT * FROM "PreprocessingData" WHERE LOWER("batchNumber") = LOWER(:batchNumber)`,
      { replacements: { batchNumber: batchNumber.trim() }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    if (!existingRows.length) {
      // Insert a dummy preprocessing record with valid lotNumber and referenceNumber
      const now = new Date();
      const defaultProductLine = 'Unknown';
      const defaultProcessingType = 'Unknown';
      const defaultProducer = 'Unknown';
      const defaultQuality = 'Unknown';

      // Fetch default product line and processing type abbreviations
      const [productLineEntry] = await sequelize.query(
        `SELECT abbreviation FROM "ProductLines" WHERE "productLine" = :productLine LIMIT 1`,
        { replacements: { productLine: defaultProductLine }, type: sequelize.QueryTypes.SELECT, transaction: t }
      );

      const [processingTypeEntry] = await sequelize.query(
        `SELECT "processingType" FROM "ProcessingTypes" WHERE abbreviation = :processingType LIMIT 1`,
        { replacements: { processingType: defaultProcessingType }, type: sequelize.QueryTypes.SELECT, transaction: t }
      );

      let dummyLotNumber, dummyReferenceNumber;

      if (defaultProducer === 'HQ') {
        const currentYear = now.getFullYear().toString().slice(-2);
        const productLineAbbreviation = productLineEntry?.abbreviation || 'UN';
        const processingTypeAbbreviation = processingTypeEntry?.processingType || 'UN';
        const batchPrefix = `HQ${currentYear}${productLineAbbreviation}-${processingTypeAbbreviation}`;
        
        let sequenceNumber = 1;
        const [sequenceResult] = await sequelize.query(
          `SELECT sequence FROM "LotNumberSequences" 
           WHERE producer = :producer AND productLine = :productLine 
           AND processingType = :processingType AND year = :year 
           FOR UPDATE`,
          { 
            replacements: { producer: defaultProducer, productLine: defaultProductLine, processingType: defaultProcessingType, year: currentYear }, 
            type: sequelize.QueryTypes.SELECT, 
            transaction: t 
          }
        );

        if (sequenceResult) {
          sequenceNumber = sequenceResult.sequence;
        }

        const formattedSequence = sequenceNumber.toString().padStart(4, '0');
        dummyLotNumber = `${batchPrefix}-${formattedSequence}`;

        await sequelize.query(
          `INSERT INTO "LotNumberSequences" (
            producer, productLine, processingType, year, sequence
          ) VALUES (
            :producer, :productLine, :processingType, :year, :sequence
          )
          ON CONFLICT (producer, productLine, processingType, year) 
          DO UPDATE SET sequence = :sequence`,
          {
            replacements: { producer: defaultProducer, productLine: defaultProductLine, processingType: defaultProcessingType, year: currentYear, sequence: sequenceNumber + 1 },
            type: sequelize.QueryTypes.INSERT,
            transaction: t
          }
        );

        const [referenceResult] = await sequelize.query(
          `SELECT "referenceNumber" FROM "ReferenceMappings_duplicate"
           WHERE "productLine" = :productLine
           AND "processingType" = :processingType
           AND "producer" = :producer
           AND "type" = :type
           LIMIT 1`,
          {
            replacements: { productLine: defaultProductLine, processingType: defaultProcessingType, producer: defaultProducer, type: batchType },
            type: sequelize.QueryTypes.SELECT,
            transaction: t
          }
        );

        dummyReferenceNumber = referenceResult?.referenceNumber || null;
      } else {
        // Assume BTM or unknown producer
        const typeAbbreviation = batchType === 'Arabica' ? 'A' : 'R';
        const processingTypeAbbreviation = processingTypeEntry?.processingType || 'UN';
        dummyLotNumber = `ID-BTM-${typeAbbreviation}-${processingTypeAbbreviation}`;
        dummyReferenceNumber = null;
      }

      const [dummyRecord] = await sequelize.query(
        `INSERT INTO "PreprocessingData" (
          "batchNumber", "weightProcessed", "processingDate", "producer", 
          "productLine", "processingType", "quality", "lotNumber", "referenceNumber",
          "createdAt", "updatedAt", "createdBy", notes, finished
        ) VALUES (
          :batchNumber, :weightProcessed, :processingDate, :producer, 
          :productLine, :processingType, :quality, :lotNumber, :referenceNumber,
          :createdAt, :updatedAt, :createdBy, :notes, :finished
        ) 
        RETURNING *`,
        {
          replacements: {
            batchNumber: batchNumber.trim(),
            weightProcessed: 0,
            processingDate: now,
            producer: defaultProducer,
            productLine: defaultProductLine,
            processingType: defaultProcessingType,
            quality: defaultQuality,
            lotNumber: dummyLotNumber,
            referenceNumber: dummyReferenceNumber,
            createdAt: now,
            updatedAt: now,
            createdBy: createdBy || 'System',
            notes: 'Auto-generated for batch completion',
            finished: true
          },
          type: sequelize.QueryTypes.INSERT,
          transaction: t
        }
      );
      await t.commit();
      logger.info('Batch marked as complete with dummy record', { batchNumber, lotNumber: dummyLotNumber, referenceNumber: dummyReferenceNumber, user: createdBy || 'unknown' });
      return res.json({ message: `Batch ${batchNumber} marked as complete with dummy record.`, data: dummyRecord });
    }

    // Update existing preprocessing data
    const [result] = await sequelize.query(
      `UPDATE "PreprocessingData" 
       SET finished = true, "updatedAt" = :updatedAt 
       WHERE LOWER("batchNumber") = LOWER(:batchNumber) 
       RETURNING *`,
      {
        replacements: { updatedAt: new Date(), batchNumber: batchNumber.trim() },
        type: sequelize.QueryTypes.SELECT,
        transaction: t
      }
    );

    if (!result.length) {
      await t.rollback();
      logger.warn('Failed to update preprocessing data', { batchNumber, user: createdBy || 'unknown' });
      throw new Error('Failed to update preprocessing data.');
    }

    await t.commit();
    logger.info('Batch marked as complete', { batchNumber, user: createdBy || 'unknown' });
    res.json({ message: `Batch ${batchNumber} marked as complete.`, data: result });
  } catch (err) {
    if (t) await t.rollback();
    logger.error('Error marking batch as complete', { batchNumber, error: err.message, stack: err.stack, user: req.body.createdBy || 'unknown' });
    res.status(err.message.includes('Batch not found') ? 404 : 500).json({ error: 'Server error', details: err.message });
  }
});

// Route for fetching all preprocessing data
router.get('/preprocessing', async (req, res) => {
  try {
    const allRows = await sequelize.query(
      `SELECT a.*, DATE("processingDate") AS "processingDateTrunc" 
       FROM "PreprocessingData" a
       ORDER BY a."processingDate" DESC`,
      { type: sequelize.QueryTypes.SELECT }
    );

    const latestRows = await sequelize.query(
      `SELECT a.*, DATE("processingDate") AS "processingDateTrunc" 
       FROM "PreprocessingData" a 
       ORDER BY a."processingDate" DESC 
       LIMIT 10`,
      { type: sequelize.QueryTypes.SELECT }
    );

    logger.info('Fetched preprocessing data successfully', { user: req.body.createdBy || 'unknown' });
    res.json({ latestRows: latestRows[0], allRows: allRows[0] });
  } catch (err) {
    logger.error('Error fetching preprocessing data', { error: err.message, stack: err.stack, user: req.body.createdBy || 'unknown' });
    res.status(500).json({ message: 'Failed to fetch preprocessing data.' });
  }
});

// Route to get preprocessing data by batch number
router.get('/preprocessing/:batchNumber', async (req, res) => {
  const { batchNumber } = req.params;

  if (!batchNumber) {
    logger.warn('Missing batch number', { user: req.body.createdBy || 'unknown' });
    return res.status(400).json({ error: 'Batch number is required.' });
  }

  try {
    const [rows] = await sequelize.query(
      `SELECT "batchNumber", "weightProcessed", "processingDate", "producer", 
              "productLine", "processingType", "quality", "lotNumber", "referenceNumber", 
              finished, notes, "createdAt", "updatedAt", "createdBy",
              SUM("weightProcessed") OVER (PARTITION BY "batchNumber") AS "totalWeightProcessed",
              COALESCE(BOOL_OR(finished), FALSE) AS batch_finished
       FROM "PreprocessingData" 
       WHERE LOWER("batchNumber") = LOWER(:batchNumber)`,
      { replacements: { batchNumber: batchNumber.trim() }, type: sequelize.QueryTypes.SELECT }
    );

    if (!rows.length) {
      logger.warn('No preprocessing data found for batch', { batchNumber, user: req.body.createdBy || 'unknown' });
      return res.status(404).json({ error: 'No preprocessing data found for this batch number.' });
    }

    logger.info('Fetched preprocessing data by batch number', { batchNumber, user: req.body.createdBy || 'unknown' });
    res.json({
      totalWeightProcessed: parseFloat(rows[0].totalWeightProcessed || 0),
      finished: rows[0].batch_finished,
      preprocessingData: rows
    });
  } catch (err) {
    logger.error('Error fetching preprocessing data by batch number', { batchNumber, error: err.message, stack: err.stack, user: req.body.createdBy || 'unknown' });
    res.status(500).json({ message: 'Failed to fetch preprocessing data by batch number.' });
  }
});

module.exports = router;