const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

// Route for creating farmer data
router.post('/farmer', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { farmerName, farmerAddress, farmerLandArea, farmerContact, latitude, longitude, farmType, notes } = req.body;

    // Save the farmer data
    const [farmerData] = await sequelize.query(
      'INSERT INTO "Farmers" ("farmerName", "farmerAddress", "farmerLandArea", "farmerContact", "latitude", "longitude", "farmType", "notes") VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      {
        replacements: [farmerName, farmerAddress, farmerLandArea, farmerContact, latitude, longitude, farmType, notes],
        transaction: t,
      }
    );

    // Commit the transaction
    await t.commit();

    // Respond with success
    res.status(201).json({
      message: `Farmer ${farmerName} created successfully`,
      farmerData: farmerData[0], // Return the created record
    });
  } catch (err) {
    // Rollback transaction on error
    await t.rollback();
    console.error('Error creating farmer data:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Route for fetching all farmer data
router.get('/farmer', async (req, res) => {
  try {
    // Fetch all records for filtering purposes
    const [allRows] = await sequelize.query('SELECT * FROM "Farmers" ORDER BY "registrationDate" ASC');
    const [latestRows] = await sequelize.query('SELECT * FROM "Farmers" ORDER BY "registrationDate" DESC LIMIT 1');
    
    res.json({ latestRows, allRows });
  } catch (err) {
    console.error('Error fetching farmer data:', err);
    res.status(500).json({ message: 'Failed to fetch farmer data.' });
  }
});

// Route to get farmer data by farmer name
router.get('/farmer/:farmerName', async (req, res) => {
  
  const { farmerName } = req.params;

  console.log('Received request for Farmer Name:', farmerName);

  try {
    const [rows] = await sequelize.query(
      'SELECT * FROM "Farmers" WHERE LOWER("farmerName") = LOWER(?)',
      { replacements: [farmerName.trim()] }
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No farmer data found for this batch number.' });
    }

    res.json(rows);
  } catch (err) {
    console.error('Error fetching farmer data by farmer name:', err);
    res.status(500).json({ message: 'Failed to fetch farmer data by farmer name.' });
  }
});

module.exports = router;