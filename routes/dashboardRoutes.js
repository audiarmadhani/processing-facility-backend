const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

const getDateRanges = (timeframe) => {
  const now = new Date();
  const ranges = { currentRange: [], previousRange: [] };

  const setRanges = (currentStart, currentEnd, prevStart, prevEnd) => {
    ranges.currentRange = [currentStart, currentEnd];
    ranges.previousRange = [prevStart, prevEnd];
  };

  switch (timeframe) {
    case 'this_week': {
      const startOfWeek = new Date(now.setDate(now.getDate() - ((now.getDay() + 6) % 7)));
      setRanges(startOfWeek, new Date(), new Date(startOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000), new Date(startOfWeek.getTime() - 24 * 60 * 60 * 1000));
      break;
    }
    case 'last_week': {
      const startOfLastWeek = new Date(now.setDate(now.getDate() - ((now.getDay() + 6) % 7) - 7));
      setRanges(startOfLastWeek, new Date(startOfLastWeek.getTime() + 6 * 24 * 60 * 60 * 1000), new Date(startOfLastWeek.getTime() - 7 * 24 * 60 * 60 * 1000), new Date(startOfLastWeek.getTime() - 24 * 60 * 60 * 1000));
      break;
    }
    case 'this_month': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      setRanges(startOfMonth, new Date(), new Date(now.getFullYear(), now.getMonth() - 1, 1), new Date(now.getFullYear(), now.getMonth(), 0));
      break;
    }
    case 'last_month': {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      setRanges(startOfLastMonth, new Date(now.getFullYear(), now.getMonth(), 0), new Date(now.getFullYear(), now.getMonth() - 2, 1), new Date(now.getFullYear(), now.getMonth() - 1, 0));
      break;
    }
    case 'this_year': {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      setRanges(startOfYear, new Date(), new Date(now.getFullYear() - 1, 0, 1), new Date(now.getFullYear() - 1, 11, 31));
      break;
    }
    case 'last_year': {
      const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
      setRanges(startOfLastYear, new Date(now.getFullYear() - 1, 11, 31), new Date(now.getFullYear() - 2, 0, 1), new Date(now.getFullYear() - 2, 11, 31));
      break;
    }
    default:
      throw new Error('Invalid timeframe');
  }
  return ranges;
};

