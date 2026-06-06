#!/usr/bin/env node
/**
 * Generates seed SQL from BTM Inventory - Inventory Log.csv
 * Usage: node backend/scripts/generate_office_inventory_seed.js [path-to-csv]
 */
const fs = require('fs');
const path = require('path');

const DEFAULT_CSV = path.join(
  process.env.HOME || '',
  'Downloads/BTM Inventory - Inventory Log.csv'
);
const csvPath = process.argv[2] || DEFAULT_CSV;
const outPath = path.join(
  __dirname,
  '../migrations/seed_office_inventory_from_csv.sql'
);

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ',') {
      row.push(field);
      field = '';
      continue;
    }
    if (ch === '\n' || (ch === '\r' && next === '\n')) {
      row.push(field);
      if (row.some((c) => c.trim() !== '')) rows.push(row);
      row = [];
      field = '';
      if (ch === '\r') i += 1;
      continue;
    }
    if (ch === '\r') {
      row.push(field);
      if (row.some((c) => c.trim() !== '')) rows.push(row);
      row = [];
      field = '';
      continue;
    }
    field += ch;
  }
  if (field.length || row.length) {
    row.push(field);
    if (row.some((c) => c.trim() !== '')) rows.push(row);
  }
  return rows;
}

function sqlEscape(value) {
  if (value == null) return 'NULL';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlNullableText(value) {
  const s = value == null ? '' : String(value).trim();
  return s === '' ? 'NULL' : sqlEscape(s);
}

function parseQuantity(raw) {
  if (raw == null) return 0;
  const s = String(raw).trim().replace(/\s/g, '');
  if (!s) return 0;
  const normalized = s.replace(/,/g, '');
  const n = Number(normalized);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function parsePrice(raw) {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s || s.toLowerCase() === 'rp0.00') return null;
  const cleaned = s.replace(/Rp\s?/gi, '').replace(/\./g, '').replace(/,/g, '.');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function parseDate(raw) {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;

  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const slash = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slash) {
    const a = Number(slash[1]);
    const b = Number(slash[2]);
    let y = slash[3];
    if (y.length === 2) y = Number(y) >= 70 ? `19${y}` : `20${y}`;

    let day;
    let month;
    if (a > 12) {
      day = a;
      month = b;
    } else if (b > 12) {
      month = a;
      day = b;
    } else {
      day = a;
      month = b;
    }
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    return `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  return null;
}

function defaultTransactionDate(remarks) {
  const r = String(remarks || '').toUpperCase();
  if (r.includes('SALDO AWAL') || r.includes('PENYESUAIAN')) return '2026-05-01';
  return '2026-05-01';
}

function buildMovementInsert({
  sortOrder,
  name,
  category,
  unit,
  itemType,
  movementType,
  quantity,
  remarks,
  pic,
  location,
  project,
  transactionDate,
  invoiceReference,
  requestDate,
  paidDate,
  unitPrice,
  totalPrice,
  notes,
}) {
  return `
WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES (${sqlEscape(name)}, ${sqlEscape(category)}, ${sqlEscape(unit)}, ${sqlNullableText(itemType)}, 0, NOW(), NOW())
  ON CONFLICT ON CONSTRAINT office_inventory_items_unique_name
  DO UPDATE SET
    "itemType" = COALESCE(EXCLUDED."itemType", "OfficeInventoryItems"."itemType"),
    "updatedAt" = NOW()
  RETURNING id
)
INSERT INTO "OfficeInventoryMovements" (
  "itemId", "movementType", quantity, remarks, pic, location, project,
  "transactionDate", "itemType", "invoiceReference", "requestDate", "paidDate",
  "unitPrice", "totalPrice", notes, "importSortOrder", "createdAt"
)
SELECT
  id,
  ${sqlEscape(movementType)},
  ${quantity},
  ${sqlNullableText(remarks)},
  ${sqlNullableText(pic)},
  ${sqlNullableText(location)},
  ${sqlNullableText(project)},
  ${sqlEscape(transactionDate)}::date,
  ${sqlNullableText(itemType)},
  ${sqlNullableText(invoiceReference)},
  ${requestDate ? `${sqlEscape(requestDate)}::date` : 'NULL'},
  ${paidDate ? `${sqlEscape(paidDate)}::date` : 'NULL'},
  ${unitPrice != null ? unitPrice : 'NULL'},
  ${totalPrice != null ? totalPrice : 'NULL'},
  ${sqlNullableText(notes)},
  ${sortOrder},
  NOW() + (${sortOrder} * interval '1 millisecond')
FROM upsert_item;`;
}

function main() {
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV not found: ${csvPath}`);
    process.exit(1);
  }

  const rows = parseCsv(fs.readFileSync(csvPath, 'utf8'));
  const dataRows = rows
    .slice(1)
    .filter((r) => {
      const name = (r[1] || '').trim();
      return name && name.toUpperCase() !== 'NAMA BARANG';
    });

  const statements = [];
  let sortOrder = 0;

  for (const r of dataRows) {
    const name = (r[1] || '').trim();
    const category = (r[2] || '').trim() || 'LAIN-LAIN';
    const pic = (r[3] || '').trim();
    const remarks = (r[4] || '').trim();
    const tgl = parseDate(r[5]) || defaultTransactionDate(remarks);
    const location = (r[6] || '').trim() || 'BALI';
    const project = (r[7] || '').trim() || 'PROCESSING FACILITY';
    const invoiceReference = (r[8] || '').trim();
    const requestDate = parseDate(r[9]);
    const paidDate = parseDate(r[10]);
    const itemType = (r[11] || '').trim();
    const qtyIn = parseQuantity(r[12]);
    const qtyOut = parseQuantity(r[13]);
    const unit = (r[14] || '').trim() || 'PCS';
    const unitPrice = parsePrice(r[15]);
    const totalPrice = parsePrice(r[16]);
    const notes = (r[17] || '').trim();

    if (!name) continue;

    const base = {
      name,
      category,
      unit,
      itemType,
      remarks,
      pic,
      location,
      project,
      transactionDate: tgl,
      invoiceReference,
      requestDate,
      paidDate,
      unitPrice,
      totalPrice,
      notes,
    };

    if (qtyIn > 0) {
      sortOrder += 1;
      statements.push(
        buildMovementInsert({ ...base, sortOrder, movementType: 'IN', quantity: qtyIn })
      );
    }
    if (qtyOut > 0) {
      sortOrder += 1;
      statements.push(
        buildMovementInsert({ ...base, sortOrder, movementType: 'OUT', quantity: qtyOut })
      );
    }
  }

  const sql = `-- Seed office inventory from Google Sheet export
-- Source: BTM Inventory - Inventory Log.csv
-- Generated: ${new Date().toISOString()}
-- Rows processed: ${dataRows.length} CSV lines -> ${sortOrder} movements
--
-- Supabase import order:
--   1. backend/migrations/add_office_inventory.sql
--   2. backend/migrations/add_office_inventory_csv_columns.sql
--   3. this file
--
-- Regenerate: node backend/scripts/generate_office_inventory_seed.js "/path/to/csv"

BEGIN;

-- Run add_office_inventory.sql and add_office_inventory_csv_columns.sql first.
-- Uncomment the next two lines only for a full re-import:
-- DELETE FROM "OfficeInventoryMovements";
-- DELETE FROM "OfficeInventoryItems";

${statements.join('\n')}

UPDATE "OfficeInventoryItems" i
SET "currentStock" = COALESCE(stock.balance, 0),
    "updatedAt" = NOW()
FROM (
  SELECT
    m."itemId",
    SUM(CASE WHEN m."movementType" = 'IN' THEN m.quantity ELSE -m.quantity END) AS balance
  FROM "OfficeInventoryMovements" m
  GROUP BY m."itemId"
) stock
WHERE i.id = stock."itemId";

COMMIT;
`;

  fs.writeFileSync(outPath, sql);
  console.log(`Wrote ${outPath}`);
  console.log(`CSV data rows: ${dataRows.length}, movements: ${sortOrder}`);
}

main();
