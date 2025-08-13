const express = require('express');
const router = express.Router();
const sequelize = require('../config/database'); // Assuming this is your Sequelize instance

// Helper function to calculate date ranges based on the selected timeframe
const getDateRanges = (timeframe) => {
    const now = new Date();
    const result = {};
  
    switch (timeframe) {
      case 'this_week':
        // Calculate Monday of the current week
        const startOfWeek = new Date(now.setDate(now.getDate() - ((now.getDay() + 6) % 7)));
        const endOfWeek = new Date(); // Today
  
        // Calculate Monday of the previous week
        const startOfPreviousWeek = new Date(startOfWeek);
        startOfPreviousWeek.setDate(startOfPreviousWeek.getDate() - 7);
        const endOfPreviousWeek = new Date(startOfPreviousWeek);
        endOfPreviousWeek.setDate(endOfPreviousWeek.getDate() + 6);
  
        result.currentRange = [startOfWeek, endOfWeek];
        result.previousRange = [startOfPreviousWeek, endOfPreviousWeek];

        break;
  
      case 'last_week':
        // Calculate Monday of the last week
        const startOfLastWeek = new Date(now.setDate(now.getDate() - ((now.getDay() + 6) % 7) - 7));
        const endOfLastWeek = new Date(startOfLastWeek);
        endOfLastWeek.setDate(endOfLastWeek.getDate() + 6);
  
        // Calculate Monday of the week before last
        const startOfWeekBeforeLast = new Date(startOfLastWeek);
        startOfWeekBeforeLast.setDate(startOfWeekBeforeLast.getDate() - 7);
        const endOfWeekBeforeLast = new Date(startOfWeekBeforeLast);
        endOfWeekBeforeLast.setDate(endOfWeekBeforeLast.getDate() + 6);
  
        result.currentRange = [startOfLastWeek, endOfLastWeek];
        result.previousRange = [startOfWeekBeforeLast, endOfWeekBeforeLast];
        break;
  
      case 'this_month':
        // Calculate the start of the current month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(); // Today
  
        // Calculate the start and end of the previous month
        const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  
        result.currentRange = [startOfMonth, endOfMonth];
        result.previousRange = [startOfPreviousMonth, endOfPreviousMonth];
        break;
  
      case 'last_month':
        // Calculate the start and end of the last month
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  
        // Calculate the start and end of two months ago
        const startOfTwoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        const endOfTwoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 1, 0);
  
        result.currentRange = [startOfLastMonth, endOfLastMonth];
        result.previousRange = [startOfTwoMonthsAgo, endOfTwoMonthsAgo];
        break;
  
      case 'this_year':
        // Calculate the start of the current year
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(); // Today
  
        // Calculate the start and end of the previous year
        const startOfPreviousYear = new Date(now.getFullYear() - 1, 0, 1);
        const endOfPreviousYear = new Date(now.getFullYear() - 1, 11, 31);
  
        result.currentRange = [startOfYear, endOfYear];
        result.previousRange = [startOfPreviousYear, endOfPreviousYear];
        break;
  
      case 'last_year':
        // Calculate the start and end of the last year
        const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
        const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31);
  
        // Calculate the start and end of two years ago
        const startOfTwoYearsAgo = new Date(now.getFullYear() - 2, 0, 1);
        const endOfTwoYearsAgo = new Date(now.getFullYear() - 2, 11, 31);
  
        result.currentRange = [startOfLastYear, endOfLastYear];
        result.previousRange = [startOfTwoYearsAgo, endOfTwoYearsAgo];
        break;
  
      default:
        throw new Error('Invalid timeframe');
    }
  
    return result;
  };

