const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

// Log database connection details for debugging
console.log('Database connection:', {
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  port: process.env.DB_PORT
});

// POST route for manual green bean splitting, weighing, and bagging
router.post('/dry-mill/:batchNumber/split', async (req, res) => {
  const { batchNumber } = req.params;
  const { grades } = req.body;

  if (!batchNumber || !grades || !Array.isArray(grades) || grades.length === 0) {
    return res.status(400).json({ error: 'Batch number and valid grades are required.' });
  }

  let t;
  try {
    t = await sequelize.transaction();

    const [dryMillEntry] = await sequelize.query(`
      SELECT dm."entered_at", pp."processingType", pp."productLine", pp."producer", rd."type"
      FROM "DryMillData" dm
      JOIN "PreprocessingData" pp ON dm."batchNumber" = pp."batchNumber"
      JOIN "ReceivingData" rd ON dm."batchNumber" = rd."batchNumber"
      WHERE dm."batchNumber" = :batchNumber
      AND dm."entered_at" IS NOT NULL
      LIMIT 1;
    `, { replacements: { batchNumber }, transaction: t, type: sequelize.QueryTypes.SELECT });

    if (!dryMillEntry) {
      await t.rollback();
      return res.status(400).json({ error: 'Batch must be entered into dry mill first or metadata not found.' });
    }

    const parentBatch = dryMillEntry;

    const results = [];
    const subBatches = [];

    const currentYear = new Date().getFullYear().toString().slice(-2);
    const [productResults] = await sequelize.query(
      'SELECT abbreviation FROM "ProductLines" WHERE "productLine" = ?',
      { replacements: [parentBatch.productLine], transaction: t }
    );
    const [processingResults] = await sequelize.query(
      'SELECT abbreviation FROM "ProcessingTypes" WHERE "processingType" = ?',
      { replacements: [parentBatch.processingType], transaction: t }
    );

    if (productResults.length === 0 || processingResults.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: 'Invalid product line or processing type' });
    }

    const productAbbreviation = productResults[0].abbreviation;
    const processingAbbreviation = processingResults[0].abbreviation;
    const batchPrefix = `${parentBatch.producer}${currentYear}${productAbbreviation}-${processingAbbreviation}`;

    const [existingBatches] = await sequelize.query(
      'SELECT "batchNumber" FROM "PostprocessingData" WHERE "batchNumber" LIKE ? ORDER BY "batchNumber" DESC LIMIT 1',
      { replacements: [`${batchPrefix}-%`], transaction: t }
    );

    let sequenceNumber = existingBatches.length > 0 ? parseInt(existingBatches[0].batchNumber.split('-').pop(), 10) : 0;

    for (const { grade, bagWeights, bagged_at } of grades) {
      if (!grade || typeof grade !== 'string' || grade.trim() === '') {
        await t.rollback();
        return res.status(400).json({ error: 'Each entry must have a valid grade.' });
      }

      if (!Array.isArray(bagWeights) || bagWeights.length === 0) {
        await t.rollback();
        return res.status(400).json({ error: `No valid bag weights provided for grade ${grade}.` });
      }

      const weights = bagWeights.map(w => {
        const weightNum = parseFloat(w);
        if (isNaN(weightNum) || weightNum <= 0) {
          throw new Error(`Invalid weight for grade ${grade}: must be a positive number.`);
        }
        return weightNum;
      });
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      const baggedAtValue = bagged_at || null;

      const subBatchId = `${batchNumber}-${grade.replace(/\s+/g, '')}`;
      const [gradeResult] = await sequelize.query(`
        INSERT INTO "DryMillGrades" ("batchNumber", "subBatchId", grade, weight, split_at, bagged_at, "is_stored")
        VALUES (:batchNumber, :subBatchId, :grade, :weight, NOW(), :bagged_at, FALSE)
        ON CONFLICT ("subBatchId") DO UPDATE SET weight = :weight, split_at = NOW(), bagged_at = :bagged_at, "is_stored" = FALSE
        RETURNING "subBatchId";
      `, { 
        replacements: { 
          batchNumber, 
          subBatchId, 
          grade, 
          weight: totalWeight, 
          bagged_at: baggedAtValue 
        }, 
        transaction: t,
        type: sequelize.QueryTypes.INSERT 
      });

      // Insert individual bag details
      for (let i = 0; i < weights.length; i++) {
        await sequelize.query(`
          INSERT INTO "BagDetails" (grade_id, bag_number, weight, bagged_at)
          VALUES (:gradeId, :bagNumber, :weight, :baggedAt)
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
        'SELECT "referenceNumber" FROM "ReferenceMappings_duplicate" WHERE "productLine" = ? AND "processingType" = ? AND "producer" = ? AND "quality" = ? AND "type" = ?',
        { replacements: [parentBatch.productLine, parentBatch.processingType, parentBatch.producer, grade, parentBatch.type], transaction: t }
      );

      if (referenceResults.length === 0) {
        await t.rollback();
        return res.status(400).json({ error: `No matching reference number found for grade ${grade}` });
      }

      const referenceNumber = referenceResults[0].referenceNumber;

      sequenceNumber += 1;
      const newBatchNumber = `${batchPrefix}-${String(sequenceNumber).padStart(4, '0')}`;
      const totalBags = weights.length;

      const [subBatch] = await sequelize.query(`
        INSERT INTO "PostprocessingData" ("batchNumber", "referenceNumber", "processingType", "productLine", weight, "totalBags", notes, quality, producer, "storedDate", "createdAt", "updatedAt", "parentBatchNumber")
        VALUES (:batchNumber, :referenceNumber, :processingType, :productLine, :weight, :totalBags, :notes, :quality, :producer, :storedDate, :createdAt, :updatedAt, :parentBatchNumber)
        RETURNING *;
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
          storedDate: new Date(),
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
    }

    await t.commit();

    res.status(201).json({ message: 'Green bean splits saved successfully', grades: results, subBatches });
  } catch (error) {
    if (t) await t.rollback();
    console.error('Error saving green bean splits:', error);
    res.status(500).json({ error: 'Failed to save green bean splits', details: error.message });
  }
});

