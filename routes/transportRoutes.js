const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

// Route to get and increment invoice number
router.get('/invoice-number', async (req, res) => {
  try {
    const result = await sequelize.transaction(async (t) => {
      // Lock the row and increment sequence
      const [sequence] = await sequelize.query(
        `UPDATE "InvoiceSequence" SET "sequence" = "sequence" + 1, "updatedAt" = CURRENT_TIMESTAMP
         WHERE "id" = 1 RETURNING "sequence"`,
        { transaction: t }
      );
      if (!sequence[0]) {
        throw new Error('Invoice sequence not found');
      }
      // Format as 4-digit string (e.g., '0001')
      const invoiceNo = `000${sequence[0].sequence}`.slice(-4);
      return invoiceNo;
    });
    res.json({ invoiceNo: result });
  } catch (err) {
    console.error('Error fetching invoice number:', err);
    res.status(500).json({ error: 'Failed to fetch invoice number', details: err.message });
  }
});

// Route for creating transport data
router.post('/transport', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      batchNumber, desa, kecamatan, kabupaten, cost, paidTo, farmerID, paymentMethod, bankAccount, bankName,
      loadingWorkerCount, loadingWorkerCostPerPerson, unloadingWorkerCount, unloadingWorkerCostPerPerson,
      harvestWorkerCount, harvestWorkerCostPerPerson, transportCostFarmToCollection, transportCostCollectionToFacility,
      invoiceNo, createdAt
    } = req.body;

    const [transportData] = await sequelize.query(
      `
      INSERT INTO "TransportData" (
        "batchNumber", "desa", "kecamatan", "kabupaten", "cost", "paidTo", "farmerID", "paymentMethod", 
        "bankAccount", "bankName", "loadingWorkerCount", "loadingWorkerCostPerPerson", 
        "unloadingWorkerCount", "unloadingWorkerCostPerPerson", "harvestWorkerCount", 
        "harvestWorkerCostPerPerson", "transportCostFarmToCollection", "transportCostCollectionToFacility", 
        "invoiceNo", "createdAt"
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()) RETURNING *
      `,
      {
        replacements: [
          batchNumber, desa, kecamatan, kabupaten, cost, paidTo, farmerID, paymentMethod, bankAccount, bankName,
          loadingWorkerCount, loadingWorkerCostPerPerson, unloadingWorkerCount, unloadingWorkerCostPerPerson,
          harvestWorkerCount, harvestWorkerCostPerPerson, transportCostFarmToCollection, transportCostCollectionToFacility,
          invoiceNo, createdAt
        ],
        transaction: t,
      }
    );

    const totalCost = Number(cost || 0) + 
      Number(loadingWorkerCount || 0) * Number(loadingWorkerCostPerPerson || 0) +
      Number(unloadingWorkerCount || 0) * Number(unloadingWorkerCostPerPerson || 0) +
      Number(harvestWorkerCount || 0) * Number(harvestWorkerCostPerPerson || 0) +
      Number(transportCostFarmToCollection || 0) +
      Number(transportCostCollectionToFacility || 0);

    const paymentPayload = {
      farmerName: paidTo,
      farmerID,
      totalAmount: totalCost,
      date: new Date().toISOString(),
      paymentMethod,
      paymentDescription: `Transport and Manpower Cost (Invoice ${invoiceNo})`,
      isPaid: 0
    };

    await sequelize.query(
      `
      INSERT INTO "PaymentData" ("farmerName", "farmerID", "totalAmount", "date", "paymentMethod", "paymentDescription", "isPaid")
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      {
        replacements: [
          paymentPayload.farmerName, paymentPayload.farmerID, paymentPayload.totalAmount, paymentPayload.date,
          paymentPayload.paymentMethod, paymentPayload.paymentDescription, paymentPayload.isPaid
        ],
        transaction: t,
      }
    );

    await t.commit();
    res.status(201).json({ message: 'Transport data and payment created successfully', transportData: transportData[0] });
  } catch (err) {
    await t.rollback();
    console.error('Error creating transport data:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Route for fetching all transport data
router.get('/transport', async (req, res) => {
  try {
    const [allTransportData] = await sequelize.query(`
      SELECT a.*, DATE("createdAt") "createdAtTrunc",
        (COALESCE(a.cost, 0) +
         COALESCE(a."loadingWorkerCount", 0) * COALESCE(a."loadingWorkerCostPerPerson", 0) +
         COALESCE(a."unloadingWorkerCount", 0) * COALESCE(a."unloadingWorkerCostPerPerson", 0) +
         COALESCE(a."harvestWorkerCount", 0) * COALESCE(a."harvestWorkerCostPerPerson", 0) +
         COALESCE(a."transportCostFarmToCollection", 0) +
         COALESCE(a."transportCostCollectionToFacility", 0)) AS "totalCost"
      FROM "TransportData" a ORDER BY "createdAt" DESC
    `);
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
      'SELECT a.*, DATE("createdAt") "createdAtTrunc" FROM "TransportData" a WHERE LOWER("batchNumber") = LOWER(?)',
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

router.get('/farmerid/:farmerId', async (req, res) => {
  const { farmerId } = req.params;
  try {
    const [farmer] = await sequelize.query('SELECT "contractType" FROM "Farmers" WHERE "farmerID" = ?', {
      replacements: [farmerId]
    });
    if (farmer.length === 0) return res.status(404).json({ message: 'Farmer not found' });
    res.json(farmer[0]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch farmer' });
  }
});

module.exports = router;