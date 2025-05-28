const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

// Route for creating farmer data
router.post('/farmer', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      farmerName, desa, kecamatan, kabupaten, farmerAddress,
      bankAccount, bankName, farmerLandArea, farmerContact,
      latitude, longitude, farmType, notes, farmVarieties,
      contractType, broker, paymentMethod
    } = req.body;

    // Validate required fields
    if (!farmerName || !farmerAddress || !farmerContact || !farmerLandArea ||
        !farmType || !contractType) {
      await t.rollback();
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate bank details for bank transfer methods
    if (['Bank Transfer to Farmer', 'Bank Transfer to Broker'].includes(paymentMethod) &&
        (!bankAccount || !bankName)) {
      await t.rollback();
      return res.status(400).json({ error: 'Bank account and bank name are required for bank transfer methods' });
    }

    // Save the farmer data
    await sequelize.query(
      `INSERT INTO "Farmers" (
        "farmerName", desa, kecamatan, kabupaten, "farmerAddress",
        "bankAccount", "bankName", "farmerLandArea", "farmerContact",
        latitude, longitude, "farmType", notes, "farmVarieties",
        "contractType", broker, "paymentMethod"
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          farmerName.trim(),
          desa || null,
          kecamatan || null,
          kabupaten || null,
          farmerAddress.trim(),
          bankAccount ? bankAccount.trim() : null,
          bankName ? bankName.trim() : null,
          farmerLandArea.trim(),
          farmerContact.trim(),
          latitude ? parseFloat(latitude) : null,
          longitude ? parseFloat(longitude) : null,
          farmType,
          notes || null,
          farmVarieties ? farmVarieties.trim() : null,
          contractType,
          broker || null,
          paymentMethod || null
        ],
        transaction: t,
      }
    );

    // Commit the transaction
    await t.commit();

    // Respond with success
    res.status(201).json({
      message: `Farmer ${farmerName} created successfully`,
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
    const [latestRows] = await sequelize.query('SELECT * FROM "Farmers" ORDER BY "registrationDate" DESC, "farmerID" DESC LIMIT 1');
    const [arabicaFarmers] = await sequelize.query(`SELECT * FROM "Farmers" WHERE "farmType" = 'Arabica' ORDER BY "registrationDate" ASC`);
    const [robustaFarmers] = await sequelize.query(`SELECT * FROM "Farmers" WHERE "farmType" = 'Robusta' ORDER BY "registrationDate" ASC`);
    
    res.json({ latestRows, allRows, arabicaFarmers, robustaFarmers });
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