const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');
// const { ReceivingData } = require('../models'); // No longer needed - raw SQL
// const { getServerSession } = require("next-auth/next"); // No authentication
// const options = require('../api/auth/[...nextauth]');  // No authentication

// Route for creating receiving data (NO AUTHENTICATION)
router.post('/receiving', async (req, res) => {
    const t = await sequelize.transaction();
    try {
        // Get ALL data from request body - NO AUTHENTICATION
        const { farmerID, farmerName, weight, totalBags, notes, type, bagPayload, createdBy, updatedBy } = req.body;

        // Basic validation (you should have more robust validation, even without auth)
        if (!farmerID || !farmerName || weight === undefined || !totalBags || !type || !createdBy || !updatedBy) {
            await t.rollback();
            return res.status(400).json({ error: 'Missing required fields.' });
        }


        // Retrieve or initialize the latest batch number
        const [latestBatchResults] = await sequelize.query('SELECT * FROM latest_batch LIMIT 1', { transaction: t, type: sequelize.QueryTypes.SELECT });
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


        // Insert ReceivingData (raw SQL, using replacements)
        const [receivingData] = await sequelize.query(`
            INSERT INTO "ReceivingData" (
                "batchNumber", "farmerID", "farmerName", weight, "totalBags", notes, type,
                "receivingDate", "createdAt", "updatedAt", "createdBy", "updatedBy"
            ) VALUES (
                :batchNumber, :farmerID, :farmerName, :weight, :totalBags, :notes, :type,
                :receivingDate, :createdAt, :updatedAt, :createdBy, :updatedBy
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
                updatedBy   // From req.body
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
            receivingData: receivingData[0], // Return created record
        });

    } catch (err) {
        await t.rollback(); // Rollback on *any* error
        console.error('Error creating receiving data:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

// Route for fetching all receiving data (raw SQL)
router.get('/receiving', async (req, res) => {
    try {
        const [allRows] = await sequelize.query('SELECT a.*, DATE("receivingDate") as "receivingDateTrunc" FROM "ReceivingData" a', { type: sequelize.QueryTypes.SELECT });
        const [latestRows] = await sequelize.query('SELECT a.*, DATE("receivingDate") as "receivingDateTrunc" FROM "ReceivingData" a ORDER BY DATE("receivingDate") DESC LIMIT 1', { type: sequelize.QueryTypes.SELECT });
        const [todayData] = await sequelize.query(`SELECT a.*, DATE("receivingDate") as "receivingDateTrunc" FROM "ReceivingData" a WHERE TO_CHAR("receivingDate", 'YYYY-MM-DD') = TO_CHAR(NOW(), 'YYYY-MM-DD') AND "batchNumber" NOT IN (SELECT unnest(regexp_split_to_array("batchNumber", ',')) FROM "TransportData") ORDER BY "receivingDate"`, { type: sequelize.QueryTypes.SELECT });
        res.json({ latestRows, allRows, todayData });
    } catch (err) {
        console.error('Error fetching receiving data:', err);
        res.status(500).json({ message: 'Failed to fetch receiving data.' });
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
                type: sequelize.QueryTypes.SELECT
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



// POST route for assigning RFID (NO AUTHENTICATION, using raw SQL)
router.post('/assign-rfid', async (req, res) => {

    const { batchNumber, rfid } = req.body;

    // Minimal validation: Check if batchNumber and rfid are provided.
    if (!batchNumber || !rfid) {
        return res.status(400).json({ error: 'Batch number and RFID tag are required.' });
    }

    const trimmedBatchNumber = batchNumber.trim();

    try {
        // Find the ReceivingData record by batchNumber (using raw SQL)
        const [receivingRecord] = await sequelize.query(`
            SELECT * FROM "ReceivingData"
            WHERE "batchNumber" = :batchNumber;
        `, {
            replacements: { batchNumber: trimmedBatchNumber },
            type: sequelize.QueryTypes.SELECT
        });

        if (!receivingRecord) {
            return res.status(404).json({ error: 'Batch number not found.' });
        }

        // Check if RFID is *already* assigned to *any* record (using raw SQL).
        const [existingRfid] = await sequelize.query(`
            SELECT * FROM "ReceivingData"
            WHERE "rfid" = :rfid;
        `,{
            replacements: {rfid: rfid},
            type: sequelize.QueryTypes.SELECT
        });

        if (existingRfid) {
            return res.status(409).json({ error: 'RFID tag is already assigned to another batch.' });
        }

        // Update the ReceivingData record with the RFID tag (using raw SQL).
        await sequelize.transaction(async (t) => { // Use transaction for atomicity
          await sequelize.query(`
              UPDATE "ReceivingData"
              SET "rfid" = :rfid, "updatedAt" = NOW()
              WHERE "batchNumber" = :batchNumber;
          `, {
            replacements: { rfid: rfid, batchNumber: trimmedBatchNumber },
            transaction: t, // Associate query with transaction
            type: sequelize.QueryTypes.UPDATE
          });
        });

        // Return success
        res.status(200).json({ message: 'RFID tag assigned successfully.' });

    } catch (error) {
        console.error('Error assigning RFID tag:', error);
        res.status(500).json({ error: 'Failed to assign RFID tag', details: error.message });
    }
});


module.exports = router;