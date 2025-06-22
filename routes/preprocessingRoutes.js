const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

// Route for creating preprocessing data
router.post('/preprocessing', async (req, res) => {
  let t;
  try {
    const { batchNumber, weightProcessed, processingDate, producer, productLine, processingType, quality, createdBy, notes } = req.body;

    if (!batchNumber || weightProcessed === undefined || !producer || !productLine || !processingType || !quality) {
      return res.status(400).json({ error: 'Batch number, weight processed, producer, product line, processing type, and quality are required.' });
    }

    if (isNaN(weightProcessed) || weightProcessed <= 0) {
      return res.status(400).json({ error: 'Weight processed must be a positive number.' });
    }

    t = await sequelize.transaction();

    // Check available weight
    const [batch] = await sequelize.query(
      `SELECT weight FROM "ReceivingData" WHERE LOWER("batchNumber") = LOWER(?)`,
      { replacements: [batchNumber.trim()], transaction: t }
    );

    if (!batch[0]) {
      throw new Error('Batch not found.');
    }

    const totalWeight = parseFloat(batch[0].weight);
    const [processed] = await sequelize.query(
      `SELECT SUM("weightProcessed") AS "totalWeightProcessed", MAX(finished) AS finished 
       FROM "PreprocessingData" 
       WHERE LOWER("batchNumber") = LOWER(?)`,
      { replacements: [batchNumber.trim()], transaction: t }
    );

    const totalWeightProcessed = parseFloat(processed[0].totalWeightProcessed || 0);
    const isFinished = processed[0].finished || false;
    const weightAvailable = totalWeight - totalWeightProcessed;

    if (isFinished) {
      throw new Error('Batch is already marked as finished.');
    }

    if (weightProcessed > weightAvailable) {
      throw new Error(`Cannot process ${weightProcessed} kg. Only ${weightAvailable} kg available.`);
    }

    // Format date
    const now = new Date();
    const formattedProcessingDate = processingDate ? new Date(processingDate) : now;

    // Insert data into PreprocessingData table
    const [preprocessingData] = await sequelize.query(
      `INSERT INTO "PreprocessingData" (
        "batchNumber", "weightProcessed", "processingDate", "producer", 
        "productLine", "processingType", "quality", "createdAt", 
        "updatedAt", "createdBy", notes, finished
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
      {
        replacements: [
          batchNumber.trim(),
          weightProcessed,
          formattedProcessingDate,
          producer,
          productLine,
          processingType,
          quality,
          now,
          now,
          createdBy,
          notes || null,
          false
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

// Route for marking a batch as finished
router.patch('/preprocessing/:batchNumber/finish', async (req, res) => {
  let t;
  try {
    const { batchNumber } = req.params;
    if (!batchNumber) {
      return res.status(400).json({ error: 'Batch number is required.' });
    }

    t = await sequelize.transaction();

    // Check if batch exists in ReceivingData
    const [batch] = await sequelize.query(
      `SELECT "batchNumber" FROM "ReceivingData" WHERE LOWER("batchNumber") = LOWER(?)`,
      { replacements: [batchNumber.trim()], transaction: t }
    );

    if (!batch[0]) {
      await t.rollback();
      return res.status(404).json({ error: 'Batch not found in receiving data.' });
    }

    // Check if batch is already finished
    const [processed] = await sequelize.query(
      `SELECT MAX(finished) AS finished 
       FROM "PreprocessingData" 
       WHERE LOWER("batchNumber") = LOWER(?)`,
      { replacements: [batchNumber.trim()], transaction: t }
    );

    if (processed[0].finished) {
      await t.rollback();
      return res.status(400).json({ error: 'Batch is already marked as finished.' });
    }

    // Check if preprocessing data exists
    const [existingRows] = await sequelize.query(
      `SELECT * FROM "PreprocessingData" WHERE LOWER("batchNumber") = LOWER(?)`,
      { replacements: [batchNumber.trim()], transaction: t }
    );

    if (!existingRows.length) {
      // Insert a dummy preprocessing record
      const now = new Date();
      const [dummyRecord] = await sequelize.query(
        `INSERT INTO "PreprocessingData" (
          "batchNumber", "weightProcessed", "processingDate", "producer", 
          "productLine", "processingType", "quality", "createdAt", 
          "updatedAt", "createdBy", notes, finished
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
        {
          replacements: [
            batchNumber.trim(),
            0, // Zero weight for dummy record
            now,
            'Unknown', // Default values
            'Unknown',
            'Unknown',
            'Unknown',
            now,
            now,
            'System', // Default createdBy
            'Auto-generated for batch completion',
            true // Mark as finished
          ],
          transaction: t,
        }
      );
      await t.commit();
      return res.json({ message: `Batch ${batchNumber} marked as complete with dummy record.`, data: dummyRecord });
    }

    // Update existing preprocessing data
    const [result] = await sequelize.query(
      `UPDATE "PreprocessingData" 
       SET finished = true, "updatedAt" = ? 
       WHERE LOWER("batchNumber") = LOWER(?) 
       RETURNING *`,
      {
        replacements: [new Date(), batchNumber.trim()],
        transaction: t
      }
    );

    if (!result.length) {
      throw new Error('Failed to update preprocessing data.');
    }

    await t.commit();
    res.json({ message: `Batch ${batchNumber} marked as complete.`, data: result });
  } catch (err) {
    if (t) await t.rollback();
    console.error('Error marking batch as complete:', err);
    res.status(err.message.includes('Batch not found') ? 404 : 500).json({ error: 'Server error', details: err.message });
  }
});

// Route for fetching all preprocessing data
router.get('/preprocessing', async (req, res) => {
  try {
    const [allRows] = await sequelize.query(
      `SELECT a.*, DATE("processingDate") "processingDateTrunc" 
       FROM "PreprocessingData" a`
    );

    const [latestRows] = await sequelize.query(
      `SELECT a.*, DATE("processingDate") "processingDateTrunc" 
       FROM "PreprocessingData" a 
       ORDER BY a."processingDate" DESC LIMIT 1`
    );

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
      `SELECT SUM("weightProcessed") AS "totalWeightProcessed", MAX(finished) AS finished 
       FROM "PreprocessingData" 
       WHERE LOWER("batchNumber") = LOWER(?)`,
      { replacements: [batchNumber.trim()] }
    );

    res.json({
      totalWeightProcessed: parseFloat(rows[0].totalWeightProcessed || 0),
      finished: rows[0].finished || false
    });
  } catch (err) {
    console.error('Error fetching preprocessing data by batch number:', err);
    res.status(500).json({ message: 'Failed to fetch preprocessing data by batch number.' });
  }
});

module.exports = router;