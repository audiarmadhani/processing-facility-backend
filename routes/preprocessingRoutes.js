const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

// Route for creating preprocessing data
router.post('/preprocessing', async (req, res) => {
  let t;
  try {
    const { batchNumber, bagsProcessed, processingDate } = req.body;

    if (!batchNumber || bagsProcessed === undefined) {
      return res.status(400).json({ error: 'Batch number and bags processed are required.' });
    }

    t = await sequelize.transaction();

    // Format date
    const now = new Date();
    const formattedProcessingDate = processingDate ? new Date(processingDate) : now;

    // Insert data into PreprocessingData table
    const [preprocessingData] = await sequelize.query(
      `INSERT INTO "PreprocessingData" ("batchNumber", "bagsProcessed", "processingDate", "createdAt", "updatedAt") 
      VALUES (?, ?, ?, ?, ?) RETURNING *`,
      {
        replacements: [batchNumber, bagsProcessed, formattedProcessingDate, now, now],
        transaction: t,
      }
    );

    await t.commit();

    res.status(201).json({
      message: 'Preprocessing data created successfully.',
      preprocessingData,
    });
  } catch (err) {
    if (t) await t.rollback();
    console.error('Error creating preprocessing data:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Route for fetching all preprocessing data
router.get('/preprocessing', async (req, res) => {
  try {
    // Fetch all records for filtering purposes
    const [allRows] = await sequelize.query('SELECT * FROM "PreprocessingData"');
    const [latestRows] = await sequelize.query('SELECT * FROM "PreprocessingData" ORDER BY "processingDate" DESC LIMIT 1');

    res.json({ latestRows, allRows });
  } catch (err) {
    console.error('Error fetching preprocessing data:', err);
    res.status(500).json({ message: 'Failed to fetch preprocessing data.' });
  }
});

// Route to get preprocessing data by batch number
router.get('/preprocessing/:batchNumber', async (req, res) => {
  const { batchNumber } = req.params;

  if (!batchNumber) {
    return res.status(400).json({ error: 'Batch number is required.' });
  }

  try {
    const [rows] = await sequelize.query(
      `SELECT SUM("bagsProcessed") AS "totalBagsProcessed" 
      FROM "PreprocessingData" 
      WHERE LOWER("batchNumber") = LOWER(?)`,
      { replacements: [batchNumber.trim()] }
    );

    if (!rows[0] || rows[0].totalBagsProcessed === null) {
      return res.json({ totalBagsProcessed: 0 });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching preprocessing data by batch number:', err);
    res.status(500).json({ message: 'Failed to fetch preprocessing data by batch number.' });
  }
});

module.exports = router;