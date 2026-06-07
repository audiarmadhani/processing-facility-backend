#!/usr/bin/env node
/**
 * Parse Sheet2 from the GB QC roast spreadsheet and generate
 * backend/migrations/import_gb_qc_roast_log_2026.sql
 *
 * Usage:
 *   node backend/scripts/generate_gb_qc_roast_log_import.js [path/to/spreadsheet.xlsx]
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const DEFAULT_XLSX = path.join(
  process.env.HOME,
  'Downloads',
  'Untitled spreadsheet (2).xlsx'
);
const OUT_SQL = path.join(
  __dirname,
  '..',
  'migrations',
  'import_gb_qc_roast_log_2026.sql'
);

function parseSlashDate(value) {
  const s = String(value).trim();
  const match = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!match) return null;

  let [, part1, part2, yearPart] = match;
  let year = yearPart.length === 2
    ? (Number(yearPart) >= 70 ? `19${yearPart}` : `20${yearPart}`)
    : yearPart;

  const first = parseInt(part1, 10);
  const second = parseInt(part2, 10);
  let day;
  let month;

  if (first > 12) {
    day = first;
    month = second;
  } else if (second > 12) {
    month = first;
    day = second;
  } else {
    // Indonesia-style dates in the sheet are DD/MM/YYYY.
    day = first;
    month = second;
  }

  const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const parsed = new Date(`${iso}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : iso;
}

function parseExcelSerial(serial) {
  if (typeof serial !== 'number' || Number.isNaN(serial)) return null;
  const utcDays = Math.floor(serial - 25569);
  const parsed = new Date(utcDays * 86400000);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

function parseRoastDate(rawVal, formattedVal) {
  if (typeof rawVal === 'number') {
    const serialDate = parseExcelSerial(rawVal);
    if (serialDate) return serialDate;
  }

  if (typeof rawVal === 'string') {
    const fromRaw = parseSlashDate(rawVal);
    if (fromRaw) return fromRaw;
    if (/^\d{4}-\d{2}-\d{2}$/.test(rawVal.trim())) return rawVal.trim();
  }

  if (formattedVal && typeof formattedVal === 'string') {
    const fromFormatted = parseSlashDate(formattedVal);
    if (fromFormatted) return fromFormatted;
    if (/^\d{4}-\d{2}-\d{2}$/.test(formattedVal.trim())) return formattedVal.trim();
  }

  return null;
}

function parseEndTemp(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;

  const s = String(value).trim();
  const mixed = s.match(/^([\d.]+)\s*,\s*\d+\s*:\s*\d+/);
  if (mixed) return parseFloat(mixed[1]);

  const commaDecimal = s.match(/^(\d+)\s*,\s*(\d+)$/);
  if (commaDecimal) return parseFloat(`${commaDecimal[1]}.${commaDecimal[2]}`);

  const normalized = s.replace(/[^\d.,-]/g, '').replace(',', '.');
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : null;
}

function parseFirstCrackMinutes(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value >= 100 ? null : value;
  }

  const s = String(value).trim();
  const timeMatch = s.match(/(\d+)\s*:\s*(\d+)/);
  if (timeMatch) {
    return parseInt(timeMatch[1], 10) + parseInt(timeMatch[2], 10) / 60;
  }

  const bare = s.match(/^([\d.]+)$/);
  if (bare) {
    const n = parseFloat(bare[1]);
    return Number.isFinite(n) && n < 100 ? n : null;
  }

  return null;
}

function esc(value) {
  return String(value).replace(/'/g, "''");
}

function sqlText(value) {
  if (value == null || value === '') return 'NULL';
  return `'${esc(value)}'`;
}

function sqlNumeric(value) {
  if (value == null || !Number.isFinite(value)) return 'NULL';
  const normalized = Number(value.toFixed(4)).toString().replace(/\.?0+$/, '');
  return normalized || '0';
}

function parseSheet2(xlsxPath) {
  const wb = XLSX.readFile(xlsxPath);
  const sheetName = wb.SheetNames.find((n) => n === 'Sheet2') || wb.SheetNames[1];
  if (!sheetName) throw new Error('Sheet2 not found in workbook');

  const raw = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], {
    header: 1,
    defval: null,
    raw: true,
  });
  const formatted = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], {
    header: 1,
    defval: null,
    raw: false,
  });

  const stats = {
    sheetRows: 0,
    skippedNoBatch: 0,
    skippedNoDate: 0,
    imported: 0,
  };
  const rows = [];

  for (let r = 0; r < raw.length; r++) {
    const batchNumber = raw[r]?.[0];
    if (!batchNumber || batchNumber === 'Batch Number') continue;

    stats.sheetRows += 1;
    const roastDate = parseRoastDate(raw[r][2], formatted[r]?.[2]);
    if (!roastDate) {
      stats.skippedNoDate += 1;
      continue;
    }

    rows.push({
      batchNumber: String(batchNumber).trim(),
      roastedAt: `${roastDate} 12:00:00+08`,
      notes: raw[r][1] != null ? String(raw[r][1]).trim() : null,
      roastProfile: raw[r][3] != null ? String(raw[r][3]).trim() : null,
      firstCrackMinutes: parseFirstCrackMinutes(raw[r][4]),
      endTemp: parseEndTemp(raw[r][5]),
      roastedBy: raw[r][6] != null ? String(raw[r][6]).trim() : null,
    });
    stats.imported += 1;
  }

  return { rows, stats, sheetName };
}

function buildSql({ rows, stats, xlsxPath }) {
  const valueLines = rows.map(
    (row) =>
      `  (${sqlText(row.batchNumber)}, '${row.roastedAt}'::timestamptz, ${sqlText(row.roastedBy)}, ${sqlText(row.notes)}, ${sqlText(row.roastProfile)}, ${sqlNumeric(row.endTemp)}, ${sqlNumeric(row.firstCrackMinutes)})`
  );

  return `-- Import GB QC roast log from Sheet2 of spreadsheet
-- Source: ${xlsxPath}
-- Generated: ${new Date().toISOString()}
--
-- Sheet2 stats:
--   Data rows scanned: ${stats.sheetRows}
--   Staged for import: ${stats.imported}
--   Skipped (no Roast Date): ${stats.skippedNoDate}
--   Skipped (no batch in PreprocessingData): resolved at INSERT time via INNER JOIN
--
-- Mapping:
--   Batch Number      -> batch_number
--   Roast Date        -> roasted_at (noon WITA)
--   Notes             -> notes
--   Roast Profile     -> roast_profile
--   First Crack Time  -> first_crack_minutes (time portion only)
--   End Temperature   -> end_temp
--   Roaster           -> roasted_by
--   processingType    -> first row in PreprocessingData per batch
--
-- Verification (run after import):
-- SELECT
--   "batchNumber",
--   "processingType",
--   COUNT(*) AS roast_entries,
--   MIN("roastedAt") AS first_roast,
--   MAX("roastedAt") AS last_roast
-- FROM "GbQcRoastLog"
-- WHERE "batchNumber" LIKE '2026%'
-- GROUP BY 1, 2
-- ORDER BY 1
-- LIMIT 20;

BEGIN;

CREATE TEMP TABLE roast_import_staging (
  batch_number TEXT NOT NULL,
  roasted_at TIMESTAMPTZ NOT NULL,
  roasted_by TEXT,
  notes TEXT,
  roast_profile TEXT,
  end_temp NUMERIC,
  first_crack_minutes NUMERIC
);

INSERT INTO roast_import_staging (
  batch_number,
  roasted_at,
  roasted_by,
  notes,
  roast_profile,
  end_temp,
  first_crack_minutes
)
VALUES
${valueLines.join(',\n')};

INSERT INTO "GbQcRoastLog" (
  "batchNumber",
  "processingType",
  "roastedAt",
  "roastedBy",
  "notes",
  "roastProfile",
  "endTemp",
  "firstCrackMinutes",
  "createdAt"
)
SELECT
  s.batch_number,
  pp."processingType",
  s.roasted_at,
  NULLIF(s.roasted_by, ''),
  NULLIF(s.notes, ''),
  NULLIF(s.roast_profile, ''),
  s.end_temp,
  s.first_crack_minutes,
  NOW()
FROM roast_import_staging s
INNER JOIN LATERAL (
  SELECT "processingType"
  FROM "PreprocessingData"
  WHERE "batchNumber" = s.batch_number
  ORDER BY id ASC
  LIMIT 1
) pp ON true;

COMMIT;
`;
}

function main() {
  const xlsxPath = process.argv[2] || DEFAULT_XLSX;
  if (!fs.existsSync(xlsxPath)) {
    console.error(`Spreadsheet not found: ${xlsxPath}`);
    process.exit(1);
  }

  const parsed = parseSheet2(xlsxPath);
  const sql = buildSql({ ...parsed, xlsxPath });
  fs.writeFileSync(OUT_SQL, sql);

  console.log(`Wrote ${OUT_SQL}`);
  console.log(parsed.stats);
  console.log(`Sample row:`, parsed.rows[0]);
}

main();
