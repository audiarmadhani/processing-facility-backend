const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

// Route for fetching all transport data
router.get('/location', async (req, res) => {
  try {
    const [location] = await sequelize.query(`
        SELECT 
        rr.name as kabupaten, 
        rd.name as kecamatan,
        rv.name as desa
        FROM reg_regencies rr
        LEFT JOIN reg_districts rd on rr.id = rd.regency_id
        LEFT JOIN reg_villages rv on rd.id = rv.district_id;
        `);
    res.json(location);
  } catch (err) {
    console.error('Error fetching location data:', err);
    res.status(500).json({ message: 'Failed to fetch location data.' });
  }
});

module.exports = router;