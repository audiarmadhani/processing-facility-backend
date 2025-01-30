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

    // Generate the new batch number
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();

    const currentBatchDate = `${year}-${month}-${day}`;

    // Correctly split and parse the latest batch number
    const [lastBatchDate, lastSeqNumberStr] = latestBatch.latest_batch_number.split('-');
    const lastSeqNumber = parseInt(lastSeqNumberStr, 10); // Convert to integer

    let sequenceNumber;

    console.log(`Latest batch: ${latestBatch.latest_batch_number}`);
    console.log(`Current batch date: ${currentBatchDate}`);
    console.log(`Last batch date: ${lastBatchDate}, last sequence number: ${lastSeqNumber}`);

    // Check if the last batch date matches the current batch date
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
      'INSERT INTO "ReceivingData" ("batchNumber", "farmerID", "farmerName", weight, "totalBags", notes, price, type, "paymentMethod", "receivingDate", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *',
      {
        replacements: [batchNumber, farmerID, farmerName, weight, totalBags, notes, price, type, paymentMethod, currentDate, currentDate, currentDate],
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
    const [allRows] = await sequelize.query('SELECT * FROM "ReceivingData"');
    const [latestRows] = await sequelize.query('SELECT * FROM "ReceivingData" ORDER BY "receivingDate" DESC LIMIT 1');
    
    res.json({ latestRows, allRows });
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
      'SELECT * FROM "ReceivingData" WHERE LOWER("batchNumber") = LOWER(?)',
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