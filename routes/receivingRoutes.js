const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');


// Route for creating receiving data (NO AUTHENTICATION)
router.post('/receiving', async (req, res) => {
  const t = await sequelize.transaction();
  try {
      const { farmerID, farmerName, weight, totalBags, notes, type, bagPayload, createdBy, updatedBy, rfid } = req.body; // Get rfid from req.body

      // Basic validation (you should have more robust validation, even without auth)
      if (!farmerID || !farmerName || weight === undefined || !totalBags || !type || !createdBy || !updatedBy) {
          await t.rollback();
          return res.status(400).json({ error: 'Missing required fields.' });
      }

      // Retrieve or initialize the latest batch number
      const [latestBatchResults] = await sequelize.query('SELECT * FROM latest_batch LIMIT 1', { transaction: t, type: sequelize.QueryTypes.SELECT });
      let latestBatch;

      if (!latestBatchResults) {
         // Initialize if no record exists
          await sequelize.query(
              'INSERT INTO latest_batch (latest_batch_number) VALUES (:initialValue)',
              { replacements: { initialValue: '1970-01-01-0000' }, transaction: t, type: sequelize.QueryTypes.INSERT }
          );
          latestBatch = { latest_batch_number: '1970-01-01-0000' };
      } else {
          latestBatch = latestBatchResults[0];
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

      // Insert ReceivingData (raw SQL)
      const [receivingData] = await sequelize.query(`
          INSERT INTO "ReceivingData" (
              "batchNumber", "farmerID", "farmerName", weight, "totalBags", notes, type,
              "receivingDate", "createdAt", "updatedAt", "createdBy", "updatedBy", "rfid"
          ) VALUES (
              :batchNumber, :farmerID, :farmerName, :weight, :totalBags, :notes, :type,
              :receivingDate, :createdAt, :updatedAt, :createdBy, :updatedBy, :rfid
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
              receivingDate: currentDate,
              createdAt: currentDate,
              updatedAt: currentDate,
              createdBy,  // From req.body
              updatedBy,   // From req.body
              rfid: rfid || null, // Add rfid here. Use null if not provided.
          },
          transaction: t,
          type: sequelize.QueryTypes.INSERT
      });


      // Insert BagData (raw SQL)
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

      // Update latest_batch (raw SQL)
      await sequelize.query(
          'UPDATE latest_batch SET latest_batch_number = :batchNumber',
          {
              replacements: { batchNumber },
              transaction: t,
              type: sequelize.QueryTypes.UPDATE
          }
      );

      // Commit the transaction
      await t.commit();

      res.status(201).json({
        message: `Batch ${batchNumber} created successfully`,
        receivingData: receivingData.length > 0 ? receivingData[0] : {},
      });
      
  } catch (err) {
      await t.rollback();
      console.error('Error creating receiving data:', err);
      res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Route for fetching all receiving data
router.get('/receiving', async (req, res) => {
  try {
    // Fetch all records for filtering purposes
    const [allRows] = await sequelize.query('SELECT a.*, DATE("receivingDate") as "receivingDateTrunc" FROM "ReceivingData" a');
    const [latestRows] = await sequelize.query('SELECT a.*, DATE("receivingDate") as "receivingDateTrunc" FROM "ReceivingData" a ORDER BY DATE("receivingDate") DESC LIMIT 1');
    const [todayData] = await sequelize.query(`SELECT a.*, DATE("receivingDate") as "receivingDateTrunc" FROM "ReceivingData" a WHERE TO_CHAR("receivingDate", 'YYYY-MM-DD') = TO_CHAR(NOW(), 'YYYY-MM-DD') AND "batchNumber" NOT IN (SELECT unnest(regexp_split_to_array("batchNumber", ',')) FROM "TransportData") ORDER BY "receivingDate"`);
    
    res.json({ latestRows, allRows, todayData });
  } catch (err) {
    console.error('Error fetching receiving data:', err);
    res.status(500).json({ message: 'Failed to fetch receiving data.' });
  }
});

// Route to get receiving data by batch number
router.get('/receiving/:batchNumber', async (req, res) => {
  const { batchNumber } = req.params;

  console.log('Received request for batch number:', batchNumber);

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
        "qcDateTrunc"
      FROM "ReceivingData" a 
      LEFT JOIN qc b on a."batchNumber" = b."batchNumber" 
      WHERE LOWER(a."batchNumber") = LOWER(?);
      `,
      { replacements: [batchNumber.trim()] }
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No receiving data found for this batch number.' });
    }

    res.json(rows);
  } catch (err) {
    console.error('Error fetching receiving data by batch number:', err);
    res.status(500).json({ message: 'Failed to fetch receiving data by batch number.' });
  }
});

// POST route for assigning RFID (NO AUTHENTICATION, using raw SQL)
router.post('/scan-rfid', async (req, res) => {

  const { rfid } = req.body;

  if (!rfid) {
    return res.status(400).json({ error: 'RFID tag is required.' });
  }

  const trimmedRfid = rfid.trim(); // Trim whitespace

  try {
    // Use a raw SQL query to insert/update the RfidScanned table
    const [result, metadata] = await sequelize.query(`
      INSERT INTO "RfidScanned" (rfid, created_at)
      VALUES (:rfid, NOW())
      RETURNING *;
    `, {
      replacements: { rfid: trimmedRfid },
      type: sequelize.QueryTypes.INSERT, // Important for RETURNING
    });
      // Respond with success
    res.status(201).json({ message: 'RFID tag scanned', rfid: trimmedRfid });


  } catch (error) {
    console.error('Error storing RFID tag:', error);
    res.status(500).json({ error: 'Failed to store RFID tag', details: error.message });
  }
});

// --- NEW ROUTE: Get the most recently scanned RFID ---
router.get('/get-rfid', async (req, res) => {
  try {
    const rfidGetQuery = `
      SELECT rfid
        FROM "RfidScanned"
        ORDER BY created_at DESC
        LIMIT 1;
      `;

    const [rfidGetResult] = await sequelize.query(rfidGetQuery);

    const results = rfidGetResult[0] || 0;

    // Check if results is valid *before* accessing .length
    if (rfidGetResult && rfidGetResult.length > 0) {
      res.status(200).json({ rfid: rfidGetResult[0].rfid });
    } else {
      res.status(200).json({ rfid: '' }); // Return empty if no RFID
    }
  } catch (error) {
      console.error('Error fetching RFID tag:', error);
      res.status(500).json({ error: 'Failed to fetch RFID tag', details: error.message });
  }
});

// Route to get receiving data by batch number
router.get('/check-rfid/:rfid', async (req, res) => {
  const { rfid } = req.params;
  if (!rfid) return res.status(400).json({ error: 'RFID is required.' });

  try {
      const [rows] = await sequelize.query(
          `SELECT * FROM "ReceivingData" WHERE "rfid" = ?;`,
          { replacements: [rfid.trim()] }
      );

      if (!rows || rows.length === 0) {
          return res.status(404).json({ message: 'No receiving data found for this RFID.' });
      }

      res.json(rows);
  } catch (err) {
      console.error('Error fetching receiving data by RFID:', err);
      res.status(500).json({ message: 'Failed to fetch receiving data by RFID.' });
  }
});

// --- NEW ROUTE: Clear the scanned RFID ---
router.delete('/clear-rfid', async (req, res) => {
  try {
      // Use raw SQL to delete *all* entries (we only expect one, but this is safer)
      await sequelize.query('DELETE FROM "RfidScanned";', { type: sequelize.QueryTypes.DELETE });
      res.status(204).send(); // 204 No Content for successful deletion
  } catch (error) {
      console.error('Error clearing RFID data:', error);
      res.status(500).json({ error: 'Failed to clear RFID data', details: error.message });
  }
});

module.exports = router;