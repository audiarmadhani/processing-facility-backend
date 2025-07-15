const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

// Route for fetching available tanks
router.get('/fermentation/available-tanks', async (req, res) => {
  try {
    const allBlueBarrelCodes = Array.from({ length: 15 }, (_, i) => 
      `BB-HQ-${String(i + 1).padStart(4, '0')}`
    );
    const allTanks = ['Biomaster', 'Carrybrew', 'Washing Track', 'Fermentation Bucket', ...allBlueBarrelCodes];

    const inUseTanks = await sequelize.query(
      `SELECT DISTINCT tank 
       FROM "FermentationData" 
       WHERE status = :status`,
      {
        replacements: { status: 'In Progress' },
        type: sequelize.QueryTypes.SELECT
      }
    );

    const inUseTanksArray = Array.isArray(inUseTanks) ? inUseTanks : inUseTanks ? [inUseTanks] : [];
    console.log('inUseTanks:', inUseTanksArray);

    const inUseTankNames = inUseTanksArray.map(row => row.tank).filter(tank => tank);

    const availableTanks = allTanks.filter(tank => !inUseTankNames.includes(tank));
    
    res.json(availableTanks);
  } catch (err) {
    console.error('Error fetching available tanks:', err);
    res.status(500).json({ message: 'Failed to fetch available tanks.', details: err.message });
  }
});

// Route for fetching available batches for fermentation
router.get('/fermentation/available-batches', async (req, res) => {
  try {
    const rows = await sequelize.query(
      `SELECT DISTINCT 
        r."batchNumber",
        r."farmerName",
        r.weight,
        MIN(p."lotNumber") as "lotNumber"
      FROM "ReceivingData" r
      LEFT JOIN "PreprocessingData" p ON r."batchNumber" = p."batchNumber" AND p.merged = FALSE
      LEFT JOIN "DryingData" d ON r."batchNumber" = d."batchNumber"
      WHERE r.merged = FALSE
      AND d."batchNumber" IS NULL
      AND r."commodityType" = 'Cherry'
      GROUP BY r."batchNumber", r."farmerName", r.weight
      ORDER BY r."batchNumber" DESC;`,
      {
        type: sequelize.QueryTypes.SELECT
      }
    );

    const result = Array.isArray(rows) ? rows : rows ? [rows] : [];

    res.json(result);
  } catch (err) {
    console.error('Error fetching available batches:', err);
    res.status(500).json({ message: 'Failed to fetch available batches.', details: err.message });
  }
});

