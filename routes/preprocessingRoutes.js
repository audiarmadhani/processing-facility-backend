const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');
const cors = require('cors');

// Configure CORS for this router
router.use(cors({
  origin: ['https://kopifabriek-platform.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
}));

// Handle CORS preflight requests
router.options('*', cors());

// Route for creating preprocessing data
router.post('/preprocessing', async (req, res) => {
  let t;
  try {
    const { batchNumber, weightProcessed, processingDate, producer, productLine, processingType, quality, createdBy, notes } = req.body;

    if (!batchNumber || weightProcessed === undefined || !producer || !productLine || !processingType || !quality) {
      return res.status(400).json({ error: 'Batch number, weight processed, producer, product line, processing type, and quality are required.' });
    }

    const parsedWeight = parseFloat(weightProcessed.toString().replace(',', '.'));
    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      return res.status(400).json({ error: 'Weight processed must be a positive number.' });
    }

    t = await sequelize.transaction();

    // Check available weight and retrieve type
    const [batch] = await sequelize.query(
      `SELECT a.weight, a."type", a."farmerName", a."receivingDate", b."qcDate" FROM "ReceivingData" a left join "QCData" b on a."batchNumber" = b."batchNumber" WHERE LOWER(a."batchNumber") = LOWER(:batchNumber)`,
      { replacements: { batchNumber: batchNumber.trim() }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    if (!batch) {
      await t.rollback();
      return res.status(404).json({ error: 'Batch not found.' });
    }

    const totalWeight = parseFloat(batch.weight);
    const batchType = batch.type;

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
      return res.status(400).json({ error: 'Batch is already marked as finished.' });
    }

    if (parsedWeight > weightAvailable) {
      await t.rollback();
      return res.status(400).json({ error: `Cannot process ${parsedWeight} kg. Only ${weightAvailable} kg available.` });
    }

    // Fetch product line and processing type abbreviations (case-insensitive)
    const [productLineEntry] = await sequelize.query(
      `SELECT abbreviation FROM "ProductLines" WHERE LOWER("productLine") = LOWER(:productLine) LIMIT 1`,
      { replacements: { productLine }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    const [processingTypeEntry] = await sequelize.query(
      `SELECT "processingType" FROM "ProcessingTypes" WHERE LOWER(abbreviation) = LOWER(:processingType) LIMIT 1`,
      { replacements: { processingType }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    if (!productLineEntry || !processingTypeEntry) {
      await t.rollback();
      return res.status(400).json({ error: 'Invalid product line or processing type. Ensure they exist in the database.' });
    }

    const productLineAbbreviation = productLineEntry.abbreviation;
    const processingTypeAbbreviation = processingTypeEntry.processingType;
    const currentYear = processingDate ? new Date(processingDate).getFullYear().toString().slice(-2) : new Date().getFullYear().toString().slice(-2);

    let lotNumber, referenceNumber;

    if (producer === 'HQ') {
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

      // Use ReferenceMappings_duplicate (replace with ReferenceMappings if confirmed incorrect)
      const [referenceResult] = await sequelize.query(
        `SELECT "referenceNumber" FROM "ReferenceMappings_duplicate"
         WHERE LOWER("productLine") = LOWER(:productLine)
         AND LOWER("processingType") = LOWER(:processingType)
         AND LOWER("producer") = LOWER(:producer)
         AND LOWER("type") = LOWER(:type)
         LIMIT 1`,
        {
          replacements: { productLine, processingType, producer, type: batchType },
          type: sequelize.QueryTypes.SELECT,
          transaction: t
        }
      );

      if (!referenceResult) {
        await t.rollback();
        return res.status(400).json({ error: 'No matching reference number found in ReferenceMappings_duplicate.' });
      }

      referenceNumber = referenceResult.referenceNumber;
    } else if (producer === 'BTM') {
      const typeAbbreviation = batchType === 'Arabica' ? 'A' : 'R';
      lotNumber = `ID-BTM-${typeAbbreviation}-${processingTypeAbbreviation}`;
      referenceNumber = null;
    } else {
      await t.rollback();
      return res.status(400).json({ error: 'Invalid producer.' });
    }

    const now = new Date();
    const formattedProcessingDate = processingDate ? new Date(processingDate) : now;

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
          weightProcessed: parsedWeight,
          processingDate: formattedProcessingDate,
          producer,
          productLine,
          processingType,
          quality,
          lotNumber,
          referenceNumber,
          createdAt: now,
          updatedAt: now,
          createdBy: createdBy || 'Unknown',
          notes: notes || null,
          finished: false
        },
        type: sequelize.QueryTypes.INSERT,
        transaction: t
      }
    );

    await t.commit();
    res.status(201).json({
      message: 'Preprocessing data created successfully.',
      preprocessingData: [preprocessingData],
    });
  } catch (err) {
    if (t) await t.rollback();
    console.error('Error creating preprocessing data:', err);
    res.status(err.message.includes('not found') ? 404 : 500).json({ error: 'Server error', details: err.message });
  }
});

// Route for marking a batch as complete
router.put('/preprocessing/:batchNumber/finish', async (req, res) => {
  let t;
  try {
    const { batchNumber } = req.params;
    const { createdBy } = req.body;
    if (!batchNumber) {
      return res.status(400).json({ error: 'Batch number is required.' });
    }

    t = await sequelize.transaction();

    const [batch] = await sequelize.query(
      `SELECT "batchNumber", "type" FROM "ReceivingData" WHERE LOWER("batchNumber") = LOWER(:batchNumber)`,
      { replacements: { batchNumber: batchNumber.trim() }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    if (!batch) {
      await t.rollback();
      return res.status(404).json({ error: 'Batch not found in receiving data.' });
    }

    const batchType = batch.type;

    const [processed] = await sequelize.query(
      `SELECT COALESCE(BOOL_OR(finished), FALSE) AS finished 
       FROM "PreprocessingData" 
       WHERE LOWER("batchNumber") = LOWER(:batchNumber)`,
      { replacements: { batchNumber: batchNumber.trim() }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    if (processed.finished) {
      await t.rollback();
      return res.status(400).json({ error: 'Batch is already marked as finished.' });
    }

    const existingRows = await sequelize.query(
      `SELECT * FROM "PreprocessingData" WHERE LOWER("batchNumber") = LOWER(:batchNumber)`,
      { replacements: { batchNumber: batchNumber.trim() }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    if (existingRows.length === 0) {
      const now = new Date();
      const defaultProductLine = 'Commercial Lot';
      const defaultProcessingType = 'Natural';
      const defaultProducer = 'BTM';
      const defaultQuality = 'G2';

      const [productLineEntry] = await sequelize.query(
        `SELECT abbreviation FROM "ProductLines" WHERE LOWER("productLine") = LOWER(:productLine) LIMIT 1`,
        { replacements: { productLine: defaultProductLine }, type: sequelize.QueryTypes.SELECT, transaction: t }
      );

      const [processingTypeEntry] = await sequelize.query(
        `SELECT processingType FROM "ProcessingTypes" WHERE LOWER(abbreviation) = LOWER(:processingType) LIMIT 1`,
        { replacements: { processingType: defaultProcessingType }, type: sequelize.QueryTypes.SELECT, transaction: t }
      );

      if (!productLineEntry || !processingTypeEntry) {
        await t.rollback();
        return res.status(400).json({ error: 'Invalid default product line or processing type for batch completion.' });
      }

      let dummyLotNumber, dummyReferenceNumber;

      if (defaultProducer === 'HQ') {
        const currentYear = now.getFullYear().toString().slice(-2);
        const productLineAbbreviation = productLineEntry.abbreviation;
        const processingTypeAbbreviation = processingTypeEntry.processingType;
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
           WHERE LOWER("productLine") = LOWER(:productLine)
           AND LOWER("processingType") = LOWER(:processingType)
           AND LOWER("producer") = LOWER(:producer)
           AND LOWER("type") = LOWER(:type)
           LIMIT 1`,
          {
            replacements: { productLine: defaultProductLine, processingType: defaultProcessingType, producer: defaultProducer, type: batchType },
            type: sequelize.QueryTypes.SELECT,
            transaction: t
          }
        );

        dummyReferenceNumber = referenceResult?.referenceNumber || null;
      } else {
        const typeAbbreviation = batchType === 'Arabica' ? 'A' : 'R';
        const processingTypeAbbreviation = processingTypeEntry.processingType || 'N/A';
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
      return res.json({ message: `Batch ${batchNumber} marked as complete with dummy record.`, data: dummyRecord });
    }

    const result = await sequelize.query(
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

    if (result.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: 'Failed to update preprocessing data.' });
    }

    await t.commit();
    res.json({ message: `Batch ${batchNumber} marked as complete.`, data: result });
  } catch (err) {
    if (t) await t.rollback();
    console.error('Error marking batch as complete:', err);
    res.status(err.message.includes('not found') ? 404 : 500).json({ error: 'Server error', details: err.message });
  }
});

// Route for fetching all preprocessing data
router.get('/preprocessing', async (req, res) => {
  try {
    const allRows = await sequelize.query(
      `SELECT a.*, TO_CHAR("processingDate", 'YYYY-MM-DD') AS "processingDateTrunc" 
       FROM "PreprocessingData" a
       ORDER BY "processingDate" DESC`,
      { type: sequelize.QueryTypes.SELECT }
    );

    const latestRows = await sequelize.query(
      `SELECT a.*, TO_CHAR("processingDate", 'YYYY-MM-DD') AS "processingDateTrunc" 
       FROM "PreprocessingData" a 
       ORDER BY "processingDate" DESC LIMIT 1`,
      { type: sequelize.QueryTypes.SELECT }
    );

    res.json({ 
      latestRows: latestRows.length > 0 ? latestRows : [], 
      allRows 
    });
  } catch (err) {
    console.error('Error fetching preprocessing data:', err);
    res.status(500).json({ message: 'Failed to fetch preprocessing data.', details: err.message });
  }
});

// Route to get preprocessing data by batch number
router.get('/preprocessing/:batchNumber', async (req, res) => {
  const { batchNumber } = req.params;

  if (!batchNumber) {
    return res.status(400).json({ error: 'Batch number is required.' });
  }

  try {
    const rows = await sequelize.query(
      `SELECT 
        "batchNumber", "weightProcessed", "processingDate", "producer", 
        "productLine", "processingType", "quality", "lotNumber", "referenceNumber", 
        finished, notes, "createdAt", "updatedAt", "createdBy",
        SUM("weightProcessed") OVER (PARTITION BY "batchNumber") AS totalWeightProcessed,
        COALESCE(BOOL_OR(finished), FALSE) AS batch_finished
       FROM "PreprocessingData" 
       WHERE LOWER("batchNumber") = LOWER(:batchNumber)
       GROUP BY 
        "batchNumber", "weightProcessed", "processingDate", "producer", 
        "productLine", "processingType", "quality", "lotNumber", "referenceNumber", 
        finished, notes, "createdAt", "updatedAt", "createdBy"`,
      { 
        replacements: { batchNumber: batchNumber.trim() }, 
        type: sequelize.QueryTypes.SELECT 
      }
    );

    if (rows.length === 0) {
      const [batch] = await sequelize.query(
        `SELECT weight FROM "ReceivingData" WHERE LOWER("batchNumber") = LOWER(:batchNumber)`,
        { replacements: { batchNumber: batchNumber.trim() }, type: sequelize.QueryTypes.SELECT }
      );

      if (!batch) {
        return res.status(404).json({ error: 'Batch not found in receiving data.' });
      }

      const totalWeight = parseFloat(batch.weight || 0);
      return res.status(200).json({
        totalWeightProcessed: 0,
        weightAvailable: totalWeight,
        finished: false,
        preprocessingData: [],
        lotNumber: 'N/A',
        referenceNumber: 'N/A'
      });
    }

    const totalWeightProcessed = parseFloat(rows[0].totalWeightProcessed || 0);
    const [batch] = await sequelize.query(
      `SELECT weight FROM "ReceivingData" WHERE LOWER("batchNumber") = LOWER(:batchNumber)`,
      { replacements: { batchNumber: batchNumber.trim() }, type: sequelize.QueryTypes.SELECT }
    );

    const totalWeight = parseFloat(batch?.weight || 0);
    const weightAvailable = totalWeight - totalWeightProcessed;

    res.json({
      totalWeightProcessed,
      weightAvailable,
      finished: rows[0].batch_finished,
      preprocessingData: rows,
      lotNumber: rows[0].lotNumber || 'N/A',
      referenceNumber: rows[0].referenceNumber || 'N/A'
    });
  } catch (err) {
    console.error('Error fetching preprocessing data by batch number:', err);
    res.status(500).json({ message: 'Failed to fetch preprocessing data by batch number.', details: err.message });
  }
});

module.exports = router;