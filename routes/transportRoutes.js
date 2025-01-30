const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

// Route for creating transport data
router.post('/transport', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      batchNumber,
      desa,
      kecamatan,
      kabupaten,
      cost,
      paidTo,
      farmerID,
      paymentMethod,
      bankAccount,
      bankName,
    } = req.body;

    // Save the transport data
    const [transportData] = await sequelize.query(
      `
      INSERT INTO "TransportData" ("batchNumber", "desa", "kecamatan", "kabupaten", "cost", "paidTo", "farmerID", "paymentMethod", "bankAccount", "bankName", "createdAt") 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()) RETURNING *
      `,
      {
        replacements: [batchNumber, desa, kecamatan, kabupaten, cost, paidTo, farmerID, paymentMethod, bankAccount, bankName],
        transaction: t,
      }
    );

    // Commit the transaction
    await t.commit();

    // Respond with success
    res.status(201).json({
      message: 'Transport data created successfully',
      transportData: transportData[0], // Return the created record
    });
  } catch (err) {
    // Rollback transaction on error
    await t.rollback();
    console.error('Error creating transport data:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Route for fetching all transport data
router.get('/transport', async (req, res) => {
  try {
    const [allTransportData] = await sequelize.query('SELECT * FROM "TransportData" ORDER BY "createdAt" DESC');
    res.json(allTransportData);
  } catch (err) {
    console.error('Error fetching transport data:', err);
    res.status(500).json({ message: 'Failed to fetch transport data.' });
  }
});

// Route to get transport data by batch number
router.get('/transport/:batchNumber', async (req, res) => {
  const { batchNumber } = req.params;

  try {
    const [rows] = await sequelize.query(
      'SELECT * FROM "TransportData" WHERE LOWER("batchNumber") = LOWER(?)',
      { replacements: [batchNumber.trim()] }
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No transport data found for this batch number.' });
    }

    res.json(rows);
  } catch (err) {
    console.error('Error fetching transport data by batch number:', err);
    res.status(500).json({ message: 'Failed to fetch transport data by batch number.' });
  }
});

module.exports = router;