// Route for creating fermentation data
router.post('/fermentation', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { batchNumber, tank, startDate, weight, createdBy } = req.body;

    if (!batchNumber || !tank || !startDate || !createdBy) {
      await t.rollback();
      return res.status(400).json({ error: 'batchNumber, tank, startDate, and createdBy are required.' });
    }

    if (!['Biomaster', 'Carrybrew', 'Washing Track', 'Fermentation Bucket'].includes(tank) && !/^BB-HQ-\d{4}$/.test(tank)) {
      await t.rollback();
      return res.status(400).json({ error: 'Invalid tank. Must be Biomaster, Carrybrew, Washing Track, Fermentation Bucket, or BB-HQ-XXXX.' });
    }

    const parsedStartDate = new Date(startDate);
    if (isNaN(parsedStartDate)) {
      await t.rollback();
      return res.status(400).json({ error: 'Invalid startDate format.' });
    }

    if (weight !== undefined && (typeof weight !== 'number' || weight <= 0)) {
      await t.rollback();
      return res.status(400).json({ error: 'Weight must be a positive number if provided.' });
    }

    const [batchCheck] = await sequelize.query(
      `SELECT 1 
      FROM "ReceivingData" r
      WHERE r."batchNumber" = :batchNumber 
      AND r.merged = FALSE 
      AND r."commodityType" = 'Cherry'`,
      {
        replacements: { batchNumber },
        transaction: t,
        type: sequelize.QueryTypes.SELECT
      }
    );
    if (!batchCheck) {
      await t.rollback();
      return res.status(400).json({ error: 'Batch number not found, merged, or not Cherry.' });
    }

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

    const [fermentationData] = await sequelize.query(`
      INSERT INTO "FermentationData" (
        "batchNumber", tank, "startDate", weight, status, "createdBy", "createdAt", "updatedAt"
      ) VALUES (
        :batchNumber, :tank, :startDate, :weight, :status, :createdBy, NOW(), NOW()
      ) RETURNING *;
    `, {
      replacements: {
        batchNumber,
        tank,
        startDate: parsedStartDate,
        weight: weight || null,
        status: 'In Progress',
        createdBy,
      },
      transaction: t,
      type: sequelize.QueryTypes.INSERT
    });

    await t.commit();
    res.status(201).json({
      message: `Fermentation started for batch ${batchNumber} in ${tank}${weight ? ` with weight ${weight}kg` : ''}`,
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
        (f."startDate") as "startDate",
        (f."endDate") as "endDate",
        r."farmerName",
        r.weight AS receiving_weight,
        COALESCE((
          SELECT SUM(fwm.weight)
          FROM "FermentationWeightMeasurements" fwm
          WHERE fwm."batchNumber" = f."batchNumber"
          AND fwm.measurement_date = (
            SELECT MAX(measurement_date)
            FROM "FermentationWeightMeasurements"
            WHERE "batchNumber" = f."batchNumber"
          )
        ), 0) as latest_weight
      FROM "FermentationData" f
      LEFT JOIN "ReceivingData" r ON f."batchNumber" = r."batchNumber"
      LEFT JOIN (SELECT DISTINCT "batchNumber" FROM "PreprocessingData") p ON f."batchNumber" = p."batchNumber"
      WHERE r.merged = FALSE
      ORDER BY f."startDate" DESC;`
    );

    res.json(rows || []);
  } catch (err) {
    console.error('Error fetching fermentation data:', err);
    res.status(500).json({ message: 'Failed to fetch fermentation data.', details: err.message });
  }
});

// Route for fetching available processing types
router.get('/fermentation/processing-types', async (req, res) => {
  try {
    const rows = await sequelize.query(
      `SELECT DISTINCT "processingType" 
       FROM "ReferenceMappings_duplicate" 
       ORDER BY "processingType" ASC;`,
      {
        type: sequelize.QueryTypes.SELECT
      }
    );

    const result = Array.isArray(rows) ? rows : rows ? [rows] : [];

    res.json(result);
  } catch (err) {
    console.error('Error fetching processing types:', err);
    res.status(500).json({ message: 'Failed to fetch processing types.', details: err.message });
  }
});

// Route for saving a new weight measurement
router.post('/fermentation-weight-measurement', async (req, res) => {
  const { batchNumber, processingType, weight, measurement_date, producer } = req.body;

  if (!batchNumber || !weight || !measurement_date || !producer) {
    return res.status(400).json({ error: 'batchNumber, weight, measurement_date, and producer are required.' });
  }

  if (typeof weight !== 'number' || weight <= 0) {
    return res.status(400).json({ error: 'Weight must be a positive number.' });
  }

  const parsedDate = new Date(measurement_date);
  if (isNaN(parsedDate) || parsedDate > new Date()) {
    return res.status(400).json({ error: 'Invalid or future measurement_date.' });
  }

  if (!['HQ', 'BTM'].includes(producer)) {
    return res.status(400).json({ error: 'Producer must be either "HQ" or "BTM".' });
  }

  const t = await sequelize.transaction();
  try {
    const [batchCheck] = await sequelize.query(
      'SELECT 1 FROM "FermentationData" WHERE "batchNumber" = :batchNumber',
      {
        replacements: { batchNumber },
        transaction: t,
        type: sequelize.QueryTypes.SELECT
      }
    );
    if (!batchCheck) {
      await t.rollback();
      return res.status(400).json({ error: 'Batch not found in fermentation data.' });
    }

    // If processingType is not provided or empty, fetch default processing types
    let finalProcessingType = processingType;
    if (!finalProcessingType) {
      const [processingTypes] = await sequelize.query(
        `SELECT DISTINCT "processingType" 
         FROM "ReferenceMappings_duplicate" 
         ORDER BY "processingType" ASC`,
        {
          transaction: t,
          type: sequelize.QueryTypes.SELECT
        }
      );
      finalProcessingType = processingTypes.length > 0 ? processingTypes[0].processingType : null;
      if (!finalProcessingType) {
        await t.rollback();
        return res.status(400).json({ error: 'No default processing type available.' });
      }
    }

    const [result] = await sequelize.query(`
      INSERT INTO "FermentationWeightMeasurements" (
        "batchNumber", "processingType", weight, measurement_date, producer, created_at, updated_at
      ) VALUES (
        :batchNumber, :processingType, :weight, :measurement_date, :producer, NOW(), NOW()
      ) RETURNING *;
    `, {
      replacements: { batchNumber, processingType: finalProcessingType, weight, measurement_date: parsedDate, producer },
      transaction: t,
      type: sequelize.QueryTypes.INSERT
    });

    await t.commit();
    res.status(201).json({ message: 'Weight measurement saved', measurement: result[0] });
  } catch (err) {
    await t.rollback();
    console.error('Error saving weight measurement:', err);
    res.status(500).json({ error: 'Failed to save weight measurement', details: err.message });
  }
});

// Route for fetching weight measurements for a batch
router.get('/fermentation-weight-measurements/:batchNumber', async (req, res) => {
  const { batchNumber } = req.params;

  try {
    const [measurements] = await sequelize.query(`
      SELECT id, "batchNumber", "processingType", weight, measurement_date, producer, created_at
      FROM "FermentationWeightMeasurements"
      WHERE "batchNumber" = :batchNumber
      ORDER BY measurement_date DESC
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.SELECT
    });

    res.status(200).json(measurements || []);
  } catch (err) {
    console.error('Error fetching weight measurements:', err);
    res.status(500).json({ error: 'Failed to fetch weight measurements', details: err.message });
  }
});

// Route to finish fermentation for a batch
router.put('/fermentation/finish/:batchNumber', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    let { batchNumber } = req.params;
    batchNumber = batchNumber.trim();

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