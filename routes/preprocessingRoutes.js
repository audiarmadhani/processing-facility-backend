const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

// Route for creating preprocessing data
router.post('/preprocessing', async (req, res) => {
  let t;
  try {
    const { batchNumber, bagsProcessed, processingDate } = req.body;

    if (!batchNumber || bagsProcessed === undefined) {
      return res.status(400).json({ error: 'Batch number and bags processed are required.' });
    }

    t = await sequelize.transaction();

    // Format date
    const now = new Date();
    const formattedProcessingDate = processingDate ? new Date(processingDate) : now;

    // Insert data into PreprocessingData table
    const [preprocessingData] = await sequelize.query(
      `INSERT INTO "PreprocessingData" ("batchNumber", "bagsProcessed", "processingDate", "createdAt", "updatedAt") 
      VALUES (?, ?, ?, ?, ?) RETURNING *`,
      {
        replacements: [batchNumber, bagsProcessed, formattedProcessingDate, now, now],
        transaction: t,
      }
    );

    await t.commit();

    res.status(201).json({
      message: 'Preprocessing data created successfully.',
      preprocessingData,
    });
  } catch (err) {
    if (t) await t.rollback();
    console.error('Error creating preprocessing data:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Route for fetching all preprocessing data
router.get('/preprocessing', async (req, res) => {
  try {
    // Fetch all records for filtering purposes
    const [allRows] = await sequelize.query('SELECT a.*, DATE("processingDate") "processingDateTrunc" FROM "PreprocessingData" a');
    const [latestRows] = await sequelize.query('SELECT a.*, DATE("processingDate") "processingDateTrunc" FROM "PreprocessingData" a ORDER BY a."processingDate" DESC LIMIT 1');

    res.json({ latestRows, allRows });
  } catch (err) {
    console.error('Error fetching preprocessing data:', err);
    res.status(500).json({ message: 'Failed to fetch preprocessing data.' });
  }
});

// Route for fetching pending processing data
router.get('/pendingpreprocessing', async (req, res) => {
  try {
    // Fetch all records for filtering purposes
    const [allRows] = await sequelize.query(`
      WITH qc AS (
        SELECT 
            q."batchNumber",
            q."qcDate",
            ARRAY_TO_STRING(ARRAY_AGG(DISTINCT q.ripeness), ', ') AS ripeness,
            ARRAY_TO_STRING(ARRAY_AGG(DISTINCT q.color), ', ') AS color,
            ARRAY_TO_STRING(ARRAY_AGG(DISTINCT q."foreignMatter"), ', ') AS "foreignMatter",
            ARRAY_TO_STRING(ARRAY_AGG(DISTINCT q."overallQuality"), ', ') AS "overallQuality",
            ARRAY_TO_STRING(ARRAY_AGG(DISTINCT q."unripePercentage"), ', ') AS "unripePercentage",
            ARRAY_TO_STRING(ARRAY_AGG(DISTINCT q."semiripePercentage"), ', ') AS "semiripePercentage",
            ARRAY_TO_STRING(ARRAY_AGG(DISTINCT q."ripePercentage"), ', ') AS "ripePercentage",
            ARRAY_TO_STRING(ARRAY_AGG(DISTINCT q."overripePercentage"), ', ') AS "overripePercentage"
        FROM 
            "QCData" q
        GROUP BY 
            q."batchNumber",
            q."qcDate"
        ORDER BY 
            q."batchNumber"
      )

      ,rp AS (
        SELECT 
          "batchNumber", 
          "unripePercentage",
          "semiripePercentage",
          "ripePercentage",
          "overripePercentage",
          ((("unripePercentage"*40) + ("semiripePercentage"*60) + ("ripePercentage"*100) + ("overripePercentage"*60))/100) AS "ripenessPercentageScore"
        FROM "QCData" q
        WHERE "unripePercentage" IS NOT NULL AND "semiripePercentage" IS NOT NULL AND "ripePercentage" IS NOT NULL AND "overripePercentage" IS NOT NULL
      )

      ,rs AS (
        SELECT 
          q."batchNumber",
          SUM(ripeness_score)::DECIMAL / COUNT(*) AS average_ripeness_score
        FROM (
          SELECT 
            q."batchNumber",
            q.ripeness_element,
            ROW_NUMBER() OVER (PARTITION BY "batchNumber" ORDER BY "ripeness_element") AS row_num,
            CASE 
              WHEN ripeness_element = 'Ripe' THEN 100
              WHEN ripeness_element = 'Overripe' THEN 50
              WHEN ripeness_element = 'Semiripe' THEN 60
              WHEN ripeness_element = 'Unripe' THEN 40
              ELSE 0
            END AS ripeness_score
          FROM (
            SELECT 
              q."batchNumber", 
              TRIM(unnest(string_to_array(trim(both ',' from q.ripeness), ','))) AS ripeness_element
            FROM (
              SELECT 
                  q."batchNumber",
                  STRING_AGG(DISTINCT q.ripeness, ', ') AS ripeness
              FROM 
                  "QCData" q
              GROUP BY 
                  q."batchNumber"
              ORDER BY 
                  q."batchNumber"
            ) q
          ) q
        ) q
      GROUP BY "batchNumber"
      )

      ,cs AS (
        SELECT 
          q."batchNumber",
          SUM(color_score)::DECIMAL / COUNT(*) AS average_color_score
        FROM (
          SELECT 
            q."batchNumber",
            q.color_element,
            ROW_NUMBER() OVER (PARTITION BY "batchNumber" ORDER BY "color_element") AS row_num,
            CASE 
              WHEN color_element = 'Green' THEN 10
              WHEN color_element = 'Yellowish Green' THEN 15
              WHEN color_element = 'Yellow' THEN 30
              WHEN color_element = 'Bright Red' THEN 80
              WHEN color_element = 'Red' THEN 100
              WHEN color_element = 'Dark Red' THEN 80
              WHEN color_element = 'Black' THEN 10
              ELSE 0
            END AS color_score
          FROM (
            SELECT 
              q."batchNumber", 
              TRIM(unnest(string_to_array(trim(both ',' from q.color), ','))) AS color_element
            FROM (
              SELECT 
                  q."batchNumber",
                  STRING_AGG(DISTINCT q.color, ', ') AS color
              FROM 
                  "QCData" q
              GROUP BY 
                  q."batchNumber"
              ORDER BY 
                  q."batchNumber"
            ) q
          ) q
        ) q
      GROUP BY "batchNumber"
      )

      ,fs AS (
        SELECT 
          q."batchNumber",
          SUM(foreign_score)::DECIMAL / COUNT(*) AS average_foreign_score
        FROM (
          SELECT 
            q."batchNumber",
            q.foreign_element,
            ROW_NUMBER() OVER (PARTITION BY "batchNumber" ORDER BY "foreign_element") AS row_num,
            CASE 
              WHEN foreign_element = 'Yes' THEN 0
              WHEN foreign_element = 'Some' THEN 50
              WHEN foreign_element = 'None' THEN 100
              ELSE 0
            END AS foreign_score
          FROM (
            SELECT 
              q."batchNumber", 
              TRIM(unnest(string_to_array(trim(both ',' from q."foreignMatter"), ','))) AS foreign_element
            FROM (
              SELECT 
                  q."batchNumber",
                  STRING_AGG(DISTINCT q.ripeness, ', ') AS ripeness,
                  STRING_AGG(DISTINCT q.color, ', ') AS color,
                  STRING_AGG(DISTINCT q."foreignMatter", ', ') AS "foreignMatter",
                  STRING_AGG(DISTINCT q."overallQuality", ', ') AS "overallQuality"
              FROM 
                  "QCData" q
              GROUP BY 
                  q."batchNumber"
              ORDER BY 
                  q."batchNumber"
            ) q
          ) q
        ) q
      GROUP BY "batchNumber"
      )

      ,main AS (
        SELECT 
          r.*
          ,DATE(q."qcDate") as qcDateData
          ,r.type AS cherry_type
          ,q.ripeness
          ,q.color
          ,q."foreignMatter"
          ,q."overallQuality"
          ,cs.average_color_score
          ,rs.average_ripeness_score
          ,fs.average_foreign_score
          ,rp."ripenessPercentageScore"
        FROM "ReceivingData" r
        LEFT JOIN qc q ON r."batchNumber" = q."batchNumber"
        LEFT JOIN cs cs ON r."batchNumber" = cs."batchNumber"
        LEFT JOIN rs rs ON r."batchNumber" = rs."batchNumber"
        LEFT JOIN fs fs ON r."batchNumber" = fs."batchNumber"
        LEFT JOIN rp rp on r."batchNumber" = rp."batchNumber"
        WHERE r."batchNumber" IS NOT NULL
        AND q."batchNumber" IS NOT NULL
        ORDER BY r."batchNumber"
      )

      ,fin as (
        SELECT 
          a."batchNumber"
          ,DATE(a."receivingDate") as receivingDateData
          ,qcDateData
          ,cherry_type as type
          ,ripeness
          ,color
          ,"foreignMatter"
          ,"overallQuality"
          ,(weight*"totalBags")::INTEGER as "totalWeight"
          ,(b."bagsProcessed")::INTEGER as "processedBags"
          ,(a."totalBags")::INTEGER as "totalBags"
          ,b."startProcessingDate"
          ,b."lastProcessingDate"
          ,(a."totalBags" - COALESCE(b."bagsProcessed", 0))::INTEGER AS "availableBags"
          ,(COALESCE(a."ripenessPercentageScore", 0)*0.5) + (COALESCE(a.average_color_score, 0)*0.1) + (COALESCE(a.average_ripeness_score, 0)*0.15) + (COALESCE(a.average_foreign_score, 0)*0.25) AS "cherryScore"
        FROM MAIN a
        LEFT JOIN (
          SELECT "batchNumber", SUM("bagsProcessed") as "bagsProcessed", MIN("processingDate") as "startProcessingDate", MAX("processingDate") AS "lastProcessingDate" FROM "PreprocessingData" GROUP BY "batchNumber"
        ) b on a."batchNumber" = b."batchNumber"
        ORDER BY cherry_type, "cherryScore" DESC
      )

      SELECT 
        a.*,
        CASE 
          WHEN type = 'Arabica' AND "cherryScore" BETWEEN 90 AND 100 THEN 'Group A'
          WHEN type = 'Arabica' AND "cherryScore" BETWEEN 80 AND 90 THEN 'Group B'
          WHEN type = 'Arabica' AND "cherryScore" BETWEEN 70 AND 80 THEN 'Group C'
          WHEN type = 'Arabica' AND "cherryScore" BETWEEN 60 AND 70 THEN 'Group D'
          WHEN type = 'Arabica' AND "cherryScore" BETWEEN 50 AND 60 THEN 'Group E'
          WHEN type = 'Robusta' AND "cherryScore" BETWEEN 90 AND 100 THEN 'Group 1'
          WHEN type = 'Robusta' AND "cherryScore" BETWEEN 80 AND 90 THEN 'Group 2'
          WHEN type = 'Robusta' AND "cherryScore" BETWEEN 70 AND 80 THEN 'Group 3'
          WHEN type = 'Robusta' AND "cherryScore" BETWEEN 60 AND 70 THEN 'Group 4'
          WHEN type = 'Robusta' AND "cherryScore" BETWEEN 50 AND 60 THEN 'Group 5'
        ELSE 'Group Z0'
        END AS "cherryGroup"
      FROM fin a;
    `);

    res.json({ allRows });
  } catch (err) {
    console.error('Error fetching preprocessing data:', err);
    res.status(500).json({ message: 'Failed to fetch preprocessing data.' });
  }
});

// Route to get preprocessing data by batch number
router.get('/preprocessing/:batchNumber', async (req, res) => {
  const { batchNumber } = req.params;

  if (!batchNumber) {
    return res.status(400).json({ error: 'Batch number is required.' });
  }

  try {
    const [rows] = await sequelize.query(
      `SELECT SUM("bagsProcessed") AS "totalBagsProcessed" 
      FROM "PreprocessingData" 
      WHERE LOWER("batchNumber") = LOWER(?)`,
      { replacements: [batchNumber.trim()] }
    );

    if (!rows[0] || rows[0].totalBagsProcessed === null) {
      return res.json({ totalBagsProcessed: 0 });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching preprocessing data by batch number:', err);
    res.status(500).json({ message: 'Failed to fetch preprocessing data by batch number.' });
  }
});

module.exports = router;