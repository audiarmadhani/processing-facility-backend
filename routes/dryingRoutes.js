const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

router.get('/drying-data', async (req, res) => {
    try {
      const data = await sequelize.query(`
        SELECT rfid, "batchNumber", "dryingArea", entered_at, exited_at, created_at
        FROM "DryingData"
        ORDER BY created_at DESC;
      `, {
        type: sequelize.QueryTypes.SELECT,
      });
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
        VALUES (:batchNumber, :moisture, NOW(), NOW())
        RETURNING *;
      `, {
        replacements: { batchNumber, moisture },
        type: sequelize.QueryTypes.INSERT,
      });
  
      res.status(201).json({
        message: 'Moisture measurement saved',
        measurement: result[0],
      });
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

module.exports = router;