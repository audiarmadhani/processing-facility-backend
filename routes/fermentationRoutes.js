const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

// Route for fetching available tanks
router.get('/fermentation/available-tanks', async (req, res) => {
  try {
    // Get tanks currently in use
    const [inUseTanks] = await sequelize.query(
      `SELECT DISTINCT tank 
       FROM "FermentationData" 
       WHERE status = :status`,
      {
        replacements: { status: 'In Progress' },
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    const inUseTankNames = inUseTanks.map(row => row.tank);
    
    // Define all possible tanks
    const allBlueBarrelCodes = Array.from({ length: 15 }, (_, i) => 
      `BB-HQ-${String(i + 1).padStart(4, '0')}`
    );
    const allTanks = ['Biomaster', 'Carrybrew', ...allBlueBarrelCodes];
    
    // Filter out in-use tanks
    const availableTanks = allTanks.filter(tank => !inUseTankNames.includes(tank));
    
    res.json(availableTanks);
  } catch (err) {
    console.error('Error fetching available tanks:', err);
    res.status(500).json({ message: 'Failed to fetch available tanks.' });
  }
});

// Route for fetching available batches for fermentation
router.get('/fermentation/available-batches', async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      `SELECT 
        p."batchNumber",
        p."lotNumber",
        r."farmerName",
        r.weight
      FROM "PreprocessingData" p
      INNER JOIN "ReceivingData" r ON p."batchNumber" = r."batchNumber"
      LEFT JOIN "FermentationData" f ON p."batchNumber" = f."batchNumber" AND f.status = :fermentationStatus
      LEFT JOIN "DryingData" d ON p."batchNumber" = d."batchNumber"
      WHERE p.producer = :producer
      AND r.merged = FALSE
      AND p.merged = FALSE
      AND f."batchNumber" IS NULL
      AND d."batchNumber" IS NULL
      ORDER BY p."batchNumber" DESC;`,
      {
        replacements: { producer: 'HQ', fermentationStatus: 'In Progress' },
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.json(rows);
  } catch (err) {
    console.error('Error fetching available batches:', err);
    res.status(500).json({ message: 'Failed to fetch available batches.' });
  }
});

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
    // Validate tank: Biomaster, Carrybrew, or BB-HQ-XXXX
    if (!['Biomaster', 'Carrybrew'].includes(tank) && !/^BB-HQ-\d{4}$/.test(tank)) {
      await t.rollback();
      return res.status(400).json({ error: 'Invalid tank. Must be Biomaster, Carrybrew, or BB-HQ-XXXX.' });
    }
    const parsedStartDate = new Date(startDate);
    if (isNaN(parsedStartDate)) {
      await t.rollback();
      return res.status(400).json({ error: 'Invalid startDate format.' });
    }

    // Validate batchNumber exists, is not merged, and has producer HQ
    const [batchCheck] = await sequelize.query(
      `SELECT 1 
      FROM "ReceivingData" r
      INNER JOIN "PreprocessingData" p ON r."batchNumber" = p."batchNumber"
      WHERE r."batchNumber" = :batchNumber 
      AND r.merged = FALSE 
      AND p.merged = FALSE
      AND p.producer = :producer`,
      {
        replacements: { batchNumber, producer: 'HQ' },
        transaction: t,
        type: sequelize.QueryTypes.SELECT
      }
    );
    if (!batchCheck) {
      await t.rollback();
      return res.status(400).json({ error: 'Batch number not found, merged, or not from producer HQ.' });
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

    // Check if tank is already in use
    const [tankCheck] = await sequelize.query(
      'SELECT 1 FROM "FermentationData" WHERE tank = :tank AND status = :status',
      {
        replacements: { tank, status: 'In Progress' },
        transaction: t,
        type: sequelize.QueryTypes.SELECT
      }
    );
    if (tankCheck) {
      await t.rollback();
      return res.status(400).json({ error: `Tank ${tank} is already in use.` });
    }

    // Check if batch is in drying
    const [dryingCheck] = await sequelize.query(
      'SELECT 1 FROM "DryingData" WHERE "batchNumber" = :batchNumber',
      {
        replacements: { batchNumber },
        transaction: t,
        type: sequelize.QueryTypes.SELECT
      }
    );
    if (dryingCheck) {
      await t.rollback();
      return res.status(400).json({ error: 'Batch is already in drying.' });
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