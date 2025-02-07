const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

const executeQuery = async (query, replacements) => {
    try {
        const [results] = await sequelize.query(query, {
            replacements,
            type: sequelize.QueryTypes.SELECT,
        });
        return results;
    } catch (error) {
        console.error("Error executing query:", error);
        throw error;
    }
};

const generateDateFilter = (startDate, endDate, dateColumn) => {
    return (startDate && endDate) ? `"${dateColumn}" BETWEEN :startDate AND :endDate` :
           startDate ? `"${dateColumn}" >= :startDate` :
           endDate ? `"${dateColumn}" <= :endDate` : '1=1';
};

router.get('/dashboard-metrics', async (req, res) => {
    try {
        let startDate, endDate, startDatePrevious, endDatePrevious;
        const timeframe = req.query.timeframe || 'thisMonth';
        const currentDate = new Date();

        switch (timeframe) {
            case 'previousWeek':
                const diff = currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1;
                startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7 - diff);
                endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1 - diff);
                startDatePrevious = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 14 - diff);
                endDatePrevious = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 8 - diff);
                break;
            case 'previousMonth':
                startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
                endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
                startDatePrevious = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1);
                endDatePrevious = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
                break;
            case 'thisMonth':
                startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                startDatePrevious = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
                endDatePrevious = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
                break;
            case 'thisYear':
                startDate = new Date(currentDate.getFullYear(), 0, 1);
                endDate = new Date(currentDate.getFullYear(), 11, 31);
                startDatePrevious = new Date(currentDate.getFullYear() - 1, 0, 1);
                endDatePrevious = new Date(currentDate.getFullYear() - 1, 11, 31);
                break;
            case 'custom':
                startDate = req.query.startDate ? new Date(req.query.startDate) : null;
                endDate = req.query.endDate ? new Date(req.query.endDate) : null;
                startDatePrevious = req.query.startDatePrevious ? new Date(req.query.startDatePrevious) : null;
                endDatePrevious = req.query.endDatePrevious ? new Date(req.query.endDatePrevious) : null;

                if (!startDate || !endDate || !startDatePrevious || !endDatePrevious) {
                    return res.status(400).json({ error: "All start and end dates are required for custom range." });
                }
                break;
            default:
                startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                startDatePrevious = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
                endDatePrevious = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        }

        const metrics = {};

        // Now use startDate and endDate in your queries (example)

        metrics.totalBatches = await executeQuery(`SELECT COUNT(*) AS count FROM "ReceivingData" WHERE ${generateDateFilter(startDate, endDate, 'receivingDate')}`, { startDate, endDate }); // Correct!
        metrics.totalArabicaWeight = await executeQuery(`SELECT COALESCE(SUM(weight), 0) AS sum FROM "ReceivingData" WHERE ${generateDateFilter(startDate, endDate, 'receivingDate')} AND type = 'Arabica'`, { startDate, endDate }); // Correct!
        metrics.totalRobustaWeight = await executeQuery(`SELECT COALESCE(SUM(weight), 0) AS sum FROM "ReceivingData" WHERE ${generateDateFilter(startDate, endDate, 'receivingDate')} AND type = 'Robusta'`, { startDate, endDate }); // Correct!
        metrics.totalArabicaCost = await executeQuery(`SELECT COALESCE(SUM(price*weight), 0) AS sum FROM "ReceivingData" WHERE ${generateDateFilter(startDate, endDate, 'receivingDate')} AND type = 'Arabica'`, { startDate, endDate }); // Correct!
        metrics.totalRobustaCost = await executeQuery(`SELECT COALESCE(SUM(price*weight), 0) AS sum FROM "ReceivingData" WHERE ${generateDateFilter(startDate, endDate, 'receivingDate')} AND type = 'Robusta'`, { startDate, endDate }); // Correct!
        metrics.avgArabicaCost = await executeQuery(`SELECT COALESCE(ROUND(AVG(price)::numeric, 1), 0) AS avg FROM "ReceivingData" WHERE ${generateDateFilter(startDate, endDate, 'receivingDate')} AND type = 'Arabica'`, { startDate, endDate }); // Correct!
        metrics.avgRobustaCost = await executeQuery(`SELECT COALESCE(ROUND(AVG(price)::numeric, 1), 0) AS avg FROM "ReceivingData" WHERE ${generateDateFilter(startDate, endDate, 'receivingDate')} AND type = 'Robusta'`, { startDate, endDate }); // Correct!
        metrics.totalArabicaProcessed = await executeQuery(`SELECT COALESCE(ROUND(SUM((b.weight/b."totalBags")*a."bagsProcessed")::numeric, 1), 0) AS sum FROM "PreprocessingData" a LEFT JOIN "ReceivingData" b on a."batchNumber" = b."batchNumber" WHERE ${generateDateFilter(startDate, endDate, 'processingDate')} AND type = 'Arabica'`, { startDate, endDate }); // Correct!
        metrics.totalRobustaProcessed = await executeQuery(`SELECT COALESCE(ROUND(SUM((b.weight/b."totalBags")*a."bagsProcessed")::numeric, 1), 0) AS sum FROM "PreprocessingData" a LEFT JOIN "ReceivingData" b on a."batchNumber" = b."batchNumber" WHERE ${generateDateFilter(startDate, endDate, 'processingDate')} AND type = 'Robusta'`, { startDate, endDate }); // Correct!
        metrics.totalArabicaProduction = await executeQuery(`SELECT COALESCE(SUM(weight), 0) AS sum FROM "PostprocessingData" WHERE ${generateDateFilter(startDate, endDate, 'storedDate')} AND type = 'Arabica'`, { startDate, endDate }); // Correct!
        metrics.totalRobustaProduction = await executeQuery(`SELECT COALESCE(SUM(weight), 0) AS sum FROM "PostprocessingData" WHERE ${generateDateFilter(startDate, endDate, 'storedDate')} AND type = 'Robusta'`, { startDate, endDate }); // Correct!

        // Metrics comparing current vs. previous (Corrected!)
        metrics.lastmonthArabicaWeight = await executeQuery(`SELECT COALESCE(SUM(weight), 0) AS sum FROM "ReceivingData" WHERE ${generateDateFilter(startDatePrevious, endDatePrevious, 'receivingDate')} AND type = 'Arabica'`, { startDate: startDatePrevious, endDate: endDatePrevious }); // Correct replacements!
        metrics.lastmonthRobustaWeight = await executeQuery(`SELECT COALESCE(SUM(weight), 0) AS sum FROM "ReceivingData" WHERE ${generateDateFilter(startDatePrevious, endDatePrevious, 'receivingDate')} AND type = 'Robusta'`, { startDate: startDatePrevious, endDate: endDatePrevious }); // Correct replacements!
        metrics.lastmonthArabicaCost = await executeQuery(`SELECT COALESCE(SUM(price*weight), 0) AS sum FROM "ReceivingData" WHERE ${generateDateFilter(startDatePrevious, endDatePrevious, 'receivingDate')} AND type = 'Arabica'`, { startDate: startDatePrevious, endDate: endDatePrevious }); // Correct replacements!
        metrics.lastmonthRobustaCost = await executeQuery(`SELECT COALESCE(SUM(price*weight), 0) AS sum FROM "ReceivingData" WHERE ${generateDateFilter(startDatePrevious, endDatePrevious, 'receivingDate')} AND type = 'Robusta'`, { startDate: startDatePrevious, endDate: endDatePrevious }); // Correct replacements!
        metrics.lastmonthAvgArabicaCost = await executeQuery(`SELECT COALESCE(ROUND(AVG(price)::numeric, 1), 0) AS avg FROM "ReceivingData" WHERE ${generateDateFilter(startDatePrevious, endDatePrevious, 'receivingDate')} AND type = 'Arabica'`, { startDate: startDatePrevious, endDate: endDatePrevious }); // Correct replacements!
        metrics.lastmonthAvgRobustaCost = await executeQuery(`SELECT COALESCE(ROUND(AVG(price)::numeric, 1), 0) AS avg FROM "ReceivingData" WHERE ${generateDateFilter(startDatePrevious, endDatePrevious, 'receivingDate')} AND type = 'Robusta'`, { startDate: startDatePrevious, endDate: endDatePrevious }); // Correct replacements!
        metrics.lastmonthArabicaProcessed = await executeQuery(`SELECT COALESCE(ROUND(SUM((b.weight/b."totalBags")*a."bagsProcessed")::numeric, 1), 0) AS sum FROM "PreprocessingData" a LEFT JOIN "ReceivingData" b on a."batchNumber" = b."batchNumber" WHERE ${generateDateFilter(startDatePrevious, endDatePrevious, 'processingDate')} AND type = 'Arabica'`, { startDate: startDatePrevious, endDate: endDatePrevious }); // Correct replacements!
        metrics.lastmonthRobustaProcessed = await executeQuery(`SELECT COALESCE(ROUND(SUM((b.weight/b."totalBags")*a."bagsProcessed")::numeric, 1), 0) AS sum FROM "PreprocessingData" a LEFT JOIN "ReceivingData" b on a."batchNumber" = b."batchNumber" WHERE ${generateDateFilter(startDatePrevious, endDatePrevious, 'processingDate')} AND type = 'Robusta'`, { startDate: startDatePrevious, endDate: endDatePrevious }); // Correct replacements!
        metrics.lastmonthArabicaProduction = await executeQuery(`SELECT COALESCE(SUM(weight), 0) AS sum FROM "PostprocessingData" WHERE ${generateDateFilter(startDatePrevious, endDatePrevious, 'storedDate')} AND type = 'Arabica'`, { startDate: startDatePrevious, endDate: endDatePrevious }); // Correct replacements!
        metrics.lastmonthRobustaProduction = await executeQuery(`SELECT COALESCE(SUM(weight), 0) AS sum FROM "PostprocessingData" WHERE ${generateDateFilter(startDatePrevious, endDatePrevious, 'storedDate')} AND type = 'Robusta'`, { startDate: startDatePrevious, endDate: endDatePrevious }); // Correct replacements!

        // ... (rest of the code)

        metrics.activeArabicaFarmers = await executeQuery(`SELECT COUNT(*) AS count FROM "Farmers" where "farmType" in ('Arabica', 'Mix', 'Mixed') AND isActive = 1`);
        metrics.activeRobustaFarmers = await executeQuery(`SELECT COUNT(*) AS count FROM "Farmers" where "farmType" in ('Robusta', 'Mix', 'Mixed') AND isActive = 1`);

        metrics.landCoveredArabica = await executeQuery(`SELECT COALESCE(SUM("farmerLandArea"), 0) as sum FROM "Farmers" WHERE "farmType" = 'Arabica' and isactive='1'`);
        metrics.landCoveredRobusta = await executeQuery(`SELECT COALESCE(SUM("farmerLandArea"), 0) as sum FROM "Farmers" WHERE "farmType" = 'Robusta' and isactive='1'`);

        const arabicaYieldQuery = `
            WITH pre AS (
            SELECT b.type, sum(b.weight) as weight FROM "PreprocessingData" a left join "ReceivingData" b on a."batchNumber" = b."batchNumber" group by b.type
            ),

            post as (
            SELECT type, SUM(weight) as weight FROM "PostprocessingData" group by type
            )

            SELECT yield as sum FROM (
            select
                a.type,
                a.weight as pre_weight,
                b.weight as post_weight,
                ROUND(((b.weight/a.weight)*100)::numeric, 2) as yield
            FROM pre a
            LEFT JOIN post b on a.type = b.type
            ) A
            WHERE type is not null
            AND type = 'Arabica'
        `;
        const robustaYieldQuery = `
            WITH pre AS (
            SELECT b.type, sum(b.weight) as weight FROM "PreprocessingData" a left join "ReceivingData" b on a."batchNumber" = b."batchNumber" group by b.type
            ),

            post as (
            SELECT type, SUM(weight) as weight FROM "PostprocessingData" group by type
            )

            SELECT yield as sum FROM (
            select
                a.type,
                a.weight as pre_weight,
                b.weight as post_weight,
                ROUND(((b.weight/a.weight)*100)::numeric, 2) as yield
            FROM pre a
            LEFT JOIN post b on a.type = b.type
            ) A
            WHERE type is not null
            AND type = 'Robusta'
        `;
        
        const pendingArabicaQCQuery = `
            SELECT COUNT(*) AS count FROM "ReceivingData" rd
            LEFT JOIN "QCData" qd ON rd."batchNumber" = qd."batchNumber"
            WHERE qd."batchNumber" IS NULL
            AND rd.type = 'Arabica'
        `;

        const pendingRobustaQCQuery = `
            SELECT COUNT(*) AS count FROM "ReceivingData" rd
            LEFT JOIN "QCData" qd ON rd."batchNumber" = qd."batchNumber"
            WHERE qd."batchNumber" IS NULL
            AND rd.type = 'Robusta'
        `;

        const pendingArabicaProcessingQuery = `
            SELECT COUNT(*) AS count FROM "QCData" qd
            LEFT JOIN "PreprocessingData" pd ON qd."batchNumber" = pd."batchNumber"
            LEFT JOIN "ReceivingData" rd on qd."batchNumber" = rd."batchNumber"
            WHERE pd."batchNumber" IS NULL
            AND rd.type = 'Arabica'
        `;

        const pendingArabicaWeightProcessingQuery = `
            SELECT COALESCE(SUM(rd.weight),0) as SUM FROM "QCData" qd
            LEFT JOIN "PreprocessingData" pd ON qd."batchNumber" = pd."batchNumber"
            LEFT JOIN "ReceivingData" rd on qd."batchNumber" = rd."batchNumber"
            WHERE pd."batchNumber" IS NULL
            AND rd.type = 'Arabica'
        `;

        const pendingRobustaProcessingQuery = `
            SELECT COUNT(*) AS count FROM "QCData" qd
            LEFT JOIN "PreprocessingData" pd ON qd."batchNumber" = pd."batchNumber"
            LEFT JOIN "ReceivingData" rd on qd."batchNumber" = rd."batchNumber"
            WHERE pd."batchNumber" IS NULL
            AND rd.type = 'Robusta'
        `;

        const pendingRobustaWeightProcessingQuery = `
            SELECT COALESCE(SUM(rd.weight),0) as SUM FROM "QCData" qd
            LEFT JOIN "PreprocessingData" pd ON qd."batchNumber" = pd."batchNumber"
            LEFT JOIN "ReceivingData" rd on qd."batchNumber" = rd."batchNumber"
            WHERE pd."batchNumber" IS NULL
            AND rd.type = 'Robusta'
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
                "referenceNumber" AS category, 
                COALESCE(SUM(weight), 0) AS weight, 
                DATE("storedDate") AS "storedDate" 
            FROM 
                "PostprocessingData" 
            WHERE 
                "storedDate" IS NOT NULL 
                AND DATE_TRUNC('month', "storedDate") = DATE_TRUNC('month', NOW()) 
                AND type = 'Arabica' 
            GROUP BY 
                "referenceNumber", 
                DATE("storedDate");
        `;

        const robustaTotalWeightbyDateQuery = `
            SELECT 
                "referenceNumber" AS category, 
                COALESCE(SUM(weight), 0) AS weight, 
                DATE("storedDate") AS "storedDate" 
            FROM 
                "PostprocessingData" 
            WHERE 
                "storedDate" IS NOT NULL 
                AND DATE_TRUNC('month', "storedDate") = DATE_TRUNC('month', NOW()) 
                AND type = 'Robusta' 
            GROUP BY 
                "referenceNumber", 
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

        // New Queries (using executeQuery helper and date filtering where needed)
        metrics.arabicaYield = await executeQuery(arabicaYieldQuery); // No date filtering
        metrics.robustaYield = await executeQuery(robustaYieldQuery); // No date filtering

        metrics.pendingArabicaQC = await executeQuery(pendingArabicaQCQuery); // No date filtering
        metrics.pendingRobustaQC = await executeQuery(pendingRobustaQCQuery); // No date filtering

        metrics.pendingArabicaProcessing = await executeQuery(pendingArabicaProcessingQuery); // No date filtering
        metrics.pendingArabicaWeightProcessing = await executeQuery(pendingArabicaWeightProcessingQuery); // No date filtering
        metrics.pendingRobustaProcessing = await executeQuery(pendingRobustaProcessingQuery); // No date filtering
        metrics.pendingRobustaWeightProcessing = await executeQuery(pendingRobustaWeightProcessingQuery); // No date filtering

        metrics.totalWeightBagsbyDate = await executeQuery(totalWeightBagsbyDateQuery); // No date filtering
        metrics.totalCostbyDate = await executeQuery(totalCostbyDateQuery); // No date filtering

        metrics.arabicaTotalWeightbyDate = await executeQuery(arabicaTotalWeightbyDateQuery); // No date filtering
        metrics.robustaTotalWeightbyDate = await executeQuery(robustaTotalWeightbyDateQuery); // No date filtering

        metrics.arabicaWeightMoM = await executeQuery(arabicaWeightMoMQuery); // No date filtering
        metrics.robustaWeightMoM = await executeQuery(robustaWeightMoMQuery); // No date filtering

        metrics.arabicaCostMoM = await executeQuery(arabicaCostMoMQuery); // No date filtering
        metrics.robustaCostMoM = await executeQuery(robustaCostMoMQuery); // No date filtering

        metrics.arabicaAvgCostMoM = await executeQuery(arabicaAvgCostMoMQuery); // No date filtering
        metrics.robustaAvgCostMoM = await executeQuery(robustaAvgCostMoMQuery); // No date filtering

        metrics.arabicaProcessedMoM = await executeQuery(arabicaProcessedMoMQuery); // No date filtering
        metrics.robustaProcessedMoM = await executeQuery(robustaProcessedMoMQuery); // No date filtering

        metrics.arabicaProductionMoM = await executeQuery(arabicaProductionMoMQuery); // No date filtering
        metrics.robustaProductionMoM = await executeQuery(robustaProductionMoMQuery); // No date filtering

        res.json(metrics);

    } catch (error) {
        console.error("Error in main route handler:", error);
        res.status(500).json({ error: "Failed to fetch dashboard metrics" });
    }
});

module.exports = router;