const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/dashboard-metrics', (req, res) => {
    const totalBatchesQuery = `SELECT COUNT(*) AS count FROM ReceivingData WHERE strftime('%Y-%m', ReceivingDate) = strftime('%Y-%m', 'now')`;
    
    const totalArabicaWeightQuery = `SELECT COALESCE(SUM(weight), 0) AS sum FROM ReceivingData WHERE strftime('%Y-%m', ReceivingDate) = strftime('%Y-%m', 'now') AND type = 'Arabica'`;
    const totalRobustaWeightQuery = `SELECT COALESCE(SUM(weight), 0) AS sum FROM ReceivingData WHERE strftime('%Y-%m', ReceivingDate) = strftime('%Y-%m', 'now') AND type = 'Robusta'`;
    const lastmonthArabicaWeightQuery = `SELECT COALESCE(SUM(weight), 0) AS sum FROM ReceivingData WHERE strftime('%Y-%m', ReceivingDate) = strftime('%Y-%m', 'now', '-1 month') AND strftime('%d', ReceivingDate) <= strftime('%d', 'now') AND type = 'Arabica'`;
    const lastmonthRobustaWeightQuery = `SELECT COALESCE(SUM(weight), 0) AS sum FROM ReceivingData WHERE strftime('%Y-%m', ReceivingDate) = strftime('%Y-%m', 'now', '-1 month') AND strftime('%d', ReceivingDate) <= strftime('%d', 'now') AND type = 'Robusta'`;
    
    const totalArabicaCostQuery = `SELECT COALESCE(SUM(price), 0) AS sum FROM ReceivingData WHERE strftime('%Y-%m', ReceivingDate) = strftime('%Y-%m', 'now') AND type = 'Arabica'`;
    const totalRobustaCostQuery = `SELECT COALESCE(SUM(price), 0) AS sum FROM ReceivingData WHERE strftime('%Y-%m', ReceivingDate) = strftime('%Y-%m', 'now') AND type = 'Robusta'`;
    const lastmonthArabicaCostQuery = `SELECT COALESCE(SUM(price), 0) AS sum FROM ReceivingData WHERE strftime('%Y-%m', ReceivingDate) = strftime('%Y-%m', 'now', '-1 month') AND strftime('%d', ReceivingDate) <= strftime('%d', 'now') AND type = 'Arabica'`;
    const lastmonthRobustaCostQuery = `SELECT COALESCE(SUM(price), 0) AS sum FROM ReceivingData WHERE strftime('%Y-%m', ReceivingDate) = strftime('%Y-%m', 'now', '-1 month') AND strftime('%d', ReceivingDate) <= strftime('%d', 'now') AND type = 'Robusta'`;
    
    const avgArabicaCostQuery = `SELECT COALESCE(ROUND(AVG(price), 1), 0) AS avg FROM ReceivingData WHERE strftime('%Y-%m', ReceivingDate) = strftime('%Y-%m', 'now') AND type = 'Arabica'`;
    const avgRobustaCostQuery = `SELECT COALESCE(ROUND(AVG(price), 1), 0) AS avg FROM ReceivingData WHERE strftime('%Y-%m', ReceivingDate) = strftime('%Y-%m', 'now') AND type = 'Robusta'`;
    const lastmonthAvgArabicaCostQuery = `SELECT COALESCE(ROUND(AVG(price), 1), 0) AS avg FROM ReceivingData WHERE strftime('%Y-%m', ReceivingDate) = strftime('%Y-%m', 'now', '-1 month') AND strftime('%d', ReceivingDate) <= strftime('%d', 'now') AND type = 'Arabica'`;
    const lastmonthAvgRobustaCostQuery = `SELECT COALESCE(ROUND(AVG(price), 1), 0) AS avg FROM ReceivingData WHERE strftime('%Y-%m', ReceivingDate) = strftime('%Y-%m', 'now', '-1 month') AND strftime('%d', ReceivingDate) <= strftime('%d', 'now') AND type = 'Robusta'`;
    
    const totalArabicaProcessedQuery = `SELECT COALESCE(ROUND(SUM((b.weight/b.totalBags)*a.bagsProcessed), 1), 0) AS sum FROM PreprocessingData a LEFT JOIN ReceivingData b on a.batchNumber = b.batchNumber WHERE strftime('%Y-%m', processingDate) = strftime('%Y-%m', 'now') AND type = 'Arabica'`;
    const totalRobustaProcessedQuery = `SELECT COALESCE(ROUND(SUM((b.weight/b.totalBags)*a.bagsProcessed), 1), 0) AS sum FROM PreprocessingData a LEFT JOIN ReceivingData b on a.batchNumber = b.batchNumber WHERE strftime('%Y-%m', processingDate) = strftime('%Y-%m', 'now') AND type = 'Robusta'`;
    const lastmonthArabicaProcessedQuery = `SELECT COALESCE(ROUND(SUM((b.weight/b.totalBags)*a.bagsProcessed), 1), 0) AS sum FROM PreprocessingData a LEFT JOIN ReceivingData b on a.batchNumber = b.batchNumber WHERE strftime('%Y-%m', processingDate) = strftime('%Y-%m', 'now', '-1 month') AND strftime('%d', processingDate) <= strftime('%d', 'now') AND type = 'Arabica'`;
    const lastmonthRobustaProcessedQuery = `SELECT COALESCE(ROUND(SUM((b.weight/b.totalBags)*a.bagsProcessed), 1), 0) AS sum FROM PreprocessingData a LEFT JOIN ReceivingData b on a.batchNumber = b.batchNumber WHERE strftime('%Y-%m', processingDate) = strftime('%Y-%m', 'now', '-1 month') AND strftime('%d', processingDate) <= strftime('%d', 'now') AND type = 'Robusta'`;

    const totalArabicaProductionQuery = `SELECT COALESCE(SUM(weight), 0) AS sum FROM PostprocessingData WHERE strftime('%Y-%m', storedDate) = strftime('%Y-%m', 'now') AND type = 'Arabica'`;
    const totalRobustaProductionQuery = `SELECT COALESCE(SUM(weight), 0) AS sum FROM PostprocessingData WHERE strftime('%Y-%m', storedDate) = strftime('%Y-%m', 'now') AND type = 'Robusta'`;
    const lastmonthArabicaProductionQuery = `SELECT COALESCE(SUM(weight), 0) AS sum FROM PostprocessingData WHERE strftime('%Y-%m', storedDate) = strftime('%Y-%m', 'now', '-1 month') AND strftime('%d', storedDate) <= strftime('%d', 'now') AND type = 'Arabica'`;
    const lastmonthRobustaProductionQuery = `SELECT COALESCE(SUM(weight), 0) AS sum FROM PostprocessingData WHERE strftime('%Y-%m', storedDate) = strftime('%Y-%m', 'now', '-1 month') AND strftime('%d', storedDate) <= strftime('%d', 'now') AND type = 'Robusta'`;

    const activeFarmersQuery = `SELECT SUM(isActive) AS count FROM Farmers`;
    
    // Query to get the count of batch numbers in ReceivingData but not in qcData
    const pendingQCQuery = `
        SELECT COUNT(*) AS count FROM ReceivingData rd
        LEFT JOIN qcData qd ON rd.batchNumber = qd.batchNumber
        WHERE qd.batchNumber IS NULL
    `;

    const pendingProcessingQuery = `
        SELECT COUNT(*) AS count FROM qcData qd
        LEFT JOIN PreprocessingData pd ON qd.batchNumber = pd.batchNumber
        WHERE pd.batchNumber IS NULL
    `;

    const totalWeightBagsbyDateQuery = `
        SELECT DATE(receivingDate) as DATE, SUM(weight) as TOTAL_WEIGHT, SUM(totalBags) as TOTAL_BAGS 
        FROM ReceivingData 
        GROUP BY DATE(receivingDate)
    `;

    const totalCostbyDateQuery = `
        SELECT DATE(receivingDate) as DATE, SUM(price) as PRICE FROM ReceivingData GROUP BY DATE(receivingDate)
    `;

    const arabicaTotalWeightbyDateQuery = `
        SELECT COALESCE(quality || ' ' || processingType,'N/A') as category, COALESCE(SUM(weight), 0) as weight, COALESCE(date(storedDate),'N/A') as storedDate from PostprocessingData WHERE strftime('%Y-%m', storedDate) = strftime('%Y-%m', 'now') AND type = 'Arabica' GROUP BY COALESCE(quality || ' ' || processingType,'N/A'), COALESCE(date(storedDate),'N/A')
    `;

    const robustaTotalWeightbyDateQuery = `
        SELECT COALESCE(quality || ' ' || processingType,'N/A') as category, COALESCE(SUM(weight), 0) as weight, COALESCE(date(storedDate),'N/A') as storedDate from PostprocessingData WHERE strftime('%Y-%m', storedDate) = strftime('%Y-%m', 'now') AND type = 'Robusta' GROUP BY COALESCE(quality || ' ' || processingType,'N/A'), COALESCE(date(storedDate),'N/A')
    `;

    const arabicaWeightMoMQuery = `
        WITH RECURSIVE DateRange AS (
        SELECT DATE('now', 'start of month') AS Date -- Start of the current month
        UNION ALL
        SELECT DATE(Date, '+1 day') -- Add one day to the previous date
        FROM DateRange
        WHERE Date < DATE('now') -- Stop at today's date
        ),
        RDA AS (
        SELECT ReceivingDate, COALESCE(SUM(Weight), 0) AS TotalWeightThisMonth
        FROM ReceivingData 
        WHERE strftime('%Y-%m', ReceivingDate) = strftime('%Y-%m', 'now')
        AND type = 'Arabica'
        GROUP BY strftime('%d', ReceivingDate)
        ),
        RDB AS (
        SELECT ReceivingDate, COALESCE(SUM(Weight), 0) AS TotalWeightLastMonth
        FROM ReceivingData 
        WHERE strftime('%Y-%m', ReceivingDate) = strftime('%Y-%m', 'now', '-1 month') AND strftime('%d', ReceivingDate) <= strftime('%d', 'now')
        AND type = 'Arabica'
        GROUP BY strftime('%d', ReceivingDate)
        )
        SELECT 
            CASE strftime('%m', a.Date)
                WHEN '01' THEN 'Jan'
                WHEN '02' THEN 'Feb'
                WHEN '03' THEN 'Mar'
                WHEN '04' THEN 'Apr'
                WHEN '05' THEN 'May'
                WHEN '06' THEN 'Jun'
                WHEN '07' THEN 'Jul'
                WHEN '08' THEN 'Aug'
                WHEN '09' THEN 'Sep'
                WHEN '10' THEN 'Oct'
                WHEN '11' THEN 'Nov'
                WHEN '12' THEN 'Dec'
            END || '-' || strftime('%d', a.Date) AS Date,
            SUM(COALESCE(b.TotalWeightThisMonth, 0)) OVER (ORDER BY a.Date) AS TotalWeightThisMonth, 
            SUM(COALESCE(c.TotalWeightLastMonth, 0)) OVER (ORDER BY a.Date) AS TotalWeightLastMonth
        FROM DateRange a
        LEFT JOIN RDA b ON a.Date = b.ReceivingDate
        LEFT JOIN RDB c ON strftime('%d', a.date) = strftime('%d', c.ReceivingDate)
        ;
    `

    const robustaWeightMoMQuery = `
        WITH RECURSIVE DateRange AS (
        SELECT DATE('now', 'start of month') AS Date -- Start of the current month
        UNION ALL
        SELECT DATE(Date, '+1 day') -- Add one day to the previous date
        FROM DateRange
        WHERE Date < DATE('now') -- Stop at today's date
        ),
        RDA AS (
        SELECT ReceivingDate, COALESCE(SUM(Weight), 0) AS TotalWeightThisMonth
        FROM ReceivingData 
        WHERE strftime('%Y-%m', ReceivingDate) = strftime('%Y-%m', 'now')
        AND type = 'Robusta'
        GROUP BY strftime('%d', ReceivingDate)
        ),
        RDB AS (
        SELECT ReceivingDate, COALESCE(SUM(Weight), 0) AS TotalWeightLastMonth
        FROM ReceivingData 
        WHERE strftime('%Y-%m', ReceivingDate) = strftime('%Y-%m', 'now', '-1 month') AND strftime('%d', ReceivingDate) <= strftime('%d', 'now')
        AND type = 'Robusta'
        GROUP BY strftime('%d', ReceivingDate)
        )
        SELECT 
            CASE strftime('%m', a.Date)
                WHEN '01' THEN 'Jan'
                WHEN '02' THEN 'Feb'
                WHEN '03' THEN 'Mar'
                WHEN '04' THEN 'Apr'
                WHEN '05' THEN 'May'
                WHEN '06' THEN 'Jun'
                WHEN '07' THEN 'Jul'
                WHEN '08' THEN 'Aug'
                WHEN '09' THEN 'Sep'
                WHEN '10' THEN 'Oct'
                WHEN '11' THEN 'Nov'
                WHEN '12' THEN 'Dec'
            END || '-' || strftime('%d', a.Date) AS Date,
            SUM(COALESCE(b.TotalWeightThisMonth, 0)) OVER (ORDER BY a.Date) AS TotalWeightThisMonth, 
            SUM(COALESCE(c.TotalWeightLastMonth, 0)) OVER (ORDER BY a.Date) AS TotalWeightLastMonth
        FROM DateRange a
        LEFT JOIN RDA b ON a.Date = b.ReceivingDate
        LEFT JOIN RDB c ON strftime('%d', a.date) = strftime('%d', c.ReceivingDate)
        ;
    `

    const arabicaCostMoMQuery = `
        WITH RECURSIVE DateRange AS (    
        SELECT DATE('now', 'start of month') AS Date -- Start of the current month
        UNION ALL
        SELECT DATE(Date, '+1 day') -- Add one day to the previous date
        FROM DateRange
        WHERE Date < DATE('now') -- Stop at today's date
        ),
        RDA AS (
        SELECT ReceivingDate, COALESCE(SUM(price), 0) AS TotalPriceThisMonth
        FROM ReceivingData 
        WHERE strftime('%Y-%m', ReceivingDate) = strftime('%Y-%m', 'now')
        AND type = 'Arabica'
        GROUP BY strftime('%d', ReceivingDate)
        ),
        RDB AS (
        SELECT ReceivingDate, COALESCE(SUM(price), 0) AS TotalPriceLastMonth
        FROM ReceivingData 
        WHERE strftime('%Y-%m', ReceivingDate) = strftime('%Y-%m', 'now', '-1 month') AND strftime('%d', ReceivingDate) <= strftime('%d', 'now')
        AND type = 'Arabica'
        GROUP BY strftime('%d', ReceivingDate)
        )
        SELECT 
            CASE strftime('%m', a.Date)
                WHEN '01' THEN 'Jan'
                WHEN '02' THEN 'Feb'
                WHEN '03' THEN 'Mar'
                WHEN '04' THEN 'Apr'
                WHEN '05' THEN 'May'
                WHEN '06' THEN 'Jun'
                WHEN '07' THEN 'Jul'
                WHEN '08' THEN 'Aug'
                WHEN '09' THEN 'Sep'
                WHEN '10' THEN 'Oct'
                WHEN '11' THEN 'Nov'
                WHEN '12' THEN 'Dec'
            END || '-' || strftime('%d', a.Date) AS Date,
            SUM(COALESCE(b.TotalPriceThisMonth, 0)) OVER (ORDER BY a.Date) AS TotalCostThisMonth, 
            SUM(COALESCE(c.TotalPriceLastMonth, 0)) OVER (ORDER BY a.Date) AS TotalCostLastMonth
        FROM DateRange a
        LEFT JOIN RDA b ON a.Date = b.ReceivingDate
        LEFT JOIN RDB c ON strftime('%d', a.date) = strftime('%d', c.ReceivingDate)
        ;
    `

    const robustaCostMoMQuery = `
        WITH RECURSIVE DateRange AS (    
        SELECT DATE('now', 'start of month') AS Date -- Start of the current month
        UNION ALL
        SELECT DATE(Date, '+1 day') -- Add one day to the previous date
        FROM DateRange
        WHERE Date < DATE('now') -- Stop at today's date
        ),
        RDA AS (
        SELECT ReceivingDate, COALESCE(SUM(price), 0) AS TotalPriceThisMonth
        FROM ReceivingData 
        WHERE strftime('%Y-%m', ReceivingDate) = strftime('%Y-%m', 'now')
        AND type = 'Robusta'
        GROUP BY strftime('%d', ReceivingDate)
        ),
        RDB AS (
        SELECT ReceivingDate, COALESCE(SUM(price), 0) AS TotalPriceLastMonth
        FROM ReceivingData 
        WHERE strftime('%Y-%m', ReceivingDate) = strftime('%Y-%m', 'now', '-1 month') AND strftime('%d', ReceivingDate) <= strftime('%d', 'now')
        AND type = 'Robusta'
        GROUP BY strftime('%d', ReceivingDate)
        )
        SELECT 
            CASE strftime('%m', a.Date)
                WHEN '01' THEN 'Jan'
                WHEN '02' THEN 'Feb'
                WHEN '03' THEN 'Mar'
                WHEN '04' THEN 'Apr'
                WHEN '05' THEN 'May'
                WHEN '06' THEN 'Jun'
                WHEN '07' THEN 'Jul'
                WHEN '08' THEN 'Aug'
                WHEN '09' THEN 'Sep'
                WHEN '10' THEN 'Oct'
                WHEN '11' THEN 'Nov'
                WHEN '12' THEN 'Dec'
            END || '-' || strftime('%d', a.Date) AS Date,
            SUM(COALESCE(b.TotalPriceThisMonth, 0)) OVER (ORDER BY a.Date) AS TotalCostThisMonth, 
            SUM(COALESCE(c.TotalPriceLastMonth, 0)) OVER (ORDER BY a.Date) AS TotalCostLastMonth
        FROM DateRange a
        LEFT JOIN RDA b ON a.Date = b.ReceivingDate
        LEFT JOIN RDB c ON strftime('%d', a.date) = strftime('%d', c.ReceivingDate)
        ;
    `

    const arabicaAvgCostMoMQuery = `
        WITH RECURSIVE DateRange AS (    
            SELECT DATE('now', 'start of month') AS Date -- Start of the current month
            UNION ALL
            SELECT DATE(Date, '+1 day') -- Add one day to the previous date
            FROM DateRange
            WHERE Date < DATE('now') -- Stop at today's date
        ),
        RDA AS (
            SELECT 
                ReceivingDate, 
                COALESCE(SUM(price), 0) AS TotalPriceThisMonth,
                COUNT(price) AS CountThisMonth
            FROM ReceivingData 
            WHERE strftime('%Y-%m', ReceivingDate) = strftime('%Y-%m', 'now')
            AND type = 'Arabica'
            GROUP BY strftime('%d', ReceivingDate)
        ),
        RDB AS (
            SELECT 
                ReceivingDate, 
                COALESCE(SUM(price), 0) AS TotalPriceLastMonth,
                COUNT(price) AS CountLastMonth
            FROM ReceivingData 
            WHERE strftime('%Y-%m', ReceivingDate) = strftime('%Y-%m', 'now', '-1 month') AND strftime('%d', ReceivingDate) <= strftime('%d', 'now')
            AND type = 'Arabica'
            GROUP BY strftime('%d', ReceivingDate)
        ),
        Cumulative AS (
            SELECT 
                a.Date,
                SUM(COALESCE(b.TotalPriceThisMonth, 0)) OVER (ORDER BY a.Date) AS CumulativePriceThisMonth,
                SUM(COALESCE(b.CountThisMonth, 0)) OVER (ORDER BY a.Date) AS CumulativeCountThisMonth,
                SUM(COALESCE(c.TotalPriceLastMonth, 0)) OVER (ORDER BY a.Date) AS CumulativePriceLastMonth,
                SUM(COALESCE(c.CountLastMonth, 0)) OVER (ORDER BY a.Date) AS CumulativeCountLastMonth
            FROM DateRange a
            LEFT JOIN RDA b ON a.Date = b.ReceivingDate
            LEFT JOIN RDB c ON strftime('%d', a.Date) = strftime('%d', c.ReceivingDate)
        )
        SELECT 
            CASE strftime('%m', Date)
                WHEN '01' THEN 'Jan'
                WHEN '02' THEN 'Feb'
                WHEN '03' THEN 'Mar'
                WHEN '04' THEN 'Apr'
                WHEN '05' THEN 'May'
                WHEN '06' THEN 'Jun'
                WHEN '07' THEN 'Jul'
                WHEN '08' THEN 'Aug'
                WHEN '09' THEN 'Sep'
                WHEN '10' THEN 'Oct'
                WHEN '11' THEN 'Nov'
                WHEN '12' THEN 'Dec'
            END || '-' || strftime('%d', Date) AS Date,
            CASE 
                WHEN CumulativeCountThisMonth > 0 THEN CumulativePriceThisMonth * 1.0 / CumulativeCountThisMonth 
                ELSE 0 
            END AS RunningAverageCostThisMonth,
            CASE 
                WHEN CumulativeCountLastMonth > 0 THEN CumulativePriceLastMonth * 1.0 / CumulativeCountLastMonth 
                ELSE 0 
            END AS RunningAverageCostLastMonth
        FROM Cumulative;
    `

    const robustaAvgCostMoMQuery = `
        WITH RECURSIVE DateRange AS (    
            SELECT DATE('now', 'start of month') AS Date -- Start of the current month
            UNION ALL
            SELECT DATE(Date, '+1 day') -- Add one day to the previous date
            FROM DateRange
            WHERE Date < DATE('now') -- Stop at today's date
        ),
        RDA AS (
            SELECT 
                ReceivingDate, 
                COALESCE(SUM(price), 0) AS TotalPriceThisMonth,
                COUNT(price) AS CountThisMonth
            FROM ReceivingData 
            WHERE strftime('%Y-%m', ReceivingDate) = strftime('%Y-%m', 'now')
            AND type = 'Robusta'
            GROUP BY strftime('%d', ReceivingDate)
        ),
        RDB AS (
            SELECT 
                ReceivingDate, 
                COALESCE(SUM(price), 0) AS TotalPriceLastMonth,
                COUNT(price) AS CountLastMonth
            FROM ReceivingData 
            WHERE strftime('%Y-%m', ReceivingDate) = strftime('%Y-%m', 'now', '-1 month') AND strftime('%d', ReceivingDate) <= strftime('%d', 'now')
            AND type = 'Robusta'
            GROUP BY strftime('%d', ReceivingDate)
        ),
        Cumulative AS (
            SELECT 
                a.Date,
                SUM(COALESCE(b.TotalPriceThisMonth, 0)) OVER (ORDER BY a.Date) AS CumulativePriceThisMonth,
                SUM(COALESCE(b.CountThisMonth, 0)) OVER (ORDER BY a.Date) AS CumulativeCountThisMonth,
                SUM(COALESCE(c.TotalPriceLastMonth, 0)) OVER (ORDER BY a.Date) AS CumulativePriceLastMonth,
                SUM(COALESCE(c.CountLastMonth, 0)) OVER (ORDER BY a.Date) AS CumulativeCountLastMonth
            FROM DateRange a
            LEFT JOIN RDA b ON a.Date = b.ReceivingDate
            LEFT JOIN RDB c ON strftime('%d', a.Date) = strftime('%d', c.ReceivingDate)
        )
        SELECT 
            CASE strftime('%m', Date)
                WHEN '01' THEN 'Jan'
                WHEN '02' THEN 'Feb'
                WHEN '03' THEN 'Mar'
                WHEN '04' THEN 'Apr'
                WHEN '05' THEN 'May'
                WHEN '06' THEN 'Jun'
                WHEN '07' THEN 'Jul'
                WHEN '08' THEN 'Aug'
                WHEN '09' THEN 'Sep'
                WHEN '10' THEN 'Oct'
                WHEN '11' THEN 'Nov'
                WHEN '12' THEN 'Dec'
            END || '-' || strftime('%d', Date) AS Date,
            CASE 
                WHEN CumulativeCountThisMonth > 0 THEN CumulativePriceThisMonth * 1.0 / CumulativeCountThisMonth 
                ELSE 0 
            END AS RunningAverageCostThisMonth,
            CASE 
                WHEN CumulativeCountLastMonth > 0 THEN CumulativePriceLastMonth * 1.0 / CumulativeCountLastMonth 
                ELSE 0 
            END AS RunningAverageCostLastMonth
        FROM Cumulative;
    `

    const arabicaProcessedMoMQuery = `
        WITH RECURSIVE DateRange AS (
        SELECT DATE('now', 'start of month') AS Date -- Start of the current month
        UNION ALL
        SELECT DATE(Date, '+1 day') -- Add one day to the previous date
        FROM DateRange
        WHERE Date < DATE('now') -- Stop at today's date
        ),
        RDA AS (
        SELECT DATE(processingDate) as processingDate, COALESCE(ROUND(SUM((b.weight/b.totalBags)*a.bagsProcessed), 1), 0) AS TotalWeightThisMonth
        FROM PreprocessingData a LEFT JOIN ReceivingData b on a.batchNumber = b.batchNumber
        WHERE strftime('%Y-%m', processingDate) = strftime('%Y-%m', 'now')
        AND type = 'Arabica'
        GROUP BY strftime('%d', processingDate)
        ),
        RDB AS (
        SELECT DATE(processingDate) as processingDate, COALESCE(ROUND(SUM((b.weight/b.totalBags)*a.bagsProcessed), 1), 0) AS TotalWeightLastMonth
        FROM PreprocessingData a LEFT JOIN ReceivingData b on a.batchNumber = b.batchNumber
        WHERE strftime('%Y-%m', processingDate) = strftime('%Y-%m', 'now', '-1 month') AND strftime('%d', processingDate) <= strftime('%d', 'now')
        AND type = 'Arabica'
        GROUP BY strftime('%d', processingDate)
        )
        SELECT 
            CASE strftime('%m', a.Date)
                WHEN '01' THEN 'Jan'
                WHEN '02' THEN 'Feb'
                WHEN '03' THEN 'Mar'
                WHEN '04' THEN 'Apr'
                WHEN '05' THEN 'May'
                WHEN '06' THEN 'Jun'
                WHEN '07' THEN 'Jul'
                WHEN '08' THEN 'Aug'
                WHEN '09' THEN 'Sep'
                WHEN '10' THEN 'Oct'
                WHEN '11' THEN 'Nov'
                WHEN '12' THEN 'Dec'
            END || '-' || strftime('%d', a.Date) AS Date,
            SUM(COALESCE(b.TotalWeightThisMonth, 0)) OVER (ORDER BY a.Date) AS TotalWeightThisMonth, 
            SUM(COALESCE(c.TotalWeightLastMonth, 0)) OVER (ORDER BY a.Date) AS TotalWeightLastMonth
        FROM DateRange a
        LEFT JOIN RDA b ON a.Date = b.processingDate
        LEFT JOIN RDB c ON strftime('%d', a.date) = strftime('%d', c.processingDate)
        ;
    `

    const robustaProcessedMoMQuery = `
        WITH RECURSIVE DateRange AS (
        SELECT DATE('now', 'start of month') AS Date -- Start of the current month
        UNION ALL
        SELECT DATE(Date, '+1 day') -- Add one day to the previous date
        FROM DateRange
        WHERE Date < DATE('now') -- Stop at today's date
        ),
        RDA AS (
        SELECT DATE(processingDate) as processingDate, COALESCE(ROUND(SUM((b.weight/b.totalBags)*a.bagsProcessed), 1), 0) AS TotalWeightThisMonth
        FROM PreprocessingData a LEFT JOIN ReceivingData b on a.batchNumber = b.batchNumber
        WHERE strftime('%Y-%m', processingDate) = strftime('%Y-%m', 'now')
        AND type = 'Robusta'
        GROUP BY strftime('%d', processingDate)
        ),
        RDB AS (
        SELECT DATE(processingDate) as processingDate, COALESCE(ROUND(SUM((b.weight/b.totalBags)*a.bagsProcessed), 1), 0) AS TotalWeightLastMonth
        FROM PreprocessingData a LEFT JOIN ReceivingData b on a.batchNumber = b.batchNumber
        WHERE strftime('%Y-%m', processingDate) = strftime('%Y-%m', 'now', '-1 month') AND strftime('%d', processingDate) <= strftime('%d', 'now')
        AND type = 'Robusta'
        GROUP BY strftime('%d', processingDate)
        )
        SELECT 
            CASE strftime('%m', a.Date)
                WHEN '01' THEN 'Jan'
                WHEN '02' THEN 'Feb'
                WHEN '03' THEN 'Mar'
                WHEN '04' THEN 'Apr'
                WHEN '05' THEN 'May'
                WHEN '06' THEN 'Jun'
                WHEN '07' THEN 'Jul'
                WHEN '08' THEN 'Aug'
                WHEN '09' THEN 'Sep'
                WHEN '10' THEN 'Oct'
                WHEN '11' THEN 'Nov'
                WHEN '12' THEN 'Dec'
            END || '-' || strftime('%d', a.Date) AS Date,
            SUM(COALESCE(b.TotalWeightThisMonth, 0)) OVER (ORDER BY a.Date) AS TotalWeightThisMonth, 
            SUM(COALESCE(c.TotalWeightLastMonth, 0)) OVER (ORDER BY a.Date) AS TotalWeightLastMonth
        FROM DateRange a
        LEFT JOIN RDA b ON a.Date = b.processingDate
        LEFT JOIN RDB c ON strftime('%d', a.date) = strftime('%d', c.processingDate)
        ;
    `

    const arabicaProductionMoMQuery = `
        WITH RECURSIVE DateRange AS (
        SELECT DATE('now', 'start of month') AS Date -- Start of the current month
        UNION ALL
        SELECT DATE(Date, '+1 day') -- Add one day to the previous date
        FROM DateRange
        WHERE Date < DATE('now') -- Stop at today's date
        ),
        RDA AS (
        SELECT DATE(storedDate) as storedDate, COALESCE(SUM(Weight), 0) AS TotalWeightThisMonth
        FROM PostprocessingData 
        WHERE strftime('%Y-%m', storedDate) = strftime('%Y-%m', 'now')
        AND type = 'Arabica'
        GROUP BY strftime('%d', storedDate)
        ),
        RDB AS (
        SELECT DATE(storedDate) as storedDate, COALESCE(SUM(Weight), 0) AS TotalWeightLastMonth
        FROM PostprocessingData 
        WHERE strftime('%Y-%m', storedDate) = strftime('%Y-%m', 'now', '-1 month') AND strftime('%d', storedDate) <= strftime('%d', 'now')
        AND type = 'Arabica'
        GROUP BY strftime('%d', storedDate)
        )
        SELECT 
            CASE strftime('%m', a.Date)
                WHEN '01' THEN 'Jan'
                WHEN '02' THEN 'Feb'
                WHEN '03' THEN 'Mar'
                WHEN '04' THEN 'Apr'
                WHEN '05' THEN 'May'
                WHEN '06' THEN 'Jun'
                WHEN '07' THEN 'Jul'
                WHEN '08' THEN 'Aug'
                WHEN '09' THEN 'Sep'
                WHEN '10' THEN 'Oct'
                WHEN '11' THEN 'Nov'
                WHEN '12' THEN 'Dec'
            END || '-' || strftime('%d', a.Date) AS Date,
            SUM(COALESCE(b.TotalWeightThisMonth, 0)) OVER (ORDER BY a.Date) AS TotalWeightThisMonth, 
            SUM(COALESCE(c.TotalWeightLastMonth, 0)) OVER (ORDER BY a.Date) AS TotalWeightLastMonth
        FROM DateRange a
        LEFT JOIN RDA b ON a.Date = b.storedDate
        LEFT JOIN RDB c ON strftime('%d', a.date) = strftime('%d', c.storedDate)
        ;
    `

    const robustaProductionMoMQuery = `
        WITH RECURSIVE DateRange AS (
        SELECT DATE('now', 'start of month') AS Date -- Start of the current month
        UNION ALL
        SELECT DATE(Date, '+1 day') -- Add one day to the previous date
        FROM DateRange
        WHERE Date < DATE('now') -- Stop at today's date
        ),
        RDA AS (
        SELECT DATE(storedDate) as storedDate, COALESCE(SUM(Weight), 0) AS TotalWeightThisMonth
        FROM PostprocessingData 
        WHERE strftime('%Y-%m', storedDate) = strftime('%Y-%m', 'now')
        AND type = 'Robusta'
        GROUP BY strftime('%d', storedDate)
        ),
        RDB AS (
        SELECT DATE(storedDate) as storedDate, COALESCE(SUM(Weight), 0) AS TotalWeightLastMonth
        FROM PostprocessingData 
        WHERE strftime('%Y-%m', storedDate) = strftime('%Y-%m', 'now', '-1 month') AND strftime('%d', storedDate) <= strftime('%d', 'now')
        AND type = 'Robusta'
        GROUP BY strftime('%d', storedDate)
        )
        SELECT 
            CASE strftime('%m', a.Date)
                WHEN '01' THEN 'Jan'
                WHEN '02' THEN 'Feb'
                WHEN '03' THEN 'Mar'
                WHEN '04' THEN 'Apr'
                WHEN '05' THEN 'May'
                WHEN '06' THEN 'Jun'
                WHEN '07' THEN 'Jul'
                WHEN '08' THEN 'Aug'
                WHEN '09' THEN 'Sep'
                WHEN '10' THEN 'Oct'
                WHEN '11' THEN 'Nov'
                WHEN '12' THEN 'Dec'
            END || '-' || strftime('%d', a.Date) AS Date,
            SUM(COALESCE(b.TotalWeightThisMonth, 0)) OVER (ORDER BY a.Date) AS TotalWeightThisMonth, 
            SUM(COALESCE(c.TotalWeightLastMonth, 0)) OVER (ORDER BY a.Date) AS TotalWeightLastMonth
        FROM DateRange a
        LEFT JOIN RDA b ON a.Date = b.storedDate
        LEFT JOIN RDB c ON strftime('%d', a.date) = strftime('%d', c.storedDate)
        ;
    `


    const queries = [
        new Promise((resolve, reject) =>
            db.get(totalBatchesQuery, [], (err, row) => (err ? reject(err) : resolve(row)))
        ),


        new Promise((resolve, reject) =>
            db.get(totalArabicaWeightQuery, [], (err, row) => (err ? reject(err) : resolve(row)))
        ),
        new Promise((resolve, reject) =>
            db.get(totalRobustaWeightQuery, [], (err, row) => (err ? reject(err) : resolve(row)))
        ),
        new Promise((resolve, reject) =>
            db.get(lastmonthArabicaWeightQuery, [], (err, row) => (err ? reject(err) : resolve(row)))
        ),
        new Promise((resolve, reject) =>
            db.get(lastmonthRobustaWeightQuery, [], (err, row) => (err ? reject(err) : resolve(row)))
        ),


        new Promise((resolve, reject) =>
            db.get(totalArabicaCostQuery, [], (err, row) => (err ? reject(err) : resolve(row)))
        ),
        new Promise((resolve, reject) =>
            db.get(totalRobustaCostQuery, [], (err, row) => (err ? reject(err) : resolve(row)))
        ),
        new Promise((resolve, reject) =>
            db.get(lastmonthArabicaCostQuery, [], (err, row) => (err ? reject(err) : resolve(row)))
        ),
        new Promise((resolve, reject) =>
            db.get(lastmonthRobustaCostQuery, [], (err, row) => (err ? reject(err) : resolve(row)))
        ),



        new Promise((resolve, reject) =>
            db.get(avgArabicaCostQuery, [], (err, row) => (err ? reject(err) : resolve(row)))
        ),
        new Promise((resolve, reject) =>
            db.get(avgRobustaCostQuery, [], (err, row) => (err ? reject(err) : resolve(row)))
        ),
        new Promise((resolve, reject) =>
            db.get(lastmonthAvgArabicaCostQuery, [], (err, row) => (err ? reject(err) : resolve(row)))
        ),
        new Promise((resolve, reject) =>
            db.get(lastmonthAvgRobustaCostQuery, [], (err, row) => (err ? reject(err) : resolve(row)))
        ),

        
        new Promise((resolve, reject) =>
            db.get(totalArabicaProcessedQuery, [], (err, row) => (err ? reject(err) : resolve(row)))
        ),
        new Promise((resolve, reject) =>
            db.get(totalRobustaProcessedQuery, [], (err, row) => (err ? reject(err) : resolve(row)))
        ),
        new Promise((resolve, reject) =>
            db.get(lastmonthArabicaProcessedQuery, [], (err, row) => (err ? reject(err) : resolve(row)))
        ),
        new Promise((resolve, reject) =>
            db.get(lastmonthRobustaProcessedQuery, [], (err, row) => (err ? reject(err) : resolve(row)))
        ),



        new Promise((resolve, reject) =>
            db.get(totalArabicaProductionQuery, [], (err, row) => (err ? reject(err) : resolve(row)))
        ),
        new Promise((resolve, reject) =>
            db.get(totalRobustaProductionQuery, [], (err, row) => (err ? reject(err) : resolve(row)))
        ),
        new Promise((resolve, reject) =>
            db.get(lastmonthArabicaProductionQuery, [], (err, row) => (err ? reject(err) : resolve(row)))
        ),
        new Promise((resolve, reject) =>
            db.get(lastmonthRobustaProductionQuery, [], (err, row) => (err ? reject(err) : resolve(row)))
        ),



        new Promise((resolve, reject) =>
            db.get(activeFarmersQuery, [], (err, row) => (err ? reject(err) : resolve(row)))
        ),
        new Promise((resolve, reject) =>
            db.get(pendingQCQuery, [], (err, row) => (err ? reject(err) : resolve(row)))
        ),
        new Promise((resolve, reject) =>
            db.get(pendingProcessingQuery, [], (err, row) => (err ? reject(err) : resolve(row)))
        ),
        new Promise((resolve, reject) =>
            db.all(totalWeightBagsbyDateQuery, [], (err, rows) => (err ? reject(err) : resolve(rows)))
        ),
        new Promise((resolve, reject) =>
            db.all(totalCostbyDateQuery, [], (err, rows) => (err ? reject(err) : resolve(rows)))
        ),
        new Promise((resolve, reject) =>
            db.all(arabicaTotalWeightbyDateQuery, [], (err, rows) => (err ? reject(err) : resolve(rows)))
        ),
        new Promise((resolve, reject) =>
            db.all(robustaTotalWeightbyDateQuery, [], (err, rows) => (err ? reject(err) : resolve(rows)))
        ),



        new Promise((resolve, reject) =>
            db.all(arabicaWeightMoMQuery, [], (err, rows) => (err ? reject(err) : resolve(rows)))
        ),
        new Promise((resolve, reject) =>
            db.all(robustaWeightMoMQuery, [], (err, rows) => (err ? reject(err) : resolve(rows)))
        ),



        new Promise((resolve, reject) =>
            db.all(arabicaCostMoMQuery, [], (err, rows) => (err ? reject(err) : resolve(rows)))
        ),
        new Promise((resolve, reject) =>
            db.all(robustaCostMoMQuery, [], (err, rows) => (err ? reject(err) : resolve(rows)))
        ),
        
        

        new Promise((resolve, reject) =>
            db.all(arabicaAvgCostMoMQuery, [], (err, rows) => (err ? reject(err) : resolve(rows)))
        ),
        new Promise((resolve, reject) =>
            db.all(robustaAvgCostMoMQuery, [], (err, rows) => (err ? reject(err) : resolve(rows)))
        ),



        new Promise((resolve, reject) =>
            db.all(arabicaProcessedMoMQuery, [], (err, rows) => (err ? reject(err) : resolve(rows)))
        ),
        new Promise((resolve, reject) =>
            db.all(robustaProcessedMoMQuery, [], (err, rows) => (err ? reject(err) : resolve(rows)))
        ),



        new Promise((resolve, reject) =>
            db.all(arabicaProductionMoMQuery, [], (err, rows) => (err ? reject(err) : resolve(rows)))
        ),
        new Promise((resolve, reject) =>
            db.all(robustaProductionMoMQuery, [], (err, rows) => (err ? reject(err) : resolve(rows)))
        ),
    ];

    Promise.all(queries)
        .then(([
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

            arabicaWeightMoM, 
            robustaWeightMoM, 

            arabicaCostMoM, 
            robustaCostMoM,

            arabicaAvgCostMoM,
            robustaAvgCostMoM,

            arabicaProcessedMoM,
            robustaProcessedMoM,

            arabicaProductionMoM,
            robustaProductionMoM

        ]) => {
            res.json({
                totalBatches: totalBatches.count || 0,

                totalArabicaWeight: totalArabicaWeight.sum || 0,
                totalRobustaWeight: totalRobustaWeight.sum || 0,
                lastmonthArabicaWeight: lastmonthArabicaWeight.sum || 0,
                lastmonthRobustaWeight: lastmonthRobustaWeight.sum || 0,

                totalArabicaCost: totalArabicaCost.sum || 0,
                totalRobustaCost: totalRobustaCost.sum || 0,
                lastmonthArabicaCost: lastmonthArabicaCost.sum || 0,
                lastmonthRobustaCost: lastmonthRobustaCost.sum || 0,

                avgArabicaCost: avgArabicaCost.avg || 0,
                avgRobustaCost: avgRobustaCost.avg || 0,
                lastmonthAvgArabicaCost: lastmonthAvgArabicaCost.avg || 0,
                lastmonthAvgRobustaCost: lastmonthAvgRobustaCost.avg || 0,

                totalArabicaProcessed: totalArabicaProcessed.sum || 0,
                totalRobustaProcessed: totalRobustaProcessed.sum || 0,
                lastmonthArabicaProcessed: lastmonthArabicaProcessed.sum || 0,
                lastmonthRobustaProcessed: lastmonthRobustaProcessed.sum || 0,

                totalArabicaProduction: totalArabicaProduction.sum || 0,
                totalRobustaProduction: totalRobustaProduction.sum || 0,
                lastmonthArabicaProduction: lastmonthArabicaProduction.sum || 0,
                lastmonthRobustaProduction: lastmonthRobustaProduction.sum || 0,

                activeFarmers: activeFarmers.count || 0,
                pendingQC: pendingQC.count || 0,
                pendingProcessing: pendingProcessing.count || 0,

                totalWeightBagsbyDate: totalWeightBagsbyDate || [], // Return as an array
                totalCostbyDate: totalCostbyDate || [], // Return as an array

                arabicaTotalWeightbyDate: arabicaTotalWeightbyDate || [], // Return as an array
                robustaTotalWeightbyDate: robustaTotalWeightbyDate || [], // Return as an array

                arabicaWeightMoM: arabicaWeightMoM || [], // Return as an array
                robustaWeightMoM: robustaWeightMoM || [], // Return as an array

                arabicaCostMoM: arabicaCostMoM || [],
                robustaCostMoM: robustaCostMoM || [],

                arabicaAvgCostMoM: arabicaAvgCostMoM || [],
                robustaAvgCostMoM: robustaAvgCostMoM || [],

                arabicaProcessedMoM: arabicaProcessedMoM || [],
                robustaProcessedMoM: robustaProcessedMoM || [],

                arabicaProductionMoM: arabicaProductionMoM || [],
                robustaProductionMoM: robustaProductionMoM || [],
            });
        })
        .catch((err) => {
            console.error('Error fetching dashboard metrics:', err);
            res.status(500).json({ message: 'Failed to fetch dashboard metrics.' });
        });
});

module.exports = router;