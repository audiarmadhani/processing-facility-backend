const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

// Route for creating receiving data
router.post('/receiving', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { farmerID, farmerName, weight, totalBags, notes, price, type, paymentMethod, bagPayload } = req.body;

    // Retrieve or initialize the latest batch number
    const [latestBatchResults] = await sequelize.query('SELECT * FROM latest_batch LIMIT 1', { transaction: t });
    let latestBatch;

    if (latestBatchResults.length === 0) {
      // Initialize the latest batch number if no record exists
      await sequelize.query(
        'INSERT INTO latest_batch (latest_batch_number) VALUES (?)',
        { replacements: ['1970-01-01-0000'], transaction: t }
      );
      latestBatch = { latest_batch_number: '1970-01-01-0000' };
    } else {
      latestBatch = latestBatchResults[0];
    }

    // Log the latest batch number to inspect its structure
    console.log(`Latest batch number from DB: ${latestBatch.latest_batch_number}`);

    // Get current date and format it for batch number
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    const currentBatchDate = `${year}-${month}-${day}`; // Define currentBatchDate

    // Split the latest batch number to extract date and sequence
    const parts = latestBatch.latest_batch_number.split('-');
    const lastBatchDate = parts.slice(0, 3).join('-'); // This should give us YYYY-MM-DD
    const lastSeqNumber = parseInt(parts[3], 10); // Extract the sequence number and convert to integer

    // Log the extracted values
    console.log(`Current batch date: ${currentBatchDate}`);
    console.log(`Last batch date: ${lastBatchDate}, last sequence number: ${lastSeqNumber}`);

    let sequenceNumber;

    if (lastBatchDate === currentBatchDate) {
      sequenceNumber = lastSeqNumber + 1; // Increment the last sequence number
    } else {
      sequenceNumber = 1; // Reset sequence if the date has changed
    }

    console.log(`New sequence number: ${sequenceNumber}`);

    // Generate the new batch number
    const batchNumber = `${currentBatchDate}-${String(sequenceNumber).padStart(4, '0')}`;
    console.log(`New batch number: ${batchNumber}`);

    // Save the receiving data
    const [receivingData] = await sequelize.query(
      'INSERT INTO "ReceivingData" ("batchNumber", "farmerID", "farmerName", weight, "totalBags", notes, type, "receivingDate", "createdAt", "updatedAt", "createdBy") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *',
      {
        replacements: [batchNumber, farmerID, farmerName, weight, totalBags, notes, type, currentDate, currentDate, currentDate, createdBy],
        transaction: t,
      }
    );

    // Save the bag data
    if (Array.isArray(bagPayload) && bagPayload.length > 0) {
      const bagInsertQuery = `
        INSERT INTO "BagData" ("batchNumber", "bagNumber", weight, "createdAt", "updatedAt") 
        VALUES ${bagPayload.map(() => '(?, ?, ?, ?, ?)').join(', ')} RETURNING *;
      `;
    
      const bagData = bagPayload.flatMap(bag => [batchNumber, bag.bagNumber, bag.weight, currentDate, currentDate]);
    
      await sequelize.query(bagInsertQuery, {
        replacements: bagData,
        transaction: t,
      });
    }

    // Update the latest batch number
    await sequelize.query(
      'UPDATE latest_batch SET latest_batch_number = ?',
      {
        replacements: [batchNumber],
        transaction: t,
      }
    );

    // Commit the transaction
    await t.commit();

    // Respond with success
    res.status(201).json({
      message: `Batch ${batchNumber} created successfully`,
      receivingData: receivingData[0], // Return the created record
    });
  } catch (err) {
    // Rollback transaction on error
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

module.exports = router;