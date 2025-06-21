const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

/**
 * GET /drying-data
 * Fetches all drying data records, including RFID, batch number, drying area, and timestamps.
 */
router.get('/drying-data', async (req, res) => {
  try {
    const data = await sequelize.query(`
      SELECT rfid, "batchNumber", "dryingArea", entered_at, exited_at, created_at
      FROM "DryingData"
      ORDER BY created_at DESC
    `, { type: sequelize.QueryTypes.SELECT });

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching drying data:', error);
    res.status(500).json({ error: 'Failed to fetch drying data', details: error.message });
  }
});

/**
 * POST /drying-measurement
 * Saves a new moisture measurement for a batch.
 * Requires: batchNumber, moisture (0-100), measurement_date.
 */
router.post('/drying-measurement', async (req, res) => {
  const { batchNumber, moisture, measurement_date } = req.body;

  // Validate inputs
  if (!batchNumber || moisture === undefined || !measurement_date) {
    return res.status(400).json({ error: 'batchNumber, moisture, and measurement_date are required' });
  }
  if (typeof moisture !== 'number' || moisture < 0 || moisture > 100) {
    return res.status(400).json({ error: 'Moisture must be a number between 0 and 100' });
  }
  const parsedDate = new Date(measurement_date);
  if (isNaN(parsedDate) || parsedDate > new Date()) {
    return res.status(400).json({ error: 'Invalid or future measurement_date' });
  }

  try {
    const [result] = await sequelize.query(`
      INSERT INTO "DryingMeasurements" ("batchNumber", moisture, measurement_date, created_at)
      VALUES (:batchNumber, :moisture, :measurement_date, NOW())
      RETURNING id, "batchNumber", moisture, measurement_date, created_at
    `, {
      replacements: { batchNumber, moisture, measurement_date },
      type: sequelize.QueryTypes.INSERT,
    });

    res.status(201).json({ message: 'Moisture measurement saved', measurement: result });
  } catch (error) {
    console.error('Error saving moisture measurement:', error);
    res.status(500).json({ error: 'Failed to save moisture measurement', details: error.message });
  }
});

/**
 * GET /drying-measurements/:batchNumber
 * Fetches all moisture measurements for a specific batch, ordered by measurement date.
 */
