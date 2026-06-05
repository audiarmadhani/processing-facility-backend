const express = require('express');
const router = express.Router();
const { sequelize } = require('../models');

const DEFAULT_DAYS = 90;
const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;
const BATCH_YEAR_PREFIX = '2026';

function parseLimit(raw) {
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return DEFAULT_LIMIT;
  return Math.min(n, MAX_LIMIT);
}

function parseOffset(raw) {
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function normalizeActor(value) {
  if (value == null) return null;
  const s = String(value).trim();
  return s === '' ? null : s;
}

function normalizeRow(row) {
  return {
    id: row.id,
    occurredAt: row.occurredAt,
    station: row.station,
    action: row.action,
    batchNumber: row.batchNumber ?? null,
    actor: normalizeActor(row.actor),
    detail: row.detail ?? null,
  };
}

async function runFeedQuery(sql, replacements = {}) {
  try {
    return await sequelize.query(sql, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });
  } catch (err) {
    console.error('updates feed query error:', err.message);
    return [];
  }
}

async function fetchAllFeedRows(since) {
  const batchFilter = `"batchNumber" LIKE '${BATCH_YEAR_PREFIX}%'`;
  const batchFilterAlias = (alias) => `${alias}."batchNumber" LIKE '${BATCH_YEAR_PREFIX}%'`;

  return Promise.all([
    runFeedQuery(`
      SELECT
        ('receiving:' || "batchNumber") AS id,
        "createdAt" AS "occurredAt",
        'Receiving' AS station,
        'New batch received' AS action,
        "batchNumber" AS "batchNumber",
        "createdBy" AS actor,
        TRIM(COALESCE("farmerName", '') || CASE WHEN "type" IS NOT NULL AND "type" <> '' THEN ' · ' || "type" ELSE '' END) AS detail
      FROM "ReceivingData"
      WHERE "createdAt" >= :since AND ${batchFilter}
    `, { since }),

    runFeedQuery(`
      SELECT
        ('qc:' || id::text) AS id,
        "createdAt" AS "occurredAt",
        'Cherry QC' AS station,
        'Cherry QC recorded' AS action,
        "batchNumber" AS "batchNumber",
        "createdBy" AS actor,
        NULL AS detail
      FROM "QCData"
      WHERE "createdAt" >= :since AND ${batchFilter}
    `, { since }),

    runFeedQuery(`
      SELECT
        ('fermentation:' || id::text) AS id,
        "createdAt" AS "occurredAt",
        'Fermentation' AS station,
        'Fermentation batch created' AS action,
        "batchNumber" AS "batchNumber",
        "createdBy" AS actor,
        TRIM(
          COALESCE('EXP ' || NULLIF("experimentNumber"::text, ''), '')
          || CASE WHEN "processingType" IS NOT NULL AND "processingType" <> '' THEN ' · ' || "processingType" ELSE '' END
        ) AS detail
      FROM "FermentationData"
      WHERE "createdAt" >= :since
        AND ("batchNumber" IS NULL OR "batchNumber" LIKE '${BATCH_YEAR_PREFIX}%')
    `, { since }),

    runFeedQuery(`
      SELECT
        ('fermentation-checkin:' || id::text) AS id,
        "createdAt" AS "occurredAt",
        'Fermentation' AS station,
        'Fermentation check-in' AS action,
        "batchNumber" AS "batchNumber",
        "createdBy" AS actor,
        TRIM(COALESCE(period, '') || CASE WHEN notes IS NOT NULL AND notes <> '' THEN ' · ' || LEFT(notes, 80) ELSE '' END) AS detail
      FROM "FermentationCheckIns"
      WHERE "createdAt" >= :since AND ${batchFilter}
    `, { since }),

    runFeedQuery(`
      SELECT
        ('preprocessing:' || "batchNumber" || ':' || COALESCE("processingType", '')) AS id,
        "createdAt" AS "occurredAt",
        'Processing' AS station,
        'Processing lot created' AS action,
        "batchNumber" AS "batchNumber",
        "createdBy" AS actor,
        TRIM(
          COALESCE("lotNumber", '')
          || CASE WHEN "referenceNumber" IS NOT NULL AND "referenceNumber" <> '' THEN ' · ' || "referenceNumber" ELSE '' END
          || CASE WHEN "processingType" IS NOT NULL AND "processingType" <> '' THEN ' · ' || "processingType" ELSE '' END
        ) AS detail
      FROM "PreprocessingData"
      WHERE "createdAt" >= :since AND ${batchFilter}
    `, { since }),

    runFeedQuery(`
      SELECT
        ('wetmill-enter:' || id::text) AS id,
        entered_at AS "occurredAt",
        'Wet Mill' AS station,
        'Entered wet mill' AS action,
        "batchNumber" AS "batchNumber",
        NULL AS actor,
        NULL AS detail
      FROM "WetMillData"
      WHERE entered_at >= :since AND ${batchFilter} AND entered_at IS NOT NULL
    `, { since }),

    runFeedQuery(`
      SELECT
        ('wetmill-exit:' || id::text) AS id,
        exited_at AS "occurredAt",
        'Wet Mill' AS station,
        'Exited wet mill' AS action,
        "batchNumber" AS "batchNumber",
        NULL AS actor,
        NULL AS detail
      FROM "WetMillData"
      WHERE exited_at >= :since AND ${batchFilter} AND exited_at IS NOT NULL
    `, { since }),

    runFeedQuery(`
      SELECT
        ('wetmill-weight:' || id::text) AS id,
        created_at AS "occurredAt",
        'Wet Mill' AS station,
        'Wet mill weight logged' AS action,
        "batchNumber" AS "batchNumber",
        NULL AS actor,
        TRIM(
          COALESCE(producer, '')
          || CASE WHEN weight IS NOT NULL THEN ' · ' || weight::text || ' kg' ELSE '' END
        ) AS detail
      FROM "WetMillWeightMeasurements"
      WHERE created_at >= :since AND ${batchFilter}
    `, { since }),

    runFeedQuery(`
      SELECT
        ('drying-assign:' || id::text) AS id,
        entered_at AS "occurredAt",
        'Drying' AS station,
        'Assigned to drying' AS action,
        "batchNumber" AS "batchNumber",
        NULL AS actor,
        "dryingArea" AS detail
      FROM "DryingData"
      WHERE entered_at >= :since AND ${batchFilter} AND entered_at IS NOT NULL
    `, { since }),

    runFeedQuery(`
      SELECT
        ('drying-weight:' || id::text) AS id,
        created_at AS "occurredAt",
        'Drying' AS station,
        'Drying weight logged' AS action,
        "batchNumber" AS "batchNumber",
        NULL AS actor,
        CASE WHEN weight IS NOT NULL THEN weight::text || ' kg' ELSE NULL END AS detail
      FROM "DryingWeightMeasurements"
      WHERE created_at >= :since AND ${batchFilter}
    `, { since }),

    runFeedQuery(`
      SELECT
        ('drying-moisture:' || id::text) AS id,
        created_at AS "occurredAt",
        'Drying' AS station,
        'Moisture reading' AS action,
        "batchNumber" AS "batchNumber",
        NULL AS actor,
        CASE WHEN moisture IS NOT NULL THEN moisture::text || '%' ELSE NULL END AS detail
      FROM "DryingMeasurements"
      WHERE created_at >= :since AND ${batchFilter}
    `, { since }),

    runFeedQuery(`
      SELECT
        ('drymill-enter:' || id::text) AS id,
        entered_at AS "occurredAt",
        'Dry Mill' AS station,
        'Entered dry mill' AS action,
        "batchNumber" AS "batchNumber",
        NULL AS actor,
        NULLIF("processingType", '') AS detail
      FROM "DryMillData"
      WHERE entered_at >= :since AND ${batchFilter} AND entered_at IS NOT NULL
    `, { since }),

    runFeedQuery(`
      SELECT
        ('drymill-exit:' || id::text) AS id,
        exited_at AS "occurredAt",
        'Dry Mill' AS station,
        'Exited dry mill' AS action,
        "batchNumber" AS "batchNumber",
        NULL AS actor,
        NULLIF("processingType", '') AS detail
      FROM "DryMillData"
      WHERE exited_at >= :since AND ${batchFilter} AND exited_at IS NOT NULL
    `, { since }),

    runFeedQuery(`
      SELECT
        ('drymill-merge:' || new_batch_number || ':' || EXTRACT(EPOCH FROM merged_at)::bigint) AS id,
        merged_at AS "occurredAt",
        'Dry Mill' AS station,
        'Dry mill batches merged' AS action,
        new_batch_number AS "batchNumber",
        created_by AS actor,
        TRIM(
          'Merged into ' || new_batch_number
          || CASE WHEN original_batch_numbers IS NOT NULL THEN ' from ' || array_to_string(original_batch_numbers, ', ') ELSE '' END
        ) AS detail
      FROM "DryMillBatchMerges"
      WHERE merged_at >= :since AND new_batch_number LIKE '${BATCH_YEAR_PREFIX}%'
    `, { since }),

    runFeedQuery(`
      SELECT
        ('drymill-process:' || id::text) AS id,
        "createdAt" AS "occurredAt",
        'Dry Mill' AS station,
        'Process step recorded' AS action,
        "batchNumber" AS "batchNumber",
        operator AS actor,
        TRIM(
          COALESCE("processStep", '')
          || CASE WHEN grade IS NOT NULL AND grade <> '' THEN ' · ' || grade ELSE '' END
        ) AS detail
      FROM "DryMillProcessEvents"
      WHERE "createdAt" >= :since AND ${batchFilter}
    `, { since }),

    runFeedQuery(`
      SELECT
        ('gb-qc:' || "batchNumber") AS id,
        "createdAt" AS "occurredAt",
        'GB QC' AS station,
        'GB QC submitted' AS action,
        "batchNumber" AS "batchNumber",
        NULL AS actor,
        NULL AS detail
      FROM "PostprocessingQCData"
      WHERE "createdAt" >= :since AND ${batchFilter}
    `, { since }),

    runFeedQuery(`
      SELECT
        ('gb-roast:' || id::text) AS id,
        "createdAt" AS "occurredAt",
        'GB QC' AS station,
        'Roast recorded' AS action,
        "batchNumber" AS "batchNumber",
        NULL AS actor,
        NULL AS detail
      FROM "GbQcRoastLog"
      WHERE "createdAt" >= :since AND ${batchFilter}
    `, { since }),

    runFeedQuery(`
      SELECT
        ('gb-cupping:' || id::text) AS id,
        "createdAt" AS "occurredAt",
        'GB QC' AS station,
        'Cupping recorded' AS action,
        "batchNumber" AS "batchNumber",
        "cuppedBy" AS actor,
        NULL AS detail
      FROM "GbQcCuppingLog"
      WHERE "createdAt" >= :since AND ${batchFilter}
    `, { since }),

    runFeedQuery(`
      SELECT
        ('farmer:' || "farmerID"::text) AS id,
        "registrationDate" AS "occurredAt",
        'Farmers' AS station,
        'Farmer registered' AS action,
        NULL AS "batchNumber",
        NULL AS actor,
        TRIM(
          COALESCE("farmerName", '')
          || CASE WHEN desa IS NOT NULL AND desa <> '' THEN ' · ' || desa ELSE '' END
          || CASE WHEN kecamatan IS NOT NULL AND kecamatan <> '' THEN ', ' || kecamatan ELSE '' END
        ) AS detail
      FROM "Farmers"
      WHERE "registrationDate" >= :since
    `, { since }),
  ]);
}

router.get('/updates', async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit);
    const offset = parseOffset(req.query.offset);
    const stationFilter = req.query.station ? String(req.query.station).trim() : null;
    const batchFilter = req.query.batchNumber ? String(req.query.batchNumber).trim() : null;

    const since = new Date(Date.now() - DEFAULT_DAYS * 24 * 60 * 60 * 1000);

    const chunks = await fetchAllFeedRows(since);
    let rows = chunks.flat().map(normalizeRow);

    if (stationFilter) {
      rows = rows.filter((row) => row.station === stationFilter);
    }

    if (batchFilter) {
      const q = batchFilter.toLowerCase();
      rows = rows.filter(
        (row) =>
          (row.batchNumber && row.batchNumber.toLowerCase().includes(q)) ||
          (row.detail && row.detail.toLowerCase().includes(q))
      );
    }

    rows.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

    const total = rows.length;
    const page = rows.slice(offset, offset + limit);

    res.json({ rows: page, total, limit, offset });
  } catch (err) {
    console.error('GET /updates error:', err);
    res.status(500).json({ error: 'Failed to fetch updates', details: err.message });
  }
});

module.exports = router;
