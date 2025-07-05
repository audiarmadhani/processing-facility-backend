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

// Generate new batch number for merge
// Generate new batch number for merge
router.get('/new-batch-number', async (req, res) => {
  let t;
  try {
    t = await sequelize.transaction();
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const [result] = await sequelize.query(
      `SELECT latest_batch_number, last_updated_date 
       FROM latest_m_batch 
       WHERE id = 1 FOR UPDATE`,
      { type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    let sequenceNumber = result.latest_batch_number;
    // Safely handle last_updated_date, converting to ISO string if it's a Date or parsing if it's a string
    let lastUpdatedDate = result.last_updated_date;
    if (lastUpdatedDate instanceof Date && !isNaN(lastUpdatedDate)) {
      lastUpdatedDate = lastUpdatedDate.toISOString().slice(0, 10);
    } else if (typeof lastUpdatedDate === 'string') {
      lastUpdatedDate = new Date(lastUpdatedDate).toISOString().slice(0, 10);
    } else {
      lastUpdatedDate = today; // Default to today if invalid
    }

    // Reset sequence if date has changed
    if (lastUpdatedDate !== today) {
      sequenceNumber = 0;
    }
    sequenceNumber += 1;

    // Update latest_m_batch
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

    const formattedSequence = sequenceNumber.toString().padStart(4, '0');
    const newBatchNumber = `${today}-${formattedSequence}-MB`;

    await t.commit();
    res.json({ newBatchNumber });
  } catch (err) {
    if (t) await t.rollback();
    console.error('Error generating new batch number:', err);
    res.status(500).json({ error: 'Failed to generate batch number', details: err.message });
  }
});

// Merge batches
router.post('/merge', async (req, res) => {
  let t;
  try {
    const { batchNumbers, notes, createdBy } = req.body;
    if (!batchNumbers || !Array.isArray(batchNumbers) || batchNumbers.length < 2) {
      return res.status(400).json({ error: 'At least two batch numbers are required.' });
    }

    t = await sequelize.transaction();

    // Validate batches and fetch additional data
    const batches = await sequelize.query(
      `SELECT r."batchNumber", r."type", r."weight", r."farmerName", r."receivingDate", r."totalBags", r."commodityType", r."rfid", q."qcDate", q."ripeness", q."color", q."foreignMatter", q."overallQuality"
       FROM "ReceivingData" r
       LEFT JOIN "QCData" q ON LOWER(r."batchNumber") = LOWER(q."batchNumber")
       WHERE LOWER(r."batchNumber") IN (:batchNumbers) AND r.merged = FALSE AND r."commodityType" != 'Green Bean'`,
      {
        replacements: { batchNumbers: batchNumbers.map(b => b.trim().toLowerCase()) },
        type: sequelize.QueryTypes.SELECT,
        transaction: t
      }
    );

    if (batches.length !== batchNumbers.length) {
      await t.rollback();
      return res.status(400).json({ error: 'Some batches not found, already merged, or are Green Bean.' });
    }

    // Validate same type
    const type = batches[0].type;
    if (!batches.every(b => b.type === type)) {
      await t.rollback();
      return res.status(400).json({ error: 'Batches must have the same type.' });
    }

    // Calculate available weight
    const processed = await sequelize.query(
      `SELECT "batchNumber", SUM("weightProcessed") AS "totalProcessed"
       FROM "PreprocessingData"
       WHERE LOWER("batchNumber") = ANY(:batchNumbers)
       GROUP BY "batchNumber"`,
      {
        replacements: { batchNumbers: batchNumbers.map(b => b.trim().toLowerCase()) },
        type: sequelize.QueryTypes.SELECT,
        transaction: t
      }
    );

    const processedMap = new Map(processed.map(r => [r.batchNumber.toLowerCase(), r.totalProcessed || 0]));
    const totalWeight = batches.reduce((sum, b) => {
      const processedWeight = processedMap.get(b.batchNumber.toLowerCase()) || 0;
      const availableWeight = b.weight - processedWeight;
      if (availableWeight <= 0) {
        throw new Error(`Batch ${b.batchNumber} has no available weight.`);
      }
      return sum + availableWeight;
    }, 0);

    // Generate new batch number
    const today = new Date().toISOString().slice(0, 10);
    const [sequenceResult] = await sequelize.query(
      `SELECT latest_batch_number, last_updated_date 
       FROM latest_m_batch 
       WHERE id = 1 FOR UPDATE`,
      { type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    let sequenceNumber = sequenceResult.latest_batch_number;
    // Safely handle last_updated_date
    let lastUpdatedDate = sequenceResult.last_updated_date;
    if (lastUpdatedDate instanceof Date && !isNaN(lastUpdatedDate)) {
      lastUpdatedDate = lastUpdatedDate.toISOString().slice(0, 10);
    } else if (typeof lastUpdatedDate === 'string') {
      lastUpdatedDate = new Date(lastUpdatedDate).toISOString().slice(0, 10);
    } else {
      lastUpdatedDate = today; // Default to today if invalid
    }

    if (lastUpdatedDate !== today) {
      sequenceNumber = 0;
    }
    sequenceNumber += 1;

    const formattedSequence = sequenceNumber.toString().padStart(4, '0');
    const newBatchNumber = `${today}-${formattedSequence}-MB`;

    // Update latest_m_batch
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

    // Calculate aggregated data
    const farmerNames = [...new Set(batches.map(b => b.farmerName).filter(Boolean))];
    const farmerNamesArray = farmerNames.length > 0 ? farmerNames : null;
    const farmerNamesString = farmerNames.length > 0 ? farmerNames.join(', ') : null;
    const earliestReceivingDate = batches.reduce((earliest, b) => {
      const date = new Date(b.receivingDate);
      return date < new Date(earliest) ? b.receivingDate : earliest;
    }, batches[0].receivingDate);
    const latestQcDate = batches.reduce((latest, b) => {
      const date = new Date(b.qcDate || new Date());
      return date > new Date(latest) ? b.qcDate || new Date() : latest;
    }, batches[0].qcDate || new Date());
    const totalBags = batches.reduce((sum, b) => sum + (parseInt(b.totalBags) || 0), 0);
    const rfids = batches.flatMap(b => b.rfid ? b.rfid.split(',').map(s => s.trim()) : []).filter(Boolean);
    const cherryScores = [...new Set(batches.map(b => b.cherryScore).filter(Boolean))].join(', ');
    const cherryGroups = [...new Set(batches.map(b => b.cherryGroup).filter(Boolean))].join(', ');
    const ripenesses = [...new Set(batches.map(b => b.ripeness).filter(Boolean))].join(', ');
    const colors = [...new Set(batches.map(b => b.color).filter(Boolean))].join(', ');
    const foreignMatters = [...new Set(batches.map(b => b.foreignMatter).filter(Boolean))].join(', ');
    const overallQualities = [...new Set(batches.map(b => b.overallQuality).filter(Boolean))].join(', ');

    // Insert new batch into ReceivingData
    await sequelize.query(
      `INSERT INTO "ReceivingData" (
        "batchNumber", "weight", "farmerName", "receivingDate", "type", "totalBags", "commodityType", merged, "createdAt", "updatedAt", "rfid"
      ) VALUES (
        :batchNumber, :weight, :farmerName, :receivingDate, :type, :totalBags, :commodityType, FALSE, :createdAt, :updatedAt, :rfid
      )`,
      {
        replacements: {
          batchNumber: newBatchNumber,
          weight: totalWeight,
          farmerName: farmerNamesArray ? JSON.stringify(farmerNamesArray) : null,
          receivingDate: earliestReceivingDate,
          type,
          totalBags: totalBags || null,
          commodityType: batches[0].commodityType,
          createdAt: new Date(),
          updatedAt: new Date(),
          rfid: rfids.length > 0 ? rfids.join(',') : null
        },
        type: sequelize.QueryTypes.INSERT,
        transaction: t
      }
    );

    // Insert into QCData for merged batch
    await sequelize.query(
      `INSERT INTO "QCData" (
        "batchNumber", "qcDate", "ripeness", "color", "foreignMatter", "overallQuality", "createdAt", "updatedAt", merged
      ) VALUES (
        :batchNumber, :qcDate, :ripeness, :color, :foreignMatter, :overallQuality, :createdAt, :updatedAt, FALSE
      )`,
      {
        replacements: {
          batchNumber: newBatchNumber,
          qcDate: latestQcDate,
          ripeness: ripenesses || null,
          color: colors || null,
          foreignMatter: foreignMatters || null,
          overallQuality: overallQualities || null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        type: sequelize.QueryTypes.INSERT,
        transaction: t
      }
    );

    // Update original batches
    await sequelize.query(
      `UPDATE "ReceivingData" SET merged = TRUE WHERE LOWER("batchNumber") = ANY(:batchNumbers)`,
      {
        replacements: { batchNumbers: batchNumbers.map(b => b.trim().toLowerCase()) },
        type: sequelize.QueryTypes.UPDATE,
        transaction: t
      }
    );
    await sequelize.query(
      `UPDATE "QCData" SET merged = TRUE WHERE LOWER("batchNumber") = ANY(:batchNumbers)`,
      {
        replacements: { batchNumbers: batchNumbers.map(b => b.trim().toLowerCase()) },
        type: sequelize.QueryTypes.UPDATE,
        transaction: t
      }
    );
    await sequelize.query(
      `UPDATE "PreprocessingData" SET merged = TRUE WHERE LOWER("batchNumber") = ANY(:batchNumbers)`,
      {
        replacements: { batchNumbers: batchNumbers.map(b => b.trim().toLowerCase()) },
        type: sequelize.QueryTypes.UPDATE,
        transaction: t
      }
    );

    // Insert into BatchMerges
    await sequelize.query(
      `INSERT INTO "BatchMerges" (
        new_batch_number, original_batch_numbers, merged_at, created_by, notes
      ) VALUES (
        :newBatchNumber, :originalBatchNumbers, :mergedAt, :createdBy, :notes
      )`,
      {
        replacements: {
          newBatchNumber,
          originalBatchNumbers: batchNumbers,
          mergedAt: new Date(),
          createdBy: createdBy || 'Unknown',
          notes: notes || null
        },
        type: sequelize.QueryTypes.INSERT,
        transaction: t
      }
    );

    await t.commit();
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
    console.error('Error merging batches:', err);
    res.status(400).json({ error: 'Failed to merge batches', details: err.message });
  }
});

// Route for creating preprocessing data
// Route for creating preprocessing data
router.post('/preprocessing', async (req, res) => {
  let t;
  try {
    const { batchNumber, weightProcessed, processingDate, producer, productLine, processingType, quality, createdBy, notes } = req.body;

    if (!batchNumber || weightProcessed === undefined || !producer || !productLine || !processingType || !quality) {
      return res.status(400).json({ error: 'Batch number, weight processed, producer, product line, processing type, and quality are required.' });
    }

    // Parse and round weightProcessed to 2 decimal places
    const parsedWeight = parseFloat(weightProcessed.toString().replace(',', '.'));
    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      return res.status(400).json({ error: 'Weight processed must be a positive number.' });
    }
    const roundedWeightProcessed = Math.round(parsedWeight * 100) / 100; // Round to 2 decimal places

    t = await sequelize.transaction();

    // Check available weight and retrieve batch data
    const [batch] = await sequelize.query(
      `SELECT r."batchNumber", r."weight", r."type", r."farmerName", r."receivingDate", r.merged, r."totalBags", q."qcDate"
       FROM "ReceivingData" r 
       LEFT JOIN "QCData" q ON LOWER(r."batchNumber") = LOWER(q."batchNumber")
       WHERE LOWER(r."batchNumber") = LOWER(:batchNumber)`,
      { replacements: { batchNumber: batchNumber.trim() }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    if (!batch) {
      await t.rollback();
      return res.status(404).json({ error: 'Batch not found.' });
    }

    if (batch.merged) {
      await t.rollback();
      return res.status(400).json({ error: 'Batch is already merged.' });
    }

    const totalWeight = parseFloat(batch.weight); // Ensure it's a number
    const roundedTotalWeight = Math.round(totalWeight * 100) / 100; // Round to 2 decimal places
    const batchType = batch.type;

    const [processed] = await sequelize.query(
      `SELECT SUM("weightProcessed") AS "totalWeightProcessed", COALESCE(BOOL_OR(finished), FALSE) AS finished 
       FROM "PreprocessingData" 
       WHERE LOWER("batchNumber") = LOWER(:batchNumber)`,
      { replacements: { batchNumber: batchNumber.trim() }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    const totalWeightProcessed = parseFloat(processed.totalWeightProcessed) || 0;
    const roundedTotalWeightProcessed = Math.round(totalWeightProcessed * 100) / 100; // Round to 2 decimal places
    const isFinished = processed.finished;
    const weightAvailable = roundedTotalWeight - roundedTotalWeightProcessed;
    const roundedWeightAvailable = Math.round(weightAvailable * 100) / 100; // Round to 2 decimal places

    if (isFinished) {
      await t.rollback();
      return res.status(400).json({ error: 'Batch is already marked as finished.' });
    }

    if (roundedWeightProcessed > roundedWeightAvailable) {
      await t.rollback();
      return res.status(400).json({ error: `Cannot process ${roundedWeightProcessed} kg. Only ${roundedWeightAvailable} kg available.` });
    }

    // Fetch product line and processing type abbreviations
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
         WHERE producer = :producer AND "productLine" = :productLine 
         AND "processingType" = :processingType AND year = :year 
         FOR UPDATE`,
        { 
          replacements: { producer, productLine, processingType, year: currentYear }, 
          type: sequelize.QueryTypes.SELECT, 
          transaction: t 
        }
      );

      if (sequenceResult) {
        sequenceNumber = sequenceResult.sequence + 1;
      }

      const formattedSequence = sequenceNumber.toString().padStart(4, '0');
      lotNumber = `${batchPrefix}-${formattedSequence}`;

      await sequelize.query(
        `INSERT INTO "LotNumberSequences" (
          producer, "productLine", "processingType", year, sequence
        ) VALUES (
          :producer, :productLine, :processingType, :year, :sequence
        )
        ON CONFLICT (producer, "productLine", "processingType", year) 
        DO UPDATE SET sequence = EXCLUDED.sequence`,
        {
          replacements: { producer, productLine, processingType, year: currentYear, sequence: sequenceNumber },
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
        "createdAt", "updatedAt", "createdBy", notes, finished, merged
      ) VALUES (
        :batchNumber, :weightProcessed, :processingDate, :producer, 
        :productLine, :processingType, :quality, :lotNumber, :referenceNumber,
        :createdAt, :updatedAt, :createdBy, :notes, :finished, FALSE
      ) 
      RETURNING *`,
      {
        replacements: {
          batchNumber: batchNumber.trim(),
          weightProcessed: roundedWeightProcessed,
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
      `SELECT "batchNumber", "type", merged FROM "ReceivingData" WHERE LOWER("batchNumber") = LOWER(:batchNumber)`,
      { replacements: { batchNumber: batchNumber.trim() }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    if (!batch) {
      await t.rollback();
      return res.status(404).json({ error: 'Batch not found in receiving data.' });
    }

    if (batch.merged) {
      await t.rollback();
      return res.status(400).json({ error: 'Batch is already merged.' });
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
           WHERE producer = :producer AND "productLine" = :productLine 
           AND "processingType" = :processingType AND year = :year 
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
            producer, "productLine", "processingType", year, sequence
          ) VALUES (
            :producer, :productLine, :processingType, :year, :sequence
          )
          ON CONFLICT (producer, "productLine", "processingType", year) 
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
          "createdAt", "updatedAt", "createdBy", notes, finished, merged
        ) VALUES (
          :batchNumber, :weightProcessed, :processingDate, :producer, 
          :productLine, :processingType, :quality, :lotNumber, :referenceNumber,
          :createdAt, :updatedAt, :createdBy, :notes, :finished, FALSE
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
      `SELECT a.*, TO_CHAR("processingDate", 'YYYY-MM-DD') AS "processingDateTrunc",
              b.original_batch_numbers
       FROM "PreprocessingData" a
       LEFT JOIN "BatchMerges" b ON a."batchNumber" = b.new_batch_number
       WHERE a.merged = FALSE
       ORDER BY "processingDate" DESC`,
      { type: sequelize.QueryTypes.SELECT }
    );

    const latestRows = await sequelize.query(
      `SELECT a.*, TO_CHAR("processingDate", 'YYYY-MM-DD') AS "processingDateTrunc",
              b.original_batch_numbers
       FROM "PreprocessingData" a
       LEFT JOIN "BatchMerges" b ON a."batchNumber" = b.new_batch_number
       WHERE a.merged = FALSE
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
        p."batchNumber", p."weightProcessed", p."processingDate", p."producer", 
        p."productLine", p."processingType", p."quality", p."lotNumber", p."referenceNumber", 
        p.finished, p.notes, p."createdAt", p."updatedAt", p."createdBy", p.merged,
        SUM(p."weightProcessed") OVER (PARTITION BY p."batchNumber") AS "totalWeightProcessed",
        COALESCE(BOOL_OR(p.finished), FALSE) AS batch_finished,
        b.original_batch_numbers
       FROM "PreprocessingData" p
       LEFT JOIN "BatchMerges" b ON p."batchNumber" = b.new_batch_number
       WHERE LOWER(p."batchNumber") = LOWER(:batchNumber)
       GROUP BY 
        p."batchNumber", p."weightProcessed", p."processingDate", p."producer", 
        p."productLine", p."processingType", p."quality", p."lotNumber", p."referenceNumber", 
        p.finished, p.notes, p."createdAt", p."updatedAt", p."createdBy", p.merged,
        b.original_batch_numbers`,
      { 
        replacements: { batchNumber: batchNumber.trim() }, 
        type: sequelize.QueryTypes.SELECT 
      }
    );

    if (rows.length === 0) {
      const [batch] = await sequelize.query(
        `SELECT weight, merged, "farmerName", "receivingDate", "totalBags", type, rfid 
         FROM "ReceivingData" 
         WHERE LOWER("batchNumber") = LOWER(:batchNumber)`,
        { replacements: { batchNumber: batchNumber.trim() }, type: sequelize.QueryTypes.SELECT }
      );

      if (!batch) {
        return res.status(404).json({ error: 'Batch not found in receiving data.' });
      }

      if (batch.merged) {
        return res.status(400).json({ error: 'Batch is already merged.' });
      }

      const totalWeight = batch.weight || 0;
      const [mergeData] = await sequelize.query(
        `SELECT original_batch_numbers FROM "BatchMerges" WHERE new_batch_number = :batchNumber`,
        { replacements: { batchNumber: batchNumber.trim() }, type: sequelize.QueryTypes.SELECT }
      );

      // Parse farmerName if it's a JSON string
      let farmerNameString = batch.farmerName;
      if (batch.farmerName && batch.farmerName.startsWith('[')) {
        try {
          const farmerNamesArray = JSON.parse(batch.farmerName);
          farmerNameString = farmerNamesArray.join(', ');
        } catch (e) {
          console.error('Error parsing farmerName JSON:', e);
        }
      }

      return res.status(200).json({
        totalWeightProcessed: 0,
        weightAvailable: totalWeight,
        finished: false,
        preprocessingData: [],
        lotNumber: 'N/A',
        referenceNumber: 'N/A',
        mergedFrom: mergeData?.original_batch_numbers || [],
        farmerName: farmerNameString || 'N/A',
        receivingDate: batch.receivingDate ? new Date(batch.receivingDate).toISOString().slice(0, 10) : 'N/A',
        totalBags: batch.totalBags || 'N/A',
        type: batch.type || 'N/A',
        rfid: batch.rfid || null
      });
    }

    const totalWeightProcessed = rows[0].totalWeightProcessed || 0;
    const [batch] = await sequelize.query(
      `SELECT weight, "farmerName", "receivingDate", "totalBags", type, rfid 
       FROM "ReceivingData" 
       WHERE LOWER("batchNumber") = LOWER(:batchNumber)`,
      { replacements: { batchNumber: batchNumber.trim() }, type: sequelize.QueryTypes.SELECT }
    );

    const totalWeight = batch?.weight || 0;
    const weightAvailable = totalWeight - totalWeightProcessed;

    // Parse farmerName if it's a JSON string
    let farmerNameString = batch.farmerName;
    if (batch.farmerName && batch.farmerName.startsWith('[')) {
      try {
        const farmerNamesArray = JSON.parse(batch.farmerName);
        farmerNameString = farmerNamesArray.join(', ');
      } catch (e) {
        console.error('Error parsing farmerName JSON:', e);
      }
    }

    res.json({
      totalWeightProcessed,
      weightAvailable,
      finished: rows[0].batch_finished,
      preprocessingData: rows,
      lotNumber: rows[0].lotNumber || 'N/A',
      referenceNumber: rows[0].referenceNumber || 'N/A',
      mergedFrom: rows[0].original_batch_numbers || [],
      farmerName: farmerNameString || 'N/A',
      receivingDate: batch.receivingDate ? new Date(batch.receivingDate).toISOString().slice(0, 10) : 'N/A',
      totalBags: batch.totalBags || 'N/A',
      type: batch.type || 'N/A',
      rfid: batch.rfid || null
    });
  } catch (err) {
    console.error('Error fetching preprocessing data by batch number:', err);
    res.status(500).json({ message: 'Failed to fetch preprocessing data by batch number.', details: err.message });
  }
});

// Route to get batch merges by batch number
router.get('/batch-merges/:batchNumber', async (req, res) => {
  const { batchNumber } = req.params;

  if (!batchNumber) {
    return res.status(400).json({ error: 'Batch number is required.' });
  }

  try {
    const mergeData = await sequelize.query(
      `SELECT new_batch_number, original_batch_numbers, merged_at, created_by, notes
       FROM "BatchMerges"
       WHERE LOWER(new_batch_number) = LOWER(:batchNumber)`,
      { replacements: { batchNumber: batchNumber.trim() }, type: sequelize.QueryTypes.SELECT }
    );

    if (mergeData.length === 0) {
      return res.status(404).json({ error: 'No merge data found for this batch number.' });
    }

    res.json(mergeData[0]);
  } catch (err) {
    console.error('Error fetching batch merge data:', err);
    res.status(500).json({ error: 'Failed to fetch batch merge data', details: err.message });
  }
});

// Route to get merged batch by original batch number
router.get('/batch-merges/original/:batchNumber', async (req, res) => {
  const { batchNumber } = req.params;

  if (!batchNumber) {
    return res.status(400).json({ error: 'Batch number is required.' });
  }

  try {
    const mergeData = await sequelize.query(
      `SELECT new_batch_number, original_batch_numbers
       FROM "BatchMerges"
       WHERE :batchNumber = ANY(original_batch_numbers)`,
      { replacements: { batchNumber: batchNumber.trim() }, type: sequelize.QueryTypes.SELECT }
    );

    if (mergeData.length === 0) {
      return res.status(404).json({ error: 'No merge data found for this original batch number.' });
    }

    res.json(mergeData[0]);
  } catch (err) {
    console.error('Error fetching merge data for original batch number:', err);
    res.status(500).json({ error: 'Failed to fetch merge data', details: err.message });
  }
});

module.exports = router;