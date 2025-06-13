const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

// Route for creating receiving data
router.post('/receiving', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { farmerID, farmerName, weight, totalBags, notes, type, producer, brix, bagPayload, createdBy, updatedBy, rfid } = req.body;

    // Basic validation
    if (!farmerID || !farmerName || weight === undefined || !totalBags || !type || !producer || !createdBy || !updatedBy) {
      await t.rollback();
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    if (!rfid) {
      await t.rollback();
      return res.status(400).json({ error: 'RFID tag is required.' });
    }
    if (brix !== undefined && (typeof brix !== 'number' || brix < 0)) {
      await t.rollback();
      return res.status(400).json({ error: 'Brix must be a non-negative number.' });
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
        "receivingDate", "createdAt", "updatedAt", "createdBy", "updatedBy", "rfid", "currentAssign"
      ) VALUES (
        :batchNumber, :farmerID, :farmerName, :weight, :totalBags, :notes, :type, :producer, :brix,
        :receivingDate, :createdAt, :updatedAt, :createdBy, :updatedBy, :rfid, :currentAssign
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
      },
      transaction: t,
      type: sequelize.QueryTypes.INSERT
    });

    // Insert BagData
    if (Array.isArray(bagPayload) && bagPayload.length > 0) {
      const bagInsertQuery = `
        INSERT INTO "BagData" ("batchNumber", "bagNumber", weight, "createdAt", "updatedAt")
        VALUES ${bagPayload.map(() => '(?, ?, ?, ?, ?)').join(', ')} RETURNING *;
      `;
      const bagData = bagPayload.flatMap(bag => [batchNumber, bag.bagNumber, bag.weight, currentDate, currentDate]);
      await sequelize.query(bagInsertQuery, {
        replacements: bagData,
        transaction: t,
        type: sequelize.QueryTypes.INSERT
      });
    }

    // Update latest_batch
    await sequelize.query(
      'UPDATE latest_batch SET latest_batch_number = :batchNumber',
      {
        replacements: { batchNumber },
        transaction: t,
        type: sequelize.QueryTypes.UPDATE
      }
    );

    // // Add to cherry inventory
    // await sequelize.query(
    //   `INSERT INTO "CherryInventoryStatus" ("batchNumber", status, "enteredAt", "createdAt", "updatedAt", "createdBy", "updatedBy")
    //    VALUES (:batchNumber, 'Stored', :enteredAt, NOW(), NOW(), :createdBy, :updatedBy)
    //    RETURNING *`,
    //   {
    //     replacements: {
    //       batchNumber,
    //       enteredAt: currentDate,
    //       createdBy,
    //       updatedBy
    //     },
    //     transaction: t,
    //     type: sequelize.QueryTypes.INSERT
    //   }
    // );

    // await sequelize.query(
    //   `INSERT INTO "CherryInventoryMovements" ("batchNumber", "movementType", "movedAt", "createdBy")
    //    VALUES (:batchNumber, 'Entry', NOW(), :createdBy)`,
    //   {
    //     replacements: { batchNumber, createdBy },
    //     transaction: t,
    //     type: sequelize.QueryTypes.INSERT
    //   }
    // );

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

// Route for fetching all Receiving data
router.get('/receiving', async (req, res) => {
  try {
    const [allRows] = await sequelize.query(
      `SELECT a.*, DATE(a."receivingDate") as "receivingDateTrunc", b."contractType", c.total_price, c.price, b.broker, b."farmVarieties"
       FROM "ReceivingData" a 
       LEFT JOIN "Farmers" b ON a."farmerID" = b."farmerID"
       LEFT JOIN (SELECT "batchNumber", SUM(total_price) total_price, MAX(price) price FROM "QCData_v" GROUP BY "batchNumber") c on a."batchNumber" = c."batchNumber"
       ORDER BY "receivingDate" DESC;`
    );

    const [todayData] = await sequelize.query(
      `SELECT a.*, DATE(a."receivingDate") as "receivingDateTrunc", b."contractType", c.total_price, c.price, b.broker, b."farmVarieties"
       FROM "ReceivingData" a 
       LEFT JOIN "Farmers" b ON a."farmerID" = b."farmerID"
       LEFT JOIN (SELECT "batchNumber", SUM(total_price) total_price, MAX(price) price FROM "QCData_v" GROUP BY "batchNumber") c on a."batchNumber" = c."batchNumber"
       WHERE TO_CHAR("receivingDate", 'YYYY-MM-DD') = TO_CHAR(NOW(), 'YYYY-MM-DD') 
       AND a."batchNumber" NOT IN (SELECT unnest(regexp_split_to_array("batchNumber", ',')) FROM "TransportData") 
       ORDER BY "receivingDate" DESC;`
    );

    const [noTransportData] = await sequelize.query(
      `SELECT a.*, DATE(a."receivingDate") as "receivingDateTrunc", b."contractType", c.total_price, c.price, b.broker, b."farmVarieties"
       FROM "ReceivingData" a 
       LEFT JOIN "Farmers" b ON a."farmerID" = b."farmerID"
       LEFT JOIN (SELECT "batchNumber", SUM(total_price) total_price, MAX(price) price FROM "QCData_v" GROUP BY "batchNumber") c on a."batchNumber" = c."batchNumber"
       WHERE a."batchNumber" NOT IN (SELECT unnest(regexp_split_to_array("batchNumber", ',')) FROM "TransportData") 
       ORDER BY "batchNumber" DESC;`
    );

    res.json({ allRows, todayData, noTransportData });
  } catch (err) {
    console.error('Error fetching Receiving data:', err);
    res.status(500).json({ message: 'Failed to fetch Receiving data.' });
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
        SELECT "batchNumber", MIN(DATE("qcDate")) AS "qcDateTrunc"
        FROM "QCData"
        GROUP BY "batchNumber"
      )
      SELECT 
        a.*, DATE("receivingDate") as "receivingDateTrunc", 
        "qcDateTrunc",
        c."contractType",
        c."farmVarieties"
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
        SELECT "batchNumber", MIN(DATE("qcDate")) AS "qcDateTrunc"
        FROM "QCData"
        GROUP BY "batchNumber"
      )
      SELECT 
        a.*, DATE("receivingDate") as "receivingDateTrunc", 
        "qcDateTrunc",
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