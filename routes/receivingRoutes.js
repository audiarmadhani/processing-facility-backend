const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

function validateCreateWithoutWeight(weight, totalBags, bagPayload) {
  if (weight !== 0 && weight !== '0') {
    return 'Batch must be created with weight 0. Record weights from the receiving table after creation.';
  }
  if (totalBags !== 0 && totalBags !== '0') {
    return 'Batch must be created with totalBags 0. Record bag weights after creation.';
  }
  if (Array.isArray(bagPayload) && bagPayload.length > 0) {
    return 'Bag weights cannot be submitted at batch creation. Use Record weight on the receiving table.';
  }
  return null;
}

function normalizeDriverHandoffCode(raw) {
  if (raw == null || raw === '') {
    return { code: null };
  }
  const code = String(raw).replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6);
  if (code.length !== 6) {
    return {
      error: 'Driver pickup code must be exactly 6 letters or numbers.',
    };
  }
  return { code };
}

function validateBagPayload(bagPayload) {
  if (!Array.isArray(bagPayload) || bagPayload.length === 0) {
    return 'At least one bag with weight is required.';
  }
  for (const bag of bagPayload) {
    const bagNumber = Number(bag.bagNumber);
    const bagWeight = Number(bag.weight);
    if (!Number.isInteger(bagNumber) || bagNumber < 1) {
      return 'Each bag must have a valid bag number (integer >= 1).';
    }
    if (isNaN(bagWeight) || bagWeight <= 0) {
      return 'Each bag must have a weight greater than 0.';
    }
  }
  const bagNumbers = bagPayload.map((b) => Number(b.bagNumber)).sort((a, b) => a - b);
  for (let i = 0; i < bagNumbers.length; i++) {
    if (bagNumbers[i] !== i + 1) {
      return 'Bag numbers must be contiguous starting from 1 (1, 2, 3, ...).';
    }
  }
  return null;
}

