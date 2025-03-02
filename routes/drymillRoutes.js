const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

// POST route for manual green bean splitting, weighing, and bagging
router.post('/dry-mill/:batchNumber/split', async (req, res) => {
  const { batchNumber } = req.params;
  const { grades } = req.body; // Array of { grade: string, weight: number, bagged_at: string (DateTime) }

  if (!batchNumber || !grades || !Array.isArray(grades) || grades.length === 0) {
    return res.status(400).json({ error: 'Batch number and valid grades are required.' });
  }

  try {
    // Check if batch has entered dry mill (using DryMillData, as QCData_v lacks this)
    const [dryMillEntry] = await sequelize.query(`
      SELECT "entered_at" FROM "DryMillData" WHERE "batchNumber" = :batchNumber AND "entered_at" IS NOT NULL LIMIT 1;
    `, { replacements: { batchNumber }, type: sequelize.QueryTypes.SELECT });

    if (!dryMillEntry) {
      return res.status(400).json({ error: 'Batch must be entered into dry mill first.' });
    }

    // No weight validation against cherry weight due to processing losses
    const results = [];
    for (const { grade, weight, bagged_at } of grades) {
      if (!grade || typeof weight !== 'number' || weight <= 0 || !bagged_at) {
        return res.status(400).json({ error: 'Each grade must have a valid grade, positive weight, and bagging date.' });
      }
      const subBatchId = `${batchNumber}-${grade.replace(/\s+/g, '')}`; // e.g., "2025-02-17-0001-Specialty"
      const [result] = await sequelize.query(`
        INSERT INTO "DryMillGrades" ("batchNumber", "subBatchId", grade, weight, split_at, bagged_at, "is_stored")
        VALUES (:batchNumber, :subBatchId, :grade, :weight, NOW(), :bagged_at, FALSE)
        ON CONFLICT ("subBatchId") DO UPDATE SET weight = :weight, split_at = NOW(), bagged_at = :bagged_at, "is_stored" = FALSE
        RETURNING *;
      `, { 
        replacements: { batchNumber, subBatchId, grade, weight: parseFloat(weight), bagged_at }, 
        type: sequelize.QueryTypes.INSERT 
      });
      results.push(result[0]);
    }

    res.status(201).json({ message: 'Green bean splits saved successfully', grades: results });
  } catch (error) {
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

  try {
    // Check if batch is in dry mill (using DryMillData, as QCData_v lacks this)
    const [dryMillEntry] = await sequelize.query(`
      SELECT "entered_at", "exited_at" FROM "DryMillData" 
      WHERE "batchNumber" = :batchNumber 
      AND "entered_at" IS NOT NULL 
      AND "exited_at" IS NULL 
      LIMIT 1;
    `, { replacements: { batchNumber }, type: sequelize.QueryTypes.SELECT });

    if (!dryMillEntry) {
      return res.status(400).json({ error: 'Batch is not in dry mill or already processed.' });
    }

    // Check if all splits have weights and bagging dates
    const [splits] = await sequelize.query(`
      SELECT COUNT(*) AS total, SUM(CASE WHEN weight IS NOT NULL AND bagged_at IS NOT NULL THEN 1 ELSE 0 END) AS completed
      FROM "DryMillGrades" 
      WHERE "batchNumber" = :batchNumber;
    `, { replacements: { batchNumber }, type: sequelize.QueryTypes.SELECT });

    if (splits.completed !== splits.total) {
      return res.status(400).json({ error: 'All splits must have weights and bagging dates before marking as processed.' });
    }

    // Update DryMillData to mark as processed
    const [result] = await sequelize.query(`
      UPDATE "DryMillData" 
      SET exited_at = NOW() 
      WHERE "batchNumber" = :batchNumber 
      AND "entered_at" IS NOT NULL 
      AND "exited_at" IS NULL 
      RETURNING *;
    `, { replacements: { batchNumber }, type: sequelize.QueryTypes.UPDATE });

    res.status(200).json({ message: 'Batch marked as processed successfully', exited_at: result[0].exited_at });
  } catch (error) {
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
    // Check if RFID is assigned in ReceivingData
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

    // Log scan in RfidScanned
    await sequelize.query(`
      INSERT INTO "RfidScanned" (rfid, scanned_at, created_at, action)
      VALUES (:rfid, :scanned_at, NOW(), 'Scan');
    `, {
      replacements: { rfid: trimmedRfid, scanned_at },
      type: sequelize.QueryTypes.INSERT,
    });

    // Check if this is an exit scan (bagging/storage readiness)
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
      // Exit scan: Prepare for storage confirmation
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
      // Entry scan: Log entry into dry mill
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

// GET route for dry mill data, using direct sequelize queries
router.get('/dry-mill-data', async (req, res) => {
  try {
    // Fetch QCData_v for base batch data
    const [qcData] = await sequelize.query(`
      SELECT "batchNumber", weight AS "cherry_weight", producer, "productLine", "processingType", quality AS "targetQuality", "batchStatus"
      FROM "QCData_v"
      WHERE "batchStatus" IN ('Processing', 'Dried')
      ORDER BY "batchNumber" DESC;
    `, { type: sequelize.QueryTypes.SELECT });

    // Fetch DryMillData for Dry Mill status
    const [dryMillDataRaw] = await sequelize.query(`
      SELECT dm.rfid, dm."batchNumber", dm.entered_at, dm.exited_at, dm.created_at
      FROM "DryMillData" dm
      ORDER BY dm.created_at DESC;
    `, { type: sequelize.QueryTypes.SELECT });

    // Fetch DryMillGrades for splits
    const [dryMillGrades] = await sequelize.query(`
      SELECT dg."batchNumber", dg."subBatchId", dg.grade, dg.weight, dg.split_at, dg.bagged_at, dg."is_stored"
      FROM "DryMillGrades" dg
      ORDER BY dg."batchNumber", dg."subBatchId";
    `, { type: sequelize.QueryTypes.SELECT });

    // Fetch ReceivingData for RFID
    const [receivingData] = await sequelize.query(`
      SELECT "batchNumber", rfid
      FROM "ReceivingData"
      ORDER BY "batchNumber";
    `, { type: sequelize.QueryTypes.SELECT });

    const data = qcData.map(batch => {
      const batchDryMillData = dryMillDataRaw.filter(data => data.batchNumber === batch.batchNumber);
      const latestEntry = batchDryMillData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
      const status = latestEntry?.exited_at ? 'Processed' : 'In Dry Mill';
      const splits = dryMillGrades.filter(grade => grade.batchNumber === batch.batchNumber).map(split => ({
        subBatchId: split.subBatchId,
        grade: split.grade,
        weight: split.weight,
        split_at: split.split_at,
        bagged_at: split.bagged_at,
        is_stored: split.is_stored,
      }));
      const receiving = receivingData.find(r => r.batchNumber === batch.batchNumber) || {};
      const isStored = splits.every(split => split.is_stored) || !splits.length;

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
    // Check if RFID is assigned in ReceivingData
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

    // Log scan in RfidScanned
    await sequelize.query(`
      INSERT INTO "RfidScanned" (rfid, scanned_at, created_at, action)
      VALUES (:rfid, :scanned_at, NOW(), 'Stored');
    `, {
      replacements: { rfid: trimmedRfid, scanned_at },
      type: sequelize.QueryTypes.INSERT,
    });

    // Mark splits as stored
    await sequelize.query(`
      UPDATE "DryMillGrades"
      SET "is_stored" = TRUE
      WHERE "batchNumber" = :batchNumber;
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.UPDATE,
    });

    // Update ReceivingData for storage and tag reuse
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

module.exports = router;