router.get('/dashboard-metrics', async (req, res) => {
  try {
    const { timeframe = 'this_month' } = req.query;
    const { currentRange: [currentStart, currentEnd], previousRange: [prevStart, prevEnd] } = getDateRanges(timeframe);

    const formatDate = date => date.toISOString().split('T')[0];
    const [currentStartDate, currentEndDate, prevStartDate, prevEndDate] = [currentStart, currentEnd, prevStart, prevEnd].map(formatDate);

    const queries = {
      totalBatches: `SELECT COALESCE(COUNT(*), 0) AS count FROM "ReceivingData" WHERE "receivingDate" BETWEEN '${currentStartDate}' AND '${currentEndDate}'`,
      totalWeight: type => `SELECT COALESCE(SUM(weight), 0) AS sum FROM "ReceivingData" WHERE "receivingDate" BETWEEN '${currentStartDate}' AND '${currentEndDate}' AND type = '${type}'`,
      lastMonthWeight: type => `SELECT COALESCE(SUM(weight), 0) AS sum FROM "ReceivingData" WHERE "receivingDate" BETWEEN '${prevStartDate}' AND '${prevEndDate}' AND type = '${type}'`,
      totalCost: type => `SELECT COALESCE(SUM(price * weight), 0) AS sum FROM "QCData_v" WHERE "receivingDate" BETWEEN '${currentStartDate}' AND '${currentEndDate}' AND type = '${type}'`,
      lastMonthCost: type => `SELECT COALESCE(SUM(price * weight), 0) AS sum FROM "QCData_v" WHERE "receivingDate" BETWEEN '${prevStartDate}' AND '${prevEndDate}' AND type = '${type}'`,
      avgCost: type => `SELECT COALESCE(ROUND(AVG(price)::numeric, 1), 0) AS avg FROM "QCData_v" WHERE "receivingDate" BETWEEN '${currentStartDate}' AND '${currentEndDate}' AND type = '${type}'`,
      lastMonthAvgCost: type => `SELECT COALESCE(ROUND(AVG(price)::numeric, 1), 0) AS avg FROM "QCData_v" WHERE "receivingDate" BETWEEN '${prevStartDate}' AND '${prevEndDate}' AND type = '${type}'`,
      totalProcessed: type => `SELECT COALESCE(ROUND(SUM((b.weight / b."totalBags") * a."bagsProcessed")::numeric, 1), 0) AS sum FROM "PreprocessingData" a LEFT JOIN "ReceivingData" b ON a."batchNumber" = b."batchNumber" WHERE "processingDate" BETWEEN '${currentStartDate}' AND '${currentEndDate}' AND type = '${type}'`,
      lastMonthProcessed: type => `SELECT COALESCE(ROUND(SUM((b.weight / b."totalBags") * a."bagsProcessed")::numeric, 1), 0) AS sum FROM "PreprocessingData" a LEFT JOIN "ReceivingData" b ON a."batchNumber" = b."batchNumber" WHERE "processingDate" BETWEEN '${prevStartDate}' AND '${prevEndDate}' AND type = '${type}'`,
      totalProduction: type => `SELECT COALESCE(SUM(weight), 0) AS sum FROM "PostprocessingData" WHERE "storedDate" BETWEEN '${currentStartDate}' AND '${currentEndDate}' AND type = '${type}'`,
      lastMonthProduction: type => `SELECT COALESCE(SUM(weight), 0) AS sum FROM "PostprocessingData" WHERE "storedDate" BETWEEN '${prevStartDate}' AND '${prevEndDate}' AND type = '${type}'`,
      activeFarmers: type => `SELECT COALESCE(SUM(isActive), 0) AS count FROM "Farmers" WHERE "farmType" IN ('${type}', 'Mix', 'Mixed')`,
      pendingQC: type => `SELECT COALESCE(COUNT(*), 0) AS count FROM "ReceivingData" rd LEFT JOIN "QCData" qd ON rd."batchNumber" = qd."batchNumber" WHERE qd."batchNumber" IS NULL AND rd.type = '${type}'`,
      pendingProcessing: type => `SELECT COALESCE(COUNT(*), 0) AS count FROM "QCData" qd LEFT JOIN "PreprocessingData" pd ON qd."batchNumber" = pd."batchNumber" LEFT JOIN "ReceivingData" rd ON qd."batchNumber" = rd."batchNumber" WHERE pd."batchNumber" IS NULL AND rd.type = '${type}'`,
      pendingWeightProcessing: type => `SELECT COALESCE(SUM(rd.weight), 0) AS sum FROM "QCData" qd LEFT JOIN "PreprocessingData" pd ON qd."batchNumber" = pd."batchNumber" LEFT JOIN "ReceivingData" rd ON qd."batchNumber" = rd."batchNumber" WHERE pd."batchNumber" IS NULL AND rd.type = '${type}'`,
      landCovered: type => `SELECT COALESCE(SUM("farmerLandArea"), 0) AS sum FROM "Farmers" WHERE "farmType" = '${type}' AND isActive = '1'`,
      yield: type => `
        WITH pre AS (SELECT b.type, COALESCE(SUM(b.weight), 0) AS weight FROM "PreprocessingData" a LEFT JOIN "ReceivingData" b ON a."batchNumber" = b."batchNumber" WHERE b.type = '${type}' GROUP BY b.type),
        post AS (SELECT type, COALESCE(SUM(weight), 0) AS weight FROM "PostprocessingData" WHERE type = '${type}' GROUP BY type)
        SELECT COALESCE(ROUND(((b.weight / a.weight) * 100)::numeric, 2), 0) AS sum FROM pre a LEFT JOIN post b ON a.type = b.type WHERE a.type = '${type}'
      `,
      totalWeightBagsbyDate: `SELECT DATE("receivingDate") AS date, COALESCE(SUM(weight), 0) AS total_weight, COALESCE(SUM("totalBags"), 0) AS total_bags FROM "ReceivingData" GROUP BY DATE("receivingDate")`,
      totalCostbyDate: `SELECT DATE("receivingDate") AS date, COALESCE(SUM(price), 0) AS price FROM "QCData_v" GROUP BY DATE("receivingDate")`,
      totalWeightbyDate: type => `
        WITH RECURSIVE "DateRange" AS (
          SELECT DATE_TRUNC('month', CURRENT_DATE)::TIMESTAMP AS "Date"
          UNION ALL
          SELECT "Date" + INTERVAL '1 day' FROM "DateRange" WHERE "Date" + INTERVAL '1 day' <= CURRENT_DATE
        ),
        ppd AS (
          SELECT "referenceNumber" AS category, COALESCE(SUM(weight), 0) AS weight, DATE("storedDate") AS "storedDate"
          FROM "PostprocessingData" WHERE "storedDate" BETWEEN '${currentStartDate}' AND '${currentEndDate}' AND type = '${type}'
          GROUP BY "referenceNumber", DATE("storedDate")
        )
        SELECT TO_CHAR(a."Date", 'Mon-DD') AS "storedDate", category, COALESCE(SUM(b.weight), 0) AS weight
        FROM "DateRange" a LEFT JOIN ppd b ON a."Date" = b."storedDate" WHERE category IS NOT NULL GROUP BY a."Date", category
      `,
      weightMoM: type => `
        WITH RECURSIVE "DateRange" AS (
          SELECT DATE_TRUNC('month', CURRENT_DATE)::TIMESTAMP AS "Date"
          UNION ALL
          SELECT "Date" + INTERVAL '1 day' FROM "DateRange" WHERE "Date" + INTERVAL '1 day' <= CURRENT_DATE
        ),
        RDA AS (
          SELECT DATE("receivingDate") AS "receivingDate", COALESCE(SUM(weight), 0) AS "TotalWeightThisMonth"
          FROM "ReceivingData" WHERE "receivingDate" BETWEEN '${currentStartDate}' AND '${currentEndDate}' AND type = '${type}'
          GROUP BY DATE("receivingDate")
        ),
        RDB AS (
          SELECT DATE("receivingDate") AS "receivingDate", COALESCE(SUM(weight), 0) AS "TotalWeightLastMonth"
          FROM "ReceivingData" WHERE "receivingDate" BETWEEN '${prevStartDate}' AND '${prevEndDate}' AND type = '${type}'
          GROUP BY DATE("receivingDate")
        )
        SELECT TO_CHAR(a."Date", 'Mon-DD') AS "Date",
          COALESCE(SUM(b."TotalWeightThisMonth"), 0) AS "TotalWeightThisMonth",
          COALESCE(SUM(c."TotalWeightLastMonth"), 0) AS "TotalWeightLastMonth"
        FROM "DateRange" a
        LEFT JOIN RDA b ON a."Date" = b."receivingDate"
        LEFT JOIN RDB c ON EXTRACT(DAY FROM a."Date") = EXTRACT(DAY FROM c."receivingDate")
        GROUP BY a."Date"
      `,
      costMoM: type => `
        WITH RECURSIVE "DateRange" AS (
          SELECT DATE_TRUNC('month', CURRENT_DATE)::TIMESTAMP AS "Date"
          UNION ALL
          SELECT "Date" + INTERVAL '1 day' FROM "DateRange" WHERE "Date" + INTERVAL '1 day' <= CURRENT_DATE
        ),
        RDA AS (
          SELECT DATE("receivingDate") AS "receivingDate", COALESCE(SUM(price * weight), 0) AS "TotalCostThisMonth"
          FROM "QCData_v" WHERE "receivingDate" BETWEEN '${currentStartDate}' AND '${currentEndDate}' AND type = '${type}'
          GROUP BY DATE("receivingDate")
        ),
        RDB AS (
          SELECT DATE("receivingDate") AS "receivingDate", COALESCE(SUM(price * weight), 0) AS "TotalCostLastMonth"
          FROM "QCData_v" WHERE "receivingDate" BETWEEN '${prevStartDate}' AND '${prevEndDate}' AND type = '${type}'
          GROUP BY DATE("receivingDate")
        )
        SELECT TO_CHAR(a."Date", 'Mon-DD') AS "Date",
          COALESCE(SUM(b."TotalCostThisMonth"), 0) AS "TotalCostThisMonth",
          COALESCE(SUM(c."TotalCostLastMonth"), 0) AS "TotalCostLastMonth"
        FROM "DateRange" a
        LEFT JOIN RDA b ON a."Date" = b."receivingDate"
        LEFT JOIN RDB c ON EXTRACT(DAY FROM a."Date") = EXTRACT(DAY FROM c."receivingDate")
        GROUP BY a."Date"
      `,
      avgCostMoM: type => `
        WITH RECURSIVE "DateRange" AS (
          SELECT DATE_TRUNC('month', CURRENT_DATE)::TIMESTAMP AS "Date"
          UNION ALL
          SELECT "Date" + INTERVAL '1 day' FROM "DateRange" WHERE "Date" + INTERVAL '1 day' <= CURRENT_DATE
        ),
        RDA AS (
          SELECT DATE("receivingDate") AS "receivingDate", COALESCE(SUM(price), 0) AS "TotalPriceThisMonth", COALESCE(COUNT(price), 0) AS "CountThisMonth"
          FROM "QCData_v" WHERE "receivingDate" BETWEEN '${currentStartDate}' AND '${currentEndDate}' AND type = '${type}'
          GROUP BY DATE("receivingDate")
        ),
        RDB AS (
          SELECT DATE("receivingDate") AS "receivingDate", COALESCE(SUM(price), 0) AS "TotalPriceLastMonth", COALESCE(COUNT(price), 0) AS "CountLastMonth"
          FROM "QCData_v" WHERE "receivingDate" BETWEEN '${prevStartDate}' AND '${prevEndDate}' AND type = '${type}'
          GROUP BY DATE("receivingDate")
        ),
        Cumulative AS (
          SELECT a."Date",
            COALESCE(SUM(b."TotalPriceThisMonth"), 0) AS "CumulativePriceThisMonth",
            COALESCE(SUM(b."CountThisMonth"), 0) AS "CumulativeCountThisMonth",
            COALESCE(SUM(c."TotalPriceLastMonth"), 0) AS "CumulativePriceLastMonth",
            COALESCE(SUM(c."CountLastMonth"), 0) AS "CumulativeCountLastMonth"
          FROM "DateRange" a
          LEFT JOIN RDA b ON a."Date" = b."receivingDate"
          LEFT JOIN RDB c ON EXTRACT(DAY FROM a."Date") = EXTRACT(DAY FROM c."receivingDate")
          GROUP BY a."Date"
        )
        SELECT TO_CHAR(a."Date", 'Mon-DD') AS "Date",
          COALESCE(ROUND(CASE WHEN "CumulativeCountThisMonth" > 0 THEN "CumulativePriceThisMonth" * 1.0 / "CumulativeCountThisMonth" ELSE 0 END, 1), 0) AS "RunningAverageCostThisMonth",
          COALESCE(ROUND(CASE WHEN "CumulativeCountLastMonth" > 0 THEN "CumulativePriceLastMonth" * 1.0 / "CumulativeCountLastMonth" ELSE 0 END, 1), 0) AS "RunningAverageCostLastMonth"
        FROM Cumulative a
      `,
      processedMoM: type => `
        WITH RECURSIVE "DateRange" AS (
          SELECT DATE_TRUNC('month', CURRENT_DATE)::TIMESTAMP AS "Date"
          UNION ALL
          SELECT "Date" + INTERVAL '1 day' FROM "DateRange" WHERE "Date" + INTERVAL '1 day' <= CURRENT_DATE
        ),
        RDA AS (
          SELECT DATE("processingDate") AS "processingDate", COALESCE(ROUND(SUM((b.weight / b."totalBags") * a."bagsProcessed")::numeric, 1), 0) AS "TotalWeightThisMonth"
          FROM "PreprocessingData" a LEFT JOIN "ReceivingData" b ON a."batchNumber" = b."batchNumber"
          WHERE "processingDate" BETWEEN '${currentStartDate}' AND '${currentEndDate}' AND type = '${type}'
          GROUP BY DATE("processingDate")
        ),
        RDB AS (
          SELECT DATE("processingDate") AS "processingDate", COALESCE(ROUND(SUM((b.weight / b."totalBags") * a."bagsProcessed")::numeric, 1), 0) AS "TotalWeightLastMonth"
          FROM "PreprocessingData" a LEFT JOIN "ReceivingData" b ON a."batchNumber" = b."batchNumber"
          WHERE "processingDate" BETWEEN '${prevStartDate}' AND '${prevEndDate}' AND type = '${type}'
          GROUP BY DATE("processingDate")
        )
        SELECT TO_CHAR(a."Date", 'Mon-DD') AS "Date",
          COALESCE(SUM(b."TotalWeightThisMonth"), 0) AS "TotalWeightThisMonth",
          COALESCE(SUM(c."TotalWeightLastMonth"), 0) AS "TotalWeightLastMonth"
        FROM "DateRange" a
        LEFT JOIN RDA b ON a."Date" = b."processingDate"
        LEFT JOIN RDB c ON EXTRACT(DAY FROM a."Date") = EXTRACT(DAY FROM c."processingDate")
        GROUP BY a."Date"
      `,
      productionMoM: type => `
        WITH RECURSIVE "DateRange" AS (
          SELECT DATE_TRUNC('month', CURRENT_DATE)::TIMESTAMP AS "Date"
          UNION ALL
          SELECT "Date" + INTERVAL '1 day' FROM "DateRange" WHERE "Date" + INTERVAL '1 day' <= CURRENT_DATE
        ),
        RDA AS (
          SELECT DATE("storedDate") AS "storedDate", COALESCE(SUM(weight), 0) AS "TotalWeightThisMonth"
          FROM "PostprocessingData" WHERE "storedDate" BETWEEN '${currentStartDate}' AND '${currentEndDate}' AND type = '${type}'
          GROUP BY DATE("storedDate")
        ),
        RDB AS (
          SELECT DATE("storedDate") AS "storedDate", COALESCE(SUM(weight), 0) AS "TotalWeightLastMonth"
          FROM "PostprocessingData" WHERE "storedDate" BETWEEN '${prevStartDate}' AND '${prevEndDate}' AND type = '${type}'
          GROUP BY DATE("storedDate")
        )
        SELECT TO_CHAR(a."Date", 'Mon-DD') AS "Date",
          COALESCE(SUM(b."TotalWeightThisMonth"), 0) AS "TotalWeightThisMonth",
          COALESCE(SUM(c."TotalWeightLastMonth"), 0) AS "TotalWeightLastMonth"
        FROM "DateRange" a
        LEFT JOIN RDA b ON a."Date" = b."storedDate"
        LEFT JOIN RDB c ON EXTRACT(DAY FROM a."Date") = EXTRACT(DAY FROM c."storedDate")
        GROUP BY a."Date"
      `,
      cherryQualitybyDate: type => `
        SELECT "qcDate",
          COALESCE(AVG("unripePercentage"), 0) AS "unripePercentage",
          COALESCE(AVG("semiripePercentage"), 0) AS "semiripePercentage",
          COALESCE(AVG("ripePercentage"), 0) AS "ripePercentage",
          COALESCE(AVG("overripePercentage"), 0) AS "overripePercentage"
        FROM (
          SELECT a."batchNumber", DATE(MIN("qcDate")) AS "qcDate",
            COALESCE(AVG("unripePercentage"), 0) AS "unripePercentage",
            COALESCE(AVG("semiripePercentage"), 0) AS "semiripePercentage",
            COALESCE(AVG("ripePercentage"), 0) AS "ripePercentage",
            COALESCE(AVG("overripePercentage"), 0) AS "overripePercentage"
          FROM "QCData" a LEFT JOIN "ReceivingData" b ON a."batchNumber" = b."batchNumber"
          WHERE "unripePercentage" IS NOT NULL AND b.type = '${type}'
          GROUP BY a."batchNumber"
        ) a GROUP BY "qcDate"
      `,
      farmersContribution: type => `
        SELECT a."farmerName", COALESCE(SUM(a.weight), 0) AS weight,
          COALESCE(SUM(b."unripeWeight"), 0) AS "unripeWeight",
          COALESCE(SUM(b."semiripeWeight"), 0) AS "semiripeWeight",
          COALESCE(SUM(b."ripeWeight"), 0) AS "ripeWeight",
          COALESCE(SUM(b."overripeWeight"), 0) AS "overripeWeight",
          COALESCE(CASE WHEN (SUM(a.weight) - (COALESCE(SUM(b."unripeWeight"), 0) + COALESCE(SUM(b."semiripeWeight"), 0) + COALESCE(SUM(b."ripeWeight"), 0) + COALESCE(SUM(b."overripeWeight"), 0))) < 0 THEN 0
            ELSE (SUM(a.weight) - (COALESCE(SUM(b."unripeWeight"), 0) + COALESCE(SUM(b."semiripeWeight"), 0) + COALESCE(SUM(b."ripeWeight"), 0) + COALESCE(SUM(b."overripeWeight"), 0))) END, 0) AS "unknownWeight"
        FROM "ReceivingData" a
        LEFT JOIN (
          SELECT a."batchNumber", SUM(b.weight) * COALESCE(AVG("unripePercentage") / 100, 0) AS "unripeWeight",
            SUM(b.weight) * COALESCE(AVG("semiripePercentage") / 100, 0) AS "semiripeWeight",
            SUM(b.weight) * COALESCE(AVG("ripePercentage") / 100, 0) AS "ripeWeight",
            SUM(b.weight) * COALESCE(AVG("overripePercentage") / 100, 0) AS "overripeWeight"
          FROM "QCData" a LEFT JOIN "ReceivingData" b ON a."batchNumber" = b."batchNumber"
          WHERE "ripePercentage" IS NOT NULL GROUP BY a."batchNumber"
        ) b ON a."batchNumber" = b."batchNumber"
        WHERE a.type = '${type}' AND "receivingDate" BETWEEN '${currentStartDate}' AND '${currentEndDate}'
        GROUP BY "farmerName"
      `,
      sankey: type => `
        WITH "Cherries" AS (SELECT COALESCE(SUM(weight), 0) AS total_cherries_weight FROM "ReceivingData" WHERE type = '${type}' AND "receivingDate" BETWEEN '${currentStartDate}' AND '${currentEndDate}'),
        "ProcessedGreenBeans" AS (
          SELECT COALESCE(SUM(ROUND(CAST((b.weight / b."totalBags") * a."bagsProcessed" AS numeric), 2)::FLOAT), 0) AS total_processed_green_beans_weight, b."batchNumber"
          FROM "PreprocessingData" a LEFT JOIN "ReceivingData" b ON a."batchNumber" = b."batchNumber"
          WHERE b.type = '${type}' AND "receivingDate" BETWEEN '${currentStartDate}' AND '${currentEndDate}' GROUP BY b."batchNumber"
        ),
        "FinishedGreenBeans" AS (
          SELECT weight, producer, quality, "productLine", "processingType", "batchNumber"
          FROM "PostprocessingData" WHERE type = '${type}' AND "storedDate" BETWEEN '${currentStartDate}' AND '${currentEndDate}'
        ),
        "TotalFinishedGreenBeans" AS (SELECT COALESCE(SUM(weight), 0) AS total_finished_weight FROM "FinishedGreenBeans"),
        "LossesFromCherries" AS (
          SELECT COALESCE(c.total_cherries_weight - COALESCE(SUM(pgb.total_processed_green_beans_weight), 0), 0) AS total_unprocessed_cherries
          FROM "Cherries" c LEFT JOIN "ProcessedGreenBeans" pgb ON 1 = 1 GROUP BY c.total_cherries_weight
        ),
        "TotalProcessedGreenBeans" AS (SELECT COALESCE(SUM(total_processed_green_beans_weight), 0) AS total_processed_weight FROM "ProcessedGreenBeans"),
        "LossesFromProcessed" AS (
          SELECT COALESCE((SELECT total_processed_weight FROM "TotalProcessedGreenBeans") - COALESCE((SELECT total_finished_weight FROM "TotalFinishedGreenBeans"), 0), 0) AS total_losses_processed GROUP BY 1
        ),
        CombinedFlows AS (
          SELECT 'Cherries' AS from_node, 'Processed Cherries' AS to_node, COALESCE(SUM(pgb.total_processed_green_beans_weight), 0) AS value FROM "ProcessedGreenBeans" pgb GROUP BY 1, 2
          UNION ALL
          SELECT 'Cherries' AS from_node, 'Unprocessed Cherries' AS to_node, COALESCE(lc.total_unprocessed_cherries, 0) AS value FROM "LossesFromCherries" lc GROUP BY 1, 2
          UNION ALL
          SELECT 'Cherries' AS from_node, 'Processed Cherries' AS to_node, tfgb.total_finished_weight AS value FROM "TotalFinishedGreenBeans" tfgb CROSS JOIN "LossesFromCherries" lc WHERE COALESCE(lc.total_unprocessed_cherries, 0) = 0 GROUP BY 1, 2, tfgb.total_finished_weight
          UNION ALL
          SELECT 'Processed Cherries' AS from_node, 'Finished Green Beans' AS to_node, COALESCE(SUM(fgb.weight), 0) AS value FROM "FinishedGreenBeans" fgb GROUP BY 1, 2
          UNION ALL
          SELECT 'Processed Cherries' AS from_node, 'Processing Loss & Unfinished Processing' AS to_node, COALESCE(lp.total_losses_processed, 0) AS value FROM "LossesFromProcessed" lp
          UNION ALL
          SELECT 'Finished Green Beans' AS from_node, fgb.producer AS to_node, COALESCE(SUM(fgb.weight), 0) AS value FROM "FinishedGreenBeans" fgb GROUP BY 1, 2
          UNION ALL
          SELECT fgb.producer AS from_node, fgb.quality AS to_node, COALESCE(SUM(fgb.weight), 0) AS value FROM "FinishedGreenBeans" fgb GROUP BY 1, 2
          UNION ALL
          SELECT fgb.quality AS from_node, pl."productLine" AS to_node, COALESCE(SUM(fgb.weight), 0) AS value FROM "FinishedGreenBeans" fgb LEFT JOIN "ProductLines" pl ON fgb."productLine" = pl."productLine" GROUP BY 1, 2
          UNION ALL
          SELECT pl."productLine" AS from_node, pt."processingType" AS to_node, COALESCE(SUM(fgb.weight), 0) AS value FROM "FinishedGreenBeans" fgb LEFT JOIN "ProductLines" pl ON fgb."productLine" = pl."productLine" LEFT JOIN "ProcessingTypes" pt ON fgb."processingType" = pt."processingType" GROUP BY 1, 2
        )
        SELECT from_node, to_node, COALESCE(SUM(value), 0) AS value FROM CombinedFlows GROUP BY from_node, to_node
      `,
      achievement: type => `
        WITH DateSeries AS (
          SELECT generate_series('${currentStartDate}'::date, '${currentEndDate}'::date, '1 day'::interval) AS date
        ),
        TargetMetricsAggregated AS (
          SELECT tm."referenceNumber", COALESCE(SUM(tm."targetValue"), 0) AS total_target_value
          FROM "TargetMetrics" tm LEFT JOIN "ReferenceMappings_duplicate" b ON tm."referenceNumber" = b."referenceNumber"
          WHERE tm."referenceNumber" IN (SELECT DISTINCT "referenceNumber" FROM "PostprocessingData")
          AND tm."startDate" BETWEEN '${currentStartDate}' AND '${currentEndDate}' AND b.type = '${type}'
          GROUP BY tm."referenceNumber"
        ),
        PostprocessingDataAggregated AS (
          SELECT p."referenceNumber", p."storedDate"::date, COALESCE(SUM(p.weight), 0) AS daily_weight
          FROM "PostprocessingData" p WHERE p."storedDate"::date BETWEEN '${currentStartDate}' AND '${currentEndDate}' AND type = '${type}'
          GROUP BY p."referenceNumber", p."storedDate"::date
        ),
        DailyAchievement AS (
          SELECT ds.date, tma."referenceNumber", tma.total_target_value, COALESCE(pda.daily_weight, 0) AS daily_weight,
            COALESCE(CASE WHEN tma.total_target_value = 0 THEN 0 ELSE (pda.daily_weight / tma.total_target_value) * 100 END, 0) AS daily_achievement_percentage
          FROM DateSeries ds
          LEFT JOIN TargetMetricsAggregated tma ON tma."referenceNumber" IN (SELECT DISTINCT "referenceNumber" FROM "PostprocessingData")
          LEFT JOIN PostprocessingDataAggregated pda ON ds.date = pda."storedDate" AND tma."referenceNumber" = pda."referenceNumber"
          WHERE ds.date BETWEEN '${currentStartDate}' AND '${currentEndDate}'
        )
        SELECT DATE(date) AS date, "referenceNumber",
          COALESCE(ROUND(CAST(SUM(daily_achievement_percentage) OVER (PARTITION BY "referenceNumber" ORDER BY date) AS numeric), 2)::FLOAT, 0) AS cumulative_achievement_percentage
        FROM DailyAchievement WHERE "referenceNumber" IS NOT NULL ORDER BY date, "referenceNumber"
      `,
    };

    const results = {};
    const types = ['Arabica', 'Robusta'];

    for (const [key, query] of Object.entries(queries)) {
      if (typeof query === 'function') {
        for (const type of types) {
          const result = await sequelize.query(query(type));
          results[`${key}${type}`] = result[0] || [];
        }
      } else {
        const result = await sequelize.query(query);
        results[key] = result[0] || [];
      }
    }

    const response = {
      totalBatches: Number(results.totalBatches[0]?.count) || 0,
      totalWeightBagsbyDate: results.totalWeightBagsbyDate || [],
      totalCostbyDate: results.totalCostbyDate || [],
    };

    for (const type of types) {
      response[`total${type}Weight`] = Number(results.totalWeight[type][0]?.sum) || 0;
      response[`lastmonth${type}Weight`] = Number(results.lastMonthWeight[type][0]?.sum) || 0;
      response[`total${type}Cost`] = Number(results.totalCost[type][0]?.sum) || 0;
      response[`lastmonth${type}Cost`] = Number(results.lastMonthCost[type][0]?.sum) || 0;
      response[`avg${type}Cost`] = Number(results.avgCost[type][0]?.avg) || 0;
      response[`lastmonthAvg${type}Cost`] = Number(results.lastMonthAvgCost[type][0]?.avg) || 0;
      response[`total${type}Processed`] = Number(results.totalProcessed[type][0]?.sum) || 0;
      response[`lastmonth${type}Processed`] = Number(results.lastMonthProcessed[type][0]?.sum) || 0;
      response[`total${type}Production`] = Number(results.totalProduction[type][0]?.sum) || 0;
      response[`lastmonth${type}Production`] = Number(results.lastMonthProduction[type][0]?.sum) || 0;
      response[`active${type}Farmers`] = Number(results.activeFarmers[type][0]?.count) || 0;
      response[`pending${type}QC`] = Number(results.pendingQC[type][0]?.count) || 0;
      response[`pending${type}Processing`] = Number(results.pendingProcessing[type][0]?.count) || 0;
      response[`pending${type}WeightProcessing`] = Number(results.pendingWeightProcessing[type][0]?.sum) || 0;
      response[`landCovered${type}`] = Number(results.landCovered[type][0]?.sum) || 0;
      response[`${type.toLowerCase()}Yield`] = Number(results.yield[type][0]?.sum) || 0;
      response[`${type.toLowerCase()}TotalWeightbyDate`] = results.totalWeightbyDate[type] || [];
      response[`${type.toLowerCase()}WeightMoM`] = results.weightMoM[type] || [];
      response[`${type.toLowerCase()}CostMoM`] = results.costMoM[type] || [];
      response[`${type.toLowerCase()}AvgCostMoM`] = results.avgCostMoM[type] || [];
      response[`${type.toLowerCase()}ProcessedMoM`] = results.processedMoM[type] || [];
      response[`${type.toLowerCase()}ProductionMoM`] = results.productionMoM[type] || [];
      response[`${type.toLowerCase()}CherryQualitybyDate`] = results.cherryQualitybyDate[type] || [];
      response[`${type.toLowerCase()}FarmersContribution`] = results.farmersContribution[type] || [];
      response[`${type.toLowerCase()}Sankey`] = results.sankey[type] || [];
      response[`${type.toLowerCase()}Achievement`] = results.achievement[type] || [];
    }

    res.json(response);
  } catch (err) {
    console.error('Error fetching dashboard metrics:', err);
    res.status(500).json({ message: 'Failed to fetch dashboard metrics.' });
  }
});

module.exports = router;