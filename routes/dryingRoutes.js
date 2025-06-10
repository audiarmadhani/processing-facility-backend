const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

router.get('/drying-data', async (req, res) => {
  try {
    const data = await sequelize.query(`
      SELECT rfid, "batchNumber", "dryingArea", entered_at, exited_at, created_at
      FROM "DryingData"
      ORDER BY created_at DESC;
    `, { type: sequelize.QueryTypes.SELECT });
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching drying data:', error);
    res.status(500).json({ error: 'Failed to fetch drying data', details: error.message });
  }
});

router.post('/drying-measurement', async (req, res) => {
  const { batchNumber, moisture } = req.body;
  if (!batchNumber || moisture === undefined) {
    return res.status(400).json({ error: 'batchNumber and moisture are required.' });
  }
  if (typeof moisture !== 'number' || moisture < 0 || moisture > 100) {
    return res.status(400).json({ error: 'Moisture must be a number between 0 and 100.' });
  }
  try {
    const [result] = await sequelize.query(`
      INSERT INTO "DryingMeasurements" ("batchNumber", moisture, measurement_date, created_at)
      VALUES (:batchNumber, :moisture, :measurement_date, NOW())
      RETURNING *;
    `, {
      replacements: { batchNumber, moisture, measurement_date },
      type: sequelize.QueryTypes.INSERT,
    });
    res.status(201).json({ message: 'Moisture measurement saved', measurement: result[0] });
  } catch (error) {
    console.error('Error saving moisture measurement:', error);
    res.status(500).json({ error: 'Failed to save moisture measurement', details: error.message });
  }
});

router.get('/drying-measurements/:batchNumber', async (req, res) => {
  const { batchNumber } = req.params;
  try {
    const measurements = await sequelize.query(`
      SELECT id, moisture, measurement_date, created_at
      FROM "DryingMeasurements"
      WHERE "batchNumber" = :batchNumber
      ORDER BY measurement_date ASC;
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

router.post('/api/greenhouse-data', async (req, res) => {
  const { device_id, temperature, humidity } = req.body;
  if (!device_id || temperature === undefined || humidity === undefined) {
    return res.status(400).json({ error: 'device_id, temperature, and humidity are required' });
  }
  try {
    await sequelize.query(`
      INSERT INTO "GreenhouseData" (device_id, temperature, humidity, recorded_at)
      VALUES (:device_id, :temperature, :humidity, NOW())
    `, {
      replacements: { device_id, temperature, humidity },
      type: sequelize.QueryTypes.INSERT,
    });
    res.status(201).json({ message: 'Data recorded successfully' });
  } catch (error) {
    console.error('Error storing greenhouse data:', error);
    res.status(500).json({ error: 'Failed to store data', details: error.message });
  }
});

router.get('/greenhouse-latest', async (req, res) => {
  try {
    const data = await sequelize.query(`
      SELECT device_id, COALESCE(temperature, 0) AS temperature, COALESCE(humidity, 0) AS humidity, recorded_at
      FROM "GreenhouseData"
      WHERE (device_id, recorded_at) IN (
        SELECT device_id, MAX(recorded_at)
        FROM "GreenhouseData"
        WHERE device_id IN ('GH_SENSOR_1', 'GH_SENSOR_2', 'GH_SENSOR_3', 'GH_SENSOR_4', 'GH_SENSOR_5')
        GROUP BY device_id
      );
    `, { type: sequelize.QueryTypes.SELECT });
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching latest greenhouse data:', error);
    res.status(500).json({ error: 'Failed to fetch latest greenhouse data', details: error.message });
  }
});

router.get('/greenhouse-historical/:device_id', async (req, res) => {
  const { device_id } = req.params;
  try {
    const data = await sequelize.query(`
      SELECT COALESCE(temperature, 0) AS temperature, COALESCE(humidity, 0) AS humidity, recorded_at
      FROM "GreenhouseData"
      WHERE device_id = :device_id
      AND recorded_at >= NOW() - INTERVAL '1 month'
      ORDER BY recorded_at ASC;
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

module.exports = router;