// POST route for marking batch as processed completely
router.post('/dry-mill/:batchNumber/complete', async (req, res) => {
  const { batchNumber } = req.params;

  if (!batchNumber) {
    return res.status(400).json({ error: 'Batch number is required.' });
  }

  let t;
  try {
    t = await sequelize.transaction();

    const [dryMillEntry] = await sequelize.query(`
      SELECT "entered_at", "exited_at" FROM "DryMillData" 
      WHERE "batchNumber" = :batchNumber 
      AND "entered_at" IS NOT NULL 
      AND "exited_at" IS NULL 
      LIMIT 1;
    `, { replacements: { batchNumber }, transaction: t, type: sequelize.QueryTypes.SELECT });

    if (!dryMillEntry) {
      await t.rollback();
      return res.status(400).json({ error: 'Batch is not in dry mill or already processed.' });
    }

    const [splits] = await sequelize.query(`
      SELECT COUNT(*) AS total, SUM(CASE WHEN weight IS NOT NULL AND bagged_at IS NOT NULL THEN 1 ELSE 0 END) AS completed
      FROM "DryMillGrades" 
      WHERE "batchNumber" = :batchNumber;
    `, { replacements: { batchNumber }, transaction: t, type: sequelize.QueryTypes.SELECT });

    if (splits.completed !== splits.total) {
      await t.rollback();
      return res.status(400).json({ error: 'All splits must have weights and bagging dates before marking as processed.' });
    }

    const [result] = await sequelize.query(`
      UPDATE "DryMillData" 
      SET exited_at = NOW() 
      WHERE "batchNumber" = :batchNumber 
      AND "entered_at" IS NOT NULL 
      AND "exited_at" IS NULL 
      RETURNING *;
    `, { replacements: { batchNumber }, transaction: t, type: sequelize.QueryTypes.UPDATE });

    await sequelize.query(`
      UPDATE "ReceivingData"
      SET "currentAssign" = 0
      WHERE "batchNumber" = :batchNumber;
    `, { replacements: { batchNumber }, transaction: t, type: sequelize.QueryTypes.UPDATE });

    await t.commit();

    res.status(200).json({ message: 'Batch marked as processed successfully, RFID tag available for reuse', exited_at: result[0].exited_at });
  } catch (error) {
    if (t) await t.rollback();
    console.error('Error marking batch as processed:', error);
    res.status(500).json({ error: 'Failed to mark batch as processed', details: error.message });
  }
});

