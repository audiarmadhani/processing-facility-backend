const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

// Route for creating farmer data
router.post('/shipper', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      shipperName, desa, kecamatan, kabupaten, shipperAddress,
      bankAccount, bankName, bankAccountName, shipperContact,
      notes, paymentMethod
    } = req.body;

    // Validate required fields
    if (!shipperName || !shipperAddress || !bankAccount || !bankName ||
        !bankAccountName || !shipperContact) {
      await t.rollback();
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate bank details for bank transfer methods
    if (['Bank Transfer'].includes(paymentMethod) &&
        (!bankAccount || !bankName)) {
      await t.rollback();
      return res.status(400).json({ error: 'Bank account and bank name are required for bank transfer methods' });
    }

    // Save the farmer data
    await sequelize.query(
      `INSERT INTO "Shippers" (
        "shipperName", desa, kecamatan, kabupaten, "shipperAddress",
        "bankAccount", "bankName", "bankAccountName", "shipperContact",
        notes, "paymentMethod"
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          shipperName.trim(),
          desa || null,
          kecamatan || null,
          kabupaten || null,
          shipperAddress.trim(),
          bankAccount ? bankAccount.trim() : null,
          bankName ? bankName.trim() : null,
          bankAccountName ? bankAccountName.trim() : null,
          shipperContact.trim(),
          notes || null,
          paymentMethod || null
        ],
        transaction: t,
      }
    );

    // Commit the transaction
    await t.commit();

    // Respond with success
    res.status(201).json({
      message: `Shipper ${shipperName} created successfully`,
    });
  } catch (err) {
    // Rollback transaction on error
    await t.rollback();
    console.error('Error creating shipper data:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Route for fetching all farmer data
router.get('/shipper', async (req, res) => {
  try {
    // Fetch all records for filtering purposes
    const [allRows] = await sequelize.query('SELECT * FROM "Shippers" ORDER BY "registrationDate" ASC');
    const [latestRows] = await sequelize.query('SELECT * FROM "Shippers" ORDER BY "registrationDate" DESC, "farmerID" DESC LIMIT 1');
    
    res.json({ latestRows, allRows });
  } catch (err) {
    console.error('Error fetching shipper data:', err);
    res.status(500).json({ message: 'Failed to fetch shipper data.' });
  }
});

// Route for fetching all farmer data
router.get('/contact', async (req, res) => {
    try {
      // Fetch all records for filtering purposes
      const [allRows] = await sequelize.query(`
        SELECT * FROM (
            SELECT "shipperID" as "ID", "shipperName" as name, "shipperAddress" as address, desa, kecamatan, kabupaten, "shipperContact" as contact, "bankAccount", "bankName", "bankAccountName", "paymentMethod", "registrationDate", notes from "Shippers"
            UNION ALL
            SELECT "farmerID" as "ID", "farmerName" as name, "farmerAddress" as address, desa, kecamatan, kabupaten, "farmerContact" as contact, "bankAccount", "bankName", "bankAccountName", "paymentMethod", "registrationDate", notes from "Farmers"
        ) a ORDER BY "registrationDate" ASC
        `);
      
      res.json({ allRows });
    } catch (err) {
      console.error('Error fetching shipper data:', err);
      res.status(500).json({ message: 'Failed to fetch shipper data.' });
    }
  });

// Route to get farmer data by farmer name
router.get('/shipper/:shipperName', async (req, res) => {
  const { shipperName } = req.params;

  console.log('Received request for Shipper Name:', shipperName);

  try {
    const [rows] = await sequelize.query(
      'SELECT * FROM "Shippers" WHERE LOWER("shipperName") = LOWER(?)',
      { replacements: [shipperName.trim()] }
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No shipper data found for this batch number.' });
    }

    res.json(rows);
  } catch (err) {
    console.error('Error fetching shipper data by shipper name:', err);
    res.status(500).json({ message: 'Failed to fetch shipper data by shipper name.' });
  }
});

module.exports = router;