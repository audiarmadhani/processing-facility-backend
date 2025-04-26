const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

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
      SELECT "entered_at" FROM "DryMillData" WHERE "batchNumber" = :batchNumber AND "entered_at" IS NOT NULL LIMIT 1;
    `, { replacements: { batchNumber }, transaction: t, type: sequelize.QueryTypes.SELECT });

    if (!dryMillEntry) {
      await t.rollback();
      return res.status(400).json({ error: 'Batch must be entered into dry mill first.' });
    }

    const [parentBatch] = await sequelize.query(`
      SELECT type, "processingType", "productLine", producer, notes
      FROM "PostprocessingData"
      WHERE "batchNumber" = :batchNumber
      LIMIT 1;
    `, { replacements: { batchNumber }, transaction: t, type: sequelize.QueryTypes.SELECT });

    if (!parentBatch) {
      await t.rollback();
      return res.status(404).json({ error: 'Parent batch not found.' });
    }

    const results = [];
    const subBatches = [];
    for (const { grade, weight, bagged_at } of grades) {
      if (!grade || typeof weight !== 'number' || weight <= 0 || !bagged_at) {
        await t.rollback();
        return res.status(400).json({ error: 'Each grade must have a valid grade, positive weight, and bagging date.' });
      }

      const subBatchId = `${batchNumber}-${grade.replace(/\s+/g, '')}`;
      const [result] = await sequelize.query(`
        INSERT INTO "DryMillGrades" ("batchNumber", "subBatchId", grade, weight, split_at, bagged_at, "is_stored")
        VALUES (:batchNumber, :subBatchId, :grade, :weight, NOW(), :bagged_at, FALSE)
        ON CONFLICT ("subBatchId") DO UPDATE SET weight = :weight, split_at = NOW(), bagged_at = :bagged_at, "is_stored" = FALSE
        RETURNING *;
      `, { 
        replacements: { batchNumber, subBatchId, grade, weight: parseFloat(weight), bagged_at }, 
        transaction: t,
        type: sequelize.QueryTypes.INSERT 
      });
      results.push(result[0]);

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

      const [referenceResults] = await sequelize.query(
        'SELECT "referenceNumber" FROM "ReferenceMappings_duplicate" WHERE "productLine" = ? AND "processingType" = ? AND "producer" = ? AND "quality" = ? AND "type" = ?',
        { replacements: [parentBatch.productLine, parentBatch.processingType, parentBatch.producer, grade, parentBatch.type], transaction: t }
      );

      if (referenceResults.length === 0) {
        await t.rollback();
        return res.status(400).json({ error: `No matching reference number found for grade ${grade}` });
      }

      const referenceNumber = referenceResults[0].referenceNumber;
      const currentYear = new Date().getFullYear().toString().slice(-2);
      const batchPrefix = `${parentBatch.producer}${currentYear}${productAbbreviation}-${processingAbbreviation}`;

      const [existingBatches] = await sequelize.query(
        'SELECT "batchNumber" FROM "PostprocessingData" WHERE "batchNumber" LIKE ? ORDER BY "batchNumber" DESC LIMIT 1',
        { replacements: [`${batchPrefix}-%`], transaction: t }
      );

      let sequenceNumber = existingBatches.length > 0 ? parseInt(existingBatches[0].batchNumber.split('-').pop(), 10) + 1 : 1;
      const newBatchNumber = `${batchPrefix}-${String(sequenceNumber).padStart(4, '0')}`;

      const totalBags = Math.ceil(weight / 60);

      const [subBatch] = await sequelize.query(`
        INSERT INTO "PostprocessingData" ("batchNumber", "referenceNumber", type, "processingType", "productLine", weight, "totalBags", notes, quality, producer, "storedDate", "createdAt", "updatedAt", "parentBatchNumber")
        VALUES (:batchNumber, :referenceNumber, :type, :processingType, :productLine, :weight, :totalBags, :notes, :quality, :producer, :storedDate, :createdAt, :updatedAt, :parentBatchNumber)
        RETURNING *;
      `, {
        replacements: {
          batchNumber: newBatchNumber,
          referenceNumber,
          type: parentBatch.type,
          processingType: parentBatch.processingType,
          productLine: parentBatch.productLine,
          weight: parseFloat(weight),
          totalBags,
          notes: parentBatch.notes || '',
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
      SET "is_stored" = TRUE, "currentAssign" = 0
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

// POST route for dry mill RFID scanning (entry/exit)
router.post('/dry-mill/scan', async (req, res) => {
  const { rfid, scanned_at } = req.body;

  if (!rfid) {
    return res.status(400).json({ error: 'RFID tag is required.' });
  }

  if (!scanned_at || scanned_at !== 'Dry Mill') {
    return res.status(400).json({ error: 'Invalid scanner identifier. Must be "Dry Mill".' });
  }

  const trimmedRfid = rfid.trim().toUpperCase();

  try {
    const [batch] = await sequelize.query(`
      SELECT "batchNumber", "is_stored", "currentAssign"
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
      VALUES (:rfid, :scanned_at, NOW(), 'Scan');
    `, {
      replacements: { rfid: trimmedRfid, scanned_at },
      type: sequelize.QueryTypes.INSERT,
    });

    const [existingEntry] = await sequelize.query(`
      SELECT id, entered_at, exited_at
      FROM "DryMillData"
      WHERE "rfid" = :rfid
      AND "batchNumber" = :batchNumber
      AND "entered_at" IS NOT NULL
      AND "exited_at" IS NULL
      LIMIT 1;
    `, {
      replacements: { rfid: trimmedRfid, batchNumber },
      type: sequelize.QueryTypes.SELECT,
    });

    if (existingEntry) {
      const [updateResult] = await sequelize.query(`
        UPDATE "DryMillData"
        SET exited_at = NOW()
        WHERE id = :id
        RETURNING *;
      `, {
        replacements: { id: existingEntry.id },
        type: sequelize.QueryTypes.UPDATE,
      });

      res.status(200).json({
        message: 'RFID tag scanned at dry mill exit, green beans ready for storage',
        rfid: trimmedRfid,
        batchNumber,
        exited_at: updateResult[0].exited_at,
      });
    } else {
      const [result] = await sequelize.query(`
        INSERT INTO "DryMillData" (rfid, "batchNumber", entered_at, created_at)
        VALUES (:rfid, :batchNumber, NOW(), NOW())
        RETURNING *;
      `, {
        replacements: { rfid: trimmedRfid, batchNumber },
        type: sequelize.QueryTypes.INSERT,
      });

      res.status(201).json({
        message: 'RFID tag scanned at dry mill entrance, scanner logs processed',
        rfid: trimmedRfid,
        batchNumber,
        entered_at: result[0].entered_at,
      });
    }
  } catch (error) {
    console.error('Error processing dry mill RFID scan:', error);
    res.status(500).json({ error: 'Failed to process dry mill RFID scan', details: error.message });
  }
});

// GET route for dry mill data
router.get('/dry-mill-data', async (req, res) => {
  try {
    const [postprocessingData] = await sequelize.query(`
      SELECT 
        "batchNumber",
        "referenceNumber",
        type,
        "processingType",
        "productLine",
        weight AS "cherry_weight",
        "totalBags",
        notes,
        quality,
        producer,
        DATE("storedDate") AS storeddatetrunc,
        "parentBatchNumber"
      FROM "PostprocessingData"
      ORDER BY "batchNumber" DESC;
    `, { type: sequelize.QueryTypes.SELECT });

    const postprocessingArray = Array.isArray(postprocessingData) ? postprocessingData : postprocessingData ? [postprocessingData] : [];

    const [dryMillData] = await sequelize.query(`
      SELECT dm.rfid, dm."batchNumber", dm.entered_at, dm.exited_at, dm.created_at
      FROM "DryMillData" dm
      ORDER BY dm.created_at DESC;
    `, { type: sequelize.QueryTypes.SELECT });

    const dryMillDataArray = Array.isArray(dryMillData) ? dryMillData : dryMillData ? [dryMillData] : [];

    const [dryMillGrades] = await sequelize.query(`
      SELECT dg."batchNumber", dg."subBatchId", dg.grade, dg.weight, dg.split_at, dg.bagged_at, dg."is_stored"
      FROM "DryMillGrades" dg
      ORDER BY dg."batchNumber", dg."subBatchId";
    `, { type: sequelize.QueryTypes.SELECT });

    const dryMillGradesArray = Array.isArray(dryMillGrades) ? dryMillGrades : dryMillGrades ? [dryMillGrades] : [];

    const [receivingData] = await sequelize.query(`
      SELECT "batchNumber", rfid, "is_stored", "currentAssign"
      FROM "ReceivingData"
      ORDER BY "batchNumber";
    `, { type: sequelize.QueryTypes.SELECT });

    const receivingDataArray = Array.isArray(receivingData) ? receivingData : receivingData ? [receivingData] : [];

    const data = postprocessingArray.map(batch => {
      const batchDryMillData = dryMillDataArray.filter(data => data.batchNumber === batch.batchNumber) || [];
      const latestEntry = batchDryMillData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
      const status = latestEntry?.exited_at ? 'Processed' : (latestEntry?.entered_at ? 'In Dry Mill' : 'Not Started');
      const splits = dryMillGradesArray.filter(grade => grade.batchNumber === (batch.parentBatchNumber || batch.batchNumber)) || [];
      const receiving = receivingDataArray.find(r => r.batchNumber === batch.batchNumber) || {};
      const isStored = receiving.is_stored || splits.every(split => split.is_stored) || !splits.length;

      return {
        ...batch,
        status,
        dryMillEntered: latestEntry?.entered_at ? new Date(latestEntry.entered_at).toISOString().slice(0, 10) : 'N/A',
        dryMillExited: latestEntry?.exited_at ? new Date(latestEntry.exited_at).toISOString().slice(0, 10) : 'N/A',
        rfid: receiving.rfid || 'N/A',
        green_bean_splits: splits.length > 0 ? 
          splits.map(split => 
            `Grade: ${split.grade}, Weight: ${split.weight} kg, Split: ${new Date(split.split_at).toISOString().slice(0, 19).replace('T', ' ')}, Bagged: ${new Date(split.bagged_at).toISOString().slice(0, 10)}, Stored: ${split.is_stored ? 'Yes' : 'No'}`
          ).join('; ') : null,
        isStored,
      };
    });

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
      UPDATE "ReceivingData"
      SET "is_stored" = TRUE, "currentAssign" = 0
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
      SELECT "rfid", "is_stored", "currentAssign"
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

    if (!batch.is_stored || batch.currentAssign) {
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

module.exports = router;