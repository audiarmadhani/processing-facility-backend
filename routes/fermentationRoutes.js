const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

// Route for creating fermentation data
router.post('/fermentation', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { batchNumber, tank, startDate, createdBy } = req.body;

    // Basic validation
    if (!batchNumber || !tank || !startDate || !createdBy) {
      await t.rollback();
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    if (!['Biomaster', 'Carrybrew Tank'].includes(tank)) {
      await t.rollback();
      return res.status(400).json({ error: 'Invalid tank. Must be Biomaster or Carrybrew Tank.' });
    }
    const parsedStartDate = new Date(startDate);
    if (isNaN(parsedStartDate)) {
      await t.rollback();
      return res.status(400).json({ error: 'Invalid startDate format.' });
    }

    // Validate batchNumber exists and is not merged
    const [batchCheck] = await sequelize.query(
      'SELECT 1 FROM "ReceivingData" WHERE "batchNumber" = :batchNumber AND merged = FALSE',
      {
        replacements: { batchNumber },
        transaction: t,
        type: sequelize.QueryTypes.SELECT
      }
    );
    if (!batchCheck) {
      await t.rollback();
      return res.status(400).json({ error: 'Batch number not found or has been merged.' });
    }

    // Check if batch is already in fermentation
    const [fermentationCheck] = await sequelize.query(
      'SELECT 1 FROM "FermentationData" WHERE "batchNumber" = :batchNumber AND status = :status',
      {
        replacements: { batchNumber, status: 'In Progress' },
        transaction: t,
        type: sequelize.QueryTypes.SELECT
      }
    );
    if (fermentationCheck) {
      await t.rollback();
      return res.status(400).json({ error: 'Batch is already in fermentation.' });
    }

    // Insert FermentationData
    const [fermentationData] = await sequelize.query(`
      INSERT INTO "FermentationData" (
        "batchNumber", tank, "startDate", status, "createdBy", "createdAt", "updatedAt"
      ) VALUES (
        :batchNumber, :tank, :startDate, :status, :createdBy, NOW(), NOW()
      ) RETURNING *;
    `, {
      replacements: {
        batchNumber,
        tank,
        startDate: parsedStartDate,
        status: 'In Progress',
        createdBy,
      },
      transaction: t,
      type: sequelize.QueryTypes.INSERT
    });

    await t.commit();
    res.status(201).json({
      message: `Fermentation started for batch ${batchNumber} in ${tank}`,
      fermentationData: fermentationData[0],
    });
  } catch (err) {
    await t.rollback();
    console.error('Error creating fermentation data:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Route for fetching all fermentation data
router.get('/fermentation', async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      `SELECT 
        f.*, 
        (f."startDate" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Makassar') as "startDate",
        (f."endDate" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Makassar') as "endDate",
        r."farmerName",
        r.weight,
        p."lotNumber"
      FROM "FermentationData" f
      LEFT JOIN "ReceivingData" r ON f."batchNumber" = r."batchNumber"
      LEFT JOIN "PreprocessingData" p ON f."batchNumber" = p."batchNumber"
      WHERE r.merged = FALSE AND (p.merged = FALSE OR p."batchNumber" IS NULL)
      ORDER BY f."startDate" DESC;`
    );

    res.json(rows);
  } catch (err) {
    console.error('Error fetching fermentation data:', err);
    res.status(500).json({ message: 'Failed to fetch fermentation data.' });
  }
});

// Route to finish fermentation for a batch
router.put('/fermentation/finish/:batchNumber', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    let { batchNumber } = req.params;
    batchNumber = batchNumber.trim();

    // Validate batch exists and is in progress
    const [batchCheck] = await sequelize.query(
      'SELECT 1 FROM "FermentationData" WHERE "batchNumber" = :batchNumber AND status = :status',
      {
        replacements: { batchNumber, status: 'In Progress' },
        transaction: t,
        type: sequelize.QueryTypes.SELECT
      }
    );
    if (!batchCheck) {
      await t.rollback();
      return res.status(400).json({ error: 'Batch not found or fermentation already finished.' });
    }

    // Update FermentationData
    const [fermentationData] = await sequelize.query(`
      UPDATE "FermentationData"
      SET "endDate" = NOW(), status = :status, "updatedAt" = NOW()
      WHERE "batchNumber" = :batchNumber
      RETURNING *;
    `, {
      replacements: { batchNumber, status: 'Finished' },
      transaction: t,
      type: sequelize.QueryTypes.UPDATE
    });

    await t.commit();
    res.json({
      message: `Fermentation finished for batch ${batchNumber}`,
      fermentationData: fermentationData[0],
    });
  } catch (err) {
    await t.rollback();
    console.error('Error finishing fermentation:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;