router.get('/drying-measurements/:batchNumber', async (req, res) => {
  const { batchNumber } = req.params;

  try {
    const measurements = await sequelize.query(`
      SELECT id, "batchNumber", moisture, measurement_date, created_at
      FROM "DryingMeasurements"
      WHERE "batchNumber" = :batchNumber
      ORDER BY measurement_date ASC
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.SELECT,
    });

    res.status(200).json(measurements);
  } catch (error) {
    console.error('Error fetching moisture measurements:', error);
    res.status(500).json({ error: 'Failed to fetch moisture measurements', details: error.message });
  }
});

/**
 * POST /api/greenhouse-data
 * Records environmental data (temperature, humidity) for a device.
 * Requires: device_id, temperature, humidity.
 */
router.post('/api/greenhouse-data', async (req, res) => {
  const { device_id, temperature, humidity } = req.body;

  // Validate inputs
  if (!device_id || temperature === undefined || humidity === undefined) {
    return res.status(400).json({ error: 'device_id, temperature, and humidity are required' });
  }
  if (typeof temperature !== 'number' || typeof humidity !== 'number') {
    return res.status(400).json({ error: 'Temperature and humidity must be numbers' });
  }

  try {
    await sequelize.query(`
      INSERT INTO "GreenhouseData" (device_id, temperature, humidity, recorded_at)
      VALUES (:device_id, :temperature, :humidity, NOW())
    `, {
      replacements: { device_id, temperature, humidity },
      type: sequelize.QueryTypes.INSERT,
    });

    res.status(201).json({ message: 'Environmental data recorded successfully' });
  } catch (error) {
    console.error('Error storing greenhouse data:', error);
    res.status(500).json({ error: 'Failed to store environmental data', details: error.message });
  }
});

/**
 * GET /greenhouse-latest
 * Fetches the latest environmental data for each device.
 */
router.get('/greenhouse-latest', async (req, res) => {
  try {
    const data = await sequelize.query(`
      SELECT device_id, COALESCE(temperature, 0) AS temperature, COALESCE(humidity, 0) AS humidity, recorded_at
      FROM "GreenhouseData"
      WHERE (device_id, recorded_at) IN (
        SELECT device_id, MAX(recorded_at)
        FROM "GreenhouseData"
        WHERE device_id IN ('GH_SENSOR_1', 'GH_SENSOR_2', 'GH_SENSOR_3', 'GH_SENSOR_4', 'GH_SENSOR_5', 'GH_SENSOR_6')
        GROUP BY device_id
      )
    `, { type: sequelize.QueryTypes.SELECT });

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching latest greenhouse data:', error);
    res.status(500).json({ error: 'Failed to fetch latest greenhouse data', details: error.message });
  }
});

/**
 * GET /greenhouse-historical/:device_id
 * Fetches historical environmental data for a specific device (last 1 month).
 */
router.get('/greenhouse-historical/:device_id', async (req, res) => {
  const { device_id } = req.params;

  try {
    const data = await sequelize.query(`
      SELECT COALESCE(temperature, 0) AS temperature, COALESCE(humidity, 0) AS humidity, recorded_at
      FROM "GreenhouseData"
      WHERE device_id = :device_id
      AND recorded_at >= NOW() - INTERVAL '1 month'
      ORDER BY recorded_at ASC
    `, {
      replacements: { device_id },
      type: sequelize.QueryTypes.SELECT,
    });

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching historical greenhouse data:', error);
    res.status(500).json({ error: 'Failed to fetch historical greenhouse data', details: error.message });
  }
});

/**
 * POST /move-drying-area
 * Moves a batch to a new drying area, updating the active drying record.
 * Requires: batchNumber, newDryingArea, rfid.
 */
router.post('/move-drying-area', async (req, res) => {
  const { batchNumber, newDryingArea, rfid } = req.body;

  // Validate inputs
  const validDryingAreas = ["Drying Area 1", "Drying Area 2", "Drying Area 3", "Drying Area 4", "Drying Area 5", "Drying Sun Dry", "Drying Room"];
  if (!batchNumber || !newDryingArea || !rfid) {
    return res.status(400).json({ error: 'batchNumber, newDryingArea, and rfid are required' });
  }
  if (!validDryingAreas.includes(newDryingArea)) {
    return res.status(400).json({ error: 'Invalid drying area' });
  }

  const t = await sequelize.transaction();
  try {
    const [activeRecord] = await sequelize.query(`
      SELECT id, "dryingArea"
      FROM "DryingData"
      WHERE "batchNumber" = :batchNumber AND rfid = :rfid AND exited_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1
    `, {
      replacements: { batchNumber, rfid },
      type: sequelize.QueryTypes.SELECT,
      transaction: t,
    });

    if (!activeRecord) {
      await t.rollback();
      return res.status(404).json({ error: `No active drying record found for batch ${batchNumber}` });
    }

    if (activeRecord.dryingArea === newDryingArea) {
      await t.rollback();
      return res.status(400).json({ error: `Batch ${batchNumber} is already in ${newDryingArea}` });
    }

    await sequelize.query(`
      UPDATE "DryingData"
      SET "dryingArea" = :newDryingArea
      WHERE id = :id
      RETURNING id, "batchNumber", "dryingArea", rfid, entered_at, exited_at, created_at
    `, {
      replacements: { id: activeRecord.id, newDryingArea },
      type: sequelize.QueryTypes.UPDATE,
      transaction: t,
    });

    await t.commit();
    res.status(200).json({ message: `Batch ${batchNumber} moved to ${newDryingArea}` });
  } catch (error) {
    await t.rollback();
    console.error('Error moving drying area:', error);
    res.status(500).json({ error: 'Failed to move drying area', details: error.message });
  }
});

/**
 * POST /drying-weight-measurement
 * Saves a new weight measurement for a batch.
 * Requires: batchNumber, processingType, bagNumber, weight (>0), measurement_date.
 */
router.post('/drying-weight-measurement', async (req, res) => {
  const { batchNumber, processingType, bagNumber, weight, measurement_date } = req.body;

  // Validate inputs
  if (!batchNumber || !processingType || !bagNumber || weight === undefined || !measurement_date) {
    return res.status(400).json({ error: 'batchNumber, processingType, bagNumber, weight, and measurement_date are required' });
  }
  if (typeof weight !== 'number' || weight <= 0) {
    return res.status(400).json({ error: 'Weight must be a positive number' });
  }
  if (!Number.isInteger(bagNumber) || bagNumber <= 0) {
    return res.status(400).json({ error: 'Bag number must be a positive integer' });
  }
  const parsedDate = new Date(measurement_date);
  if (isNaN(parsedDate) || parsedDate > new Date()) {
    return res.status(400).json({ error: 'Invalid or future measurement_date' });
  }

  try {
    const [result] = await sequelize.query(`
      INSERT INTO "DryingWeightMeasurements" ("batchNumber", "processingType", "bagNumber", weight, measurement_date, created_at)
      VALUES (:batchNumber, :processingType, :bagNumber, :weight, :measurement_date, NOW())
      RETURNING id, "batchNumber", "processingType", "bagNumber", weight, measurement_date, created_at
    `, {
      replacements: { batchNumber, processingType, bagNumber, weight, measurement_date },
      type: sequelize.QueryTypes.INSERT,
    });

    res.status(201).json({ message: 'Weight measurement saved', measurement: result });
  } catch (error) {
    console.error('Error saving weight measurement:', error);
    res.status(500).json({ error: 'Failed to save weight measurement', details: error.message });
  }
});

/**
 * GET /drying-weight-measurements/:batchNumber
 * Fetches all weight measurements for a specific batch, ordered by measurement date, processing type, and bag number.
 */
router.get('/drying-weight-measurements/:batchNumber', async (req, res) => {
  const { batchNumber } = req.params;

  try {
    const measurements = await sequelize.query(`
      SELECT id, "batchNumber", "processingType", "bagNumber", weight, measurement_date, created_at
      FROM "DryingWeightMeasurements"
      WHERE "batchNumber" = :batchNumber
      ORDER BY measurement_date DESC, "processingType" ASC, "bagNumber" ASC
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.SELECT,
    });

    res.status(200).json(measurements);
  } catch (error) {
    console.error('Error fetching weight measurements:', error);
    res.status(500).json({ error: 'Failed to fetch weight measurements', details: error.message });
  }
});

