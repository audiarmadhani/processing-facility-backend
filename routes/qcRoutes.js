const express = require('express');
const router = express.Router();
const { createQCData } = require('../controller/qcController'); 
const { validateQCData } = require('../middleware/validationMiddleware'); // Import validation middleware
const sequelize = require('../config/database');


// Route to create QC data with validation
router.post('/qc', validateQCData, createQCData);

// Route for fetching all QC data
router.get('/qc', async (req, res) => {
    try {
      // Fetch all records for filtering purposes
      const [allRows] = await sequelize.query('SELECT * FROM QCData');
  
      // Fetch the latest records ordered by QC date
      const [latestRows] = await sequelize.query('SELECT * FROM QCData ORDER BY qcDate DESC LIMIT 20');
  
      res.json({ latestRows, allRows });
    } catch (err) {
      console.error('Error fetching QC data:', err);
      res.status(500).json({ message: 'Failed to fetch QC data.' });
    }
  });
module.exports = router;