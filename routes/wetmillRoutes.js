const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

router.get('/wetmill-data', async (req, res) => {
  try {
    const data = await sequelize.query(`
      SELECT rfid, "batchNumber", entered_at, exited_at, created_at
      FROM "WetMillData"
      ORDER BY created_at DESC;
    `, {
      type: sequelize.QueryTypes.SELECT,
    });
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching wet mill data:', error);
    res.status(500).json({ error: 'Failed to fetch wet mill data', details: error.message });
  }
});

module.exports = router;