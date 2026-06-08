#!/usr/bin/env node
/**
 * Parse Sheet3 from the GB QC cupping spreadsheet and generate
 * backend/migrations/import_gb_qc_cupping_log_2026.sql
 *
 * Usage:
 *   node backend/scripts/generate_gb_qc_cupping_log_import.js [path/to/spreadsheet.xlsx]
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const DEFAULT_XLSX = path.join(
  process.env.HOME,
  'Downloads',
  'Untitled spreadsheet (4).xlsx'
);
const OUT_SQL = path.join(
  __dirname,
  '..',
  'migrations',
  'import_gb_qc_cupping_log_2026.sql'
);

function parseSlashDate(value) {
  const s = String(value).trim();
  const slashMatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  const dashMatch = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  const match = slashMatch || dashMatch;
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

function parseCuppingDate(rawVal, formattedVal) {
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
    const trimmed = formattedVal.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

    const dMonY = trimmed.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
    if (dMonY) {
      const months = {
        jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
        jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
      };
      const month = months[dMonY[2].toLowerCase()];
      if (month) {
        const iso = `${dMonY[3]}-${String(month).padStart(2, '0')}-${String(parseInt(dMonY[1], 10)).padStart(2, '0')}`;
        const parsed = new Date(`${iso}T12:00:00`);
        if (!Number.isNaN(parsed.getTime())) return iso;
      }
    }

    const fromFormatted = parseSlashDate(trimmed);
    if (fromFormatted) return fromFormatted;
  }

  return null;
}

function okForFurtherProcessFromNotes(notes) {
  const s = String(notes);
  if (s.includes('🟢') || s.includes('👍')) return true;
  if (s.includes('🔴') || s.includes('🟡')) return false;
  return false;
}

function detectCuppers(headerRow, subHeaderRow) {
  const cuppers = [];
  for (let col = 1; col < headerRow.length; col += 1) {
    const name = headerRow[col];
    if (!name || typeof name !== 'string') continue;
    if (subHeaderRow[col] !== 'Cupping Time') continue;
    if (subHeaderRow[col + 1] !== 'QC Notes') continue;
    cuppers.push({ name: name.trim(), timeCol: col, notesCol: col + 1 });
    col += 1;
  }
  return cuppers;
}

function esc(value) {
  return String(value)
    .replace(/'/g, "''")
    .replace(/\r\n/g, ' ')
    .replace(/[\r\n]/g, ' ');
}

function sqlText(value) {
  if (value == null || value === '') return 'NULL';
  return `'${esc(value)}'`;
}

function sqlBool(value) {
  return value ? 'TRUE' : 'FALSE';
}

function parseSheet3(xlsxPath) {
  const wb = XLSX.readFile(xlsxPath);
  const sheetName = wb.SheetNames.find((n) => n === 'Sheet3') || wb.SheetNames[0];
  if (!sheetName) throw new Error('Sheet3 not found in workbook');

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

  const cuppers = detectCuppers(raw[0] || [], raw[1] || []);
  if (cuppers.length === 0) {
    throw new Error('Could not detect cupper columns from header rows');
  }

  const stats = {
    batchRows: 0,
    skippedIncomplete: 0,
    imported: 0,
    okTrue: 0,
    okFalse: 0,
    emojiGreen: 0,
    emojiYellow: 0,
    emojiRed: 0,
    emojiThumbs: 0,
    emojiNone: 0,
  };
  const rows = [];

  for (let r = 2; r < raw.length; r++) {
    const batchNumber = raw[r]?.[0];
    if (!batchNumber || batchNumber === 'Batch') continue;

    stats.batchRows += 1;

    for (const cupper of cuppers) {
      const rawTime = raw[r][cupper.timeCol];
      const rawNotes = raw[r][cupper.notesCol];
      const notes = rawNotes != null ? String(rawNotes).trim() : '';

      if (!rawTime || !notes) {
        stats.skippedIncomplete += 1;
        continue;
      }

      const cuppedAt = parseCuppingDate(rawTime, formatted[r]?.[cupper.timeCol]);
      if (!cuppedAt) {
        stats.skippedIncomplete += 1;
        continue;
      }

      const okForFurtherProcess = okForFurtherProcessFromNotes(notes);
      if (okForFurtherProcess) stats.okTrue += 1;
      else stats.okFalse += 1;

      if (notes.includes('🟢')) stats.emojiGreen += 1;
      else if (notes.includes('🟡')) stats.emojiYellow += 1;
      else if (notes.includes('🔴')) stats.emojiRed += 1;
      else if (notes.includes('👍')) stats.emojiThumbs += 1;
      else stats.emojiNone += 1;

      rows.push({
        batchNumber: String(batchNumber).trim(),
        cuppedAt,
        notes,
        okForFurtherProcess,
        cuppedBy: cupper.name,
      });
      stats.imported += 1;
    }
  }

  rows.sort((a, b) =>
    a.batchNumber.localeCompare(b.batchNumber)
      || a.cuppedBy.localeCompare(b.cuppedBy)
      || a.cuppedAt.localeCompare(b.cuppedAt)
  );

  return { rows, stats, sheetName, cuppers };
}

function buildSql({ rows, stats, xlsxPath, cuppers }) {
  const valueLines = rows.map(
    (row) =>
      `  (${sqlText(row.batchNumber)}, '${row.cuppedAt}'::date, ${sqlText(row.notes)}, ${sqlBool(row.okForFurtherProcess)}, ${sqlText(row.cuppedBy)})`
  );

  return `-- Import GB QC cupping log from Sheet3 of spreadsheet
-- Source: ${xlsxPath}
-- Generated: ${new Date().toISOString()}
--
-- Sheet3 stats:
--   Batch rows scanned: ${stats.batchRows}
--   Cuppers: ${cuppers.map((c) => c.name).join(', ')}
--   Staged for import: ${stats.imported}
--   Skipped incomplete cupper slots: ${stats.skippedIncomplete}
--   okForFurtherProcess true: ${stats.okTrue} (🟢 ${stats.emojiGreen}, 👍 ${stats.emojiThumbs})
--   okForFurtherProcess false: ${stats.okFalse} (🟡 ${stats.emojiYellow}, 🔴 ${stats.emojiRed}, no emoji ${stats.emojiNone})
--
-- Mapping:
--   Batch            -> batch_number
--   Cupping Time     -> cupped_at
--   QC Notes         -> notes
--   Cupper header    -> cupped_by
--   Emoji in notes   -> ok_for_further_process (🟢/👍 true, 🔴/🟡 false, none false)
--
-- Rules:
--   Skip rows missing Cupping Time or QC Notes
--   Plain INSERT (multiple entries per batch allowed)
--
-- Verification (run after import):
-- SELECT
--   "batchNumber",
--   "cuppedBy",
--   COUNT(*) AS cupping_entries,
--   MIN("cuppedAt") AS first_cupping,
--   MAX("cuppedAt") AS last_cupping,
--   BOOL_OR("okForFurtherProcess") AS any_ok
-- FROM "GbQcCuppingLog"
-- WHERE "batchNumber" LIKE '2026%'
-- GROUP BY 1, 2
-- ORDER BY 1, 2
-- LIMIT 20;

BEGIN;

CREATE TEMP TABLE cupping_import_staging (
  batch_number TEXT NOT NULL,
  cupped_at DATE NOT NULL,
  notes TEXT NOT NULL,
  ok_for_further_process BOOLEAN NOT NULL,
  cupped_by TEXT
);

INSERT INTO cupping_import_staging (
  batch_number,
  cupped_at,
  notes,
  ok_for_further_process,
  cupped_by
)
VALUES
${valueLines.join(',\n')};

INSERT INTO "GbQcCuppingLog" (
  "batchNumber",
  "cuppedAt",
  notes,
  "okForFurtherProcess",
  "cuppedBy",
  "createdAt"
)
SELECT
  batch_number,
  cupped_at,
  notes,
  ok_for_further_process,
  cupped_by,
  NOW()
FROM cupping_import_staging;

COMMIT;
`;
}

function main() {
  const xlsxPath = process.argv[2] || DEFAULT_XLSX;
  if (!fs.existsSync(xlsxPath)) {
    console.error(`Spreadsheet not found: ${xlsxPath}`);
    process.exit(1);
  }

  const parsed = parseSheet3(xlsxPath);
  const sql = buildSql({ ...parsed, xlsxPath });
  fs.writeFileSync(OUT_SQL, sql);

  console.log(`Wrote ${OUT_SQL}`);
  console.log(parsed.stats);
  console.log('Cuppers:', parsed.cuppers.map((c) => c.name).join(', '));
  console.log('Sample row:', parsed.rows[0]);
}

main();
