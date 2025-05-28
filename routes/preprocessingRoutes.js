const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

// Route for creating preprocessing data
router.post('/preprocessing', async (req, res) => {
  let t;
  try {
    const { batchNumber, bagsProcessed, processingDate, producer, productLine, processingType, quality, createdBy, notes } = req.body;

    if (!batchNumber || bagsProcessed === undefined || !producer || !productLine || !processingType || !quality) {
      return res.status(400).json({ error: 'Batch number, bags processed, producer, product line, processing type, and quality are required.' });
    }

    t = await sequelize.transaction();

    // Format date
    const now = new Date();
    const formattedProcessingDate = processingDate ? new Date(processingDate) : now;

    // Insert data into PreprocessingData table
    const [preprocessingData] = await sequelize.query(
      `INSERT INTO "PreprocessingData" (
        "batchNumber", "bagsProcessed", "processingDate", "producer", 
        "productLine", "processingType", "quality", "createdAt", 
        "updatedAt", "createdBy", notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
      {
        replacements: [
          batchNumber.trim(),
          bagsProcessed,
          formattedProcessingDate,
          producer,
          productLine,
          processingType,
          quality,
          now,
          now,
          createdBy,
          notes || null
        ],
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
    const [allRows] = await sequelize.query('SELECT a.*, DATE("processingDate") "processingDateTrunc" FROM "PreprocessingData" a');
    const [latestRows] = await sequelize.query('SELECT a.*, DATE("processingDate") "processingDateTrunc" FROM "PreprocessingData" a ORDER BY a."processingDate" DESC LIMIT 1');

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