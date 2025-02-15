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
      const [allRows] = await sequelize.query(
        `
        WITH qc AS (
          SELECT
            "batchNumber",
            string_agg(DISTINCT "ripeness", ', ') AS "ripeness",
            string_agg(DISTINCT "color", ', ') AS "color",
            string_agg(DISTINCT "foreignMatter", ', ') AS "foreignMatter",
            string_agg(DISTINCT "overallQuality", ', ') AS "overallQuality",
            string_agg(DISTINCT "qcNotes", ', ') AS "qcNotes",
            MAX("qcDate") AS "qcDate",
            AVG("unripePercentage") AS "unripePercentage",
            AVG("semiripePercentage") AS "semiripePercentage",
            AVG("ripePercentage") AS "ripePercentage",
            AVG("overripePercentage") AS "overripePercentage",
            MIN("createdAt") AS "createdAt",
            MAX("updatedAt") AS "updatedAt",
            AVG(price) AS price,
            string_agg(DISTINCT "paymentMethod", ', ') AS "paymentMethod"
        FROM (
            SELECT
                "batchNumber",
                unnest(string_to_array("ripeness", ', ')) AS "ripeness",
                unnest(string_to_array("color", ', ')) AS "color",
                unnest(string_to_array("foreignMatter", ', ')) AS "foreignMatter",
                unnest(string_to_array("overallQuality", ', ')) AS "overallQuality",
                unnest(string_to_array("qcNotes", ', ')) AS "qcNotes",
                "qcDate",
                "unripePercentage",
                "semiripePercentage",
                "ripePercentage",
                "overripePercentage",
                "createdAt",
                "updatedAt",
                price,
                "paymentMethod"
            FROM "QCData"
        ) AS subquery
        GROUP BY "batchNumber"
        ORDER BY "batchNumber"
        )

        SELECT 
          a."batchNumber",
          a.ripeness,
          a.color,
          a."foreignMatter",
          a."unripePercentage",
          a."semiripePercentage",
          a."ripePercentage",
          a."overripePercentage",
          a."overallQuality",
          a."qcNotes", 
          DATE("qcDate") "qcDateTrunc",
          b."farmerName",
          b.weight,
          b."totalBags",
          b.notes "receivingNotes",
          b."updatedBy",
          b."receivingDate",
          a.price,
          a."paymentMethod",
          c."bankAccount",
          c."bankName"
        FROM "qc" a
        LEFT JOIN "ReceivingData" b on a."batchNumber" = b."batchNumber"
        LEFT JOIN "Farmers" c on b."farmerID" = c."farmerID"
        `);
  
      // Fetch the latest records ordered by QC date
      const [latestRows] = await sequelize.query(
        `
        WITH qc AS (
          SELECT
            "batchNumber",
            string_agg(DISTINCT "ripeness", ', ') AS "ripeness",
            string_agg(DISTINCT "color", ', ') AS "color",
            string_agg(DISTINCT "foreignMatter", ', ') AS "foreignMatter",
            string_agg(DISTINCT "overallQuality", ', ') AS "overallQuality",
            string_agg(DISTINCT "qcNotes", ', ') AS "qcNotes",
            MAX("qcDate") AS "qcDate",
            AVG("unripePercentage") AS "unripePercentage",
            AVG("semiripePercentage") AS "semiripePercentage",
            AVG("ripePercentage") AS "ripePercentage",
            AVG("overripePercentage") AS "overripePercentage",
            MIN("createdAt") AS "createdAt",
            MAX("updatedAt") AS "updatedAt",
            AVG(price) AS price,
            string_agg(DISTINCT "paymentMethod", ', ') AS "paymentMethod"
        FROM (
            SELECT
                "batchNumber",
                unnest(string_to_array("ripeness", ', ')) AS "ripeness",
                unnest(string_to_array("color", ', ')) AS "color",
                unnest(string_to_array("foreignMatter", ', ')) AS "foreignMatter",
                unnest(string_to_array("overallQuality", ', ')) AS "overallQuality",
                unnest(string_to_array("qcNotes", ', ')) AS "qcNotes",
                "qcDate",
                "unripePercentage",
                "semiripePercentage",
                "ripePercentage",
                "overripePercentage",
                "createdAt",
                "updatedAt",
                price,
                "paymentMethod"
            FROM "QCData"
        ) AS subquery
        GROUP BY "batchNumber"
        ORDER BY "batchNumber"
        )

        SELECT 
          a."batchNumber",
          a.ripeness,
          a.color,
          a."foreignMatter",
          a."unripePercentage",
          a."semiripePercentage",
          a."ripePercentage",
          a."overripePercentage",
          a."overallQuality",
          a."qcNotes", 
          DATE("qcDate") "qcDateTrunc",
          b."farmerName",
          b.weight,
          b."totalBags",
          b.notes "receivingNotes",
          b."updatedBy",
          b."receivingDate",
          a.price,
          a."paymentMethod",
          c."bankAccount",
          c."bankName"
        FROM "qc" a
        LEFT JOIN "ReceivingData" b on a."batchNumber" = b."batchNumber"
        LEFT JOIN "Farmers" c on b."farmerID" = c."farmerID"
        WHERE DATE(a."qcDate") = DATE(NOW())
        `);
  
      res.json({ latestRows, allRows });
    } catch (err) {
      console.error('Error fetching QC data:', err);
      res.status(500).json({ message: 'Failed to fetch QC data.' });
    }
  });
module.exports = router;