// GET route for dry mill data
router.get('/dry-mill-data', async (req, res) => {
  try {
    // Debug queries to verify raw data
    const debugPostprocessingQuery = `
      SELECT * FROM "PostprocessingData" WHERE "parentBatchNumber" = '2025-05-01-0001' ORDER BY "batchNumber" DESC;
    `;
    const debugPostprocessingResult = await sequelize.query(debugPostprocessingQuery, { type: sequelize.QueryTypes.SELECT, raw: true });
    console.log('Debug PostprocessingData Raw Result:', debugPostprocessingResult);

    const debugDryMillGradesQuery = `
      SELECT * FROM "DryMillGrades" WHERE "batchNumber" = '2025-05-01-0001' ORDER BY "subBatchId";
    `;
    const debugDryMillGradesResult = await sequelize.query(debugDryMillGradesQuery, { type: sequelize.QueryTypes.SELECT, raw: true });
    console.log('Debug DryMillGrades Raw Result:', debugDryMillGradesResult);

    const debugBagDetailsQuery = `
      SELECT * FROM "BagDetails" WHERE grade_id IN (SELECT "subBatchId" FROM "DryMillGrades" WHERE "batchNumber" = '2025-05-01-0001') ORDER BY bag_number;
    `;
    const debugBagDetailsResult = await sequelize.query(debugBagDetailsQuery, { type: sequelize.QueryTypes.SELECT, raw: true });
    console.log('Debug BagDetails Raw Result:', debugBagDetailsResult);

    // Fetch parent batches
    const parentBatchesQuery = `
      SELECT 
        dm."batchNumber",
        pp."processingType",
        pp."productLine",
        pp."producer",
        rd."type",
        rd."weight" AS "cherry_weight",
        rd."totalBags",
        NULL AS "notes",
        NULL AS "referenceNumber",
        NULL AS quality,
        NULL AS "storedDate",
        NULL AS "parentBatchNumber"
      FROM "DryMillData" dm
      JOIN "PreprocessingData" pp ON dm."batchNumber" = pp."batchNumber"
      JOIN "ReceivingData" rd ON dm."batchNumber" = rd."batchNumber"
      ORDER BY dm."batchNumber" DESC;
    `;
    const parentBatchesResult = await sequelize.query(parentBatchesQuery, { type: sequelize.QueryTypes.SELECT, raw: true });
    const parentBatchesArray = Array.isArray(parentBatchesResult) ? parentBatchesResult : parentBatchesResult ? [parentBatchesResult] : [];
    console.log('parentBatchesArray:', parentBatchesArray);

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
        DATE(ppd."storedDate") AS storeddatetrunc,
        ppd."parentBatchNumber"
      FROM "PostprocessingData" ppd
      LEFT JOIN "ReceivingData" rd ON ppd."parentBatchNumber" = rd."batchNumber"
      ORDER BY ppd."batchNumber" DESC;
    `;
    const subBatchesResult = await sequelize.query(subBatchesQuery, { type: sequelize.QueryTypes.SELECT, raw: true });
    const subBatchesArray = Array.isArray(subBatchesResult) ? subBatchesResult : subBatchesResult ? [subBatchesResult] : [];
    console.log('subBatchesArray:', subBatchesArray);

    const postprocessingArray = [...parentBatchesArray, ...subBatchesArray];
    console.log('postprocessingArray:', postprocessingArray);

    const dryMillDataQuery = `
      SELECT dm."batchNumber", dm.entered_at, dm.exited_at, dm.created_at
      FROM "DryMillData" dm
      ORDER BY dm.created_at DESC;
    `;
    const dryMillDataResult = await sequelize.query(dryMillDataQuery, { type: sequelize.QueryTypes.SELECT, raw: true });
    const dryMillDataArray = Array.isArray(dryMillDataResult) ? dryMillDataResult : dryMillDataResult ? [dryMillDataResult] : [];

    const dryMillGradesQuery = `
      SELECT dg."batchNumber", dg."subBatchId", dg.grade, dg.weight, dg.split_at, dg.bagged_at, dg."is_stored"
      FROM "DryMillGrades" dg
      ORDER BY dg."batchNumber", dg."subBatchId";
    `;
    const dryMillGradesResult = await sequelize.query(dryMillGradesQuery, { type: sequelize.QueryTypes.SELECT, raw: true });
    const dryMillGradesArray = Array.isArray(dryMillGradesResult) ? dryMillGradesResult : dryMillGradesResult ? [dryMillGradesResult] : [];
    console.log('dryMillGradesArray:', dryMillGradesArray);

    const bagDetailsQuery = `
      SELECT bd.*, dg."batchNumber"
      FROM "BagDetails" bd
      JOIN "DryMillGrades" dg ON bd.grade_id = dg."subBatchId"
      ORDER BY dg."batchNumber", bd.bag_number;
    `;
    const bagDetailsResult = await sequelize.query(bagDetailsQuery, { type: sequelize.QueryTypes.SELECT, raw: true });
    const bagDetailsArray = Array.isArray(bagDetailsResult) ? bagDetailsResult : bagDetailsResult ? [bagDetailsResult] : [];
    console.log('bagDetailsArray:', bagDetailsArray);

    const receivingDataQuery = `
      SELECT "batchNumber", rfid, "currentAssign"
      FROM "ReceivingData"
      ORDER BY "batchNumber";
    `;
    const receivingDataResult = await sequelize.query(receivingDataQuery, { type: sequelize.QueryTypes.SELECT, raw: true });
    const receivingDataArray = Array.isArray(receivingDataResult) ? receivingDataResult : receivingDataResult ? [receivingDataResult] : [];

    const data = postprocessingArray.map(batch => {
      const relevantBatchNumber = batch.parentBatchNumber || batch.batchNumber;
      const batchDryMillData = dryMillDataArray.filter(data => data.batchNumber === relevantBatchNumber) || [];
      const latestEntry = batchDryMillData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
      const status = latestEntry?.exited_at ? 'Processed' : (latestEntry?.entered_at ? 'In Dry Mill' : 'Not Started');

      const grades = dryMillGradesArray.filter(grade => grade.batchNumber === relevantBatchNumber) || [];
      const bags = bagDetailsArray.filter(bag => grades.some(g => g.subBatchId === bag.grade_id)) || [];
      const receiving = receivingDataArray.find(r => r.batchNumber === (batch.parentBatchNumber || batch.batchNumber)) || {};
      const hasSplits = grades.length > 0;
      const allSplitsStored = hasSplits ? grades.every(g => g.is_stored && bags.every(b => b.is_stored)) : false;
      const isStored = receiving.currentAssign === 0 && (!hasSplits || allSplitsStored);

      return {
        ...batch,
        status,
        dryMillEntered: latestEntry?.entered_at ? new Date(latestEntry.entered_at).toISOString().slice(0, 10) : 'N/A',
        dryMillExited: latestEntry?.exited_at ? new Date(latestEntry.exited_at).toISOString().slice(0, 10) : 'N/A',
        rfid: receiving.rfid || 'N/A',
        bagWeights: bags.map(b => b.weight),
        green_bean_splits: grades.length > 0 ? 
          grades.map(g => 
            `Grade: ${g.grade}, Weight: ${g.weight ? g.weight + ' kg' : 'N/A'}, Split: ${new Date(g.split_at).toISOString().slice(0, 19).replace('T', ' ')}, Bagged: ${g.bagged_at ? new Date(g.bagged_at).toISOString().slice(0, 10) : 'N/A'}, Stored: ${g.is_stored ? 'Yes' : 'No'}`
          ).join('; ') : null,
        isStored,
      };
    });

    console.log('Final data:', data);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching dry mill data:', error);
    res.status(500).json({ error: 'Failed to fetch dry mill data', details: error.message });
  }
});

// POST route for warehouse storage scanning
router.post('/warehouse/scan', async (req, res) => {
  const { rfid, scanned_at } = req.body;

  if (!rfid) {
    return res.status(400).json({ error: 'RFID tag is required.' });
  }

  if (!scanned_at || scanned_at !== 'Warehouse') {
    return res.status(400).json({ error: 'Invalid scanner identifier. Must be "Warehouse".' });
  }

  const trimmedRfid = rfid.trim().toUpperCase();

  try {
    const [batch] = await sequelize.query(`
      SELECT "batchNumber"
      FROM "ReceivingData"
      WHERE "rfid" = :rfid
      AND "currentAssign" = 1
      LIMIT 1;
    `, {
      replacements: { rfid: trimmedRfid },
      type: sequelize.QueryTypes.SELECT,
    });

    if (!batch) {
      return res.status(404).json({ error: 'RFID not associated with any active batch.' });
    }

    const batchNumber = batch.batchNumber;

    await sequelize.query(`
      INSERT INTO "RfidScanned" (rfid, scanned_at, created_at, action)
      VALUES (:rfid, :scanned_at, NOW(), 'Stored');
    `, {
      replacements: { rfid: trimmedRfid, scanned_at },
      type: sequelize.QueryTypes.INSERT,
    });

    await sequelize.query(`
      UPDATE "DryMillGrades"
      SET "is_stored" = TRUE
      WHERE "batchNumber" = :batchNumber;
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.UPDATE,
    });

    await sequelize.query(`
      UPDATE "BagDetails"
      SET is_stored = TRUE
      WHERE grade_id IN (SELECT "subBatchId" FROM "DryMillGrades" WHERE "batchNumber" = :batchNumber);
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.UPDATE,
    });

    await sequelize.query(`
      UPDATE "ReceivingData"
      SET "currentAssign" = 0
      WHERE "batchNumber" = :batchNumber;
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.UPDATE,
    });

    res.status(200).json({
      message: 'Green beans marked as stored, RFID tag available for reuse',
      rfid: trimmedRfid,
      batchNumber,
    });
  } catch (error) {
    console.error('Error processing warehouse RFID scan:', error);
    res.status(500).json({ error: 'Failed to process warehouse RFID scan', details: error.message });
  }
});

