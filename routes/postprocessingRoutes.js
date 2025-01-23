const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

// Route for creating postprocessing data
router.post('/postprocessing', async (req, res) => {
  let t;
  try {
    const { type, processingType, weight, totalBags, notes, quality } = req.body;

    if (!type || !processingType || !weight || !totalBags || !quality) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    t = await sequelize.transaction();

    // Retrieve or initialize the latest batch number
    const [latestBatchResults] = await sequelize.query('SELECT * FROM latest_pp_batch LIMIT 1', { transaction: t });
    let latestBatch;

    if (latestBatchResults.length === 0) {
      // Initialize the latest batch number if no record exists
      await sequelize.query(
        'INSERT INTO latest_pp_batch (latest_batch_number) VALUES (?)',
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
    // Properly split the latest batch number
    const lastBatchDate = latestBatch.latest_batch_number.slice(0, 10); // Extract "YYYY-MM-DD"
    const lastSeqNumber = latestBatch.latest_batch_number.slice(11);   // Extract "XXXX"
    let sequenceNumber = 1;

    if (lastBatchDate === currentBatchDate) {
      sequenceNumber = parseInt(lastSeqNumber, 10) + 1;
    }

    const batchNumber = `${currentBatchDate}-${String(sequenceNumber).padStart(4, '0')}`;

    console.log('Latest Batch Number:', latestBatch.latest_batch_number);
    console.log('Last Batch Date:', lastBatchDate);
    console.log('Last Sequence Number:', lastSeqNumber);
    console.log('Generated Batch Number:', batchNumber);


    const [postprocessingData] = await sequelize.query(
      `INSERT INTO PostprocessingData 
        (batchNumber, type, processingType, weight, totalBags, notes, quality, storedDate, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
       RETURNING *`,
      {
        replacements: [
          batchNumber, type, processingType, weight, totalBags, notes, quality,
          currentDate, currentDate, currentDate
        ],
        transaction: t,
      }
    );

    await sequelize.query(
      'UPDATE latest_pp_batch SET latest_batch_number = ?',
      {
        replacements: [batchNumber],
        transaction: t,
      }
    );

    await t.commit();

    res.status(201).json({
      message: `Batch ${batchNumber} stored successfully`,
      postprocessingData,
    });
  } catch (err) {
    if (t) await t.rollback();
    console.error('Error creating postprocessing data:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Route for fetching all postprocessing data
router.get('/postprocessing', async (req, res) => {
  try {
    // Fetch all records for filtering purposes
    const [allRows] = await sequelize.query('SELECT * FROM PostprocessingData');
    const [latestRows] = await sequelize.query('SELECT * FROM PostprocessingData ORDER BY storedDate ASC');
    
    res.json({ latestRows, allRows });
  } catch (err) {
    console.error('Error fetching post processing data:', err);
    res.status(500).json({ message: 'Failed to fetch post processing data.' });
  }
});

// Route to get postprocessing data by batch number
router.get('/postprocessing/:batchNumber', async (req, res) => {
  const { batchNumber } = req.params;

  console.log('Received request for batch number:', batchNumber);

  try {
    const [rows] = await sequelize.query(
      'SELECT * FROM PostprocessingData WHERE LOWER(batchNumber) = LOWER(?)',
      { replacements: [batchNumber.trim()] }
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No post processing data found for this batch number.' });
    }

    res.json(rows);
  } catch (err) {
    console.error('Error fetching post processing data by batch number:', err);
    res.status(500).json({ message: 'Failed to fetch postprocessing data by batch number.' });
  }
});

module.exports = router;