// Route for creating receiving data
router.post('/receiving', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      farmerID,
      farmerName,
      weight,
      totalBags,
      notes,
      type,
      producer,
      brix,
      bagPayload,
      createdBy,
      updatedBy,
      rfid,
      driverPickupHandoffCode,
    } = req.body;

    // Basic validation
    if (!farmerID || !farmerName || weight === undefined || totalBags === undefined || !type || !producer || !createdBy || !updatedBy) {
      await t.rollback();
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    const createWeightError = validateCreateWithoutWeight(weight, totalBags, bagPayload);
    if (createWeightError) {
      await t.rollback();
      return res.status(400).json({ error: createWeightError });
    }
    if (!rfid) {
      await t.rollback();
      return res.status(400).json({ error: 'RFID tag is required.' });
    }
    if (brix !== undefined && (typeof brix !== 'number' || brix < 0)) {
      await t.rollback();
      return res.status(400).json({ error: 'Brix must be a non-negative number.' });
    }

    const handoffResult = normalizeDriverHandoffCode(driverPickupHandoffCode);
    if (handoffResult.error) {
      await t.rollback();
      return res.status(400).json({ error: handoffResult.error });
    }

    // Retrieve or initialize the latest batch number
    const [latestBatchResults] = await sequelize.query(
      'SELECT latest_batch_number FROM latest_batch LIMIT 1',
      { transaction: t, type: sequelize.QueryTypes.SELECT }
    );
    let latestBatch;

    if (Array.isArray(latestBatchResults) && latestBatchResults.length > 0) {
      latestBatch = latestBatchResults[0];
    } else if (latestBatchResults && latestBatchResults.latest_batch_number) {
      latestBatch = latestBatchResults;
    } else {
      await sequelize.query(
        'INSERT INTO latest_batch (latest_batch_number) VALUES (:initialValue)',
        { replacements: { initialValue: '1970-01-01-0000' }, transaction: t, type: sequelize.QueryTypes.INSERT }
      );
      latestBatch = { latest_batch_number: '1970-01-01-0000' };
    }

    // Get current date and format it
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    const currentBatchDate = `${year}-${month}-${day}`;

    // Calculate the new batch number
    const parts = latestBatch.latest_batch_number.split('-');
    const lastBatchDate = parts.slice(0, 3).join('-');
    const lastSeqNumber = parseInt(parts[3], 10);

    let sequenceNumber = (lastBatchDate === currentBatchDate) ? lastSeqNumber + 1 : 1;
    const batchNumber = `${currentBatchDate}-${String(sequenceNumber).padStart(4, '0')}`;

    // Insert ReceivingData
    const [receivingData] = await sequelize.query(`
      INSERT INTO "ReceivingData" (
        "batchNumber", "farmerID", "farmerName", weight, "totalBags", notes, type, producer, brix,
        "receivingDate", "createdAt", "updatedAt", "createdBy", "updatedBy", "rfid", "currentAssign",
        "driverPickupHandoffCode"
      ) VALUES (
        :batchNumber, :farmerID, :farmerName, :weight, :totalBags, :notes, :type, :producer, :brix,
        :receivingDate, :createdAt, :updatedAt, :createdBy, :updatedBy, :rfid, :currentAssign,
        :driverPickupHandoffCode
      ) RETURNING *;
    `, {
      replacements: {
        batchNumber,
        farmerID,
        farmerName,
        weight,
        totalBags,
        notes,
        type,
        producer,
        brix: brix !== undefined ? brix : null,
        receivingDate: currentDate,
        createdAt: currentDate,
        updatedAt: currentDate,
        createdBy,
        updatedBy,
        rfid,
        currentAssign: 1,
        driverPickupHandoffCode: handoffResult.code,
      },
      transaction: t,
      type: sequelize.QueryTypes.INSERT
    });

    // Update latest_batch
    await sequelize.query(
      'UPDATE latest_batch SET latest_batch_number = :batchNumber',
      {
        replacements: { batchNumber },
        transaction: t,
        type: sequelize.QueryTypes.UPDATE
      }
    );

    await t.commit();
    res.status(201).json({
      message: `Batch ${batchNumber} created and stored in inventory successfully`,
      receivingData: receivingData[0],
    });
  } catch (err) {
    await t.rollback();
    console.error('Error creating receiving data:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Route for creating green bean receiving data
// --- receiving-green-beans route (replace the existing handler) ---
router.post('/receiving-green-beans', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      farmerID, farmerName, weight, totalBags, notes,
      type, producer, processingType, grade, bagPayload,
      createdBy, updatedBy, rfid, price, moisture, driverPickupHandoffCode,
    } = req.body;

    // Basic validation
    if (!farmerID || !farmerName || weight === undefined || totalBags === undefined || !type || !producer || !createdBy || !updatedBy || !processingType || !grade) {
      await t.rollback();
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    const createWeightError = validateCreateWithoutWeight(weight, totalBags, bagPayload);
    if (createWeightError) {
      await t.rollback();
      return res.status(400).json({ error: createWeightError });
    }
    if (!rfid) {
      await t.rollback();
      return res.status(400).json({ error: 'RFID tag is required.' });
    }
    // price and moisture are optional; validate if provided
    if (price !== undefined && (isNaN(Number(price)) || Number(price) < 0)) {
      await t.rollback();
      return res.status(400).json({ error: 'Price must be a non-negative number.' });
    }
    if (moisture !== undefined && (isNaN(Number(moisture)) || Number(moisture) < 0)) {
      await t.rollback();
      return res.status(400).json({ error: 'Moisture must be a non-negative number.' });
    }

    const handoffResult = normalizeDriverHandoffCode(driverPickupHandoffCode);
    if (handoffResult.error) {
      await t.rollback();
      return res.status(400).json({ error: handoffResult.error });
    }

    // Get current date and format it
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    const currentBatchDate = `${year}-${month}-${day}`;

    // Retrieve or initialize the latest green bean batch number with locking.
    // Use a robust SELECT that returns rows array consistently.
    const latestRows = await sequelize.query(
      'SELECT latest_green_bean_batch_number FROM latest_gb_batch LIMIT 1 FOR UPDATE',
      { transaction: t, type: sequelize.QueryTypes.SELECT }
    );

    let latestBatchNumber = 'GB-1970-01-01-0000';
    if (Array.isArray(latestRows) && latestRows.length > 0 && latestRows[0].latest_green_bean_batch_number) {
      latestBatchNumber = latestRows[0].latest_green_bean_batch_number;
    } else {
      // initialize table if missing or empty
      await sequelize.query(
        'INSERT INTO latest_gb_batch (latest_green_bean_batch_number) VALUES (:initialValue)',
        { replacements: { initialValue: latestBatchNumber }, transaction: t, type: sequelize.QueryTypes.INSERT }
      );
    }

    // Parse the latest batch number properly.
    // Format is: GB-YYYY-MM-DD-XXXX -> parts[0]='GB', parts[1]=YYYY, parts[2]=MM, parts[3]=DD, parts[4]=SEQ
    const parts = String(latestBatchNumber).split('-');
    const lastBatchDate = parts.slice(1, 4).join('-');   // YYYY-MM-DD
    const lastSeqNumber = parseInt(parts[4], 10) || 0;   // sequence is at index 4
    const sequenceNumber = (lastBatchDate === currentBatchDate) ? lastSeqNumber + 1 : 1;
    const batchNumber = `GB-${currentBatchDate}-${String(sequenceNumber).padStart(4, '0')}`;

    // Insert ReceivingData with optional price and moisture fields
    const [receivingData] = await sequelize.query(`
      INSERT INTO "ReceivingData" (
        "batchNumber", "farmerID", "farmerName", weight, "totalBags", notes, type, producer,
        "processingType", "grade", "commodityType", "receivingDate", "createdAt", "updatedAt",
        "createdBy", "updatedBy", "rfid", "currentAssign",
        price, moisture, "driverPickupHandoffCode"
      ) VALUES (
        :batchNumber, :farmerID, :farmerName, :weight, :totalBags, :notes, :type, :producer,
        :processingType, :grade, :commodityType, :receivingDate, :createdAt, :updatedAt,
        :createdBy, :updatedBy, :rfid, :currentAssign,
        :price, :moisture, :driverPickupHandoffCode
      ) RETURNING *;
    `, {
      replacements: {
        batchNumber,
        farmerID,
        farmerName,
        weight,
        totalBags,
        notes,
        type,
        producer,
        processingType,
        grade,
        commodityType: 'Green Bean',
        receivingDate: currentDate,
        createdAt: currentDate,
        updatedAt: currentDate,
        createdBy,
        updatedBy,
        rfid,
        currentAssign: 1,
        price: price !== undefined ? Number(price) : null,
        moisture: moisture !== undefined ? Number(moisture) : null,
        driverPickupHandoffCode: handoffResult.code,
      },
      transaction: t,
      type: sequelize.QueryTypes.INSERT
    });

    // Update latest_gb_batch
    await sequelize.query(
      'UPDATE latest_gb_batch SET latest_green_bean_batch_number = :batchNumber',
      {
        replacements: { batchNumber },
        transaction: t,
        type: sequelize.QueryTypes.UPDATE
      }
    );

    await t.commit();
    res.status(201).json({
      message: `Batch ${batchNumber} created and stored in inventory successfully`,
      receivingData: receivingData[0],
    });
  } catch (err) {
    await t.rollback();
    console.error('Error creating green bean receiving data:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Route for fetching all Receiving data
router.get('/receiving', async (req, res) => {
  try {
    const { commodityType } = req.query;
    let whereClause = '';
    if (commodityType) {
      whereClause = `AND a."commodityType" = :commodityType`;
    }

    const [allRows] = await sequelize.query(
      `SELECT a.*, (a."receivingDate" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Makassar') as "receivingDate",
       b."contractType", c.price*a.weight total_price, c.price, b.broker, b."farmVarieties"
       FROM "ReceivingData" a 
       LEFT JOIN "Farmers" b ON a."farmerID" = b."farmerID"
       LEFT JOIN (SELECT "batchNumber", MAX(price) price FROM "QCData" GROUP BY "batchNumber") c on a."batchNumber" = c."batchNumber"
       WHERE a.merged = FALSE
       AND a."batchNumber" LIKE '2026%'
       ${whereClause}
       ORDER BY a."receivingDate" DESC;`,
      {
        replacements: commodityType ? { commodityType } : {},
      }
    );

    const [noQCRows] = await sequelize.query(
      `SELECT a.*, (a."receivingDate" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Makassar') as "receivingDate",
       b."contractType", c.price*a.weight total_price, c.price, b.broker, b."farmVarieties"
       FROM "ReceivingData" a 
       LEFT JOIN "Farmers" b ON a."farmerID" = b."farmerID"
       LEFT JOIN (SELECT "batchNumber", MAX(price) price FROM "QCData" GROUP BY "batchNumber") c on a."batchNumber" = c."batchNumber"
       WHERE a.merged = FALSE
       AND a."commodityType" = 'Cherry'
       AND a."batchNumber" NOT LIKE '%MB'
       AND a."batchNumber" LIKE '2026%'
       ORDER BY a."receivingDate" DESC;`,
      {
        replacements: commodityType ? { commodityType } : {},
      }
    );

    const [todayData] = await sequelize.query(
      `SELECT a.*, (a."receivingDate" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Makassar') as "receivingDate",
       b."contractType", c.price*a.weight total_price, c.price, b.broker, b."farmVarieties"
       FROM "ReceivingData" a 
       LEFT JOIN "Farmers" b ON a."farmerID" = b."farmerID"
       LEFT JOIN (SELECT "batchNumber", MAX(price) price FROM "QCData" GROUP BY "batchNumber") c on a."batchNumber" = c."batchNumber"
       WHERE TO_CHAR(a."receivingDate" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Makassar', 'YYYY-MM-DD') = TO_CHAR(NOW() AT TIME ZONE 'Asia/Makassar', 'YYYY-MM-DD')
       AND a."batchNumber" NOT IN (SELECT unnest(regexp_split_to_array("batchNumber", ',')) FROM "TransportData")
       ${commodityType ? 'AND a."commodityType" = :commodityType' : ''}
       AND a.merged = FALSE
       AND a."batchNumber" LIKE '2026%'
       ORDER BY a."receivingDate" DESC;`,
      {
        replacements: commodityType ? { commodityType } : {},
      }
    );

    const [noTransportData] = await sequelize.query(
      `SELECT a.*, (a."receivingDate" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Makassar') as "receivingDate",
       b."contractType", c.price*a.weight total_price, c.price, b.broker, b."farmVarieties"
       FROM "ReceivingData" a 
       LEFT JOIN "Farmers" b ON a."farmerID" = b."farmerID"
       LEFT JOIN (SELECT "batchNumber", MAX(price) price FROM "QCData" GROUP BY "batchNumber") c on a."batchNumber" = c."batchNumber"
       WHERE a."batchNumber" NOT IN (SELECT unnest(regexp_split_to_array("batchNumber", ',')) FROM "TransportData")
       ${commodityType ? 'AND a."commodityType" = :commodityType' : ''}
       AND a.merged = FALSE
       AND a."batchNumber" LIKE '2026%'
       ORDER BY a."batchNumber" DESC;`,
      {
        replacements: commodityType ? { commodityType } : {},
      }
    );

    res.json({ allRows, noQCRows, todayData, noTransportData });
  } catch (err) {
    console.error('Error fetching Receiving data:', err);
    res.status(500).json({ message: 'Failed to fetch Receiving data.' });
  }
});

// date query param = batch date encoded in batchNumber (YYYY-MM-DD-####), not receivingDate
router.get('/receiving/cherry-receive-report', async (req, res) => {
  const { date } = req.query;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
    return res.status(400).json({ error: 'date query param is required (YYYY-MM-DD)' });
  }

  try {
    const rows = await sequelize.query(
      `
      SELECT
        a."batchNumber",
        SUBSTRING(a."batchNumber", 1, 10) AS "batchDate",
        (a."receivingDate" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Makassar') AS "receivingDate",
        a."farmerName",
        b.broker,
        a.type,
        b."farmVarieties",
        a.brix,
        a.weight,
        a.producer,
        c.price,
        fer."experimentNumber"
      FROM "ReceivingData" a
      LEFT JOIN "Farmers" b ON a."farmerID" = b."farmerID"
      LEFT JOIN (
        SELECT "batchNumber", MAX(price) AS price
        FROM "QCData"
        GROUP BY "batchNumber"
      ) c ON a."batchNumber" = c."batchNumber"
      LEFT JOIN LATERAL (
        SELECT fd."experimentNumber"
        FROM "FermentationData" fd
        WHERE fd."batchNumber" = a."batchNumber"
        ORDER BY fd.id DESC
        LIMIT 1
      ) fer ON true
      WHERE a.merged = FALSE
        AND a."commodityType" = 'Cherry'
        AND a."batchNumber" LIKE '2026%'
        AND a."batchNumber" NOT LIKE '%MB'
        AND SUBSTRING(a."batchNumber", 1, 10) = :date
      ORDER BY a."batchNumber" ASC
      `,
      {
        replacements: { date: String(date) },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json({ date, rows });
  } catch (err) {
    console.error('Error fetching cherry receive report:', err);
    res.status(500).json({ error: 'Failed to fetch cherry receive report', details: err.message });
  }
});

// Route to get bag weights for a batch
router.get('/receiving/:batchNumber/bags', async (req, res) => {
  let { batchNumber } = req.params;
  batchNumber = batchNumber.trim();

  try {
    const receivingRows = await sequelize.query(
      `SELECT "batchNumber", weight, "totalBags", merged
       FROM "ReceivingData"
       WHERE LOWER("batchNumber") = LOWER(:batchNumber)
       LIMIT 1`,
      { replacements: { batchNumber }, type: sequelize.QueryTypes.SELECT }
    );

    const receiving = Array.isArray(receivingRows) && receivingRows.length > 0 ? receivingRows[0] : null;
    if (!receiving) {
      return res.status(404).json({ error: 'Batch not found.' });
    }

    const bags = await sequelize.query(
      `SELECT "bagNumber", weight
       FROM "BagData"
       WHERE LOWER("batchNumber") = LOWER(:batchNumber)
       ORDER BY "bagNumber" ASC`,
      { replacements: { batchNumber }, type: sequelize.QueryTypes.SELECT }
    );

    res.json({
      batchNumber: receiving.batchNumber,
      weight: receiving.weight,
      totalBags: receiving.totalBags,
      bags: Array.isArray(bags) ? bags : [],
    });
  } catch (err) {
    console.error('Error fetching bag data:', err);
    res.status(500).json({ error: 'Failed to fetch bag data.', details: err.message });
  }
});

// Route to record or update bag weights for a batch
router.put('/receiving/:batchNumber/weights', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    let { batchNumber } = req.params;
    batchNumber = batchNumber.trim();
    const { bagPayload, updatedBy } = req.body;

    if (!updatedBy) {
      await t.rollback();
      return res.status(400).json({ error: 'updatedBy is required.' });
    }

    const bagError = validateBagPayload(bagPayload);
    if (bagError) {
      await t.rollback();
      return res.status(400).json({ error: bagError });
    }

    const receivingRows = await sequelize.query(
      `SELECT "batchNumber", merged FROM "ReceivingData"
       WHERE LOWER("batchNumber") = LOWER(:batchNumber)
       LIMIT 1`,
      { replacements: { batchNumber }, transaction: t, type: sequelize.QueryTypes.SELECT }
    );
    const receiving = Array.isArray(receivingRows) && receivingRows.length > 0 ? receivingRows[0] : null;
    if (!receiving) {
      await t.rollback();
      return res.status(404).json({ error: 'Batch not found.' });
    }
    if (receiving.merged) {
      await t.rollback();
      return res.status(400).json({ error: 'Cannot update weights for a merged batch.' });
    }

    const canonicalBatchNumber = receiving.batchNumber;
    const currentDate = new Date();
    const totalWeight = bagPayload.reduce((sum, bag) => sum + Number(bag.weight), 0);
    const totalBags = bagPayload.length;

    await sequelize.query(
      `DELETE FROM "BagData" WHERE LOWER("batchNumber") = LOWER(:batchNumber)`,
      { replacements: { batchNumber: canonicalBatchNumber }, transaction: t, type: sequelize.QueryTypes.DELETE }
    );

    const bagInsertQuery = `
      INSERT INTO "BagData" ("batchNumber", "bagNumber", weight, "createdAt", "updatedAt")
      VALUES ${bagPayload.map(() => '(?, ?, ?, ?, ?)').join(', ')} RETURNING *;
    `;
    const bagData = bagPayload.flatMap((bag) => [
      canonicalBatchNumber,
      bag.bagNumber,
      Number(bag.weight),
      currentDate,
      currentDate,
    ]);
    const insertedBags = await sequelize.query(bagInsertQuery, {
      replacements: bagData,
      transaction: t,
      type: sequelize.QueryTypes.INSERT,
    });

    const updatedReceiving = await sequelize.query(
      `UPDATE "ReceivingData"
       SET weight = :weight, "totalBags" = :totalBags, "updatedAt" = :updatedAt, "updatedBy" = :updatedBy
       WHERE LOWER("batchNumber") = LOWER(:batchNumber)
       RETURNING *`,
      {
        replacements: {
          weight: totalWeight,
          totalBags,
          updatedAt: currentDate,
          updatedBy,
          batchNumber: canonicalBatchNumber,
        },
        transaction: t,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    await t.commit();

    const receivingRow =
      Array.isArray(updatedReceiving) && updatedReceiving.length > 0 ? updatedReceiving[0] : null;
    res.json({
      message: `Weights recorded for batch ${canonicalBatchNumber}`,
      receivingData: receivingRow,
      bags: Array.isArray(insertedBags) ? insertedBags : insertedBags?.[0] ?? [],
    });
  } catch (err) {
    await t.rollback();
    console.error('Error updating batch weights:', err);
    res.status(500).json({ error: 'Failed to update batch weights.', details: err.message });
  }
});

// Route to get receiving data by batch number
router.get('/receiving/:batchNumber', async (req, res) => {
  let { batchNumber } = req.params;
  batchNumber = batchNumber.trim();

  try {
    const [rows] = await sequelize.query(
      `
      WITH qc AS (
        SELECT "batchNumber", MIN("qcDate" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Makassar') AS "qcDate"
        FROM "QCData"
        GROUP BY "batchNumber"
      )
      SELECT 
        a.*, (a."receivingDate" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Makassar') as "receivingDate",
        b."qcDate",
        c."contractType",
        c."farmVarieties",
        c."farmVarieties" as variety
      FROM "ReceivingData" a 
      LEFT JOIN qc b ON a."batchNumber" = b."batchNumber" 
      LEFT JOIN "Farmers" c ON a."farmerID" = c."farmerID"
      WHERE LOWER(a."batchNumber") = LOWER(:batchNumber);
      `,
      {
        replacements: { batchNumber },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!Array.isArray(rows)) {
      return res.status(200).json(rows ? [rows] : []);
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No receiving data found for this batch number.' });
    }

    res.json(rows);
  } catch (err) {
    console.error('Error fetching receiving data by batch number:', err);
    res.status(500).json({ message: 'Failed to fetch receiving data by batch number.' });
  }
});

// Route to get receiving data by rfid
router.get('/receivingrfid/:rfid', async (req, res) => {
  let { rfid } = req.params;
  rfid = rfid.trim();

  try {
    const [rows] = await sequelize.query(
      `
      WITH qc AS (
        SELECT "batchNumber", MIN("qcDate" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Makassar') AS "qcDate"
        FROM "QCData"
        GROUP BY "batchNumber"
      )
      SELECT 
        a.*, (a."receivingDate" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Makassar') as "receivingDate",
        b."qcDate",
        c."contractType",
        c."farmVarieties"
      FROM "ReceivingData" a 
      LEFT JOIN qc b ON a."batchNumber" = b."batchNumber" 
      LEFT JOIN "Farmers" c ON a."farmerID" = c."farmerID"
      WHERE UPPER(a."rfid") = UPPER(:rfid)
      AND "currentAssign" = 1;
      `,
      {
        replacements: { rfid },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!Array.isArray(rows)) {
      return res.status(200).json(rows ? [rows] : []);
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No receiving data found for this RFID.' });
    }

    res.json(rows);
  } catch (err) {
    console.error('Error fetching receiving data by RFID:', err);
    res.status(500).json({ message: 'Failed to fetch receiving data by RFID.' });
  }
});

module.exports = router;