router.get('/dashboard-metrics', async (req, res) => {
    try {
        const { timeframe = 'this_month' } = req.query;

        let currentStartDate, currentEndDate, previousStartDate, previousEndDate;
        try {
        const dateRanges = getDateRanges(timeframe);
        [currentStartDate, currentEndDate] = dateRanges.currentRange;
        [previousStartDate, previousEndDate] = dateRanges.previousRange || [];
        } catch (error) {
        return res.status(400).json({ message: error.message });
        }

        // Format dates for SQL queries
        const formattedCurrentStartDate = currentStartDate.toISOString().split('T')[0];
        const formattedCurrentEndDate = currentEndDate.toISOString().split('T')[0];
        const formattedPreviousStartDate = previousStartDate?.toISOString().split('T')[0];
        const formattedPreviousEndDate = previousEndDate?.toISOString().split('T')[0];

        // Define dynamic SQL queries based on the timeframe
        const totalBatchesQuery = `
        SELECT COALESCE(COUNT(*),0) AS count 
        FROM "ReceivingData" 
        WHERE "receivingDate" BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}'
        AND merged = FALSE
        `;
        const totalArabicaWeightQuery = `
        SELECT COALESCE(SUM(weight), 0) AS sum 
        FROM "ReceivingData" 
        WHERE "receivingDate" BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}' 
            AND type = 'Arabica'
            AND merged = FALSE
            AND "commodityType" = 'Cherry' 
        `;
        const totalRobustaWeightQuery = `
        SELECT COALESCE(SUM(weight), 0) AS sum 
        FROM "ReceivingData" 
        WHERE "receivingDate" BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}' 
            AND type = 'Robusta'
            AND merged = FALSE
            AND "commodityType" = 'Cherry' 
        `;
        const totalArabicaCostQuery = `
        SELECT COALESCE(SUM(total_price), 0) AS sum 
        FROM "QCData_v" 
        WHERE "receivingDate" BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}' 
            AND type = 'Arabica'
        `;
        const totalRobustaCostQuery = `
        SELECT COALESCE(SUM(total_price), 0) AS sum 
        FROM "QCData_v" 
        WHERE "receivingDate" BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}' 
            AND type = 'Robusta'
        `;
        const avgArabicaCostQuery = `
        SELECT COALESCE(ROUND(AVG(price)::numeric, 1), 0) AS avg 
        FROM "QCData_v" 
        WHERE "receivingDate" BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}' 
            AND type = 'Arabica'
        `;
        const avgRobustaCostQuery = `
        SELECT COALESCE(ROUND(AVG(price)::numeric, 1), 0) AS avg 
        FROM "QCData_v" 
        WHERE "receivingDate" BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}' 
            AND type = 'Robusta'
        `;
        const totalArabicaProcessedQuery = `
            SELECT COALESCE(ROUND(SUM("weightProcessed")::numeric, 1), 0) AS sum 
            FROM "PreprocessingData" a 
            LEFT JOIN "ReceivingData" b ON a."batchNumber" = b."batchNumber" 
            WHERE "processingDate" BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}' 
            AND type = 'Arabica'
            AND b.merged = FALSE
            AND "commodityType" = 'Cherry' 
        `;
        const totalRobustaProcessedQuery = `
            SELECT COALESCE(ROUND(SUM("weightProcessed")::numeric, 1), 0) AS sum  
            FROM "PreprocessingData" a 
            LEFT JOIN "ReceivingData" b on a."batchNumber" = b."batchNumber" 
            WHERE "processingDate" BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}' 
            AND type = 'Robusta'
            AND b.merged = FALSE
            AND "commodityType" = 'Cherry' 
        `;
        const activeArabicaFarmersQuery = `
            SELECT COALESCE(SUM(isActive), 0) AS count FROM "Farmers" where "farmType" in ('Arabica', 'Mix', 'Mixed');
        `;
        const activeRobustaFarmersQuery = `
            SELECT COALESCE(SUM(isActive), 0) AS count FROM "Farmers" where "farmType" in ('Robusta', 'Mix', 'Mixed');
        `;
        const landCoveredArabicaQuery = `
            SELECT COALESCE(SUM("farmerLandArea"), 0) as sum FROM "Farmers" WHERE "farmType" = 'Arabica' and isactive='1'
        `;
        const landCoveredRobustaQuery = `
            SELECT COALESCE(SUM("farmerLandArea"), 0) as sum FROM "Farmers" WHERE "farmType" = 'Robusta' and isactive='1'
        `;

        // Queries for the previous range (e.g., last month)
        const lastmonthArabicaWeightQuery = `
        SELECT COALESCE(SUM(weight), 0) AS sum 
        FROM "ReceivingData" 
        WHERE "receivingDate" BETWEEN '${formattedPreviousStartDate}' AND '${formattedPreviousEndDate}' 
            AND type = 'Arabica'
            AND merged = FALSE
            AND "commodityType" = 'Cherry' 
        `;
        const lastmonthRobustaWeightQuery = `
        SELECT COALESCE(SUM(weight), 0) AS sum 
        FROM "ReceivingData" 
        WHERE "receivingDate" BETWEEN '${formattedPreviousStartDate}' AND '${formattedPreviousEndDate}' 
            AND type = 'Robusta'
            AND merged = FALSE
            AND "commodityType" = 'Cherry' 
        `;
        const lastmonthArabicaCostQuery = `
        SELECT COALESCE(SUM(total_price), 0) AS sum 
        FROM "QCData_v" 
        WHERE "receivingDate" BETWEEN '${formattedPreviousStartDate}' AND '${formattedPreviousEndDate}' 
            AND type = 'Arabica'
        `;
        const lastmonthRobustaCostQuery = `
        SELECT COALESCE(SUM(total_price), 0) AS sum 
        FROM "QCData_v" 
        WHERE "receivingDate" BETWEEN '${formattedPreviousStartDate}' AND '${formattedPreviousEndDate}' 
            AND type = 'Robusta'
        `;
        const lastmonthAvgArabicaCostQuery = `
        SELECT COALESCE(ROUND(AVG(price)::numeric, 1), 0) AS avg 
        FROM "QCData_v" 
        WHERE "receivingDate" BETWEEN '${formattedPreviousStartDate}' AND '${formattedPreviousEndDate}' 
            AND type = 'Arabica'
        `;
        const lastmonthAvgRobustaCostQuery = `
        SELECT COALESCE(ROUND(AVG(price)::numeric, 1), 0) AS avg 
        FROM "QCData_v" 
        WHERE "receivingDate" BETWEEN '${formattedPreviousStartDate}' AND '${formattedPreviousEndDate}' 
            AND type = 'Robusta'
        `;
        const lastmonthArabicaProcessedQuery = `
            SELECT COALESCE(ROUND(SUM((b.weight/b."totalBags")*a."bagsProcessed")::numeric, 1), 0) AS sum FROM "PreprocessingData" a LEFT JOIN "ReceivingData" b on a."batchNumber" = b."batchNumber" WHERE "processingDate" BETWEEN '${formattedPreviousStartDate}' AND '${formattedPreviousEndDate}' AND b.type = 'Arabica' AND b.merged = FALSE AND b."commodityType" = 'Cherry'
        `;
        const lastmonthRobustaProcessedQuery = `
            SELECT COALESCE(ROUND(SUM((b.weight/b."totalBags")*a."bagsProcessed")::numeric, 1), 0) AS sum FROM "PreprocessingData" a LEFT JOIN "ReceivingData" b on a."batchNumber" = b."batchNumber" WHERE "processingDate" BETWEEN '${formattedPreviousStartDate}' AND '${formattedPreviousEndDate}' AND b.type = 'Robusta' AND b.merged = FALSE AND b."commodityType" = 'Cherry'
        `;

        // Example queries for production data
        const totalArabicaProductionQuery = `
        SELECT COALESCE(SUM(weight), 0) AS sum 
        FROM "PostprocessingData" 
        WHERE "storedDate" BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}' 
            AND type = 'Arabica'
        `;
        const totalRobustaProductionQuery = `
        SELECT COALESCE(SUM(weight), 0) AS sum 
        FROM "PostprocessingData" 
        WHERE "storedDate" BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}' 
            AND type = 'Robusta'
        `;
        const lastmonthArabicaProductionQuery = `
        SELECT COALESCE(SUM(weight), 0) AS sum 
        FROM "PostprocessingData" 
        WHERE "storedDate" BETWEEN '${formattedPreviousStartDate}' AND '${formattedPreviousEndDate}' 
            AND type = 'Arabica'
        `;
        const lastmonthRobustaProductionQuery = `
        SELECT COALESCE(SUM(weight), 0) AS sum 
        FROM "PostprocessingData" 
        WHERE "storedDate" BETWEEN '${formattedPreviousStartDate}' AND '${formattedPreviousEndDate}' 
            AND type = 'Robusta'
        `;
        const pendingArabicaQCQuery = `
            SELECT COALESCE(COUNT(*), 0) AS count FROM "ReceivingData" rd
            LEFT JOIN "QCData" qd ON rd."batchNumber" = qd."batchNumber"
            WHERE qd."batchNumber" IS NULL
            AND rd.type = 'Arabica'
            AND rd.merged = FALSE
            AND rd."commodityType" = 'Cherry' 
        `;
        const pendingRobustaQCQuery = `
            SELECT COALESCE(COUNT(*), 0) AS count FROM "ReceivingData" rd
            LEFT JOIN "QCData" qd ON rd."batchNumber" = qd."batchNumber"
            WHERE qd."batchNumber" IS NULL
            AND rd.type = 'Robusta'
            AND rd.merged = FALSE
            AND rd."commodityType" = 'Cherry' 
        `;
        const pendingArabicaProcessingQuery = `
            SELECT COALESCE(COUNT(*), 0) AS count FROM "QCData" qd
            LEFT JOIN "PreprocessingData" pd ON qd."batchNumber" = pd."batchNumber"
            LEFT JOIN "ReceivingData" rd on qd."batchNumber" = rd."batchNumber"
            WHERE pd."batchNumber" IS NULL
            AND rd.type = 'Arabica'
            AND rd.merged = FALSE
            AND rd."commodityType" = 'Cherry' 
        `;
        const pendingArabicaWeightProcessingQuery = `
            SELECT COALESCE(SUM(rd.weight),0) as SUM FROM "QCData" qd
            LEFT JOIN "PreprocessingData" pd ON qd."batchNumber" = pd."batchNumber"
            LEFT JOIN "ReceivingData" rd on qd."batchNumber" = rd."batchNumber"
            WHERE pd."batchNumber" IS NULL
            AND rd.type = 'Arabica'
            AND rd.merged = FALSE
            AND rd."commodityType" = 'Cherry' 
        `;
        const pendingRobustaProcessingQuery = `
            SELECT COALESCE(COUNT(*), 0) AS count FROM "QCData" qd
            LEFT JOIN "PreprocessingData" pd ON qd."batchNumber" = pd."batchNumber"
            LEFT JOIN "ReceivingData" rd on qd."batchNumber" = rd."batchNumber"
            WHERE pd."batchNumber" IS NULL
            AND rd.type = 'Robusta'
            AND rd.merged = FALSE
            AND rd."commodityType" = 'Cherry' 
        `;
        const pendingRobustaWeightProcessingQuery = `
            SELECT COALESCE(SUM(rd.weight),0) as SUM FROM "QCData" qd
            LEFT JOIN "PreprocessingData" pd ON qd."batchNumber" = pd."batchNumber"
            LEFT JOIN "ReceivingData" rd on qd."batchNumber" = rd."batchNumber"
            WHERE pd."batchNumber" IS NULL
            AND rd.type = 'Robusta'
            AND rd.merged = FALSE
            AND rd."commodityType" = 'Cherry' 
        `;
        const totalWeightBagsbyDateQuery = `
            SELECT DATE("receivingDate") as DATE, COALESCE(SUM(weight), 0) as TOTAL_WEIGHT, COALESCE(SUM("totalBags"), 0) as TOTAL_BAGS 
            FROM "ReceivingData" 
            WHERE merged = FALSE
            AND "commodityType" = 'Cherry' 
            GROUP BY DATE("receivingDate")
        `;
        const totalCostbyDateQuery = `
            SELECT DATE("receivingDate") as DATE, COALESCE(SUM(total_price), 0) as PRICE FROM "QCData_v" GROUP BY DATE("receivingDate")
        `;
        const arabicaYieldQuery = `
            WITH pre AS (
            SELECT b.type, sum(b.weight) as weight FROM "PreprocessingData" a left join "ReceivingData" b on a."batchNumber" = b."batchNumber" 
            WHERE b.merged = FALSE
            AND b."commodityType" = 'Cherry' 
            group by b.type
            ),
 
            post as (
            SELECT type, SUM(weight) as weight FROM "PostprocessingData" group by type
            )
 
            SELECT COALESCE(yield, 0) as sum FROM (
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
            SELECT b.type, sum(b.weight) as weight FROM "PreprocessingData" a left join "ReceivingData" b on a."batchNumber" = b."batchNumber" 
            WHERE b.merged = FALSE
            AND b."commodityType" = 'Cherry'  
            group by b.type
            ),
 
            post as (
            SELECT type, SUM(weight) as weight FROM "PostprocessingData" group by type
            )
 
            SELECT COALESCE(yield, 0) as sum FROM (
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
        const arabicaTotalWeightbyDateQuery = `
            WITH RECURSIVE "DateRange" AS (
                SELECT DATE_TRUNC('month', CURRENT_DATE)::TIMESTAMP AS "Date" -- Start of the current month
                UNION ALL
                SELECT "Date" + INTERVAL '1 day' -- Add one day to the previous date
                FROM "DateRange"
                WHERE "Date" + INTERVAL '1 day' <= CURRENT_DATE -- Stop at today's date
            ),

            ppd AS (
            SELECT 
                "referenceNumber" AS category, 
                COALESCE(SUM(weight), 0) AS weight, 
                DATE("storedDate") AS "storedDate" 
            FROM 
                "PostprocessingData" 
            WHERE 
                "storedDate" IS NOT NULL 
                AND "storedDate" BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}'
                AND type = 'Arabica' 
            GROUP BY 
                "referenceNumber", 
                DATE("storedDate")
            )

            SELECT * FROM (
              SELECT 
              TO_CHAR(a."Date", 'Mon-DD') AS "storedDate",
              category,
              SUM(COALESCE(b."weight", 0)) OVER (ORDER BY a."Date") AS weight
              FROM "DateRange" a
              LEFT JOIN ppd b ON a."Date" = b."storedDate"
            ) a
            WHERE category IS NOT NULL
        `;
        const robustaTotalWeightbyDateQuery = `
            WITH RECURSIVE "DateRange" AS (
                SELECT DATE_TRUNC('month', CURRENT_DATE)::TIMESTAMP AS "Date" -- Start of the current month
                UNION ALL
                SELECT "Date" + INTERVAL '1 day' -- Add one day to the previous date
                FROM "DateRange"
                WHERE "Date" + INTERVAL '1 day' <= CURRENT_DATE -- Stop at today's date
            ),

            ppd AS (
            SELECT 
                "referenceNumber" AS category, 
                COALESCE(SUM(weight), 0) AS weight, 
                DATE("storedDate") AS "storedDate" 
            FROM 
                "PostprocessingData" 
            WHERE 
                "storedDate" IS NOT NULL 
                AND "storedDate" BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}'
                AND type = 'Robusta' 
            GROUP BY 
                "referenceNumber", 
                DATE("storedDate")
            )

            SELECT * FROM (
              SELECT 
              TO_CHAR(a."Date", 'Mon-DD') AS "storedDate",
              category,
              SUM(COALESCE(b."weight", 0)) OVER (ORDER BY a."Date") AS weight
              FROM "DateRange" a
              LEFT JOIN ppd b ON a."Date" = b."storedDate"
            ) a
            WHERE category IS NOT NULL
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
                    WHERE "receivingDate" BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}'
                    AND type = 'Arabica'
                    AND merged = FALSE
                    AND "commodityType" = 'Cherry' 
                    GROUP BY DATE("receivingDate")::TIMESTAMP
            ),
            RDB AS (
                    SELECT DATE("receivingDate")::TIMESTAMP AS "receivingDate", COALESCE(SUM(Weight), 0) AS "TotalWeightLastMonth"
                    FROM "ReceivingData" 
                    WHERE "receivingDate" BETWEEN '${formattedPreviousStartDate}' AND '${formattedPreviousEndDate}'
                    AND type = 'Arabica'
                    AND merged = FALSE
                    AND "commodityType" = 'Cherry' 
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
                WHERE "receivingDate" BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}'
                AND type = 'Robusta'
                AND merged = FALSE
                AND "commodityType" = 'Cherry' 
                GROUP BY DATE("receivingDate")::TIMESTAMP
            ),
            RDB AS (
                SELECT DATE("receivingDate")::TIMESTAMP AS "receivingDate", COALESCE(SUM(Weight), 0) AS "TotalWeightLastMonth"
                FROM "ReceivingData" 
                WHERE "receivingDate" BETWEEN '${formattedPreviousStartDate}' AND '${formattedPreviousEndDate}'
                AND type = 'Robusta'
                AND merged = FALSE
                AND "commodityType" = 'Cherry' 
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
                SELECT DATE("receivingDate")::TIMESTAMP AS "receivingDate", COALESCE(SUM(total_price), 0) AS "TotalPriceThisMonth"
                FROM "QCData_v" 
                WHERE "receivingDate" BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}'
                AND type = 'Arabica'
                GROUP BY DATE("receivingDate")::TIMESTAMP
            ),
            RDB AS (
                SELECT DATE("receivingDate")::TIMESTAMP AS "receivingDate", COALESCE(SUM(total_price), 0) AS "TotalPriceLastMonth"
                FROM "QCData_v" 
                WHERE "receivingDate" BETWEEN '${formattedPreviousStartDate}' AND '${formattedPreviousEndDate}'
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
                SELECT DATE("receivingDate")::TIMESTAMP AS "receivingDate", COALESCE(SUM(total_price), 0) AS "TotalPriceThisMonth"
                FROM "QCData_v" 
                WHERE "receivingDate" BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}'
                AND type = 'Robusta'
                GROUP BY DATE("receivingDate")::TIMESTAMP
            ),
            RDB AS (
                SELECT DATE("receivingDate")::TIMESTAMP AS "receivingDate", COALESCE(SUM(total_price), 0) AS "TotalPriceLastMonth"
                FROM "QCData_v" 
                WHERE "receivingDate" BETWEEN '${formattedPreviousStartDate}' AND '${formattedPreviousEndDate}'
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
                FROM "QCData_v" 
                WHERE "receivingDate" BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}'
                AND type = 'Arabica'
                GROUP BY DATE("receivingDate")
            ),
            RDB AS (
                SELECT 
                    DATE("receivingDate") AS "receivingDate", 
                    COALESCE(SUM(price), 0) AS "TotalPriceLastMonth",
                    COUNT(price) AS "CountLastMonth"
                FROM "QCData_v" 
                WHERE "receivingDate" BETWEEN '${formattedPreviousStartDate}' AND '${formattedPreviousEndDate}'
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
                COALESCE(ROUND(CASE 
                    WHEN "CumulativeCountThisMonth" > 0 THEN "CumulativePriceThisMonth" * 1.0 / "CumulativeCountThisMonth" 
                    ELSE 0 
                END, 1), 0) AS "RunningAverageCostThisMonth",
                COALESCE(ROUND(CASE 
                    WHEN "CumulativeCountLastMonth" > 0 THEN "CumulativePriceLastMonth" * 1.0 / "CumulativeCountLastMonth" 
                    ELSE 0 
                END, 1), 0) AS "RunningAverageCostLastMonth"
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
                FROM "QCData_v" 
                WHERE "receivingDate" BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}'
                AND type = 'Robusta'
                GROUP BY DATE("receivingDate")
            ),
            RDB AS (
                SELECT 
                    DATE("receivingDate") AS "receivingDate", 
                    COALESCE(SUM(price), 0) AS "TotalPriceLastMonth",
                    COUNT(price) AS "CountLastMonth"
                FROM "QCData_v" 
                WHERE "receivingDate" BETWEEN '${formattedPreviousStartDate}' AND '${formattedPreviousEndDate}'
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
                COALESCE(ROUND(CASE 
                    WHEN "CumulativeCountThisMonth" > 0 THEN "CumulativePriceThisMonth" * 1.0 / "CumulativeCountThisMonth" 
                    ELSE 0 
                END, 1), 0) AS "RunningAverageCostThisMonth",
                COALESCE(ROUND(CASE 
                    WHEN "CumulativeCountLastMonth" > 0 THEN "CumulativePriceLastMonth" * 1.0 / "CumulativeCountLastMonth" 
                    ELSE 0 
                END, 1), 0) AS "RunningAverageCostLastMonth"
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
                WHERE "processingDate" BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}'
                AND b.type = 'Arabica'
                AND b.merged = FALSE
                AND b."commodityType" = 'Cherry' 
                GROUP BY DATE("processingDate")
            ),
            RDB AS (
                SELECT DATE("processingDate") as "processingDate", COALESCE(ROUND(SUM((b.weight/b."totalBags")*a."bagsProcessed")::numeric, 1), 0) AS "TotalWeightLastMonth"
                FROM "PreprocessingData" a LEFT JOIN "ReceivingData" b on a."batchNumber" = b."batchNumber"
                WHERE "processingDate" BETWEEN '${formattedPreviousStartDate}' AND '${formattedPreviousEndDate}'
                AND b.type = 'Arabica'
                AND b.merged = FALSE
                AND b."commodityType" = 'Cherry' 
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
                WHERE "processingDate" BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}'
                AND b.type = 'Arabica'
                AND b.merged = FALSE
                AND b."commodityType" = 'Cherry' 
                GROUP BY DATE("processingDate")
            ),
            RDB AS (
                SELECT DATE("processingDate") as "processingDate", COALESCE(ROUND(SUM((b.weight/b."totalBags")*a."bagsProcessed")::numeric, 1), 0) AS "TotalWeightLastMonth"
                FROM "PreprocessingData" a LEFT JOIN "ReceivingData" b on a."batchNumber" = b."batchNumber"
                WHERE "processingDate" BETWEEN '${formattedPreviousStartDate}' AND '${formattedPreviousEndDate}'
                AND b.type = 'Arabica'
                AND b.merged = FALSE
                AND b."commodityType" = 'Cherry' 
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
                WHERE "storedDate" BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}'
                AND type = 'Arabica'
                GROUP BY DATE("storedDate")
            ),
            RDB AS (
                SELECT DATE("storedDate") as "storedDate", COALESCE(SUM(Weight), 0) AS "TotalWeightLastMonth"
                FROM "PostprocessingData" 
                WHERE "storedDate" BETWEEN '${formattedPreviousStartDate}' AND '${formattedPreviousEndDate}'
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
                WHERE "storedDate" BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}'
                AND type = 'Robusta'
                GROUP BY DATE("storedDate")
            ),
            RDB AS (
                SELECT DATE("storedDate") as "storedDate", COALESCE(SUM(Weight), 0) AS "TotalWeightLastMonth"
                FROM "PostprocessingData" 
                WHERE "storedDate" BETWEEN '${formattedPreviousStartDate}' AND '${formattedPreviousEndDate}'
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

        const arabicaCherryQualitybyDateQuery = `
            SELECT 
                "qcDate", 
                COALESCE(avg("unripePercentage"), 0) "unripePercentage",
                COALESCE(avg("semiripePercentage"), 0) "semiripePercentage",
                COALESCE(avg("ripePercentage"), 0) "ripePercentage",
                COALESCE(avg("overripePercentage"), 0) "overripePercentage"
            FROM (
                SELECT 
                    a."batchNumber",
                    DATE(min("qcDate")) "qcDate",
                    COALESCE(avg("unripePercentage"), 0) "unripePercentage",
                    COALESCE(avg("semiripePercentage"), 0) "semiripePercentage",
                    COALESCE(avg("ripePercentage"), 0) "ripePercentage",
                    COALESCE(avg("overripePercentage"), 0) "overripePercentage"
                FROM "QCData" a
                LEFT JOIN "ReceivingData" b on a."batchNumber" = b."batchNumber"
                WHERE "unripePercentage" IS NOT NULL
                AND b.type = 'Arabica'
                AND b.merged = FALSE
                AND b."commodityType" = 'Cherry' 
                GROUP BY a."batchNumber"
            ) a
            GROUP BY "qcDate"
        `;

        const robustaCherryQualitybyDateQuery = `
            SELECT 
                "qcDate", 
                COALESCE(avg("unripePercentage"), 0) "unripePercentage",
                COALESCE(avg("semiripePercentage"), 0) "semiripePercentage",
                COALESCE(avg("ripePercentage"), 0) "ripePercentage",
                COALESCE(avg("overripePercentage"), 0) "overripePercentage"
            FROM (
                SELECT 
                    a."batchNumber",
                    DATE(min("qcDate")) "qcDate",
                    COALESCE(avg("unripePercentage"), 0) "unripePercentage",
                    COALESCE(avg("semiripePercentage"), 0) "semiripePercentage",
                    COALESCE(avg("ripePercentage"), 0) "ripePercentage",
                    COALESCE(avg("overripePercentage"), 0) "overripePercentage"
                FROM "QCData" a
                LEFT JOIN "ReceivingData" b on a."batchNumber" = b."batchNumber"
                WHERE "unripePercentage" IS NOT NULL
                AND b.type = 'Robusta'
                AND b.merged = FALSE
                AND b."commodityType" = 'Cherry' 
                GROUP BY a."batchNumber"
            ) a
            GROUP BY "qcDate"
        `;

        const arabicaFarmersContributionQuery = `
            SELECT 
                a."farmerName"
                ,COALESCE(sum(a.weight), 0) weight
                ,COALESCE(SUM("unripeWeight"), 0) "unripeWeight"
                ,COALESCE(SUM("semiripeWeight"), 0) "semiripeWeight"
                ,COALESCE(SUM("ripeWeight"), 0) "ripeWeight"
                ,COALESCE(SUM("overripeWeight"), 0) "overripeWeight"
                ,CASE WHEN 
                    (sum(a.weight) - (COALESCE(SUM("unripeWeight"), 0) + COALESCE(SUM("semiripeWeight"), 0) + COALESCE(SUM("ripeWeight"), 0) + COALESCE(SUM("overripeWeight"), 0))) < 0 THEN 0
                    ELSE (sum(a.weight) - (COALESCE(SUM("unripeWeight"), 0) + COALESCE(SUM("semiripeWeight"), 0) + COALESCE(SUM("ripeWeight"), 0) + COALESCE(SUM("overripeWeight"), 0)))
                    END AS "unknownWeight"
            from "ReceivingData" a
            LEFT JOIN (
                SELECT
                    a."batchNumber",
                    SUM(b.weight),
                    SUM(b.weight) * AVG("unripePercentage")/100 AS "unripeWeight",
                    SUM(b.weight) * AVG("semiripePercentage")/100 AS "semiripeWeight",
                    SUM(b.weight) * AVG("ripePercentage")/100 AS "ripeWeight",
                    SUM(b.weight) * AVG("overripePercentage")/100 AS "overripeWeight"
                FROM "QCData" a
                LEFT JOIN "ReceivingData" b on a."batchNumber" = b."batchNumber"
                WHERE "ripePercentage" IS NOT NULL
                GROUP BY a."batchNumber"
            ) b on a."batchNumber" = b."batchNumber"
            WHERE a.type = 'Arabica'
            AND a.merged = FALSE
            AND a."commodityType" = 'Cherry' 
            AND "receivingDate" BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}' 
            GROUP BY "farmerName"
        `;

        const robustaFarmersContributionQuery = `
            SELECT 
                a."farmerName"
                ,COALESCE(sum(a.weight), 0) weight
                ,COALESCE(SUM("unripeWeight"), 0) "unripeWeight"
                ,COALESCE(SUM("semiripeWeight"), 0) "semiripeWeight"
                ,COALESCE(SUM("ripeWeight"), 0) "ripeWeight"
                ,COALESCE(SUM("overripeWeight"), 0) "overripeWeight"
                ,CASE WHEN 
                    (sum(a.weight) - (COALESCE(SUM("unripeWeight"), 0) + COALESCE(SUM("semiripeWeight"), 0) + COALESCE(SUM("ripeWeight"), 0) + COALESCE(SUM("overripeWeight"), 0))) < 0 THEN 0
                    ELSE (sum(a.weight) - (COALESCE(SUM("unripeWeight"), 0) + COALESCE(SUM("semiripeWeight"), 0) + COALESCE(SUM("ripeWeight"), 0) + COALESCE(SUM("overripeWeight"), 0)))
                    END AS "unknownWeight"
            from "ReceivingData" a
            LEFT JOIN (
                SELECT
                    a."batchNumber",
                    SUM(b.weight),
                    SUM(b.weight) * AVG("unripePercentage")/100 AS "unripeWeight",
                    SUM(b.weight) * AVG("semiripePercentage")/100 AS "semiripeWeight",
                    SUM(b.weight) * AVG("ripePercentage")/100 AS "ripeWeight",
                    SUM(b.weight) * AVG("overripePercentage")/100 AS "overripeWeight"
                FROM "QCData" a
                LEFT JOIN "ReceivingData" b on a."batchNumber" = b."batchNumber"
                WHERE "ripePercentage" IS NOT NULL
                GROUP BY a."batchNumber"
            ) b on a."batchNumber" = b."batchNumber"
            WHERE a.type = 'Robusta'
            AND a.merged = FALSE
            AND a."commodityType" = 'Cherry' 
            AND "receivingDate" BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}' 
            GROUP BY "farmerName"
        `;

        const arabicaSankeyQuery = `
            WITH "Cherries" AS (
                SELECT
                    SUM(weight) AS total_cherries_weight
                FROM "ReceivingData"
                WHERE type = 'Arabica'
                AND merged = FALSE
                AND "commodityType" = 'Cherry' 
                AND "receivingDate" BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}'
            ),
            "ProcessedGreenBeans" AS (
                SELECT
                    SUM(ROUND(CAST((b.weight / b."totalBags") * a."bagsProcessed" AS numeric), 2)::FLOAT) AS total_processed_green_beans_weight,
                    b."batchNumber" -- for later joining
                FROM "PreprocessingData" a
                LEFT JOIN "ReceivingData" b ON a."batchNumber" = b."batchNumber"
                WHERE b.type = 'Arabica'
                AND b.merged = FALSE
                AND b."commodityType" = 'Cherry' 
                AND "receivingDate" BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}'
                GROUP BY b."batchNumber"
            ),
            "FinishedGreenBeans" AS (
                SELECT
                    weight,
                    producer,
                    quality,
                    "productLine",
                    "processingType",
                    "batchNumber" -- for later joining
                FROM "PostprocessingData"
                WHERE type = 'Arabica'
                AND "storedDate" BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}'
            ),
            "TotalFinishedGreenBeans" AS (
                SELECT
                    COALESCE(SUM(weight), 0) AS total_finished_weight
                FROM "FinishedGreenBeans"
            ),
            "LossesFromCherries" AS (
                -- This computes the unprocessed cherries as the difference
                SELECT
                    c.total_cherries_weight - COALESCE(SUM(pgb.total_processed_green_beans_weight), 0) AS total_unprocessed_cherries
                FROM "Cherries" c
                LEFT JOIN "ProcessedGreenBeans" pgb ON 1 = 1
                GROUP BY c.total_cherries_weight -- Ensure a single row
            ),
            "TotalProcessedGreenBeans" AS (
                SELECT
                    COALESCE(SUM(total_processed_green_beans_weight), 0) AS total_processed_weight
                FROM "ProcessedGreenBeans"
            ),
            "LossesFromProcessed" AS (
                SELECT
                    -- Calculate loss as the difference between total processed green beans and finished green beans
                    (SELECT total_processed_weight FROM "TotalProcessedGreenBeans") - 
                    COALESCE((SELECT total_finished_weight FROM "TotalFinishedGreenBeans"), 0) AS total_losses_processed
                GROUP BY 1 -- Ensure a single row
            ),

            CombinedFlows AS (
                -- Flow from Cherries to Processed Green Beans (from Preprocessing)
                SELECT
                    'Cherries' AS from_node,
                    'Processed Cherries' AS to_node,
                    COALESCE(SUM(pgb.total_processed_green_beans_weight), 0) AS value
                FROM "ProcessedGreenBeans" pgb
                GROUP BY 1, 2

                UNION ALL

                SELECT
                    'Cherries' AS from_node,
                    'Unprocessed Cherries' AS to_node,
                    COALESCE(lc.total_unprocessed_cherries, 0) AS value
                FROM "LossesFromCherries" lc
                GROUP BY 1, 2, lc.total_unprocessed_cherries

                UNION ALL

                -- Conditional extra flow: If the unprocessed cherries flow is 0,
                -- add an extra flow from Cherries to Processed Green Beans with a value equal
                -- to the total Finished Green Beans weight.
                SELECT
                    'Cherries' AS from_node,
                    'Processed Cherries' AS to_node,
                    tfgb.total_finished_weight AS value
                FROM "TotalFinishedGreenBeans" tfgb
                CROSS JOIN "LossesFromCherries" lc
                WHERE COALESCE(lc.total_unprocessed_cherries, 0) = 0
                GROUP BY 1, 2, tfgb.total_finished_weight

                UNION ALL

                -- Flow from Processed Green Beans to Finished Green Beans (by FinishedGreenBeans records)
                SELECT
                    'Processed Cherries' AS from_node,
                    'Finished Green Beans' AS to_node,
                    SUM(fgb.weight) AS value
                FROM "FinishedGreenBeans" fgb
                GROUP BY 1, 2

                UNION ALL

                -- Flow representing processing losses (adjusted to account for finished green beans)
                SELECT
                    'Processed Cherries' AS from_node,
                    'Processing Loss & Unfinished Processing' AS to_node,
                    COALESCE(lp.total_losses_processed, 0) AS value
                FROM "LossesFromProcessed" lp

                UNION ALL

                -- Flow from Finished Green Beans to Producer
                SELECT
                    'Finished Green Beans' AS from_node,
                    fgb.producer AS to_node,
                    SUM(fgb.weight) AS value
                FROM "FinishedGreenBeans" fgb
                GROUP BY 1, 2, fgb.producer

                UNION ALL

                -- Flow from Producer to Quality
                SELECT
                    fgb.producer AS from_node,
                    fgb.quality AS to_node,
                    SUM(fgb.weight) AS value
                FROM "FinishedGreenBeans" fgb
                GROUP BY 1, 2, fgb.quality

                UNION ALL

                -- Flow from Quality to ProductLine (using LEFT JOIN to handle potential duplicates)
                SELECT
                    fgb.quality AS from_node,
                    pl."productLine" AS to_node,
                    SUM(fgb.weight) AS value
                FROM "FinishedGreenBeans" fgb
                LEFT JOIN "ProductLines" pl ON fgb."productLine" = pl."productLine"
                GROUP BY 1, 2, pl."productLine"

                UNION ALL

                -- Flow from ProductLine to ProcessingType (using LEFT JOIN to handle potential duplicates)
                SELECT
                    pl."productLine" AS from_node,
                    pt."processingType" AS to_node,
                    SUM(fgb.weight) AS value
                FROM "FinishedGreenBeans" fgb
                LEFT JOIN "ProductLines" pl ON fgb."productLine" = pl."productLine"
                LEFT JOIN "ProcessingTypes" pt ON fgb."processingType" = pt."processingType"
                GROUP BY 1, 2, pt."processingType"
            )

            SELECT from_node, to_node, SUM(value) AS value
            FROM CombinedFlows
            GROUP BY from_node, to_node;
        `;

        const robustaSankeyQuery = `
            WITH "Cherries" AS (
                SELECT
                    SUM(weight) AS total_cherries_weight
                FROM "ReceivingData"
                WHERE type = 'Robusta'
                AND merged = FALSE
                AND "commodityType" = 'Cherry' 
                AND "receivingDate" BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}'
            ),
            "ProcessedGreenBeans" AS (
                SELECT
                    SUM(ROUND(CAST((b.weight / b."totalBags") * a."bagsProcessed" AS numeric), 2)::FLOAT) AS total_processed_green_beans_weight,
                    b."batchNumber" -- for later joining
                FROM "PreprocessingData" a
                LEFT JOIN "ReceivingData" b ON a."batchNumber" = b."batchNumber"
                WHERE b.type = 'Robusta'
                AND b.merged = FALSE
                AND b."commodityType" = 'Cherry' 
                AND "receivingDate" BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}'
                GROUP BY b."batchNumber"
            ),
            "FinishedGreenBeans" AS (
                SELECT
                    weight,
                    producer,
                    quality,
                    "productLine",
                    "processingType",
                    "batchNumber" -- for later joining
                FROM "PostprocessingData"
                WHERE type = 'Robusta'
                AND "storedDate" BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}'
            ),
            "TotalFinishedGreenBeans" AS (
                SELECT
                    COALESCE(SUM(weight), 0) AS total_finished_weight
                FROM "FinishedGreenBeans"
            ),
            "LossesFromCherries" AS (
                -- This computes the unprocessed cherries as the difference
                SELECT
                    c.total_cherries_weight - COALESCE(SUM(pgb.total_processed_green_beans_weight), 0) AS total_unprocessed_cherries
                FROM "Cherries" c
                LEFT JOIN "ProcessedGreenBeans" pgb ON 1 = 1
                GROUP BY c.total_cherries_weight -- Ensure a single row
            ),
            "TotalProcessedGreenBeans" AS (
                SELECT
                    COALESCE(SUM(total_processed_green_beans_weight), 0) AS total_processed_weight
                FROM "ProcessedGreenBeans"
            ),
            "LossesFromProcessed" AS (
                SELECT
                    -- Calculate loss as the difference between total processed green beans and finished green beans
                    (SELECT total_processed_weight FROM "TotalProcessedGreenBeans") - 
                    COALESCE((SELECT total_finished_weight FROM "TotalFinishedGreenBeans"), 0) AS total_losses_processed
                GROUP BY 1 -- Ensure a single row
            ),

            CombinedFlows AS (
                -- Flow from Cherries to Processed Green Beans (from Preprocessing)
                SELECT
                    'Cherries' AS from_node,
                    'Processed Cherries' AS to_node,
                    COALESCE(SUM(pgb.total_processed_green_beans_weight), 0) AS value
                FROM "ProcessedGreenBeans" pgb
                GROUP BY 1, 2

                UNION ALL

                SELECT
                    'Cherries' AS from_node,
                    'Unprocessed Cherries' AS to_node,
                    COALESCE(lc.total_unprocessed_cherries, 0) AS value
                FROM "LossesFromCherries" lc
                GROUP BY 1, 2, lc.total_unprocessed_cherries

                UNION ALL

                -- Conditional extra flow: If the unprocessed cherries flow is 0,
                -- add an extra flow from Cherries to Processed Green Beans with a value equal
                -- to the total Finished Green Beans weight.
                SELECT
                    'Cherries' AS from_node,
                    'Processed Cherries' AS to_node,
                    tfgb.total_finished_weight AS value
                FROM "TotalFinishedGreenBeans" tfgb
                CROSS JOIN "LossesFromCherries" lc
                WHERE COALESCE(lc.total_unprocessed_cherries, 0) = 0
                GROUP BY 1, 2, tfgb.total_finished_weight

                UNION ALL

                -- Flow from Processed Green Beans to Finished Green Beans (by FinishedGreenBeans records)
                SELECT
                    'Processed Cherries' AS from_node,
                    'Finished Green Beans' AS to_node,
                    SUM(fgb.weight) AS value
                FROM "FinishedGreenBeans" fgb
                GROUP BY 1, 2

                UNION ALL

                -- Flow representing processing losses (adjusted to account for finished green beans)
                SELECT
                    'Processed Cherries' AS from_node,
                    'Processing Loss & Unfinished Processing' AS to_node,
                    COALESCE(lp.total_losses_processed, 0) AS value
                FROM "LossesFromProcessed" lp

                UNION ALL

                -- Flow from Finished Green Beans to Producer
                SELECT
                    'Finished Green Beans' AS from_node,
                    fgb.producer AS to_node,
                    SUM(fgb.weight) AS value
                FROM "FinishedGreenBeans" fgb
                GROUP BY 1, 2, fgb.producer

                UNION ALL

                -- Flow from Producer to Quality
                SELECT
                    fgb.producer AS from_node,
                    fgb.quality AS to_node,
                    SUM(fgb.weight) AS value
                FROM "FinishedGreenBeans" fgb
                GROUP BY 1, 2, fgb.quality

                UNION ALL

                -- Flow from Quality to ProductLine (using LEFT JOIN to handle potential duplicates)
                SELECT
                    fgb.quality AS from_node,
                    pl."productLine" AS to_node,
                    SUM(fgb.weight) AS value
                FROM "FinishedGreenBeans" fgb
                LEFT JOIN "ProductLines" pl ON fgb."productLine" = pl."productLine"
                GROUP BY 1, 2, pl."productLine"

                UNION ALL

                -- Flow from ProductLine to ProcessingType (using LEFT JOIN to handle potential duplicates)
                SELECT
                    pl."productLine" AS from_node,
                    pt."processingType" AS to_node,
                    SUM(fgb.weight) AS value
                FROM "FinishedGreenBeans" fgb
                LEFT JOIN "ProductLines" pl ON fgb."productLine" = pl."productLine"
                LEFT JOIN "ProcessingTypes" pt ON fgb."processingType" = pt."processingType"
                GROUP BY 1, 2, pt."processingType"
            )

            SELECT from_node, to_node, SUM(value) AS value
            FROM CombinedFlows
            GROUP BY from_node, to_node;
        `;

        const arabicaAchievementQuery = `
            WITH DateSeries AS (
                SELECT generate_series(
                    '${formattedCurrentStartDate}'::date,
                    '${formattedCurrentEndDate}'::date,
                    '1 day'::interval
                ) AS date
            ),
            TargetMetricsAggregated AS (
                SELECT
                    tm."referenceNumber",
                    SUM(tm."targetValue") AS total_target_value
                FROM "TargetMetrics" tm
                LEFT JOIN "ReferenceMappings_duplicate" b on tm."referenceNumber" = b."referenceNumber"
                WHERE tm."referenceNumber" IN (SELECT DISTINCT "referenceNumber" FROM "PostprocessingData")
                AND tm."startDate" BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}'
                AND b.type = 'Arabica'
                GROUP BY tm."referenceNumber"
            ),
            PostprocessingDataAggregated AS (
                SELECT
                    p."referenceNumber",
                    p."storedDate"::date,
                    SUM(p.weight) AS daily_weight
                FROM "PostprocessingData" p
                WHERE p."storedDate"::date BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}'
                AND type = 'Arabica'
                GROUP BY p."referenceNumber", p."storedDate"::date
            ),
            DailyAchievement AS (  -- Calculate daily achievement percentage
                SELECT
                    ds.date,
                    tma."referenceNumber",
                    tma.total_target_value,
                    COALESCE(pda.daily_weight, 0) AS daily_weight,
                    CASE
                        WHEN tma.total_target_value = 0 THEN 0
                        ELSE (COALESCE(pda.daily_weight, 0) / tma.total_target_value) * 100  -- Daily percentage
                    END AS daily_achievement_percentage
                FROM DateSeries ds
                LEFT JOIN TargetMetricsAggregated tma ON tma."referenceNumber" IN (SELECT DISTINCT "referenceNumber" FROM "PostprocessingData")
                LEFT JOIN PostprocessingDataAggregated pda ON ds.date = pda."storedDate" AND tma."referenceNumber" = pda."referenceNumber"
                WHERE ds.date BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}'
            )
            SELECT
                DATE(date) date,
                "referenceNumber",
                COALESCE(ROUND(CAST(SUM(daily_achievement_percentage) OVER (PARTITION BY "referenceNumber" ORDER BY date) AS numeric) , 2), 0)::FLOAT AS cumulative_achievement_percentage -- Cumulative sum of DAILY percentages
            FROM DailyAchievement
            WHERE "referenceNumber" IS NOT NULL
            ORDER BY date, "referenceNumber";
            `;

        const robustaAchievementQuery = `
            WITH DateSeries AS (
                SELECT generate_series(
                    '${formattedCurrentStartDate}'::date,
                    '${formattedCurrentEndDate}'::date,
                    '1 day'::interval
                ) AS date
            ),
            TargetMetricsAggregated AS (
                SELECT
                    tm."referenceNumber",
                    SUM(tm."targetValue") AS total_target_value
                FROM "TargetMetrics" tm
                LEFT JOIN "ReferenceMappings_duplicate" b on tm."referenceNumber" = b."referenceNumber"
                WHERE tm."referenceNumber" IN (SELECT DISTINCT "referenceNumber" FROM "PostprocessingData")
                AND tm."startDate" BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}'
                AND b.type = 'Robusta'
                GROUP BY tm."referenceNumber"
            ),
            PostprocessingDataAggregated AS (
                SELECT
                    p."referenceNumber",
                    p."storedDate"::date,
                    SUM(p.weight) AS daily_weight
                FROM "PostprocessingData" p
                WHERE p."storedDate"::date BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}'
                AND type = 'Robusta'
                GROUP BY p."referenceNumber", p."storedDate"::date
            ),
            DailyAchievement AS (  -- Calculate daily achievement percentage
                SELECT
                    ds.date,
                    tma."referenceNumber",
                    tma.total_target_value,
                    COALESCE(pda.daily_weight, 0) AS daily_weight,
                    CASE
                        WHEN tma.total_target_value = 0 THEN 0
                        ELSE (COALESCE(pda.daily_weight, 0) / tma.total_target_value) * 100  -- Daily percentage
                    END AS daily_achievement_percentage
                FROM DateSeries ds
                LEFT JOIN TargetMetricsAggregated tma ON tma."referenceNumber" IN (SELECT DISTINCT "referenceNumber" FROM "PostprocessingData")
                LEFT JOIN PostprocessingDataAggregated pda ON ds.date = pda."storedDate" AND tma."referenceNumber" = pda."referenceNumber"
                WHERE ds.date BETWEEN '${formattedCurrentStartDate}' AND '${formattedCurrentEndDate}'
            )
            SELECT
                DATE(date) date,
                "referenceNumber",
                COALESCE(ROUND(CAST(SUM(daily_achievement_percentage) OVER (PARTITION BY "referenceNumber" ORDER BY date) AS numeric) , 2), 0)::FLOAT AS cumulative_achievement_percentage -- Cumulative sum of DAILY percentages
            FROM DailyAchievement
            WHERE "referenceNumber" IS NOT NULL
            ORDER BY date, "referenceNumber";
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
 
        const [activeArabicaFarmersResult] = await sequelize.query(activeArabicaFarmersQuery);
        const [activeRobustaFarmersResult] = await sequelize.query(activeRobustaFarmersQuery);
 
        const [pendingArabicaQCResult] = await sequelize.query(pendingArabicaQCQuery);
        const [pendingRobustaQCResult] = await sequelize.query(pendingRobustaQCQuery);
 
        const [pendingArabicaProcessingResult] = await sequelize.query(pendingArabicaProcessingQuery);
        const [pendingArabicaWeightProcessingResult] = await sequelize.query(pendingArabicaWeightProcessingQuery);
        const [pendingRobustaProcessingResult] = await sequelize.query(pendingRobustaProcessingQuery);
        const [pendingRobustaWeightProcessingResult] = await sequelize.query(pendingRobustaWeightProcessingQuery);
 
        const [totalWeightBagsbyDateResult] = await sequelize.query(totalWeightBagsbyDateQuery);
        const [totalCostbyDateResult] = await sequelize.query(totalCostbyDateQuery);
        const [landCoveredArabicaResult] = await sequelize.query(landCoveredArabicaQuery);
        const [landCoveredRobustaResult] = await sequelize.query(landCoveredRobustaQuery);
 
        const [arabicaYieldResult] = await sequelize.query(arabicaYieldQuery);
        const [robustaYieldResult] = await sequelize.query(robustaYieldQuery);
 
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

        const [arabicaCherryQualitybyDateResult] = await sequelize.query(arabicaCherryQualitybyDateQuery);
        const [robustaCherryQualitybyDateResult] = await sequelize.query(robustaCherryQualitybyDateQuery);

        const [arabicaFarmersContributionResult] = await sequelize.query(arabicaFarmersContributionQuery);
        const [robustaFarmersContributionResult] = await sequelize.query(robustaFarmersContributionQuery);

        const [arabicaSankeyResult] = await sequelize.query(arabicaSankeyQuery);
        const [robustaSankeyResult] = await sequelize.query(robustaSankeyQuery);

        const [arabicaAchievementResult] = await sequelize.query(arabicaAchievementQuery);
        const [robustaAchievementResult] = await sequelize.query(robustaAchievementQuery); 
 
 
        // Extract the relevant values from query results
        // Convert all numeric values to numbers using Number()
				const totalBatches = Number(totalBatchesResult[0].count) || 0;

				const totalArabicaWeight = Number(totalArabicaWeightResult[0].sum) || 0;
				const totalRobustaWeight = Number(totalRobustaWeightResult[0].sum) || 0;
				const lastmonthArabicaWeight = Number(lastmonthArabicaWeightResult[0].sum) || 0;
				const lastmonthRobustaWeight = Number(lastmonthRobustaWeightResult[0].sum) || 0;

				const totalArabicaCost = Number(totalArabicaCostResult[0].sum) || 0;
				const totalRobustaCost = Number(totalRobustaCostResult[0].sum) || 0;
				const lastmonthArabicaCost = Number(lastmonthArabicaCostResult[0].sum) || 0;
				const lastmonthRobustaCost = Number(lastmonthRobustaCostResult[0].sum) || 0;

				const avgArabicaCost = Number(avgArabicaCostResult[0].avg) || 0;
				const avgRobustaCost = Number(avgRobustaCostResult[0].avg) || 0;
				const lastmonthAvgArabicaCost = Number(lastmonthAvgArabicaCostResult[0].avg) || 0;
				const lastmonthAvgRobustaCost = Number(lastmonthAvgRobustaCostResult[0].avg) || 0;

				const totalArabicaProcessed = Number(totalArabicaProcessedResult[0].sum) || 0;
				const totalRobustaProcessed = Number(totalRobustaProcessedResult[0].sum) || 0;
				const lastmonthArabicaProcessed = Number(lastmonthArabicaProcessedResult[0].sum) || 0;
				const lastmonthRobustaProcessed = Number(lastmonthRobustaProcessedResult[0].sum) || 0;

				const totalArabicaProduction = Number(totalArabicaProductionResult[0].sum) || 0;
				const totalRobustaProduction = Number(totalRobustaProductionResult[0].sum) || 0;
				const lastmonthArabicaProduction = Number(lastmonthArabicaProductionResult[0].sum) || 0;
				const lastmonthRobustaProduction = Number(lastmonthRobustaProductionResult[0].sum) || 0;

				const activeArabicaFarmers = Number(activeArabicaFarmersResult[0].count) || 0;
				const activeRobustaFarmers = Number(activeRobustaFarmersResult[0].count) || 0;

				const pendingArabicaQC = Number(pendingArabicaQCResult[0].count) || 0;
				const pendingRobustaQC = Number(pendingRobustaQCResult[0].count) || 0;

				const pendingArabicaProcessing = Number(pendingArabicaProcessingResult[0].count) || 0;
				const pendingArabicaWeightProcessing = Number(pendingArabicaWeightProcessingResult[0].sum) || 0;
				const pendingRobustaProcessing = Number(pendingRobustaProcessingResult[0].count) || 0;
				const pendingRobustaWeightProcessing = Number(pendingRobustaWeightProcessingResult[0].sum) || 0;

				const landCoveredArabica = Number(landCoveredArabicaResult[0].sum) || 0;
				const landCoveredRobusta = Number(landCoveredRobustaResult[0].sum) || 0;

				const arabicaYield = arabicaYieldResult || 0;
				const robustaYield = robustaYieldResult || 0;

				// Arrays are not converted to numbers, so leave them as is
				const totalWeightBagsbyDate = totalWeightBagsbyDateResult || [];
				const totalCostbyDate = totalCostbyDateResult || [];

				const arabicaTotalWeightbyDate = arabicaTotalWeightbyDateResult || [];
				const robustaTotalWeightbyDate = robustaTotalWeightbyDateResult || [];

				const arabicaWeightMoM = arabicaWeightMoMResult || [];
				const robustaWeightMoM = robustaWeightMoMResult || [];

				const arabicaCostMoM = arabicaCostMoMResult || [];
				const robustaCostMoM = robustaCostMoMResult || [];

				const arabicaAvgCostMoM = arabicaAvgCostMoMResult || [];
				const robustaAvgCostMoM = robustaAvgCostMoMResult || [];

				const arabicaProcessedMoM = arabicaProcessedMoMResult || [];
				const robustaProcessedMoM = robustaProcessedMoMResult || [];

				const arabicaProductionMoM = arabicaProductionMoMResult || [];
				const robustaProductionMoM = robustaProductionMoMResult || [];

				const arabicaCherryQualitybyDate = arabicaCherryQualitybyDateResult || [];
				const robustaCherryQualitybyDate = robustaCherryQualitybyDateResult || [];

				const arabicaFarmersContribution = arabicaFarmersContributionResult || [];
				const robustaFarmersContribution = robustaFarmersContributionResult || [];

				const arabicaSankey = arabicaSankeyResult || [];
				const robustaSankey = robustaSankeyResult || [];

				const arabicaAchievement = arabicaAchievementResult || [];
				const robustaAchievement = robustaAchievementResult || [];
 
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
 
            activeArabicaFarmers, 
            activeRobustaFarmers,
 
            pendingArabicaQC, 
            pendingRobustaQC,
 
            pendingArabicaProcessing, 
            pendingArabicaWeightProcessing, 
            pendingRobustaProcessing, 
            pendingRobustaWeightProcessing, 
 
            landCoveredArabica,
            landCoveredRobusta,
            arabicaYield,
            robustaYield,
 
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
            robustaProductionMoM,

            arabicaCherryQualitybyDate,
            robustaCherryQualitybyDate,

            arabicaFarmersContribution,
            robustaFarmersContribution,

            arabicaSankey,
            robustaSankey,

            arabicaAchievement,
            robustaAchievement,
 
        });
    } catch (err) {
    console.error('Error fetching dashboard metrics:', err);
    res.status(500).json({ message: 'Failed to fetch dashboard metrics.' });
      }
});


router.get('/arabica-targets', async (req, res) => {
    try {
        const { timeframe = 'this_month' } = req.query;

        let currentStartDate, currentEndDate, previousStartDate, previousEndDate;
        try {
        const dateRanges = getDateRanges(timeframe);
        [currentStartDate, currentEndDate] = dateRanges.currentRange;
        [previousStartDate, previousEndDate] = dateRanges.previousRange || [];
        } catch (error) {
        return res.status(400).json({ message: error.message });
        }

        // Format dates for SQL queries
        const formattedCurrentStartDate = currentStartDate.toISOString().split('T')[0];
        const formattedCurrentEndDate = currentEndDate.toISOString().split('T')[0];
        const formattedPreviousStartDate = previousStartDate?.toISOString().split('T')[0];
        const formattedPreviousEndDate = previousEndDate?.toISOString().split('T')[0];

        const arabicaTargetQuery = `
            WITH target AS (
            SELECT
                'Arabica' as type,
                260000 as "cherryTarget",
                260000/6 as "gbTarget",
                'Washed' as "processingType"

            UNION ALL

            SELECT
                'Arabica' as type,
                120000 as "cherryTarget",
                120000/6 as "gbTarget",
                'Natural' as "processingType"

            UNION ALL

            SELECT
                'Robusta' as type,
                134820 as "cherryTarget",
                134820/4 as "gbTarget",
                'Natural' as "processingType"
            )

            , base as (
            SELECT 
                b.type,
                a."processingType", 
                SUM("weightProcessed") as "weightProcessed" 
            FROM "PreprocessingData" a
            LEFT JOIN "ReceivingData" b on a."batchNumber" = b."batchNumber"
            WHERE a.producer = 'BTM' 
            AND b.merged = FALSE
            AND b."commodityType" = 'Cherry' 
            GROUP BY b.type, a."processingType"
            )

            SELECT
            a."processingType",
            a.type,
            a."weightProcessed" as "cherryNow",
            FLOOR(CASE WHEN a.type = 'Arabica' THEN a."weightProcessed"/6 ELSE a."weightProcessed"/4 END) as "projectedGB",
            b."cherryTarget",
            b."gbTarget",
            FLOOR(a."weightProcessed" - b."cherryTarget") AS "cherryDeficit",
            FLOOR((a."weightProcessed" - b."cherryTarget")/(DATE '2025-08-15' - CURRENT_DATE)) as "cherryperdTarget"
            FROM base a
            LEFT JOIN target b on a.type = b.type and a."processingType" = b."processingType"
            WHERE a.type = 'Arabica';
            `;

        const [arabicaTargetResult] = await sequelize.query(arabicaTargetQuery);
        const arabicaTarget = arabicaTargetResult || [];

        // Return the metrics
        res.json({
            arabicaTarget,
        });
    } catch (err) {
    console.error('Error fetching arabica target:', err);
    res.status(500).json({ message: 'Failed to fetch arabica target.' });
      }
});

router.get('/robusta-targets', async (req, res) => {
    try {
        const { timeframe = 'this_month' } = req.query;

        let currentStartDate, currentEndDate, previousStartDate, previousEndDate;
        try {
        const dateRanges = getDateRanges(timeframe);
        [currentStartDate, currentEndDate] = dateRanges.currentRange;
        [previousStartDate, previousEndDate] = dateRanges.previousRange || [];
        } catch (error) {
        return res.status(400).json({ message: error.message });
        }

        // Format dates for SQL queries
        const formattedCurrentStartDate = currentStartDate.toISOString().split('T')[0];
        const formattedCurrentEndDate = currentEndDate.toISOString().split('T')[0];
        const formattedPreviousStartDate = previousStartDate?.toISOString().split('T')[0];
        const formattedPreviousEndDate = previousEndDate?.toISOString().split('T')[0];

        const robustaTargetQuery = `
            WITH target AS (
            SELECT
                'Arabica' as type,
                260000 as "cherryTarget",
                260000/6 as "gbTarget",
                'Washed' as "processingType"

            UNION ALL

            SELECT
                'Arabica' as type,
                120000 as "cherryTarget",
                120000/6 as "gbTarget",
                'Natural' as "processingType"

            UNION ALL

            SELECT
                'Robusta' as type,
                134820 as "cherryTarget",
                134820/4 as "gbTarget",
                'Natural' as "processingType"
            )

            , base as (
            SELECT 
                b.type,
                a."processingType", 
                SUM("weightProcessed") as "weightProcessed" 
            FROM "PreprocessingData" a
            LEFT JOIN "ReceivingData" b on a."batchNumber" = b."batchNumber"
            WHERE a.producer = 'BTM' 
            AND b.merged = FALSE
            AND b."commodityType" = 'Cherry' 
            GROUP BY b.type, a."processingType"
            )

            SELECT
            a."processingType",
            a.type,
            a."weightProcessed" as "cherryNow",
            FLOOR(CASE WHEN a.type = 'Arabica' THEN a."weightProcessed"/6 ELSE a."weightProcessed"/4 END) as "projectedGB",
            b."cherryTarget",
            b."gbTarget",
            FLOOR(a."weightProcessed" - b."cherryTarget") AS "cherryDeficit",
            FLOOR((a."weightProcessed" - b."cherryTarget")/(DATE '2025-08-15' - CURRENT_DATE)) as "cherryperdTarget"
            FROM base a
            LEFT JOIN target b on a.type = b.type and a."processingType" = b."processingType"
            WHERE a.type = 'Robusta';
            `;

        const [robustaTargetResult] = await sequelize.query(robustaTargetQuery);
        const robustaTarget = robustaTargetResult || [];

        // Return the metrics
        res.json({
            robustaTarget,
        });
    } catch (err) {
    console.error('Error fetching robusta target:', err);
    res.status(500).json({ message: 'Failed to fetch robusta target.' });
      }
});

router.get('/land-targets', async (req, res) => {
    try {
        const { timeframe = 'this_month' } = req.query;

        let currentStartDate, currentEndDate, previousStartDate, previousEndDate;
        try {
        const dateRanges = getDateRanges(timeframe);
        [currentStartDate, currentEndDate] = dateRanges.currentRange;
        [previousStartDate, previousEndDate] = dateRanges.previousRange || [];
        } catch (error) {
        return res.status(400).json({ message: error.message });
        }

        // Format dates for SQL queries
        const formattedCurrentStartDate = currentStartDate.toISOString().split('T')[0];
        const formattedCurrentEndDate = currentEndDate.toISOString().split('T')[0];
        const formattedPreviousStartDate = previousStartDate?.toISOString().split('T')[0];
        const formattedPreviousEndDate = previousEndDate?.toISOString().split('T')[0];

        const landTargetQuery = `
            SELECT 
                a."farmerName",
                a."brokerName",
                a."askingPrice" as "contractValue",
                a."cherryEstimate",
                a."gbEstimate",
                COALESCE(SUM(c.weight),0) as currentcherrytotal,
                COALESCE(SUM(c.weight),0) - a."cherryEstimate" as difference
            FROM "LandContract" a
            LEFT JOIN "Farmers" b on a."farmerName" = b."farmerName"
            LEFT JOIN "ReceivingData" c on b."farmerID" = c."farmerID"
            WHERE c.merged = FALSE
            AND c."commodityType" = 'Cherry' 
            GROUP BY 
                a."farmerName",
                a."brokerName",
                a."askingPrice",
                a."cherryEstimate",
                a."gbEstimate"
            ORDER BY "brokerName", "askingPrice";
            `;

        const [landTargetResult] = await sequelize.query(landTargetQuery);
        const landTarget = landTargetResult || [];

        // Return the metrics
        res.json({
            landTarget,
        });
    } catch (err) {
    console.error('Error fetching land target:', err);
    res.status(500).json({ message: 'Failed to fetch land target.' });
      }
});

router.get('/heqa-targets', async (req, res) => {
    try {
        const { timeframe = 'this_month' } = req.query;

        let currentStartDate, currentEndDate, previousStartDate, previousEndDate;
        try {
        const dateRanges = getDateRanges(timeframe);
        [currentStartDate, currentEndDate] = dateRanges.currentRange;
        [previousStartDate, previousEndDate] = dateRanges.previousRange || [];
        } catch (error) {
        return res.status(400).json({ message: error.message });
        }

        // Format dates for SQL queries
        const formattedCurrentStartDate = currentStartDate.toISOString().split('T')[0];
        const formattedCurrentEndDate = currentEndDate.toISOString().split('T')[0];
        const formattedPreviousStartDate = previousStartDate?.toISOString().split('T')[0];
        const formattedPreviousEndDate = previousEndDate?.toISOString().split('T')[0];

        const heqaTargetQuery = `
            WITH target AS (
            SELECT
                4200*5 as "cherryTarget",
                4200 as "gbTarget",
                'Regional Lot' as "productLine",
                'Pulped Natural' as "processingType",
                'Arabica' as type

            UNION ALL

            SELECT
                600*5 as "cherryTarget",
                600 as "gbTarget",
                'Micro Lot' as "productLine",
                'Natural' as "processingType",
                'Robusta' as type

            UNION ALL

            SELECT
                475*5 as "cherryTarget",
                475 as "gbTarget",
                'Micro Lot' as "productLine",
                'CM Natural' as "processingType",
                'Arabica' as type

            UNION ALL

            SELECT
                600*5 as "cherryTarget",
                600 as "gbTarget",
                'Micro Lot' as "productLine",
                'CM Pulped Natural' as "processingType",
                'Arabica' as type

            UNION ALL

            SELECT
                700*5 as "cherryTarget",
                700 as "gbTarget",
                'Micro Lot' as "productLine",
                'Aerobic Natural' as "processingType",
                'Arabica' as type

            UNION ALL

            SELECT
                600*5 as "cherryTarget",
                600 as "gbTarget",
                'Micro Lot' as "productLine",
                'Anaerobic Pulped Natural' as "processingType",
                'Arabica' as type

            UNION ALL

            SELECT
                5000*5 as "cherryTarget",
                5000 as "gbTarget",
                'Regional Lot' as "productLine",
                'Pulped Natural' as "processingType",
                'Robusta' as type
            )

            , base as (
            SELECT 
                a."productLine",
                a."processingType",
                b.type,
                SUM("weightProcessed") as "weightProcessed" 
            FROM "PreprocessingData" a
            LEFT JOIN "ReceivingData" b on a."batchNumber" = b."batchNumber"
            WHERE a.producer = 'HQ' 
            AND b.merged = FALSE
            AND b."commodityType" = 'Cherry' 
            GROUP BY a."productLine", a."processingType", b.type
            )

            SELECT
            a."productLine",
            a."weightProcessed" as "cherryNow",
            FLOOR(a."weightProcessed"/5) as "projectedGB",
            b."cherryTarget",
            b."gbTarget",
            FLOOR(a."weightProcessed" - b."cherryTarget") AS "cherryDeficit",
            FLOOR((a."weightProcessed" - b."cherryTarget")/(DATE '2025-08-15' - CURRENT_DATE)) as "cherryperdTarget"
            FROM base a
            LEFT JOIN target b on a."productLine" = b."productLine" AND a.type = b.type AND a."processingType" = b."processingType" ;
            `;

        const [heqaTargetResult] = await sequelize.query(heqaTargetQuery);
        const heqaTarget = heqaTargetResult || [];

        // Return the metrics
        res.json({
            heqaTarget,
        });
    } catch (err) {
    console.error('Error fetching heqa target:', err);
    res.status(500).json({ message: 'Failed to fetch heqa target.' });
      }
});

router.get('/batch-tracking', async (req, res) => {
    try {
      const { batchNumbers } = req.query; // Optional batchNumber filter (comma-separated)
  
      let query = `
        SELECT 
          "batchNumber",
          "farmerName",
          processingtype,
          "grade",
          COALESCE(CAST("receiving_weight" AS TEXT), 'N/A') AS "receiving_weight",
          "receiving_date",
          "qc_date",
          "preprocessing_date",
          COALESCE(CAST("preprocessing_weight" AS TEXT), 'N/A') AS "preprocessing_weight",
          "wet_mill_entered_date",
          "wet_mill_exited_date",
          COALESCE(CAST("wetmill_weight" AS TEXT), 'N/A') AS "wetmill_weight",
          "wetmill_weight_date",
          "fermentation_start_date",
          "fermentation_end_date",
          COALESCE(CAST("fermentation_weight" AS TEXT), 'N/A') AS "fermentation_weight",
          "fermentation_weight_date",
          "drying_entered_date",
          "drying_exited_date",
          COALESCE(CAST("drying_weight" AS TEXT), 'N/A') AS "drying_weight",
          "drying_weight_date",
          "dry_mill_entered_date",
          "dry_mill_exited_date",
          "dry_mill_split_date",
          COALESCE(CAST("dry_mill_weight" AS TEXT), 'N/A') AS "dry_mill_weight",
          "storage_date",
          "position",
          "status"
        FROM "BatchTrackingView"
      `;
  
      // Add batch number filtering if provided
      if (batchNumbers) {
        const batchArray = batchNumbers.split(',').map(num => `'${num.trim()}'`).join(',');
        query += ` WHERE "batchNumber" IN (${batchArray})`;
      }
  
      // Order by batchNumber and processingType for consistency
      query += ` ORDER BY "batchNumber", "processingType"`;
  
      // Execute the query
      const [results] = await sequelize.query(query);
  
      // Return the results
      res.json(results);
    } catch (err) {
      console.error('Error fetching batch tracking data:', err);
      res.status(500).json({ message: 'Failed to fetch batch tracking data.' });
    }
  });

 
module.exports = router;