// POST route for reusing RFID tags
router.post('/rfid/reuse', async (req, res) => {
  const { batchNumber } = req.body;

  if (!batchNumber) {
    return res.status(400).json({ error: 'Batch number is required.' });
  }

  try {
    const [batch] = await sequelize.query(`
      SELECT "rfid", "currentAssign"
      FROM "ReceivingData"
      WHERE "batchNumber" = :batchNumber
      LIMIT 1;
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.SELECT,
    });

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found.' });
    }

    if (batch.currentAssign !== 0) {
      return res.status(400).json({ error: 'RFID tag is not ready for reuse.' });
    }

    await sequelize.query(`
      UPDATE "ReceivingData"
      SET "currentAssign" = 1
      WHERE "batchNumber" = :batchNumber;
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.UPDATE,
    });

    res.status(200).json({
      message: 'RFID tag reused successfully',
      batchNumber,
    });
  } catch (error) {
    console.error('Error reusing RFID tag:', error);
    res.status(500).json({ error: 'Failed to reuse RFID tag', details: error.message });
  }
});

// GET route for fetching existing grades for a batch
router.get('/dry-mill-grades/:batchNumber', async (req, res) => {
  const { batchNumber } = req.params;

  try {
    const gradesResult = await sequelize.query(`
      SELECT dg."subBatchId", dg.grade, dg.weight, dg.bagged_at, dg.is_stored,
             COALESCE(ARRAY_AGG(bd.weight ORDER BY bd.bag_number), ARRAY[]::FLOAT[]) AS bag_weights
      FROM "DryMillGrades" dg
      LEFT JOIN "BagDetails" bd ON dg."subBatchId" = bd.grade_id
      WHERE dg."batchNumber" = :batchNumber
      GROUP BY dg."subBatchId", dg.grade, dg.weight, dg.bagged_at, dg.is_stored
      ORDER BY dg.grade;
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.SELECT,
    });

    // Ensure gradesResult is always an array
    const grades = Array.isArray(gradesResult) ? gradesResult : [];

    const formattedGrades = grades.map(grade => ({
      grade: grade.grade,
      weight: grade.weight ? grade.weight.toString() : '',
      bagWeights: grade.bag_weights || [],
      bagged_at: grade.bagged_at ? new Date(grade.bagged_at).toISOString().slice(0, 10) : '',
    }));

    if (formattedGrades.length === 0) {
      return res.status(200).json([
        { grade: 'Specialty Grade', weight: '', bagWeights: [], bagged_at: new Date().toISOString().slice(0, 10) },
        { grade: 'Grade 1', weight: '', bagWeights: [], bagged_at: new Date().toISOString().slice(0, 10) },
        { grade: 'Grade 2', weight: '', bagWeights: [], bagged_at: new Date().toISOString().slice(0, 10) },
        { grade: 'Grade 3', weight: '', bagWeights: [], bagged_at: new Date().toISOString().slice(0, 10) },
        { grade: 'Grade 4', weight: '', bagWeights: [], bagged_at: new Date().toISOString().slice(0, 10) },
      ]);
    }

    res.status(200).json(formattedGrades);
  } catch (error) {
    console.error('Error fetching dry mill grades:', error);
    res.status(500).json({ error: 'Failed to fetch dry mill grades', details: error.message });
  }
});

module.exports = router;