/**
 * GET /drying-weight-measurements/:batchNumber/:processingType/max-bag-number
 * Fetches the highest bag number for a batch and processing type.
 */
router.get('/drying-weight-measurements/:batchNumber/:processingType/max-bag-number', async (req, res) => {
  const { batchNumber, processingType } = req.params;

  try {
    const [result] = await sequelize.query(`
      SELECT COALESCE(MAX("bagNumber"), 0) AS "maxBagNumber"
      FROM "DryingWeightMeasurements"
      WHERE "batchNumber" = :batchNumber AND "processingType" = :processingType
    `, {
      replacements: { batchNumber, processingType },
      type: sequelize.QueryTypes.SELECT,
    });

    res.status(200).json({ maxBagNumber: result.maxBagNumber });
  } catch (error) {
    console.error('Error fetching max bag number:', error);
    res.status(500).json({ error: 'Failed to fetch max bag number', details: error.message });
  }
});

/**
 * PUT /drying-weight-measurement/:id
 * Updates a weight measurement's weight and measurement_date.
 * Requires: weight (>0), measurement_date.
 */
router.put('/drying-weight-measurement/:id', async (req, res) => {
  const { id } = req.params;
  const { weight, measurement_date } = req.body;

  // Validate inputs
  if (weight === undefined || !measurement_date) {
    return res.status(400).json({ error: 'weight and measurement_date are required' });
  }
  if (typeof weight !== 'number' || weight <= 0) {
    return res.status(400).json({ error: 'Weight must be a positive number' });
  }
  const parsedDate = new Date(measurement_date);
  if (isNaN(parsedDate) || parsedDate > new Date()) {
    return res.status(400).json({ error: 'Invalid or future measurement_date' });
  }

  try {
    const [result] = await sequelize.query(`
      UPDATE "DryingWeightMeasurements"
      SET weight = :weight, measurement_date = :measurement_date, updated_at = NOW()
      WHERE id = :id
      RETURNING id, "batchNumber", "processingType", "bagNumber", weight, measurement_date, created_at, updated_at
    `, {
      replacements: { id, weight, measurement_date },
      type: sequelize.QueryTypes.UPDATE,
    });

    if (!result) {
      return res.status(404).json({ error: `Weight measurement with id ${id} not found` });
    }

    res.status(200).json({ message: 'Weight measurement updated', measurement: result });
  } catch (error) {
    console.error('Error updating weight measurement:', error);
    res.status(500).json({ error: 'Failed to update weight measurement', details: error.message });
  }
});

/**
 * DELETE /drying-weight-measurement/:id
 * Deletes a single weight measurement by ID.
 */
router.delete('/drying-weight-measurement/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await sequelize.query(`
      DELETE FROM "DryingWeightMeasurements"
      WHERE id = :id
      RETURNING id
    `, {
      replacements: { id },
      type: sequelize.QueryTypes.DELETE,
    });

    if (!result) {
      return res.status(404).json({ error: `Weight measurement with id ${id} not found` });
    }

    res.status(200).json({ message: 'Weight measurement deleted' });
  } catch (error) {
    console.error('Error deleting weight measurement:', error);
    res.status(500).json({ error: 'Failed to delete weight measurement', details: error.message });
  }
});

/**
 * POST /drying-weight-measurements/delete
 * Deletes multiple weight measurements by their IDs in a single transaction.
 * Requires: ids (array of measurement IDs).
 */
router.post('/drying-weight-measurements/delete', async (req, res) => {
  const { ids } = req.body;

  // Validate inputs
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'ids must be a non-empty array' });
  }

  const t = await sequelize.transaction();
  try {
    const deletedCount = await sequelize.query(`
      DELETE FROM "DryingWeightMeasurements"
      WHERE id = ANY(:ids)
      RETURNING id
    `, {
      replacements: { ids },
      type: sequelize.QueryTypes.DELETE,
      transaction: t,
    });

    if (deletedCount.length === 0) {
      await t.rollback();
      return res.status(404).json({ error: 'No weight measurements found for the provided IDs' });
    }

    await t.commit();
    res.status(200).json({ 
      message: `${deletedCount.length} weight measurement${deletedCount.length > 1 ? 's' : ''} deleted`,
      deletedIds: deletedCount.map(row => row.id)
    });
  } catch (error) {
    await t.rollback();
    console.error('Error deleting weight measurements:', error);
    res.status(500).json({ error: 'Failed to delete weight measurements', details: error.message });
  }
});

module.exports = router;