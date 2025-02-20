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

module.exports = router;