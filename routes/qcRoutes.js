const express = require('express');
const router = express.Router();
const { QCData, ReceivingData, sequelize } = require('../models');
const { validateQCData } = require('../middleware/validationMiddleware'); // Import validation middleware

// Route to create QC data with validation (using raw SQL query)
router.post('/qc', validateQCData, async (req, res) => {
    try {
        const { batchNumber, ripeness, color, foreignMatter, overallQuality, qcNotes, unripePercentage, semiripePercentage, ripePercentage, overripePercentage, price, paymentMethod } = req.body;

        // Check if the batch number exists in ReceivingData
        const [receivingCheck] = await sequelize.query(
            `SELECT 1 FROM "ReceivingData" WHERE "batchNumber" = :batchNumber LIMIT 1`,
            {
                replacements: { batchNumber: batchNumber.trim() },
                type: sequelize.QueryTypes.SELECT
            }
        );

        if (!receivingCheck) {
            return res.status(404).json({ error: 'Batch number does not exist in receiving data.' });
        }
      
        // Use a parameterized query for insertion
        const [result] = await sequelize.query(`
            INSERT INTO "QCData" (
                "batchNumber",
                "ripeness",
                "color",
                "foreignMatter",
                "overallQuality",
                "qcNotes",
                "unripePercentage",
                "semiripePercentage",
                "ripePercentage",
                "overripePercentage",
                "paymentMethod",
                "createdAt",
                "updatedAt"
            ) VALUES (
                :batchNumber,
                :ripeness,
                :color,
                :foreignMatter,
                :overallQuality,
                :qcNotes,
                :unripePercentage,
                :semiripePercentage,
                :ripePercentage,
                :overripePercentage,
                :paymentMethod,
                NOW(),
                NOW()
            )
            RETURNING *; -- Important: Return the created row
        `, {
            replacements: {
                batchNumber,
                ripeness,
                color,
                foreignMatter,
                overallQuality,
                qcNotes,
                unripePercentage,
                semiripePercentage,
                ripePercentage,
                overripePercentage,
                paymentMethod
            },
            type: sequelize.QueryTypes.INSERT // Specify the query type
        });
      
        res.status(201).json(result[0]); // Access the first element (the created row)

    } catch (err) {
        console.error('Error creating QC data:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

// Route for fetching all QC data
router.get('/qc', async (req, res) => {
    try {
        // Fetch all records for filtering purposes
        const [allRows] = await sequelize.query(
            `
            WITH qc AS (
            SELECT 
                q."batchNumber",
                q."qcDate",
                ARRAY_TO_STRING(ARRAY_AGG(DISTINCT q."paymentMethod"), ', ') AS "paymentMethod",
                ARRAY_TO_STRING(ARRAY_AGG(DISTINCT q."qcNotes"), ', ') AS "qcNotes",
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
              ,q."paymentMethod"
              ,q."unripePercentage"
              ,q."semiripePercentage"
              ,q."ripePercentage"
              ,q."overripePercentage"
              ,q."qcNotes"
              ,fm."bankAccount"
              ,fm."bankName"
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
            LEFT JOIN "Farmers" fm on r."farmerID" = fm."farmerID"
            WHERE r."batchNumber" IS NOT NULL
            AND q."batchNumber" IS NOT NULL
            ORDER BY r."batchNumber"
          )

          ,fin as (
            SELECT 
              a.*
              ,DATE(a."receivingDate") as "receivingDateData"
              ,(weight*"totalBags")::INTEGER as "totalWeight"
              ,(b."bagsProcessed")::INTEGER as "processedBags"
              ,(a."totalBags")::INTEGER as "totalBagsInt"
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
            a."batchNumber",
            a.type,
            a.ripeness,
            a.color,
            a."foreignMatter",
            a."unripePercentage",
            a."semiripePercentage",
            a."ripePercentage",
            a."overripePercentage",
            a."overallQuality",
            a."qcNotes",
            a.qcdatedata "qcDate",
            a."totalWeight" weight,
            a."totalBagsInt" "totalBags",
            a.notes "receivingNotes",
            a."updatedBy",
            a."receivingDateData" "receivingDate",
            a."paymentMethod",
            a."farmerName",
            a."bankAccount",
            a."bankName",
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
            END AS "cherryGroup",
            CASE 
              WHEN type = 'Arabica' AND "cherryScore" BETWEEN 80 AND 100 THEN 'Arabica Quality A'
              WHEN type = 'Arabica' AND "cherryScore" BETWEEN 50 AND 80 THEN 'Arabica QUality B'
              WHEN type = 'Arabica' AND "cherryScore" BETWEEN 0 AND 50 THEN 'Arabica QUality C'
              WHEN type = 'Robusta' AND "cherryScore" BETWEEN 80 AND 100 THEN 'Robusta Group A'
              WHEN type = 'Robusta' AND "cherryScore" BETWEEN 50 AND 80 THEN 'Robusta Group B'
              WHEN type = 'Robusta' AND "cherryScore" BETWEEN 0 AND 50 THEN 'Robusta Group C'
            ELSE 'Unknown'
            END AS "priceGroup",
            CASE 
              WHEN type = 'Arabica' AND "cherryScore" BETWEEN 80 AND 100 THEN b."maxPrice"
              WHEN type = 'Arabica' AND "cherryScore" BETWEEN 50 AND 80 THEN ((b."maxPrice"+b."minPrice")/2)
              WHEN type = 'Arabica' AND "cherryScore" BETWEEN 0 AND 50 THEN b."minPrice"
              WHEN type = 'Robusta' AND "cherryScore" BETWEEN 80 AND 100 THEN b."maxPrice"
              WHEN type = 'Robusta' AND "cherryScore" BETWEEN 50 AND 80 THEN ((b."maxPrice"+b."minPrice")/2)
              WHEN type = 'Robusta' AND "cherryScore" BETWEEN 0 AND 50 THEN b."minPrice"
            ELSE 0
            END AS "price"
          FROM fin a
          LEFT JOIN (
            SELECT
              a."batchNumber",
              b."minPrice",
              b."maxPrice",
              b."validAt",
              b."validUntil"
            FROM "ReceivingData" a
            LEFT JOIN "PriceMetrics" b on a.type = b.type  AND DATE(date_trunc('week', "receivingDate")) = DATE(b."validAt")
          ) b on a."batchNumber" = b."batchNumber";
        `
        );

        // Fetch the latest records ordered by QC date
        const [latestRows] = await sequelize.query(
            `
             WITH qc AS (
            SELECT 
                q."batchNumber",
                q."qcDate",
                ARRAY_TO_STRING(ARRAY_AGG(DISTINCT q."paymentMethod"), ', ') AS "paymentMethod",
                ARRAY_TO_STRING(ARRAY_AGG(DISTINCT q."qcNotes"), ', ') AS "qcNotes",
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
              ,q."paymentMethod"
              ,q."unripePercentage"
              ,q."semiripePercentage"
              ,q."ripePercentage"
              ,q."overripePercentage"
              ,q."qcNotes"
              ,fm."bankAccount"
              ,fm."bankName"
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
            LEFT JOIN "Farmers" fm on r."farmerID" = fm."farmerID"
            WHERE r."batchNumber" IS NOT NULL
            AND q."batchNumber" IS NOT NULL
            ORDER BY r."batchNumber"
          )

          ,fin as (
            SELECT 
              a.*
              ,DATE(a."receivingDate") as "receivingDateData"
              ,(weight*"totalBags")::INTEGER as "totalWeight"
              ,(b."bagsProcessed")::INTEGER as "processedBags"
              ,(a."totalBags")::INTEGER as "totalBagsInt"
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
            a."batchNumber",
            a.type,
            a.ripeness,
            a.color,
            a."foreignMatter",
            a."unripePercentage",
            a."semiripePercentage",
            a."ripePercentage",
            a."overripePercentage",
            a."overallQuality",
            a."qcNotes",
            a.qcdatedata "qcDate",
            a."totalWeight" weight,
            a."totalBagsInt" "totalBags",
            a.notes "receivingNotes",
            a."updatedBy",
            a."receivingDateData" "receivingDate",
            a."paymentMethod",
            a."farmerName",
            a."bankAccount",
            a."bankName",
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
            END AS "cherryGroup",
            CASE 
              WHEN type = 'Arabica' AND "cherryScore" BETWEEN 80 AND 100 THEN 'Arabica Quality A'
              WHEN type = 'Arabica' AND "cherryScore" BETWEEN 50 AND 80 THEN 'Arabica QUality B'
              WHEN type = 'Arabica' AND "cherryScore" BETWEEN 0 AND 50 THEN 'Arabica QUality C'
              WHEN type = 'Robusta' AND "cherryScore" BETWEEN 80 AND 100 THEN 'Robusta Group A'
              WHEN type = 'Robusta' AND "cherryScore" BETWEEN 50 AND 80 THEN 'Robusta Group B'
              WHEN type = 'Robusta' AND "cherryScore" BETWEEN 0 AND 50 THEN 'Robusta Group C'
            ELSE 'Unknown'
            END AS "priceGroup",
            CASE 
              WHEN type = 'Arabica' AND "cherryScore" BETWEEN 80 AND 100 THEN b."maxPrice"
              WHEN type = 'Arabica' AND "cherryScore" BETWEEN 50 AND 80 THEN ((b."maxPrice"+b."minPrice")/2)
              WHEN type = 'Arabica' AND "cherryScore" BETWEEN 0 AND 50 THEN b."minPrice"
              WHEN type = 'Robusta' AND "cherryScore" BETWEEN 80 AND 100 THEN b."maxPrice"
              WHEN type = 'Robusta' AND "cherryScore" BETWEEN 50 AND 80 THEN ((b."maxPrice"+b."minPrice")/2)
              WHEN type = 'Robusta' AND "cherryScore" BETWEEN 0 AND 50 THEN b."minPrice"
            ELSE 0
            END AS "price"
          FROM fin a
          LEFT JOIN (
            SELECT
              a."batchNumber",
              b."minPrice",
              b."maxPrice",
              b."validAt",
              b."validUntil"
            FROM "ReceivingData" a
            LEFT JOIN "PriceMetrics" b on a.type = b.type  AND DATE(date_trunc('week', "receivingDate")) = DATE(b."validAt")
          ) b on a."batchNumber" = b."batchNumber";
        WHERE DATE("qcDate") = DATE(NOW())
        `
        );

        res.json({ latestRows, allRows });
    } catch (err) {
        console.error('Error fetching QC data:', err);
        res.status(500).json({ message: 'Failed to fetch QC data.' });
    }
});


// Route for updating QC Data
router.put('/qc/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            ripeness,
            color,
            foreignMatter,
            overallQuality,
            qcNotes,
            unripePercentage,
            semiripePercentage,
            ripePercentage,
            overripePercentage,
            price,
            paymentMethod
        } = req.body;

      // Use a parameterized query for update
      const [updatedRows] = await sequelize.query(`
        UPDATE "QCData"
        SET
            "ripeness" = :ripeness,
            "color" = :color,
            "foreignMatter" = :foreignMatter,
            "overallQuality" = :overallQuality,
            "qcNotes" = :qcNotes,
            "unripePercentage" = :unripePercentage,
            "semiripePercentage" = :semiripePercentage,
            "ripePercentage" = :ripePercentage,
            "overripePercentage" = :overripePercentage,
            "price" = :price,
            "paymentMethod" = :paymentMethod,
            "updatedAt" = NOW()
        WHERE "id" = :id
        RETURNING *;
    `, {
        replacements: {
            id, ripeness, color, foreignMatter, overallQuality, qcNotes,
            unripePercentage, semiripePercentage, ripePercentage, overripePercentage,
            price, paymentMethod
        },
        type: sequelize.QueryTypes.UPDATE
      });


        if (updatedRows.length === 0) {
            return res.status(404).json({ error: 'QCData record not found.' });
        }
      
        res.status(200).json(updatedRows[0]); // Return updated row


    } catch (err) {
        console.error('Error updating QC data:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});


// Route for deleting QC Data
router.delete('/qc/:id', async (req, res) => {
    try {
        const { id } = req.params;

      const [deletedRows] = await sequelize.query(`
            DELETE FROM "QCData"
            WHERE "id" = :id
            RETURNING *;
        `, {
          replacements: { id },
          type: sequelize.QueryTypes.DELETE
        });

        if (deletedRows.length === 0) {
            return res.status(404).json({ error: 'QCData record not found.' });
        }

        res.status(204).send(); // No content

    } catch (err) {
        console.error('Error deleting QC data:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

module.exports = router;