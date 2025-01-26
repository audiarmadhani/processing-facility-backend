const express = require('express');
const router = express.Router();
const sequelize = require('../config/database'); // Assuming this is your Sequelize instance

router.get('/dashboard-metrics', async (req, res) => {
    try {
        const totalBatchesQuery = `SELECT COUNT(*) AS count FROM "ReceivingData" WHERE TO_CHAR("receivingDate", 'YYYY-MM') = TO_CHAR(NOW(), 'YYYY-MM')`;
        
        const totalArabicaWeightQuery = `SELECT COALESCE(SUM(weight), 0) AS sum FROM "ReceivingData" WHERE TO_CHAR("receivingDate", 'YYYY-MM') = TO_CHAR(NOW(), 'YYYY-MM') AND type = 'Arabica'`;
        const totalRobustaWeightQuery = `SELECT COALESCE(SUM(weight), 0) AS sum FROM "ReceivingData" WHERE TO_CHAR("receivingDate", 'YYYY-MM') = TO_CHAR(NOW(), 'YYYY-MM') AND type = 'Robusta'`;
        const lastmonthArabicaWeightQuery = `SELECT COALESCE(SUM(weight), 0) AS sum FROM "ReceivingData" WHERE TO_CHAR("receivingDate", 'YYYY-MM') = TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'YYYY-MM') AND TO_CHAR("receivingDate", 'DD') <= TO_CHAR(CURRENT_DATE, 'DD')  AND type = 'Arabica'`;
        const lastmonthRobustaWeightQuery = `SELECT COALESCE(SUM(weight), 0) AS sum FROM "ReceivingData" WHERE TO_CHAR("receivingDate", 'YYYY-MM') = TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'YYYY-MM') AND TO_CHAR("receivingDate", 'DD') <= TO_CHAR(CURRENT_DATE, 'DD')  AND type = 'Robusta'`;
        
        const totalArabicaCostQuery = `SELECT COALESCE(SUM(price), 0)*COALESCE(SUM(weight), 0) AS sum FROM "ReceivingData" WHERE TO_CHAR("receivingDate", 'YYYY-MM') = TO_CHAR(NOW(), 'YYYY-MM') AND type = 'Arabica'`;
        const totalRobustaCostQuery = `SELECT COALESCE(SUM(price), 0)*COALESCE(SUM(weight), 0) AS sum FROM "ReceivingData" WHERE TO_CHAR("receivingDate", 'YYYY-MM') = TO_CHAR(NOW(), 'YYYY-MM') AND type = 'Robusta'`;
        const lastmonthArabicaCostQuery = `SELECT COALESCE(SUM(price), 0)*COALESCE(SUM(weight), 0) AS sum FROM "ReceivingData" WHERE TO_CHAR("receivingDate", 'YYYY-MM') = TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'YYYY-MM') AND TO_CHAR("receivingDate", 'DD') <= TO_CHAR(CURRENT_DATE, 'DD')  AND type = 'Arabica'`;
        const lastmonthRobustaCostQuery = `SELECT COALESCE(SUM(price), 0)*COALESCE(SUM(weight), 0) AS sum FROM "ReceivingData" WHERE TO_CHAR("receivingDate", 'YYYY-MM') = TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'YYYY-MM') AND TO_CHAR("receivingDate", 'DD') <= TO_CHAR(CURRENT_DATE, 'DD')  AND type = 'Robusta'`;
        
        const avgArabicaCostQuery = `SELECT COALESCE(ROUND(AVG(price)::numeric, 1), 0) AS avg FROM "ReceivingData" WHERE TO_CHAR("receivingDate", 'YYYY-MM') = TO_CHAR(NOW(), 'YYYY-MM') AND type = 'Arabica'`;
        const avgRobustaCostQuery = `SELECT COALESCE(ROUND(AVG(price)::numeric, 1), 0) AS avg FROM "ReceivingData" WHERE TO_CHAR("receivingDate", 'YYYY-MM') = TO_CHAR(NOW(), 'YYYY-MM') AND type = 'Robusta'`;
        const lastmonthAvgArabicaCostQuery = `SELECT COALESCE(ROUND(AVG(price)::numeric, 1), 0) AS avg FROM "ReceivingData" WHERE TO_CHAR("receivingDate", 'YYYY-MM') = TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'YYYY-MM') AND TO_CHAR("receivingDate", 'DD') <= TO_CHAR(CURRENT_DATE, 'DD')  AND type = 'Arabica'`;
        const lastmonthAvgRobustaCostQuery = `SELECT COALESCE(ROUND(AVG(price)::numeric, 1), 0) AS avg FROM "ReceivingData" WHERE TO_CHAR("receivingDate", 'YYYY-MM') = TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'YYYY-MM') AND TO_CHAR("receivingDate", 'DD') <= TO_CHAR(CURRENT_DATE, 'DD')  AND type = 'Robusta'`;
        
        const totalArabicaProcessedQuery = `SELECT COALESCE(ROUND(SUM((b.weight/b."totalBags")*a."bagsProcessed")::numeric, 1), 0) AS sum FROM "PreprocessingData" a LEFT JOIN "ReceivingData" b on a."batchNumber" = b."batchNumber" WHERE TO_CHAR("processingDate", 'YYYY-MM') = TO_CHAR(NOW(), 'YYYY-MM') AND type = 'Arabica'`;
        const totalRobustaProcessedQuery = `SELECT COALESCE(ROUND(SUM((b.weight/b."totalBags")*a."bagsProcessed")::numeric, 1), 0) AS sum FROM "PreprocessingData" a LEFT JOIN "ReceivingData" b on a."batchNumber" = b."batchNumber" WHERE TO_CHAR("processingDate", 'YYYY-MM') = TO_CHAR(NOW(), 'YYYY-MM') AND type = 'Robusta'`;
        const lastmonthArabicaProcessedQuery = `SELECT COALESCE(ROUND(SUM((b.weight/b."totalBags")*a."bagsProcessed")::numeric, 1), 0) AS sum FROM "PreprocessingData" a LEFT JOIN "ReceivingData" b on a."batchNumber" = b."batchNumber" WHERE TO_CHAR("processingDate", 'YYYY-MM') = TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'YYYY-MM') AND TO_CHAR("processingDate", 'DD') <= TO_CHAR(CURRENT_DATE, 'DD') AND type = 'Arabica'`;
        const lastmonthRobustaProcessedQuery = `SELECT COALESCE(ROUND(SUM((b.weight/b."totalBags")*a."bagsProcessed")::numeric, 1), 0) AS sum FROM "PreprocessingData" a LEFT JOIN "ReceivingData" b on a."batchNumber" = b."batchNumber" WHERE TO_CHAR("processingDate", 'YYYY-MM') = TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'YYYY-MM') AND TO_CHAR("processingDate", 'DD') <= TO_CHAR(CURRENT_DATE, 'DD') AND type = 'Robusta'`;

        const totalArabicaProductionQuery = `SELECT COALESCE(SUM(weight), 0) AS sum FROM "PostprocessingData" WHERE TO_CHAR("storedDate", 'YYYY-MM') = TO_CHAR(NOW(), 'YYYY-MM') AND type = 'Arabica'`;
        const totalRobustaProductionQuery = `SELECT COALESCE(SUM(weight), 0) AS sum FROM "PostprocessingData" WHERE TO_CHAR("storedDate", 'YYYY-MM') = TO_CHAR(NOW(), 'YYYY-MM') AND type = 'Robusta'`;
        const lastmonthArabicaProductionQuery = `SELECT COALESCE(SUM(weight), 0) AS sum FROM "PostprocessingData" WHERE TO_CHAR("storedDate", 'YYYY-MM') = TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'YYYY-MM') AND TO_CHAR("storedDate", 'DD') <= TO_CHAR(CURRENT_DATE, 'DD') AND type = 'Arabica'`;
        const lastmonthRobustaProductionQuery = `SELECT COALESCE(SUM(weight), 0) AS sum FROM "PostprocessingData" WHERE TO_CHAR("storedDate", 'YYYY-MM') = TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'YYYY-MM') AND TO_CHAR("storedDate", 'DD') <= TO_CHAR(CURRENT_DATE, 'DD') AND type = 'Robusta'`;

        const activeFarmersQuery = `SELECT SUM(isActive) AS count FROM "Farmers"`;

        const landCoveredArabicaQuery = `SELECT COALESCE(SUM("farmerLandArea"), 0) as sum FROM "Farmers" WHERE "farmType" = 'Arabica' and isactive='1'`;
        const landCoveredRobustaQuery = `SELECT COALESCE(SUM("farmerLandArea"), 0) as sum FROM "Farmers" WHERE "farmType" = 'Robusta' and isactive='1'`;
        
        // Query to get the count of batch numbers in "ReceivingData" but not in "QCData"
        const pendingQCQuery = `
            SELECT COUNT(*) AS count FROM "ReceivingData" rd
            LEFT JOIN "QCData" qd ON rd."batchNumber" = qd."batchNumber"
            WHERE qd."batchNumber" IS NULL
        `;

        const pendingProcessingQuery = `
            SELECT COUNT(*) AS count FROM "QCData" qd
            LEFT JOIN "PreprocessingData" pd ON qd."batchNumber" = pd."batchNumber"
            WHERE pd."batchNumber" IS NULL
        `;

        const totalWeightBagsbyDateQuery = `
            SELECT DATE("receivingDate") as DATE, SUM(weight) as TOTAL_WEIGHT, SUM("totalBags") as TOTAL_BAGS 
            FROM "ReceivingData" 
            GROUP BY DATE("receivingDate")
        `;

        const totalCostbyDateQuery = `
            SELECT DATE("receivingDate") as DATE, SUM(price) as PRICE FROM "ReceivingData" GROUP BY DATE("receivingDate")
        `;

        const arabicaTotalWeightbyDateQuery = `
            SELECT 
                "batchNumber" AS category, 
                COALESCE(SUM(weight), 0) AS weight, 
                DATE("storedDate") AS "storedDate" 
            FROM 
                "PostprocessingData" 
            WHERE 
                "storedDate" IS NOT NULL 
                AND DATE_TRUNC('month', "storedDate") = DATE_TRUNC('month', NOW()) 
                AND type = 'Arabica' 
            GROUP BY 
                "batchNumber", 
                DATE("storedDate");
        `;

        const robustaTotalWeightbyDateQuery = `
            SELECT 
                "batchNumber" AS category, 
                COALESCE(SUM(weight), 0) AS weight, 
                DATE("storedDate") AS "storedDate" 
            FROM 
                "PostprocessingData" 
            WHERE 
                "storedDate" IS NOT NULL 
                AND DATE_TRUNC('month', "storedDate") = DATE_TRUNC('month', NOW()) 
                AND type = 'Robusta' 
            GROUP BY 
                "batchNumber", 
                DATE("storedDate");
        `;

        const arabicaWeightMoMQuery = `
            WITH RECURSIVE "DateRange" AS (
                SELECT DATE_TRUNC('month', CURRENT_DATE)::TIMESTAMP AS "Date" -- Start of the current month
                UNION ALL
                SELECT "Date" + INTERVAL '1 day' -- Add one day to the previous date
                FROM "DateRange"
                WHERE "Date" + INTERVAL '1 day' <= CURRENT_DATE -- Stop at today's date
            ),
            RDA AS (
                SELECT DATE("receivingDate")::TIMESTAMP AS "receivingDate", COALESCE(SUM(Weight), 0) AS "TotalWeightThisMonth"
                FROM "ReceivingData" 
                WHERE TO_CHAR("receivingDate", 'YYYY-MM') = TO_CHAR(NOW(), 'YYYY-MM')
                AND type = 'Arabica'
                GROUP BY DATE("receivingDate")::TIMESTAMP
            ),
            RDB AS (
                SELECT DATE("receivingDate")::TIMESTAMP AS "receivingDate", COALESCE(SUM(Weight), 0) AS "TotalWeightLastMonth"
                FROM "ReceivingData" 
                WHERE TO_CHAR("receivingDate", 'YYYY-MM') = TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'YYYY-MM') AND TO_CHAR("receivingDate", 'DD') <= TO_CHAR(CURRENT_DATE, 'DD') 
                AND type = 'Arabica'
                GROUP BY DATE("receivingDate")::TIMESTAMP
            )
            SELECT 
                TO_CHAR(a."Date", 'Mon-DD') AS "Date",
                SUM(COALESCE(b."TotalWeightThisMonth", 0)) OVER (ORDER BY a."Date") AS "TotalWeightThisMonth", 
                SUM(COALESCE(c."TotalWeightLastMonth", 0)) OVER (ORDER BY a."Date") AS "TotalWeightLastMonth"
            FROM "DateRange" a
            LEFT JOIN RDA b ON a."Date" = b."receivingDate"
            LEFT JOIN RDB c ON EXTRACT(DAY FROM a."Date") = EXTRACT(DAY FROM c."receivingDate");
        `;

        const robustaWeightMoMQuery = `
            WITH RECURSIVE "DateRange" AS (
                SELECT DATE_TRUNC('month', CURRENT_DATE)::TIMESTAMP AS "Date" -- Start of the current month
                UNION ALL
                SELECT "Date" + INTERVAL '1 day' -- Add one day to the previous date
                FROM "DateRange"
                WHERE "Date" + INTERVAL '1 day' <= CURRENT_DATE -- Stop at today's date
            ),
            RDA AS (
                SELECT DATE("receivingDate")::TIMESTAMP AS "receivingDate", COALESCE(SUM(Weight), 0) AS "TotalWeightThisMonth"
                FROM "ReceivingData" 
                WHERE TO_CHAR("receivingDate", 'YYYY-MM') = TO_CHAR(NOW(), 'YYYY-MM')
                AND type = 'Robusta'
                GROUP BY DATE("receivingDate")::TIMESTAMP
            ),
            RDB AS (
                SELECT DATE("receivingDate")::TIMESTAMP AS "receivingDate", COALESCE(SUM(Weight), 0) AS "TotalWeightLastMonth"
                FROM "ReceivingData" 
                WHERE TO_CHAR("receivingDate", 'YYYY-MM') = TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'YYYY-MM') AND TO_CHAR("receivingDate", 'DD') <= TO_CHAR(CURRENT_DATE, 'DD') 
                AND type = 'Robusta'
                GROUP BY DATE("receivingDate")::TIMESTAMP
            )
            SELECT 
                TO_CHAR(a."Date", 'Mon-DD') AS "Date",
                SUM(COALESCE(b."TotalWeightThisMonth", 0)) OVER (ORDER BY a."Date") AS "TotalWeightThisMonth", 
                SUM(COALESCE(c."TotalWeightLastMonth", 0)) OVER (ORDER BY a."Date") AS "TotalWeightLastMonth"
            FROM "DateRange" a
            LEFT JOIN RDA b ON a."Date" = b."receivingDate"
            LEFT JOIN RDB c ON EXTRACT(DAY FROM a."Date") = EXTRACT(DAY FROM c."receivingDate");
        `;

        const arabicaCostMoMQuery = `
            WITH RECURSIVE "DateRange" AS (
                SELECT DATE_TRUNC('month', CURRENT_DATE)::TIMESTAMP AS "Date" -- Start of the current month
                UNION ALL
                SELECT "Date" + INTERVAL '1 day' -- Add one day to the previous date
                FROM "DateRange"
                WHERE "Date" + INTERVAL '1 day' <= CURRENT_DATE -- Stop at today's date
            ),
            RDA AS (
                SELECT DATE("receivingDate")::TIMESTAMP AS "receivingDate", COALESCE(SUM(price), 0)*COALESCE(SUM(weight), 0) AS "TotalPriceThisMonth"
                FROM "ReceivingData" 
                WHERE TO_CHAR("receivingDate", 'YYYY-MM') = TO_CHAR(NOW(), 'YYYY-MM')
                AND type = 'Arabica'
                GROUP BY DATE("receivingDate")::TIMESTAMP
            ),
            RDB AS (
                SELECT DATE("receivingDate")::TIMESTAMP AS "receivingDate", COALESCE(SUM(price), 0)*COALESCE(SUM(weight), 0) AS "TotalPriceLastMonth"
                FROM "ReceivingData" 
                WHERE TO_CHAR("receivingDate", 'YYYY-MM') = TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'YYYY-MM') AND TO_CHAR("receivingDate", 'DD') <= TO_CHAR(CURRENT_DATE, 'DD') 
                AND type = 'Arabica'
                GROUP BY DATE("receivingDate")::TIMESTAMP
            )
            SELECT 
                TO_CHAR(a."Date", 'Mon-DD') AS "Date",
                SUM(COALESCE(b."TotalPriceThisMonth", 0)) OVER (ORDER BY a."Date") AS "TotalCostThisMonth", 
                SUM(COALESCE(c."TotalPriceLastMonth", 0)) OVER (ORDER BY a."Date") AS "TotalCostLastMonth"
            FROM "DateRange" a
            LEFT JOIN RDA b ON a."Date" = b."receivingDate"
            LEFT JOIN RDB c ON EXTRACT(DAY FROM a."Date") = EXTRACT(DAY FROM c."receivingDate");
        `;

        const robustaCostMoMQuery = `
            WITH RECURSIVE "DateRange" AS (
                SELECT DATE_TRUNC('month', CURRENT_DATE)::TIMESTAMP AS "Date" -- Start of the current month
                UNION ALL
                SELECT "Date" + INTERVAL '1 day' -- Add one day to the previous date
                FROM "DateRange"
                WHERE "Date" + INTERVAL '1 day' <= CURRENT_DATE -- Stop at today's date
            ),
            RDA AS (
                SELECT DATE("receivingDate")::TIMESTAMP AS "receivingDate", COALESCE(SUM(price), 0)*COALESCE(SUM(weight), 0) AS "TotalPriceThisMonth"
                FROM "ReceivingData" 
                WHERE TO_CHAR("receivingDate", 'YYYY-MM') = TO_CHAR(NOW(), 'YYYY-MM')
                AND type = 'Robusta'
                GROUP BY DATE("receivingDate")::TIMESTAMP
            ),
            RDB AS (
                SELECT DATE("receivingDate")::TIMESTAMP AS "receivingDate", COALESCE(SUM(price), 0)*COALESCE(SUM(weight), 0) AS "TotalPriceLastMonth"
                FROM "ReceivingData" 
                WHERE TO_CHAR("receivingDate", 'YYYY-MM') = TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'YYYY-MM') AND TO_CHAR("receivingDate", 'DD') <= TO_CHAR(CURRENT_DATE, 'DD') 
                AND type = 'Robusta'
                GROUP BY DATE("receivingDate")::TIMESTAMP
            )
            SELECT 
                TO_CHAR(a."Date", 'Mon-DD') AS "Date",
                SUM(COALESCE(b."TotalPriceThisMonth", 0)) OVER (ORDER BY a."Date") AS "TotalCostThisMonth", 
                SUM(COALESCE(c."TotalPriceLastMonth", 0)) OVER (ORDER BY a."Date") AS "TotalCostLastMonth"
            FROM "DateRange" a
            LEFT JOIN RDA b ON a."Date" = b."receivingDate"
            LEFT JOIN RDB c ON EXTRACT(DAY FROM a."Date") = EXTRACT(DAY FROM c."receivingDate");
        `;

        const arabicaAvgCostMoMQuery = `
            WITH RECURSIVE "DateRange" AS (
                SELECT DATE_TRUNC('month', CURRENT_DATE)::TIMESTAMP AS "Date" -- Start of the current month
                UNION ALL
                SELECT "Date" + INTERVAL '1 day' -- Add one day to the previous date
                FROM "DateRange"
                WHERE "Date" + INTERVAL '1 day' <= CURRENT_DATE -- Stop at today's date
            ),
            RDA AS (
                SELECT 
                    DATE("receivingDate") AS "receivingDate", 
                    COALESCE(SUM(price), 0) AS "TotalPriceThisMonth",
                    COUNT(price) AS "CountThisMonth"
                FROM "ReceivingData" 
                WHERE TO_CHAR("receivingDate", 'YYYY-MM') = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
                AND type = 'Arabica'
                GROUP BY DATE("receivingDate")
            ),
            RDB AS (
                SELECT 
                    DATE("receivingDate") AS "receivingDate", 
                    COALESCE(SUM(price), 0) AS "TotalPriceLastMonth",
                    COUNT(price) AS "CountLastMonth"
                FROM "ReceivingData" 
                WHERE TO_CHAR("receivingDate", 'YYYY-MM') = TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'YYYY-MM') 
                AND TO_CHAR("receivingDate", 'DD') <= TO_CHAR(CURRENT_DATE, 'DD') 
                AND type = 'Arabica'
                GROUP BY DATE("receivingDate")
            ),
            Cumulative AS (
                SELECT 
                    a."Date",
                    SUM(COALESCE(b."TotalPriceThisMonth", 0)) OVER (ORDER BY a."Date") AS "CumulativePriceThisMonth",
                    SUM(COALESCE(b."CountThisMonth", 0)) OVER (ORDER BY a."Date") AS "CumulativeCountThisMonth",
                    SUM(COALESCE(c."TotalPriceLastMonth", 0)) OVER (ORDER BY a."Date") AS "CumulativePriceLastMonth",
                    SUM(COALESCE(c."CountLastMonth", 0)) OVER (ORDER BY a."Date") AS "CumulativeCountLastMonth"
                FROM "DateRange" a
                LEFT JOIN RDA b ON a."Date" = b."receivingDate"
                LEFT JOIN RDB c ON EXTRACT(DAY FROM a."Date") = EXTRACT(DAY FROM c."receivingDate")
            )
            SELECT 
                TO_CHAR(a."Date", 'Mon-DD') AS "Date",
                ROUND(CASE 
                    WHEN "CumulativeCountThisMonth" > 0 THEN "CumulativePriceThisMonth" * 1.0 / "CumulativeCountThisMonth" 
                    ELSE 0 
                END, 1) AS "RunningAverageCostThisMonth",
                ROUND(CASE 
                    WHEN "CumulativeCountLastMonth" > 0 THEN "CumulativePriceLastMonth" * 1.0 / "CumulativeCountLastMonth" 
                    ELSE 0 
                END, 1) AS "RunningAverageCostLastMonth"
            FROM Cumulative a;
        `;

        const robustaAvgCostMoMQuery = `
            WITH RECURSIVE "DateRange" AS (
                SELECT DATE_TRUNC('month', CURRENT_DATE)::TIMESTAMP AS "Date" -- Start of the current month
                UNION ALL
                SELECT "Date" + INTERVAL '1 day' -- Add one day to the previous date
                FROM "DateRange"
                WHERE "Date" + INTERVAL '1 day' <= CURRENT_DATE -- Stop at today's date
            ),
            RDA AS (
                SELECT 
                    DATE("receivingDate") AS "receivingDate", 
                    COALESCE(SUM(price), 0) AS "TotalPriceThisMonth",
                    COUNT(price) AS "CountThisMonth"
                FROM "ReceivingData" 
                WHERE TO_CHAR("receivingDate", 'YYYY-MM') = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
                AND type = 'Robusta'
                GROUP BY DATE("receivingDate")
            ),
            RDB AS (
                SELECT 
                    DATE("receivingDate") AS "receivingDate", 
                    COALESCE(SUM(price), 0) AS "TotalPriceLastMonth",
                    COUNT(price) AS "CountLastMonth"
                FROM "ReceivingData" 
                WHERE TO_CHAR("receivingDate", 'YYYY-MM') = TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'YYYY-MM') 
                AND TO_CHAR("receivingDate", 'DD') <= TO_CHAR(CURRENT_DATE, 'DD') 
                AND type = 'Robusta'
                GROUP BY DATE("receivingDate")
            ),
            Cumulative AS (
                SELECT 
                    a."Date",
                    SUM(COALESCE(b."TotalPriceThisMonth", 0)) OVER (ORDER BY a."Date") AS "CumulativePriceThisMonth",
                    SUM(COALESCE(b."CountThisMonth", 0)) OVER (ORDER BY a."Date") AS "CumulativeCountThisMonth",
                    SUM(COALESCE(c."TotalPriceLastMonth", 0)) OVER (ORDER BY a."Date") AS "CumulativePriceLastMonth",
                    SUM(COALESCE(c."CountLastMonth", 0)) OVER (ORDER BY a."Date") AS "CumulativeCountLastMonth"
                FROM "DateRange" a
                LEFT JOIN RDA b ON a."Date" = b."receivingDate"
                LEFT JOIN RDB c ON EXTRACT(DAY FROM a."Date") = EXTRACT(DAY FROM c."receivingDate")
            )
            SELECT 
                TO_CHAR(a."Date", 'Mon-DD') AS "Date",
                ROUND(CASE 
                    WHEN "CumulativeCountThisMonth" > 0 THEN "CumulativePriceThisMonth" * 1.0 / "CumulativeCountThisMonth" 
                    ELSE 0 
                END, 1) AS "RunningAverageCostThisMonth",
                ROUND(CASE 
                    WHEN "CumulativeCountLastMonth" > 0 THEN "CumulativePriceLastMonth" * 1.0 / "CumulativeCountLastMonth" 
                    ELSE 0 
                END, 1) AS "RunningAverageCostLastMonth"
            FROM Cumulative a;
        `;

        const arabicaProcessedMoMQuery = `
            WITH RECURSIVE "DateRange" AS (
                SELECT DATE_TRUNC('month', CURRENT_DATE)::TIMESTAMP AS "Date" -- Start of the current month
                UNION ALL
                SELECT "Date" + INTERVAL '1 day' -- Add one day to the previous date
                FROM "DateRange"
                WHERE "Date" + INTERVAL '1 day' <= CURRENT_DATE -- Stop at today's date
            ),
            RDA AS (
                SELECT DATE("processingDate") as "processingDate", COALESCE(ROUND(SUM((b.weight/b."totalBags")*a."bagsProcessed")::numeric, 1), 0) AS "TotalWeightThisMonth"
                FROM "PreprocessingData" a LEFT JOIN "ReceivingData" b on a."batchNumber" = b."batchNumber"
                WHERE TO_CHAR("processingDate", 'YYYY-MM') = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
                AND type = 'Arabica'
                GROUP BY DATE("processingDate")
            ),
            RDB AS (
                SELECT DATE("processingDate") as "processingDate", COALESCE(ROUND(SUM((b.weight/b."totalBags")*a."bagsProcessed")::numeric, 1), 0) AS "TotalWeightLastMonth"
                FROM "PreprocessingData" a LEFT JOIN "ReceivingData" b on a."batchNumber" = b."batchNumber"
                WHERE TO_CHAR("processingDate", 'YYYY-MM') = TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'YYYY-MM') AND EXTRACT(DAY FROM "processingDate") <= EXTRACT(DAY FROM CURRENT_DATE)
                AND type = 'Arabica'
                GROUP BY DATE("processingDate")
            )
            SELECT 
                TO_CHAR(a."Date", 'Mon-DD') AS "Date",
                SUM(COALESCE(b."TotalWeightThisMonth", 0)) OVER (ORDER BY a."Date") AS "TotalWeightThisMonth", 
                SUM(COALESCE(c."TotalWeightLastMonth", 0)) OVER (ORDER BY a."Date") AS "TotalWeightLastMonth"
            FROM "DateRange" a
            LEFT JOIN RDA b ON a."Date" = b."processingDate"
            LEFT JOIN RDB c ON EXTRACT(DAY FROM a."Date") = EXTRACT(DAY FROM c."processingDate");
        `;

        const robustaProcessedMoMQuery = `
            WITH RECURSIVE "DateRange" AS (
                SELECT DATE_TRUNC('month', CURRENT_DATE)::TIMESTAMP AS "Date" -- Start of the current month
                UNION ALL
                SELECT "Date" + INTERVAL '1 day' -- Add one day to the previous date
                FROM "DateRange"
                WHERE "Date" + INTERVAL '1 day' <= CURRENT_DATE -- Stop at today's date
            ),
            RDA AS (
                SELECT DATE("processingDate") as "processingDate", COALESCE(ROUND(SUM((b.weight/b."totalBags")*a."bagsProcessed")::numeric, 1), 0) AS "TotalWeightThisMonth"
                FROM "PreprocessingData" a LEFT JOIN "ReceivingData" b on a."batchNumber" = b."batchNumber"
                WHERE TO_CHAR("processingDate", 'YYYY-MM') = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
                AND type = 'Robusta'
                GROUP BY DATE("processingDate")
            ),
            RDB AS (
                SELECT DATE("processingDate") as "processingDate", COALESCE(ROUND(SUM((b.weight/b."totalBags")*a."bagsProcessed")::numeric, 1), 0) AS "TotalWeightLastMonth"
                FROM "PreprocessingData" a LEFT JOIN "ReceivingData" b on a."batchNumber" = b."batchNumber"
                WHERE TO_CHAR("processingDate", 'YYYY-MM') = TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'YYYY-MM') AND EXTRACT(DAY FROM "processingDate") <= EXTRACT(DAY FROM CURRENT_DATE)
                AND type = 'Robusta'
                GROUP BY DATE("processingDate")
            )
            SELECT 
                TO_CHAR(a."Date", 'Mon-DD') AS "Date",
                SUM(COALESCE(b."TotalWeightThisMonth", 0)) OVER (ORDER BY a."Date") AS "TotalWeightThisMonth", 
                SUM(COALESCE(c."TotalWeightLastMonth", 0)) OVER (ORDER BY a."Date") AS "TotalWeightLastMonth"
            FROM "DateRange" a
            LEFT JOIN RDA b ON a."Date" = b."processingDate"
            LEFT JOIN RDB c ON EXTRACT(DAY FROM a."Date") = EXTRACT(DAY FROM c."processingDate");
        `;

        const arabicaProductionMoMQuery = `
            WITH RECURSIVE "DateRange" AS (
                SELECT DATE_TRUNC('month', CURRENT_DATE)::TIMESTAMP AS "Date" -- Start of the current month
                UNION ALL
                SELECT "Date" + INTERVAL '1 day' -- Add one day to the previous date
                FROM "DateRange"
                WHERE "Date" + INTERVAL '1 day' <= CURRENT_DATE -- Stop at today's date
            ),
                RDA AS (
                SELECT DATE("storedDate") as "storedDate", COALESCE(SUM(Weight), 0) AS "TotalWeightThisMonth"
                FROM "PostprocessingData" 
                WHERE TO_CHAR("storedDate", 'YYYY-MM') = TO_CHAR(NOW(), 'YYYY-MM')
                AND type = 'Arabica'
                GROUP BY DATE("storedDate")
            ),
            RDB AS (
                SELECT DATE("storedDate") as "storedDate", COALESCE(SUM(Weight), 0) AS "TotalWeightLastMonth"
                FROM "PostprocessingData" 
                WHERE TO_CHAR("storedDate", 'YYYY-MM') = TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'YYYY-MM') AND TO_CHAR("storedDate", 'DD') <= TO_CHAR(CURRENT_DATE, 'DD')
                AND type = 'Arabica'
                GROUP BY DATE("storedDate")
            )
            SELECT 
                TO_CHAR(a."Date", 'Mon-DD') AS "Date",
                SUM(COALESCE(b."TotalWeightThisMonth", 0)) OVER (ORDER BY a."Date") AS "TotalWeightThisMonth", 
                SUM(COALESCE(c."TotalWeightLastMonth", 0)) OVER (ORDER BY a."Date") AS "TotalWeightLastMonth"
            FROM "DateRange" a
            LEFT JOIN RDA b ON a."Date" = b."storedDate"
            LEFT JOIN RDB c ON EXTRACT(DAY FROM a."Date") = EXTRACT(DAY FROM c."storedDate")
            ;
        `;

        const robustaProductionMoMQuery = `
            WITH RECURSIVE "DateRange" AS (
                SELECT DATE_TRUNC('month', CURRENT_DATE)::TIMESTAMP AS "Date" -- Start of the current month
                UNION ALL
                SELECT "Date" + INTERVAL '1 day' -- Add one day to the previous date
                FROM "DateRange"
                WHERE "Date" + INTERVAL '1 day' <= CURRENT_DATE -- Stop at today's date
            ),
                RDA AS (
                SELECT DATE("storedDate") as "storedDate", COALESCE(SUM(Weight), 0) AS "TotalWeightThisMonth"
                FROM "PostprocessingData" 
                WHERE TO_CHAR("storedDate", 'YYYY-MM') = TO_CHAR(NOW(), 'YYYY-MM')
                AND type = 'Robusta'
                GROUP BY DATE("storedDate")
            ),
            RDB AS (
                SELECT DATE("storedDate") as "storedDate", COALESCE(SUM(Weight), 0) AS "TotalWeightLastMonth"
                FROM "PostprocessingData" 
                WHERE TO_CHAR("storedDate", 'YYYY-MM') = TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'YYYY-MM') AND TO_CHAR("storedDate", 'DD') <= TO_CHAR(CURRENT_DATE, 'DD')
                AND type = 'Robusta'
                GROUP BY DATE("storedDate")
            )
            SELECT 
                TO_CHAR(a."Date", 'Mon-DD') AS "Date",
                SUM(COALESCE(b."TotalWeightThisMonth", 0)) OVER (ORDER BY a."Date") AS "TotalWeightThisMonth", 
                SUM(COALESCE(c."TotalWeightLastMonth", 0)) OVER (ORDER BY a."Date") AS "TotalWeightLastMonth"
            FROM "DateRange" a
            LEFT JOIN RDA b ON a."Date" = b."storedDate"
            LEFT JOIN RDB c ON EXTRACT(DAY FROM a."Date") = EXTRACT(DAY FROM c."storedDate")
            ;
        `;

        // Execute queries
        const [totalBatchesResult] = await sequelize.query(totalBatchesQuery);

        const [totalArabicaWeightResult] = await sequelize.query(totalArabicaWeightQuery);
        const [totalRobustaWeightResult] = await sequelize.query(totalRobustaWeightQuery);
        const [lastmonthArabicaWeightResult] = await sequelize.query(lastmonthArabicaWeightQuery);
        const [lastmonthRobustaWeightResult] = await sequelize.query(lastmonthRobustaWeightQuery);

        const [totalArabicaCostResult] = await sequelize.query(totalArabicaCostQuery);
        const [totalRobustaCostResult] = await sequelize.query(totalRobustaCostQuery);
        const [lastmonthArabicaCostResult] = await sequelize.query(lastmonthArabicaCostQuery);
        const [lastmonthRobustaCostResult] = await sequelize.query(lastmonthRobustaCostQuery);

        const [avgArabicaCostResult] = await sequelize.query(avgArabicaCostQuery);
        const [avgRobustaCostResult] = await sequelize.query(avgRobustaCostQuery);
        const [lastmonthAvgArabicaCostResult] = await sequelize.query(lastmonthAvgArabicaCostQuery);
        const [lastmonthAvgRobustaCostResult] = await sequelize.query(lastmonthAvgRobustaCostQuery);

        const [totalArabicaProcessedResult] = await sequelize.query(totalArabicaProcessedQuery);
        const [totalRobustaProcessedResult] = await sequelize.query(totalRobustaProcessedQuery);
        const [lastmonthArabicaProcessedResult] = await sequelize.query(lastmonthArabicaProcessedQuery);
        const [lastmonthRobustaProcessedResult] = await sequelize.query(lastmonthRobustaProcessedQuery);

        const [totalArabicaProductionResult] = await sequelize.query(totalArabicaProductionQuery);
        const [totalRobustaProductionResult] = await sequelize.query(totalRobustaProductionQuery);
        const [lastmonthArabicaProductionResult] = await sequelize.query(lastmonthArabicaProductionQuery);
        const [lastmonthRobustaProductionResult] = await sequelize.query(lastmonthRobustaProductionQuery);

        const [activeFarmersResult] = await sequelize.query(activeFarmersQuery);
        const [pendingQCResult] = await sequelize.query(pendingQCQuery);
        const [pendingProcessingResult] = await sequelize.query(pendingProcessingQuery);
        const [totalWeightBagsbyDateResult] = await sequelize.query(totalWeightBagsbyDateQuery);
        const [totalCostbyDateResult] = await sequelize.query(totalCostbyDateQuery);
        const [landCoveredArabicaResult] = await sequelize.query(landCoveredArabicaQuery);
        const [landCoveredRobustaResult] = await sequelize.query(landCoveredRobustaQuery);

        const [arabicaTotalWeightbyDateResult] = await sequelize.query(arabicaTotalWeightbyDateQuery);
        const [robustaTotalWeightbyDateResult] = await sequelize.query(robustaTotalWeightbyDateQuery);

        const [arabicaWeightMoMResult] = await sequelize.query(arabicaWeightMoMQuery);
        const [robustaWeightMoMResult] = await sequelize.query(robustaWeightMoMQuery);

        const [arabicaCostMoMResult] = await sequelize.query(arabicaCostMoMQuery);
        const [robustaCostMoMResult] = await sequelize.query(robustaCostMoMQuery);

        const [arabicaAvgCostMoMResult] = await sequelize.query(arabicaAvgCostMoMQuery);
        const [robustaAvgCostMoMResult] = await sequelize.query(robustaAvgCostMoMQuery);

        const [arabicaProcessedMoMResult] = await sequelize.query(arabicaProcessedMoMQuery);
        const [robustaProcessedMoMResult] = await sequelize.query(robustaProcessedMoMQuery);

        const [arabicaProductionMoMResult] = await sequelize.query(arabicaProductionMoMQuery);
        const [robustaProductionMoMResult] = await sequelize.query(robustaProductionMoMQuery);


        // Extract the relevant values from query results
        const totalBatches = totalBatchesResult[0].count || 0;
        
        const totalArabicaWeight = totalArabicaWeightResult[0].sum || 0;
        const totalRobustaWeight= totalRobustaWeightResult[0].sum || 0;
        const lastmonthArabicaWeight= lastmonthArabicaWeightResult[0].sum || 0;
        const lastmonthRobustaWeight= lastmonthRobustaWeightResult[0].sum || 0;

        const totalArabicaCost= totalArabicaCostResult[0].sum || 0;
        const totalRobustaCost= totalRobustaCostResult[0].sum || 0;
        const lastmonthArabicaCost= lastmonthArabicaCostResult[0].sum || 0;
        const lastmonthRobustaCost= lastmonthRobustaCostResult[0].sum || 0;

        const avgArabicaCost= avgArabicaCostResult[0].avg || 0;
        const avgRobustaCost= avgRobustaCostResult[0].avg || 0;
        const lastmonthAvgArabicaCost= lastmonthAvgArabicaCostResult[0].avg || 0;
        const lastmonthAvgRobustaCost= lastmonthAvgRobustaCostResult[0].avg || 0;

        const totalArabicaProcessed= totalArabicaProcessedResult[0].sum || 0;
        const totalRobustaProcessed= totalRobustaProcessedResult[0].sum || 0;
        const lastmonthArabicaProcessed= lastmonthArabicaProcessedResult[0].sum || 0;
        const lastmonthRobustaProcessed= lastmonthRobustaProcessedResult[0].sum || 0;

        const totalArabicaProduction= totalArabicaProductionResult[0].sum || 0;
        const totalRobustaProduction= totalRobustaProductionResult[0].sum || 0;
        const lastmonthArabicaProduction= lastmonthArabicaProductionResult[0].sum || 0;
        const lastmonthRobustaProduction= lastmonthRobustaProductionResult[0].sum || 0;

        const activeFarmers= activeFarmersResult[0].count || 0;
        const pendingQC= pendingQCResult[0].count || 0;
        const pendingProcessing= pendingProcessingResult[0].count || 0;
        const landCoveredArabica = landCoveredArabicaResult[0].sum || 0;
        const landCoveredRobusta = landCoveredRobustaResult[0].sum || 0;

        const totalWeightBagsbyDate= totalWeightBagsbyDateResult || []; // Return as an array
        const totalCostbyDate= totalCostbyDateResult || []; // Return as an array

        const arabicaTotalWeightbyDate= arabicaTotalWeightbyDateResult || []; // Return as an array
        const robustaTotalWeightbyDate= robustaTotalWeightbyDateResult || []; // Return as an array

        const arabicaWeightMoM= arabicaWeightMoMResult || []; // Return as an array
        const robustaWeightMoM= robustaWeightMoMResult || []; // Return as an array

        const arabicaCostMoM= arabicaCostMoMResult || [];
        const robustaCostMoM= robustaCostMoMResult || [];

        const arabicaAvgCostMoM= arabicaAvgCostMoMResult || [];
        const robustaAvgCostMoM= robustaAvgCostMoMResult || [];

        const arabicaProcessedMoM= arabicaProcessedMoMResult || [];
        const robustaProcessedMoM= robustaProcessedMoMResult || [];

        const arabicaProductionMoM= arabicaProductionMoMResult || [];
        const robustaProductionMoM= robustaProductionMoMResult || [];

        // Return the metrics
        res.json({
            totalBatches, 

            totalArabicaWeight, 
            totalRobustaWeight, 
            lastmonthArabicaWeight, 
            lastmonthRobustaWeight, 

            totalArabicaCost, 
            totalRobustaCost, 
            lastmonthArabicaCost, 
            lastmonthRobustaCost, 

            avgArabicaCost,
            avgRobustaCost,
            lastmonthAvgArabicaCost,
            lastmonthAvgRobustaCost,

            totalArabicaProcessed,
            totalRobustaProcessed,
            lastmonthArabicaProcessed,
            lastmonthRobustaProcessed,

            totalArabicaProduction,
            totalRobustaProduction,
            lastmonthArabicaProduction,
            lastmonthRobustaProduction,

            activeFarmers, 
            pendingQC, 
            pendingProcessing, 
            totalWeightBagsbyDate, 
            totalCostbyDate, 
            arabicaTotalWeightbyDate,
            robustaTotalWeightbyDate,
            landCoveredArabica,
            landCoveredRobusta,

            arabicaWeightMoM, 
            robustaWeightMoM, 

            arabicaCostMoM, 
            robustaCostMoM,

            arabicaAvgCostMoM,
            robustaAvgCostMoM,

            arabicaProcessedMoM,
            robustaProcessedMoM,

            arabicaProductionMoM,
            robustaProductionMoM,
            
        });
    } catch (err) {
    console.error('Error fetching dashboard metrics:', err);
    res.status(500).json({ message: 'Failed to fetch dashboard metrics.' });
      }
});
    
module.exports = router;