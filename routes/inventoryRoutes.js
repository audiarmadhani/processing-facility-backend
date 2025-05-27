const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

// Fetch cherry inventory with status
router.get('/inventory/cherries', async (req, res) => {
  try {
    const [rows] = await sequelize.query(`
      SELECT 
        r."batchNumber",
        r."farmerName",
        r."type",
        r."weight",
        r."totalBags",
        r."receivingDate",
        DATE(r."receivingDate") as "receivingDateTrunc",
        r."notes",
        r."rfid",
        CASE
          WHEN p."batchNumber" IS NULL THEN 'Stored'
          WHEN p."processingDate" > NOW() - INTERVAL '2 days' THEN 'In Dry Mill'
          WHEN p."processingDate" IS NOT NULL AND po."batchNumber" IS NULL THEN 'Drying'
          ELSE 'Processed'
        END as "status"
      FROM "ReceivingData" r
      LEFT JOIN "PreprocessingData" p ON r."batchNumber" = p."batchNumber"
      LEFT JOIN "PostprocessingData" po ON r."batchNumber" = po."parentBatchNumber"
      WHERE r."currentAssign" = 1
      ORDER BY r."receivingDate" DESC;
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching cherry inventory:', err);
    res.status(500).json({ message: 'Failed to fetch cherry inventory.' });
  }
});

// Fetch green bean inventory
router.get('/inventory/green-beans', async (req, res) => {
  try {
    const [rows] = await sequelize.query(`
      SELECT 
        p."batchNumber",
        p."parentBatchNumber",
        r."type",
        p."processingType",
        p."weight",
        p."totalBags",
        p."storedDate",
        DATE(p."storedDate") as "storedDateTrunc",
        p."quality",
        p."producer",
        p."productLine",
        p."referenceNumber"
      FROM "PostprocessingData" p
      LEFT JOIN "ReceivingData" r on p."parentBatchNumber" = r."batchNumber"
      ORDER BY p."storedDate" DESC;
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching green bean inventory:', err);
    res.status(500).json({ message: 'Failed to fetch green bean inventory.' });
  }
});

// Fetch order summary
router.get('/inventory/orders', async (req, res) => {
  try {
    const [rows] = await sequelize.query(`
      SELECT 
        o."order_id",
        o."customer_id",
        o."status",
        o."created_at",
        o."price",
        p."batchNumber"
      FROM "Orders" o
      LEFT JOIN "PostprocessingData" p ON o."batch_number" = p."batchNumber"
      WHERE o."status" IN ('pending', 'processing', 'ready', 'shipped')
      ORDER BY o."created_at" DESC;
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching order summary:', err);
    res.status(500).json({ message: 'Failed to fetch order summary.' });
  }
});

module.exports = router;