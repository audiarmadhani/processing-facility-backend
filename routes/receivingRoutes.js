const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

// Route for creating receiving data (NO AUTHENTICATION)
router.post('/receiving', async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { farmerID, farmerName, weight, totalBags, notes, type, bagPayload, createdBy, updatedBy, rfid } = req.body;

        // Basic validation (you should have more robust validation, even without auth)
        if (!farmerID || !farmerName || weight === undefined || !totalBags || !type || !createdBy || !updatedBy) {
            await t.rollback();
            return res.status(400).json({ error: 'Missing required fields.' });
        }
        if (!rfid) { //check if rfid is available
          await t.rollback();
          return res.status(400).json({ error: 'RFID tag is required.' });
        }


        // Retrieve or initialize the latest batch number
        const [latestBatchResults] = await sequelize.query('SELECT latest_batch_number FROM latest_batch LIMIT 1', { transaction: t, type: sequelize.QueryTypes.SELECT });
        let latestBatch;

        if (latestBatchResults.length === 0) {
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
        const [receivingData, metadata] = await sequelize.query(`
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
                rfid: rfid || null, // Include RFID from the request, allow null
            },
            transaction: t,
            type: sequelize.QueryTypes.INSERT  // Corrected: INSERT query type
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
                type: sequelize.QueryTypes.INSERT // Corrected query type
            });
        }

        // Update latest_batch (raw SQL)
        await sequelize.query(
            'UPDATE latest_batch SET latest_batch_number = :batchNumber',
            {
                replacements: { batchNumber },
                transaction: t,
                type: sequelize.QueryTypes.UPDATE // Corrected query type
            }
        );

        // Commit the transaction
        await t.commit();
        // console.log("Receiving Data:", receivingData);
        // Respond with success and return all data
        res.status(201).json({
          message: `Batch ${batchNumber} created successfully`,
          receivingData: receivingData[0], // Return created record.
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
        // Fetch all records for filtering purposes
        const [allRows] = await sequelize.query(
          `SELECT a.*, DATE("receivingDate") as "receivingDateTrunc" FROM "ReceivingData" a;`
        );

        // Fetch the latest records ordered by QC date
        const [todayData] = await sequelize.query(
          `SELECT a.*, DATE("receivingDate") as "receivingDateTrunc" FROM "ReceivingData" a WHERE TO_CHAR("receivingDate", 'YYYY-MM-DD') = TO_CHAR(NOW(), 'YYYY-MM-DD') AND "batchNumber" NOT IN (SELECT unnest(regexp_split_to_array("batchNumber", ',')) FROM "TransportData") ORDER BY "receivingDate";`
        );

        res.json({ allRows, todayData });
    } catch (err) {
        console.error('Error fetching Receiving data:', err);
        res.status(500).json({ message: 'Failed to fetch Receiving data.' });
    }
});

// Route to get receiving data by batch number (raw SQL)
router.get('/receiving/:batchNumber', async (req, res) => {
    const { batchNumber } = req.params;
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
      WHERE LOWER(a."batchNumber") = LOWER(:batchNumber);
      `,
            {
                replacements: { batchNumber: batchNumber.trim() },
                type: sequelize.QueryTypes.SELECT // Corrected: SELECT query type
            }
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


// --- NEW ROUTE: Get the most recently scanned RFID ---
router.get('/get-rfid', async (req, res) => {
  try {
    // Fetch the most recently scanned RFID tag
    const [results] = await sequelize.query(`
        SELECT rfid
        FROM "RfidScanned"
        ORDER BY created_at DESC
        LIMIT 1;
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    // Robust check for RFID data:
    if (Array.isArray(results) && results.length > 0) {
        // Handle the case where results is an array (as expected)
        res.status(200).json({ rfid: results[0].rfid });
    } else if (results && results.rfid) {
        // Handle the case where results is a single object
        res.status(200).json({ rfid: results.rfid });
    }
    else {
        res.status(200).json({ rfid: '' }); // Return empty string if no RFID
    }

  } catch (error) {
    console.error('Error fetching RFID tag:', error);
    res.status(500).json({ error: 'Failed to fetch RFID tag', details: error.message });
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

// POST route to receive RFID tag scans from ESP32
router.post('/scan-rfid', async (req, res) => {
  const { rfid } = req.body;

  if (!rfid) {
    return res.status(400).json({ error: 'RFID tag is required.' });
  }

  const trimmedRfid = rfid.trim();

  try {
    // Insert/Update RfidScanned table (using raw SQL)
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


// --- NEW ROUTE: Check if RFID is already assigned ---
router.get('/check-rfid/:rfid', async (req, res) => {
  const { rfid } = req.params; // Get RFID from route parameter

  if (!rfid) {
    return res.status(400).json({ error: 'RFID tag is required.' });
  }

    const trimmedRfid = rfid.trim().toUpperCase(); //  <-- ALWAYS trim and uppercase

  try {
    // Use a raw SQL query to check if the RFID exists in ReceivingData
    const [results] = await sequelize.query(`
        SELECT *
        FROM "ReceivingData"
        WHERE "rfid" = :rfid
        AND "currentAssign" = 1
    `, {
      replacements: { rfid: trimmedRfid }, //  <-- Use the trimmed and upper-cased RFID
      type: sequelize.QueryTypes.SELECT
    });

        // Correctly check if results is an array and has length, OR if it's an object
        const isAssigned = Array.isArray(results) ? results.length > 0 : results !== undefined && results !== null;


    res.status(200).json({ isAssigned }); // Return { isAssigned: true/false }

  } catch (error) {
    console.error('Error checking RFID tag:', error);
    res.status(500).json({ error: 'Failed to check RFID tag', details: error.message });
  }
});


module.exports = router;