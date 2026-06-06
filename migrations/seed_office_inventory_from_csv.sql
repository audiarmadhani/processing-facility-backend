-- Seed office inventory from Google Sheet export
-- Source: BTM Inventory - Inventory Log.csv
-- Generated: 2026-06-06T05:12:00.727Z
-- Rows processed: 678 CSV lines -> 672 movements
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


WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Whiteboard', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  1,
  NOW() + (1 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Westafel', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  2,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  2,
  NOW() + (2 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Webcam NYK A96', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  3,
  NOW() + (3 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Webcam Logitech UVC', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  4,
  NOW() + (4 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Water Pum (Sanyo)', 'MESIN', 'SET', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  5,
  NOW() + (5 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Ac Sharp 1Pk', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  2,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  6,
  NOW() + (6 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Water Jet Pump LAKONI', 'MESIN', 'SET', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '(Rusak) SALDO AWAL MEI',
  7,
  NOW() + (7 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Wallmount Rack (tempat kabel)', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  8,
  NOW() + (8 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Walkie Talkie WLN', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  6,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  9,
  NOW() + (9 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Vibrator Motor Hopper BMV41M', 'MESIN', 'SET', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  10,
  NOW() + (10 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Vanbelt B-63', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  3,
  'PEMBELIAN',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  11,
  NOW() + (11 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Vanbelt A-17', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  2,
  'PEMBELIAN',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  12,
  NOW() + (12 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Vacum Sealer', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  13,
  NOW() + (13 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('UPC 2000 - Pulper Demulcilager', 'MESIN', 'SET', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  14,
  NOW() + (14 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Troli barang (putih)', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  3,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  15,
  NOW() + (15 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Troli barang (putih)', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'OUT',
  2,
  'PEMAKAIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '2 RUSAK',
  16,
  NOW() + (16 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Troli barang (hitam)', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  3,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  17,
  NOW() + (17 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Toren Air 5500lt', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  3,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  18,
  NOW() + (18 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Toren Air 1000Ltr', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  4,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  19,
  NOW() + (19 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Tong biru 200L + clamp', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  15,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  20,
  NOW() + (20 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Timer dinding (Ruangan Bar)', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  21,
  NOW() + (21 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Timbangan Duduk Digital 150kg', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'JAKARTA',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  22,
  NOW() + (22 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Timbangan Duduk 200Kg', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  2,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  23,
  NOW() + (23 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Thermopro', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  5,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  24,
  NOW() + (24 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Agratronix Coffe Moisture Tester(Alat pengukur kadar air)', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  25,
  NOW() + (25 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Thermopro', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'OUT',
  3,
  'PEMAKAIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '3 RUSAK',
  26,
  NOW() + (26 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Thermogun', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  27,
  NOW() + (27 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Thermocouple', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  28,
  NOW() + (28 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Terpal A8 15x8', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  15,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  29,
  NOW() + (29 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Terpal A8 Ungu', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  3,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  30,
  NOW() + (30 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Terpal A8 8x8 Coklat', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  4,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  31,
  NOW() + (31 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Terpal A8 20x20 (Hijau)', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  6,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  32,
  NOW() + (32 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Terpal A33x3', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  10,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  33,
  NOW() + (33 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Terpal A25x5', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  5,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  34,
  NOW() + (34 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Terpal A215x8', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  15,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  35,
  NOW() + (35 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Terpal A215x6', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  2,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  36,
  NOW() + (36 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Terpal A2 7x5', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  37,
  NOW() + (37 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Terpal A2 3x3 Coklat', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  4,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  38,
  NOW() + (38 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Terpal A2 11x10 Coklat Silver', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  39,
  NOW() + (39 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Tabung N2', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  2,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  40,
  NOW() + (40 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Tabung Gas Udara (Regulator)', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  41,
  NOW() + (41 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Tabung CO2', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  3,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  42,
  NOW() + (42 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Starlink Internet', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  43,
  NOW() + (43 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Stand Webcam Wetmill', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  44,
  NOW() + (44 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Stampel BTM', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  45,
  NOW() + (45 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Sprayer Pompa', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  46,
  NOW() + (46 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Spidol Hitam', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  4,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  47,
  NOW() + (47 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Speaker', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  48,
  NOW() + (48 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Span Skrup', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  20,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  49,
  NOW() + (49 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Solder', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  50,
  NOW() + (50 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Sizer', 'MESIN', 'SET', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  51,
  NOW() + (51 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Sign Processing Facility (Pelang PT)', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  52,
  NOW() + (52 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Serokan Pengering Kopi', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  6,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  53,
  NOW() + (53 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Serokan Pengering Kopi', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PEMAKAIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '1 RUSAK RAYAP',
  54,
  NOW() + (54 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Serokan Green Beans', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  3,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  55,
  NOW() + (55 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Sekop', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  2,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  56,
  NOW() + (56 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Scale Acaia / Timbangan digital', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  4,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  57,
  NOW() + (57 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Scale Acaia / Timbangan digital', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PEMAKAIAN',
  'HARIS',
  'SURABAYA',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '1 DIBAWA KE JAKARTA',
  58,
  NOW() + (58 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Scaffolding', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  59,
  NOW() + (59 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Sarung Bantal', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  7,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  60,
  NOW() + (60 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Safety Glasses', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  14,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  61,
  NOW() + (61 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('RFID Scanner', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  12,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  62,
  NOW() + (62 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('RFID Scanner', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'OUT',
  2,
  'PEMAKAIAN',
  'HARIS',
  'JAKARTA',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '2 DIKIRIM KE JAKARTA',
  63,
  NOW() + (63 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('RFID Card', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  100,
  'SALDO AWAL',
  'INDRI',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  64,
  NOW() + (64 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Redmi Pad SE', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  2,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  65,
  NOW() + (65 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Rak Sampling 180 x 80 cm', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  66,
  NOW() + (66 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Rak Display Sampling 200 x 150 cm', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  2,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  67,
  NOW() + (67 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Printer Label Thermal', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'SURABAYA',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  68,
  NOW() + (68 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Printer Label Thermal', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PEMAKAIAN',
  'HARIS',
  'SURABAYA',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '1 DI SURABAYA',
  69,
  NOW() + (69 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pompa Limbah Waste Water', 'MESIN', 'SET', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  70,
  NOW() + (70 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pompa Electrik Air Galon', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  71,
  NOW() + (71 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Plastik inner PE 120 x 80 cm ( 50pcs/ball)', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  250,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  72,
  NOW() + (72 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('ph Meter', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  73,
  NOW() + (73 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Penutup telinga (Ruangan DryMil)', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  2,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI (2 Patah dan Rusak)',
  74,
  NOW() + (74 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Penggaris Siku', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  75,
  NOW() + (75 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Paranet 3 X 6 m', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  3,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  76,
  NOW() + (76 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Paranet 2 X 5 m', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  2,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  77,
  NOW() + (77 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pallet Plastik', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  200,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  78,
  NOW() + (78 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pallet Plastik', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'OUT',
  16,
  'PEMAKAIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '16 IKUT PENGIRIMAN',
  79,
  NOW() + (79 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pallet Plastik', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'OUT',
  50,
  '28/08/25',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  'INV-KFI-000069.pdf',
  NULL,
  NULL,
  NULL,
  NULL,
  'INV-KFI-000069.pdf 50 PENJUALAN',
  80,
  NOW() + (80 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Oli Mesin Jahit', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  '18/02/26',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  'BELI BENANG JAHIT & OLI MESIN JAHIT 52K - TF HARIS - 18 FEB 26.jpeg',
  '2026-02-18'::date,
  NULL,
  40,
  40,
  'PEMBELIAN',
  81,
  NOW() + (81 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Monitor View Sonic', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  2,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  82,
  NOW() + (82 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Modul Saklar', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  83,
  NOW() + (83 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Mic', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  84,
  NOW() + (84 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Meteran Tancap 100m', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  85,
  NOW() + (85 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Mesin Wesort', 'MESIN', 'SET', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  86,
  NOW() + (86 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Mesin suton blower grading', 'MESIN', 'SET', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  87,
  NOW() + (87 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Mesin Pulper/huller (King Indonesia)', 'MESIN', 'SET', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  88,
  NOW() + (88 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Mesin Pulper/Huller ( Richie)', 'MESIN', 'SET', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  89,
  NOW() + (89 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Mesin Penagos', 'MESIN', 'SET', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  90,
  NOW() + (90 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Mesin Las', 'MESIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  91,
  NOW() + (91 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Mesin Jahit Karung', 'MESIN', 'SET', 'ASET', 0, NOW(), NOW())
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
  'IN',
  3,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  92,
  NOW() + (92 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Mesin Jahit Karung', 'MESIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'OUT',
  1,
  '1/17/2026',
  'HARIS',
  'JAKARTA',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  'BKI-BKI 026A-41',
  NULL,
  NULL,
  NULL,
  NULL,
  '1 DIBAWA KE MARUNDA',
  93,
  NOW() + (93 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Meja Sortir Manual @6orang', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  2,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  94,
  NOW() + (94 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Meja Portabel', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  95,
  NOW() + (95 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Meja Kantor', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  96,
  NOW() + (96 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Meja Gudang', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  2,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  97,
  NOW() + (97 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Meja Bar kecil', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  98,
  NOW() + (98 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Meja Bar Besar', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  99,
  NOW() + (99 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Matabor', 'LAIN-LAIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  100,
  NOW() + (100 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Mata Gerinda', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  5,
  'PEMBELIAN',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  101,
  NOW() + (101 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Airtex Dehumidifying Axial Flow Fan', 'MESIN', 'SET', 'ASET', 0, NOW(), NOW())
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
  'IN',
  12,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  102,
  NOW() + (102 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Masker Disposable (50pcs/box)', 'LAIN-LAIN', 'BOX', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  9,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  103,
  NOW() + (103 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Mahlkoning EK 43S - Coffe Grinder', 'MESIN', 'SET', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  104,
  NOW() + (104 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Magnet Sparator', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  2,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  105,
  NOW() + (105 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Laptop HP Ryzen 7320U', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  3,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  106,
  NOW() + (106 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Laptop ASUS (di tako sby)', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'SURABAYA',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  107,
  NOW() + (107 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lampu Sorot', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  6,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  108,
  NOW() + (108 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lampu Bar', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  109,
  NOW() + (109 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('L300', 'KENDARAAN', 'UNIT', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  110,
  NOW() + (110 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kursi Plastik', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  6,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  111,
  NOW() + (111 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kursi kantor', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  8,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  112,
  NOW() + (112 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kursi Bar', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  4,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  113,
  NOW() + (113 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kunci L bintang', 'PERALATAN', 'SET', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  114,
  NOW() + (114 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kulkas Sharp', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  115,
  NOW() + (115 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kotak P3K', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  2,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  116,
  NOW() + (116 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kompresor Angin', 'MESIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  2,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  117,
  NOW() + (117 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('knock box', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  118,
  NOW() + (118 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Klem Seling', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  40,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  119,
  NOW() + (119 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kipas Rotating Besi', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  3,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  120,
  NOW() + (120 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kettle', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  3,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  121,
  NOW() + (121 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kettle', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PEMAKAIAN',
  'HARIS',
  'SURABAYA',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '1 Fellow stagg Ekg kettle  DIBAWA KE JAKARTA',
  122,
  NOW() + (122 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kawat Sidi Ayakan', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  123,
  NOW() + (123 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kawat Seling', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  70,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  124,
  NOW() + (124 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kawat Las', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1000,
  '18/02/26',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  'BELI KAWAT LAS DAN AMPLAS 68K INDRI - TF HARIS - 18 FEB26.jpeg',
  '2026-02-18'::date,
  NULL,
  5800,
  58,
  'PEMBELIAN',
  125,
  NOW() + (125 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kawat Las', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1000,
  '18/02/26',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  'BELI KAWAT LAS DAN AMPLAS 68K INDRI - TF HARIS - 18 FEB26.jpeg',
  '2026-02-18'::date,
  NULL,
  5800,
  58,
  'PEMBELIAN',
  126,
  NOW() + (126 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('katle Water Heater', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  2,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  127,
  NOW() + (127 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kasur lantai', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  7,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  128,
  NOW() + (128 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Karung Putih Polos', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  22350,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  129,
  NOW() + (129 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Karung Putih BTM [55bal @500/bal]', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  27051,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  130,
  NOW() + (130 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Karung Putih BTM [55bal @500/bal]', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  87,
  '18/02/26',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  '2026-02-18'::date,
  NULL,
  NULL,
  NULL,
  'DIAMBIL HERMAN PACKING ROBUSTA',
  131,
  NOW() + (131 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Karung Goni Pulp Natural Robusta (Nogales)', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  192,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'CAFE NOGALES',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  132,
  NOW() + (132 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Karung Goni Polos', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  3,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  133,
  NOW() + (133 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Karung Goni Cumpa Yellow Cattura', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'CUMPA',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  134,
  NOW() + (134 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Karung goni Cumpa', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  61,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'CUMPA',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  135,
  NOW() + (135 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Karung Goni CSS Bener Meriah', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  10,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  136,
  NOW() + (136 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Karung goni Arabica Pulp Natural (Nogales)', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  50,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'CAFE NOGALES',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  137,
  NOW() + (137 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Karpet L300', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  138,
  NOW() + (138 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kardus HEQA', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  428,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  139,
  NOW() + (139 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kardus Coklat Polos', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  33,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  140,
  NOW() + (140 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Impact Driver & Drill Cordless (NRT-PRO TX340DC MESIN BOR)', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  141,
  NOW() + (141 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Impact Driver & Drill Cordless (NRT-PRO 340DC BOR)', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  142,
  NOW() + (142 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Ikawa Pro 100 Coffe roaster', 'MESIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'KOPI FABRIEK',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  143,
  NOW() + (143 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Ikawa Pro 100 Coffe roaster', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PEMAKAIAN',
  'HARIS',
  'BALI',
  'KOPI FABRIEK',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '1 DIBAWA KE JAKARTA',
  144,
  NOW() + (144 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Hopper', 'MESIN', 'SET', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  145,
  NOW() + (145 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Hand Pallet', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  146,
  NOW() + (146 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Hand Grinder', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'SURABAYA',
  'KOPI FABRIEK',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  147,
  NOW() + (147 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Hand Grease Gun 500cc', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  148,
  NOW() + (148 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Greenhouse UV repair Tape', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  3,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  149,
  NOW() + (149 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Grain Pro 92x50', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  84,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  150,
  NOW() + (150 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Grain pro 75x130', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  118,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  151,
  NOW() + (151 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Grain Pro 72x110 Ziplock', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  48,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  152,
  NOW() + (152 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Gerinda', 'PERALATAN', 'UNIT', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  153,
  NOW() + (153 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Gerinda', 'PERALATAN', 'UNIT', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  '10/02/26',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  'BELI GERINDA MAKITA M 0900B 391200 INDRI - TF HARIS - 10FEB.jpeg',
  '2026-02-10'::date,
  '2026-02-10'::date,
  391.2,
  391.2,
  'GERINDA LAMA MAINTENANCE, BELI BARU',
  154,
  NOW() + (154 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Genset Isuzu Tech 30 KVA', 'MESIN', 'SET', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  155,
  NOW() + (155 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Gelas ukur 1Lt', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  156,
  NOW() + (156 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Garukan Kopi Paralon', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  8,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  157,
  NOW() + (157 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Garukan Kopi Kayu', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  5,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  158,
  NOW() + (158 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Garukan Kopi Besi', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  10,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  159,
  NOW() + (159 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Flow Meter', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  160,
  NOW() + (160 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Flex tape', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  8,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  161,
  NOW() + (161 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Exhaust', 'MESIN', 'SET', 'ASET', 0, NOW(), NOW())
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
  'IN',
  5,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  162,
  NOW() + (162 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Espon L350', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  163,
  NOW() + (163 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Epson LX310 Dot Matrix', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  164,
  NOW() + (164 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Ember 75L HIJAU', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  32,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  165,
  NOW() + (165 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Ember 75L HIJAU', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'OUT',
  9,
  'PEMAKAIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '9 PECAH',
  166,
  NOW() + (166 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Ember 70L HITAM', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  17,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  167,
  NOW() + (167 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Ember 70L HITAM', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'OUT',
  8,
  'PEMAKAIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '8 PECAH',
  168,
  NOW() + (168 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Ember 70L HIJAU', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  30,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  169,
  NOW() + (169 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Ember 70L HIJAU', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'OUT',
  13,
  'PEMAKAIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '13 PECAH',
  170,
  NOW() + (170 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Elefator', 'MESIN', 'SET', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '(2PCS 1 ELEVATOR SUTON DAN 1 ELEVATOR HULLLING) SALDO AWAL MEI',
  171,
  NOW() + (171 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Earlock Box 29x19x10', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  25,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  172,
  NOW() + (172 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Dynabolt', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  20,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  173,
  NOW() + (173 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Dynabolt', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'OUT',
  20,
  'PEMAKAIAN',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'HABIS',
  174,
  NOW() + (174 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Dripper', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  12,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  175,
  NOW() + (175 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Device iot Webcam 2', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  176,
  NOW() + (176 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Device iot Webcam 1', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  177,
  NOW() + (177 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Cupping Spoon (Sendok)', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  50,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  178,
  NOW() + (178 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Cupping Bowl', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  12,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  179,
  NOW() + (179 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Coffee fermentation tank & Mesin - Carry Brew', 'MESIN', 'SET', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  180,
  NOW() + (180 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Coffe Huller', 'MESIN', 'SET', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  181,
  NOW() + (181 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('CCTV', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  12,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  '1',
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  182,
  NOW() + (182 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Cardboard HEQA', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  7,
  'PEMBELIAN',
  'HARIS',
  'JAKARTA',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  183,
  NOW() + (183 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Cardboard Box polos', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  33,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  184,
  NOW() + (184 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Brix Meter', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  185,
  NOW() + (185 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Box Sampling HEQA 28x18x10', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  977,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  186,
  NOW() + (186 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Box Kontainer 70 Ltr', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  187,
  NOW() + (187 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Benang Jahit', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  '18/02/26',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  'BELI BENANG JAHIT & OLI MESIN JAHIT 52K - TF HARIS - 18 FEB 26.jpeg',
  '2026-02-18'::date,
  NULL,
  12,
  12,
  'PEMBELIAN',
  188,
  NOW() + (188 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Beaker', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  189,
  NOW() + (189 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Bantal Tidur', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  5,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  190,
  NOW() + (190 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Bandul Timbangan @5kg', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  2,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  191,
  NOW() + (191 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Ban L300 CT1000 Zeetex R14', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  2,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  192,
  NOW() + (192 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Ban Bekas L300', 'LAIN-LAIN', 'PCS', 'BEKAS', 0, NOW(), NOW())
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
  'IN',
  2,
  'BEKAS',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BEKAS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  193,
  NOW() + (193 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Arit Rumput', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  'BELI ARIT RUMPUT 107K INDRI - TF HARIS - 18 FEB26.jpeg',
  '2026-02-18'::date,
  NULL,
  92.95,
  92.95,
  'PEMBELIAN',
  194,
  NOW() + (194 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Apar 6Kg', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  4,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  195,
  NOW() + (195 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Anping Contry (Trolley)', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  37,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  196,
  NOW() + (196 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Anping Contry (Tray putih)', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  594,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  197,
  NOW() + (197 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Amplas Tumpuk', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  '18/02/26',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  'BELI KAWAT LAS DAN AMPLAS 68K INDRI - TF HARIS - 18 FEB26.jpeg',
  '2026-02-18'::date,
  NULL,
  10,
  10,
  'PEMBELIAN',
  198,
  NOW() + (198 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Airtex Dehumidifying Dryer', 'MESIN', 'SET', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  199,
  NOW() + (199 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Grain Pro 92x50', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  40,
  '20/02/26',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  '2026-02-20'::date,
  NULL,
  NULL,
  NULL,
  'DIKIRIIM KE MARUNDA',
  200,
  NOW() + (200 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Mesin Bor Listrik Makita M 0600 B', 'MESIN', 'UNIT', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  '19/02/26',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  'BELI MESIN BOR TANGAN LISTRIK MAKITA M 0600 B 404347 INDRI - TF HARIS - 19 FEB26.jpeg',
  '2026-02-19'::date,
  '2026-02-19'::date,
  404.347,
  404.347,
  'MESIN BOR UNTUK MAINTENANCE BERAT',
  201,
  NOW() + (201 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Mata Gerinda Poles', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  3,
  '23/02/26',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  'Mata Gerinda Poles Merk Kinik 3 pcs 25K indri - TF HARIS - 23 FEB 26.jpeg',
  NULL,
  '2026-02-23'::date,
  8.33333,
  25,
  'PEMBELIAN',
  202,
  NOW() + (202 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Grain Pro 92x50', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  19,
  '24/02/26',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  '2026-02-25'::date,
  NULL,
  NULL,
  'DIKIRIIM KE MARUNDA',
  203,
  NOW() + (203 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kawat Las', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  2000,
  '25/02/26',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  'Pembelian kawat las 2 kg.jpeg',
  '2026-02-25'::date,
  NULL,
  3600,
  72,
  'PEMBELIAN',
  204,
  NOW() + (204 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Box Sampling HEQA 28x18x10', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  2,
  '25/02/26',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING PENGIRIMAN GB DAPUR KOPI BALI',
  205,
  NOW() + (205 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Box Sampling HEQA 28x18x10', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  '26/02/26',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  '2026-02-27'::date,
  '2026-02-27'::date,
  NULL,
  NULL,
  'PACKING PENGIRIMAN SAMPLE GB KE SURABAYA',
  206,
  NOW() + (206 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kawat Las', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  36,
  '26/02/26',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  'Pembelian kawat las 2 kg.jpeg',
  '2026-02-25'::date,
  NULL,
  3600,
  NULL,
  'ATAP DRY MILL',
  207,
  NOW() + (207 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Timbangan Duduk Digital 150kg', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'OUT',
  1,
  '27/02/26',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  'SuratJalan_41.pdf',
  NULL,
  NULL,
  NULL,
  NULL,
  'KIRIM JAKARTA',
  208,
  NOW() + (208 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Mesin Vaccum Heavypack', 'MESIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  '27/02/26',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'KIRIM JAKARTA',
  209,
  NOW() + (209 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Tatakan Packing 25Kg', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  '27/02/26',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'KIRIM JAKARTA',
  210,
  NOW() + (210 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Mesin Vaccum Heavypack', 'MESIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'OUT',
  1,
  '27/02/26',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  'SuratJalan_41.pdf',
  NULL,
  NULL,
  NULL,
  NULL,
  'KIRIM JAKARTA',
  211,
  NOW() + (211 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Tatakan Packing 25Kg', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'OUT',
  1,
  '27/02/26',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  'SuratJalan_41.pdf',
  NULL,
  NULL,
  NULL,
  NULL,
  'KIRIM JAKARTA',
  212,
  NOW() + (212 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kompresor Angin', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'OUT',
  1,
  '27/02/26',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'KIRIM JAKARTA',
  213,
  NOW() + (213 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kawat Las', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  502,
  '28/02/26',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  'Pembelian kawat las 2 kg.jpeg',
  '2026-02-25'::date,
  NULL,
  3600,
  NULL,
  'ATAP DRY MILL',
  214,
  NOW() + (214 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Box Sampling HEQA 28x18x10', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  '2/3/2026',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  '2026-02-27'::date,
  '2026-02-27'::date,
  NULL,
  NULL,
  'PACKING PENGIRIMAN SAMPLE GB KE JKT',
  215,
  NOW() + (215 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pouch Sampling Brown HEQA', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  261,
  '3/2/2026',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  216,
  NOW() + (216 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pouch Sampling Gray BTM', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  203,
  '3/2/2026',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  217,
  NOW() + (217 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pouch Sampling Gray BTM', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  2,
  '3/2/2026',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  'SuratJalan_41.pdf',
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING PENGIRIMAN SAMPLE GB KE RIAU',
  218,
  NOW() + (218 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kawat Las', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  94,
  '3/2/2026',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  'Pembelian kawat las 2 kg.jpeg',
  '2026-02-25'::date,
  NULL,
  3600,
  NULL,
  'ATAP DRY MILL',
  219,
  NOW() + (219 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pouch Sampling Brown HEQA', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  3,
  '3/3/2026',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING PENGIRIMAN SAMPLE GB KE PT.INDOKOM',
  220,
  NOW() + (220 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Box Sampling HEQA 28x18x10', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  '3/3/2026',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING PENGIRIMAN SAMPLE GB KE PT.INDOKOM',
  221,
  NOW() + (221 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Plastik inner PE 120 x 80 cm ( 50pcs/ball)', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  116,
  '3/3/2026',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING ROBUSTA PUPUAN',
  222,
  NOW() + (222 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Karung Putih BTM [55bal @500/bal]', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  116,
  '3/3/2026',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING ROBUSTA PUPUAN',
  223,
  NOW() + (223 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Saf - Instant Bread Yeast  ( 1 pack 500gr )', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  18000,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  224,
  NOW() + (224 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Plastik inner PE 120 x 80 cm ( 50pcs/ball)', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  127,
  '3/5/2026',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING ROBUSTA PUPUAN',
  225,
  NOW() + (225 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Karung Putih BTM [55bal @500/bal]', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  127,
  '3/5/2026',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING ROBUSTA PUPUAN',
  226,
  NOW() + (226 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Cobra Chasis Grease Hijau No.3', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  '3/5/2026',
  NULL,
  NULL,
  NULL,
  35,
  'PENYESUAIAN AWAL',
  227,
  NOW() + (227 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kawat Las', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  146,
  '3/6/2026',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  3600,
  NULL,
  'ATAP DRY MILL',
  228,
  NOW() + (228 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Box Sampling HEQA 28x18x10', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  2,
  '3/6/2026',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING PENGIRIMAN SAMPLE GB KE TAKOPI',
  229,
  NOW() + (229 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pouch Sampling Brown HEQA', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  '3/6/2026',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING SAMPLE GB UNTUK DI BAWA PAK HARIS',
  230,
  NOW() + (230 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pouch Sampling Gray BTM', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  20,
  '3/6/2026',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING PENGIRIMAN SAMPLE GB KE TAKOPI',
  231,
  NOW() + (231 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pouch Sampling Gray BTM', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  2,
  '3/6/2026',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING SAMPLE CBB',
  232,
  NOW() + (232 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kawat Las', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  52,
  '3/7/2026',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  3600,
  NULL,
  'ATAP DRY MILL',
  233,
  NOW() + (233 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Standing Pouch 300 Gram (14 X 22)', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  50,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  '2026-01-28'::date,
  '2026-01-28'::date,
  NULL,
  17.85,
  'PENYESUAIAN AWAL',
  234,
  NOW() + (234 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Standing Pouch 500 Gram (16 X 24)', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  50,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  '2026-01-28'::date,
  '2026-01-28'::date,
  NULL,
  35,
  'PENYESUAIAN AWAL',
  235,
  NOW() + (235 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Standing Pouch 500 Gram (16 X 24)', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  2,
  '3/14/2026',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'Sample ()',
  236,
  NOW() + (236 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Intenso Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  500,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  'Inv - PT. Berkas Tuaian Melimpah 03032026.pdf',
  '2026-03-03'::date,
  '2026-03-09'::date,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  237,
  NOW() + (237 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Cima Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  500,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  'Inv - PT. Berkas Tuaian Melimpah 03032026.pdf',
  '2026-03-03'::date,
  '2026-03-09'::date,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  238,
  NOW() + (238 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Oro Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  500,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  'Inv - PT. Berkas Tuaian Melimpah 03032026.pdf',
  '2026-03-03'::date,
  '2026-03-09'::date,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  239,
  NOW() + (239 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Troli Barang 100 X 70 (Hitam)', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  2,
  'PEMBELIAN',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  240,
  NOW() + (240 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Troli Barang 70 X 50 (Hitam)', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  2,
  'PEMBELIAN',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  241,
  NOW() + (241 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Avian Cat Kayu dan Besi (0.9 L)', 'LAIN-LAIN', 'Litter', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  '4/2/2026',
  NULL,
  NULL,
  78,
  70.2,
  'SALDO AWAL MEI',
  242,
  NOW() + (242 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kuas Cat SANSHAN-KS-888', 'LAIN-LAIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  2,
  'PEMBELIAN',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  '4/2/2026',
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  243,
  NOW() + (243 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pouch Sampling Brown HEQA', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  8,
  '4/7/2026',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING (8) SAMPLE KIRIM PAK JEREMY',
  244,
  NOW() + (244 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Box Sampling HEQA 28x18x10', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  '4/7/2026',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING (8) SAMPLE KIRIM PAK JEREMY',
  245,
  NOW() + (245 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Standing Pouch 300 Gram (14 X 22)', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  '4/7/2026',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SAMPLE (SITE)',
  246,
  NOW() + (246 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Standing Pouch 300 Gram (14 X 22)', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  2,
  '4/7/2026',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING SAMPLE (46) KIRIM PAK ALFIAN',
  247,
  NOW() + (247 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Earlock Box 29x19x10', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  '4/7/2026',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING SAMPLE (46) KIRIM PAK ALFIAN',
  248,
  NOW() + (248 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Plastik inner PE 120 x 80 cm ( 50pcs/ball)', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  50,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  249,
  NOW() + (249 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Binder Clip 105 15mm', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  12,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  250,
  NOW() + (250 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Bolpen SNOWMAN BP7 Hitam', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  24,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  251,
  NOW() + (251 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kertas Buram 50gr (1 RIM)', 'LAIN-LAIN', 'RIM', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  252,
  NOW() + (252 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Cutter Besar', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  12,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  253,
  NOW() + (253 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Gunting Joyko Hitam', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  2,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  254,
  NOW() + (254 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Isi Cutter Besar Kenko L 150', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  10,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  255,
  NOW() + (255 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Tape/Lakban Bening', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  12,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  256,
  NOW() + (256 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('HVS Kertas A4 PO 75', 'LAIN-LAIN', 'RIM', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  2,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  257,
  NOW() + (257 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Snowman Spidol Karung 500/550 Hitam', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  258,
  NOW() + (258 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Snowman Refill Hitam', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  259,
  NOW() + (259 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Snowman Refill Permanent Hitam', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  260,
  NOW() + (260 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Sticky Note Memo 75/75', 'LAIN-LAIN', 'PAK', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  20,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'SALDO AWAL MEI',
  261,
  NOW() + (261 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pouch Sampling Gray BTM', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  10,
  '4/10/2026',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING SAMPLE G1 WASHED 1KG@100gr KIRIM CIANJUR',
  262,
  NOW() + (262 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Box Sampling HEQA 28x18x10', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  '4/10/2026',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING SAMPLE G1 WASHED 1KG@100gr KIRIM CIANJUR',
  263,
  NOW() + (263 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Plastik inner PE 120 x 80 cm ( 50pcs/ball)', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  6,
  '4/10/2026',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING PENGIRIMAN ALL GB KE CIANJUR',
  264,
  NOW() + (264 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Karung Putih BTM [55bal @500/bal]', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  6,
  '4/10/2026',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING PENGIRIMAN ALL GB KE CIANJUR',
  265,
  NOW() + (265 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pouch Sampling Brown HEQA', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  3,
  '4/10/2026',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING SAMPLE (25, 6.2.2) KIRIM CIANJUR',
  266,
  NOW() + (266 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Box Sampling HEQA 28x18x10', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  '4/10/2026',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING SAMPLE (25, 6.2.2) KIRIM CIANJUR',
  267,
  NOW() + (267 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('RFID Card', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  200,
  'PEMBELIAN',
  'INDRI',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-14'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  268,
  NOW() + (268 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Garukan Tray Kecil', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  5,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-14'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  269,
  NOW() + (269 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Betel Beton', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-15'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  75,
  75,
  'PEMBELIAN',
  270,
  NOW() + (270 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Fisher 6 pembengkok besi', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-15'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  30,
  30,
  'PEMBELIAN',
  271,
  NOW() + (271 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Fisher 12 pembengkok besi', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-15'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  30,
  30,
  'PEMBELIAN',
  272,
  NOW() + (272 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Tang Gegep', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-15'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  75,
  75,
  'PEMBELIAN',
  273,
  NOW() + (273 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Meteran 7.5M', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-15'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  75,
  75,
  'PEMBELIAN',
  274,
  NOW() + (274 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kikir Gergaji Segitiga', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-15'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  45,
  45,
  'PEMBELIAN',
  275,
  NOW() + (275 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Semen Mortar', 'PERALATAN', 'SAK', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-15'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  225,
  225,
  'PEMBELIAN',
  276,
  NOW() + (276 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Semen Tiga Roda', 'PERALATAN', 'SAK', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  20,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-15'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  62,
  NULL,
  'PEMBELIAN',
  277,
  NOW() + (277 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Triplek 8ml', 'PERALATAN', 'LEMBAR', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  3,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-15'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  85,
  255,
  'PEMBELIAN',
  278,
  NOW() + (278 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Paku 7', 'PERALATAN', 'KG', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  2,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-15'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  22,
  44,
  'PEMBELIAN',
  279,
  NOW() + (279 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Reng Lokal', 'PERALATAN', 'IKAT', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  2,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-15'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  175,
  350,
  'PEMBELIAN',
  280,
  NOW() + (280 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kawat Ikat', 'PERALATAN', 'KG', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  2,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-15'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  22,
  44,
  'PEMBELIAN',
  281,
  NOW() + (281 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Spandek P 4M', 'PERALATAN', 'LEMBAR', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-15'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  148,
  148,
  'PEMBELIAN',
  282,
  NOW() + (282 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Thiner A', 'PERALATAN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-15'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  60,
  60,
  'PEMBELIAN',
  283,
  NOW() + (283 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kuas No.2', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  3,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-15'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  12,
  36,
  'PEMBELIAN',
  284,
  NOW() + (284 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Cat Dextro Silver 1/2', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-15'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  60,
  60,
  'PEMBELIAN',
  285,
  NOW() + (285 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Ember  Ijo', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  5,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-15'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  10,
  50,
  'PEMBELIAN',
  286,
  NOW() + (286 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lot Tukang RRC Kerucut 400gr', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-15'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  45,
  45,
  'PEMBELIAN',
  287,
  NOW() + (287 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Benang Ukur Bangunan', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-15'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  5,
  5,
  'PEMBELIAN',
  288,
  NOW() + (288 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Water Selang', 'PERALATAN', 'METER', 'ASET', 0, NOW(), NOW())
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
  'IN',
  8,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-15'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  4,
  32,
  'PEMBELIAN',
  289,
  NOW() + (289 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Cetok Semen Bulat BELCO', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  2,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-15'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  25,
  50,
  'PEMBELIAN',
  290,
  NOW() + (290 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Cetok Semen Lancip GALUR', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-15'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  20,
  20,
  'PEMBELIAN',
  291,
  NOW() + (291 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Palu Besar', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-15'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  60,
  60,
  'PEMBELIAN',
  292,
  NOW() + (292 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Paku 4', 'PERALATAN', 'KG', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-15'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  25,
  25,
  'PEMBELIAN',
  293,
  NOW() + (293 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Besi Cor 6mm', 'PERALATAN', 'BATANG', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  3,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-15'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  35,
  105,
  'PEMBELIAN',
  294,
  NOW() + (294 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Besi Cor 12mm', 'PERALATAN', 'BATANG', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  18,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-15'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  120,
  NULL,
  'PEMBELIAN',
  295,
  NOW() + (295 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Gergaji Kayu WIPRO', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-15'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  125,
  125,
  'PEMBELIAN',
  296,
  NOW() + (296 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kasut Plastik perata acian semen', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  2,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-15'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  25,
  50,
  'PEMBELIAN',
  297,
  NOW() + (297 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Semen Tiga Roda', 'PERALATAN', 'SAK', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-16'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'RENOVASI DRY MILL',
  298,
  NOW() + (298 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Triplek 8ml', 'PERALATAN', 'LEMBAR', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-16'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'RENOVASI DRY MILL',
  299,
  NOW() + (299 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Besi Cor 6mm', 'PERALATAN', 'BATANG', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  3,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-16'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'RENOVASI DRY MILL',
  300,
  NOW() + (300 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Besi Cor 12mm', 'PERALATAN', 'BATANG', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-16'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'RENOVASI DRY MILL',
  301,
  NOW() + (301 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Reng Lokal', 'PERALATAN', 'IKAT', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-17'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'RENOVASI DRY MILL',
  302,
  NOW() + (302 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Triplek 8ml', 'PERALATAN', 'LEMBAR', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-17'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'RENOVASI DRY MILL',
  303,
  NOW() + (303 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Intenso Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  8,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-17'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  304,
  NOW() + (304 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Cima Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  8,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-17'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  305,
  NOW() + (305 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Oro Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  8,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-17'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  306,
  NOW() + (306 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Sarung Tangan/Gloves', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  100,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-17'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  307,
  NOW() + (307 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Sarung Tangan/Gloves', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  12,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-17'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PRODUKSI',
  308,
  NOW() + (308 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Saf - Instant Bread Yeast  ( 1 pack 500gr )', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1000,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-17'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  309,
  NOW() + (309 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Semen Tiga Roda', 'PERALATAN', 'SAK', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  2,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-18'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'RENOVASI DRY MILL',
  310,
  NOW() + (310 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Cat Dextro Black matt', 'LAIN-LAIN', 'KG', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  2,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-18'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  311,
  NOW() + (311 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('RFID Scanner', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'OUT',
  1,
  'RUSAK',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-20'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'RUSAK',
  312,
  NOW() + (312 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Semen Tiga Roda', 'PERALATAN', 'SAK', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-20'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'RENOVASI DRY MILL',
  313,
  NOW() + (313 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pouch Sampling Brown HEQA', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  27,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-20'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING SAMPLE GB KIRIM KO JEREMY (WOC)',
  314,
  NOW() + (314 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pouch Sampling Gray BTM', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  4,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-20'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING SAMPLE GB KIRIM KO JEREMY (WOC)',
  315,
  NOW() + (315 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Box Sampling HEQA 28x18x10', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  2,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-20'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING SAMPLE GB KIRIM KO JEREMY (WOC)',
  316,
  NOW() + (316 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Earlock Box 29x19x10', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-20'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'TEMPAT STICKER',
  317,
  NOW() + (317 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Cat Dextro Black matt', 'LAIN-LAIN', 'KG', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-20'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENGECATAN ATAP DRY MILL',
  318,
  NOW() + (318 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Sapu Lantai', 'LAIN-LAIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-20'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  319,
  NOW() + (319 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Bantal Tidur', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-20'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  320,
  NOW() + (320 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Intenso Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  8,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-20'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  321,
  NOW() + (321 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Cima Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  8,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-20'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  322,
  NOW() + (322 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Oro', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  8,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-20'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  323,
  NOW() + (323 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Saf - Instant Bread Yeast  ( 1 pack 500gr )', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1000,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-20'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  324,
  NOW() + (324 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Gelas Takar 1400 ml', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  8,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  325,
  NOW() + (325 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Gelas Takar 2000 ml', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  3,
  'SALDO AWAL',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  326,
  NOW() + (326 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Gelas Takar 1400 ml', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'OUT',
  1,
  'RUSAK',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-22'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'RUSAK',
  327,
  NOW() + (327 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Semen Tiga Roda', 'PERALATAN', 'SAK', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  4,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-22'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'RABAT',
  328,
  NOW() + (328 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Sarung Tangan/Gloves', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  9,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-22'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PRODUKSI',
  329,
  NOW() + (329 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Gula RJ Polos', 'LAIN-LAIN', 'KG', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  50,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-22'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  330,
  NOW() + (330 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Talang Galvanis 4 X 1,2 m', 'LAIN-LAIN', 'METER', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  4,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-22'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  90,
  360,
  'PEMBELIAN',
  331,
  NOW() + (331 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Engsel Pintu', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  3,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-22'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  40,
  120,
  'PEMBELIAN',
  332,
  NOW() + (332 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Dinabolt 10', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  20,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-22'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  3,
  60,
  'PEMBELIAN',
  333,
  NOW() + (333 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Besi T1.2 (4x4)', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  10,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-22'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  195,
  NULL,
  'PEMBELIAN',
  334,
  NOW() + (334 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Siku TS 4x4', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-22'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  130,
  130,
  'PEMBELIAN',
  335,
  NOW() + (335 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Spandek  6M', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  4,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-22'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  240,
  960,
  'PEMBELIAN',
  336,
  NOW() + (336 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Besi T1.2 (4x4)', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  2,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-22'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBUATAN TUTUP LIMBAH HULLER',
  337,
  NOW() + (337 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kawat Las', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  120,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-22'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBUATAN TUTUP LIMBAH HULLER',
  338,
  NOW() + (338 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Engsel Pintu', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  3,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-22'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBUATAN TUTUP LIMBAH HULLER',
  339,
  NOW() + (339 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Dinabolt 10', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  8,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-22'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBUATAN TUTUP LIMBAH HULLER',
  340,
  NOW() + (340 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Talang Galvanis 4 X 1,2 m', 'LAIN-LAIN', 'METER', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  3,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-22'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  341,
  NOW() + (341 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Intenso Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  8,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-23'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  342,
  NOW() + (342 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Cima Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  8,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-23'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  343,
  NOW() + (343 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Oro Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  8,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-23'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  344,
  NOW() + (344 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Sarung Tangan/Gloves', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  6,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-23'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'TRIAL PRODUKSI',
  345,
  NOW() + (345 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Nachi Lakban Hitam', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  2,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-27'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  20,
  40,
  'PEMBELIAN',
  346,
  NOW() + (346 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kawat Las', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  231,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-27'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBUATAN ATAP COMPRESSOR WESORT',
  347,
  NOW() + (347 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Siku TS 4x4', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-27'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBUATAN ATAP COMPRESSOR WESORT',
  348,
  NOW() + (348 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kawat Ikat', 'LAIN-LAIN', 'KG', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  2,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-27'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'RENOVASI PAGAR PEMBATAS',
  349,
  NOW() + (349 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Talang Galvanis 4 X 1,2 m', 'LAIN-LAIN', 'METER', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-27'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBUATAN ATAP COMPRESSOR WESORT',
  350,
  NOW() + (350 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Dinabolt 10', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  12,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-27'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBUATAN ATAP COMPRESSOR WESORT',
  351,
  NOW() + (351 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Besi T1.2 (4x4)', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  8,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-27'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBUATAN ATAP COMPRESSOR WESORT',
  352,
  NOW() + (352 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Spandek  6M', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  4,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-27'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBUATAN ATAP COMPRESSOR WESORT',
  353,
  NOW() + (353 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Spandek P 4M', 'LAIN-LAIN', 'LEMBAR', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-27'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'ATAP DRY MILL',
  354,
  NOW() + (354 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Intenso Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  8,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-27'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  355,
  NOW() + (355 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Cima Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  8,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-27'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  356,
  NOW() + (356 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Oro', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  8,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-27'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  357,
  NOW() + (357 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Standing Pouch 500 Gram (16 X 24)', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  16,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-28'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING SAMPLE SITE',
  358,
  NOW() + (358 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kertas Vinyl Matte', 'LAIN-LAIN', 'LEMBAR', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  20,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-26'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  359,
  NOW() + (359 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kertas Vinyl Matte', 'LAIN-LAIN', 'LEMBAR', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  7,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-28'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'TRIAL PRINT STICKER',
  360,
  NOW() + (360 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Standing Pouch 300 Gram (14 X 22)', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  5,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-28'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING SAMPLE SITE',
  361,
  NOW() + (361 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Mata Bor 8 mm', 'LAIN-LAIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-28'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  16,
  16,
  'PEMBELIAN',
  362,
  NOW() + (362 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Dynabolt 8', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  10,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-28'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  2,
  20,
  'PEMBELIAN',
  363,
  NOW() + (363 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Dynabolt 8', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  3,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-28'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBUATAN PINTU SAMPING LIMBAH HULLER',
  364,
  NOW() + (364 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Webcam Nemesis Severus HD 1944P', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  2,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-29'::date,
  'ASET',
  'Invoice 583673912593516333.PDF',
  '2026-04-24'::date,
  '2026-04-24'::date,
  NULL,
  NULL,
  'PEMBELIAN',
  365,
  NOW() + (365 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Box Sampling HEQA 28x18x10', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  2,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-29'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING SAMPLE GB KIRIM KO JEREMY (BUKIT TELAGA)',
  366,
  NOW() + (366 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Standing Pouch 300 Gram (14 X 22)', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-29'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING SAMPLE SITE (GANTI RUSAK)',
  367,
  NOW() + (367 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pouch Sampling Brown HEQA', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  28,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-29'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING SAMPLE GB KIRIM KO JEREMY (BUKIT TELAGA)',
  368,
  NOW() + (368 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pouch Sampling Gray BTM', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  8,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-29'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING SAMPLE GB KIRIM KO JEREMY (BUKIT TELAGA)',
  369,
  NOW() + (369 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pouch Sampling Brown HEQA', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-29'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'RUSAK',
  370,
  NOW() + (370 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Bolpen SNOWMAN BP7 Hitam', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-29'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'TRIAL PRODUKSI',
  371,
  NOW() + (371 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Centralite Lampu', 'LAIN-LAIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  4,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-30'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  38,
  152,
  'PEMBELIAN',
  372,
  NOW() + (372 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Stop Kontak 4L', 'LAIN-LAIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  2,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-30'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  20,
  40,
  'PEMBELIAN',
  373,
  NOW() + (373 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Steker Broco', 'LAIN-LAIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  3,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-30'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  13,
  39,
  'PEMBELIAN',
  374,
  NOW() + (374 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Stop Kontak 4L (OB BROCO)', 'LAIN-LAIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-23'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  50,
  50,
  'PEMBELIAN',
  375,
  NOW() + (375 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Stop Kontak 4L (Uticon)', 'LAIN-LAIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-23'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  20,
  20,
  'PEMBELIAN',
  376,
  NOW() + (376 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Steker Broco (Cuk Arde)', 'LAIN-LAIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  3,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-23'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  12,
  36,
  'PEMBELIAN',
  377,
  NOW() + (377 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Silicone Sealant', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  30,
  30,
  'PEMBELIAN',
  378,
  NOW() + (378 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kasur Lantai', 'LAIN-LAIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-17'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  184.2,
  184.2,
  'PEMBELIAN',
  379,
  NOW() + (379 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Sarung Bantal', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-17'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  5.665,
  5.665,
  'PEMBELIAN',
  380,
  NOW() + (380 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Intenso Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  32,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  381,
  NOW() + (381 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Cima Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  32,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  382,
  NOW() + (382 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Oro Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  32,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  383,
  NOW() + (383 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Gula RJ Polos', 'LAIN-LAIN', 'KG', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  384,
  NOW() + (384 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Sarung Tangan/Gloves', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  6,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  385,
  NOW() + (385 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Mata shock Lemari', 'PERALATAN', 'BOX', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  386,
  NOW() + (386 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Vacum Multipro VC 30-1-RL', 'MESIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  387,
  NOW() + (387 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kompresor Lakoni 1.0HP', 'MESIN', 'SET', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  388,
  NOW() + (388 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pompa Somy  3 Dim', 'MESIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  389,
  NOW() + (389 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kunci Set Max Built', 'PERALATAN', 'SET', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  390,
  NOW() + (390 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Mata Bor Set', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  8,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  391,
  NOW() + (391 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Skectmat', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  392,
  NOW() + (392 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kunci T 12 mm', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  393,
  NOW() + (393 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kunci Pas', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  394,
  NOW() + (394 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kunci L', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  395,
  NOW() + (395 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Siku', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  396,
  NOW() + (396 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kunci inggris Besar', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  397,
  NOW() + (397 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kunci inggris kecil', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  398,
  NOW() + (398 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Meteran 4 meter', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  399,
  NOW() + (399 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kunci Pipa  12 Inch', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  400,
  NOW() + (400 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Tang Butung', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  401,
  NOW() + (401 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Tang Kombinasi', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  402,
  NOW() + (402 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Obeng Soket', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  403,
  NOW() + (403 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Tang Potong', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  404,
  NOW() + (404 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Tang Rivet', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  405,
  NOW() + (405 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Charger Aki', 'PERALATAN', 'SET', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  406,
  NOW() + (406 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Tang Skun', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  407,
  NOW() + (407 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Tang Amper MT87', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  408,
  NOW() + (408 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('AVO Krisbow', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  409,
  NOW() + (409 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Tespen', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  410,
  NOW() + (410 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Tangga Maten', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  411,
  NOW() + (411 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lem Dexton', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  5,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  412,
  NOW() + (412 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Seal tape Hitam', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  413,
  NOW() + (413 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lem  Pipa', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  2,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  414,
  NOW() + (414 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('WD-40 Kaleng', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  415,
  NOW() + (415 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Engsel Olia', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  4,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  416,
  NOW() + (416 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lem Taco', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  2,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  417,
  NOW() + (417 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pipa Instalasi', 'LAIN-LAIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  50,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  418,
  NOW() + (418 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Klem Pipa', 'PERALATAN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  50,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  419,
  NOW() + (419 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Tidos', 'PERALATAN', 'PCS', NULL, 0, NOW(), NOW())
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
  'IN',
  20,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  420,
  NOW() + (420 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Keni Pipa 3 Dim', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  5,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  421,
  NOW() + (421 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lamppu Ares LED', 'PERALATAN', 'DUS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  2,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  422,
  NOW() + (422 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kabel CCTV Roll', 'PERALATAN', 'ROLL', 'ASET', 0, NOW(), NOW())
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
  'IN',
  2,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  423,
  NOW() + (423 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kabel Suprem 4 x 6 mm', 'PERALATAN', 'ROLL', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  424,
  NOW() + (424 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kabel Suprem 4 x 4 mm', 'PERALATAN', 'ROLL', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  425,
  NOW() + (425 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kabel Suprem 4 x 16 mm', 'PERALATAN', 'ROLL', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  426,
  NOW() + (426 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kabel NYMH 3 x 0,75', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  3,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  427,
  NOW() + (427 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kabel NYMH 3 x 2,5', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  428,
  NOW() + (428 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Stop Kontak Single', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  5,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  429,
  NOW() + (429 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Speed Kipas Rapid', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  5,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  430,
  NOW() + (430 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Stop Konntak Dinding Double', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  4,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  431,
  NOW() + (431 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lampu Sorot Vacolux 50 WATT', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  432,
  NOW() + (432 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Stan TV', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  433,
  NOW() + (433 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lampu Zetalux 18 w', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  434,
  NOW() + (434 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Skrup 3,5 x 22 mm', 'PERALATAN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  435,
  NOW() + (435 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Finser', 'PERALATAN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  5,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  436,
  NOW() + (436 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Steker 3 Pasang', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  4,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  437,
  NOW() + (437 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Tor 3 Pas', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  6,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  438,
  NOW() + (438 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('MCB 3 Phase', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  439,
  NOW() + (439 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Time 3 Phase', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  10,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  440,
  NOW() + (440 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('MCB 1 Phase', 'PERALATAN', 'BOX', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  441,
  NOW() + (441 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Suku Cadang Alat-alat', 'PERALATAN', 'SET', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  442,
  NOW() + (442 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Klaket ACC', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  443,
  NOW() + (443 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kabel Engkel Sisa', 'PERALATAN', 'ROLL', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  4,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  444,
  NOW() + (444 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kabel Lem Wifi', 'PERALATAN', 'ROLL', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  445,
  NOW() + (445 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Panel MCB', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  2,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  446,
  NOW() + (446 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Filter Air', 'PERALATAN', 'SET', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  447,
  NOW() + (447 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Sisa Ekalavator', 'PERALATAN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  448,
  NOW() + (448 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Bus bar 1 x 2 x 5 3P', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  449,
  NOW() + (449 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Grounding', 'PERALATAN', 'LONJOR', 'ASET', 0, NOW(), NOW())
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
  'IN',
  4,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  450,
  NOW() + (450 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lampu Jalan', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  451,
  NOW() + (451 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lampu Hibolux', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  2,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  452,
  NOW() + (452 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Bolpen SNOWMAN BP7 Hitam', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PRODUKSI',
  453,
  NOW() + (453 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Standing Pouch 300 Gram (14 X 22)', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  41,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING SAMPLE SITE (GANTI RUSAK)',
  454,
  NOW() + (454 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Standing Pouch 500 Gram (16 X 24)', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  32,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING SAMPLE SITE',
  455,
  NOW() + (455 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Sabun cuci piring FOOD GRADE', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  3,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  10.6,
  31.8,
  'PEMBELIAN',
  456,
  NOW() + (456 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Baterai Moist Meter  Alkaline 6LR61 9Volt', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  2,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  52.6,
  105.2,
  'PEMBELIAN',
  457,
  NOW() + (457 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Baterai Moist Meter  Alkaline 6LR61 9Volt', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  2,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENGGUNAAN UNTUK MOIST METER',
  458,
  NOW() + (458 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Van Belt A-17', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  459,
  NOW() + (459 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Van Belt A-26', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  460,
  NOW() + (460 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Van Belt A-62', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  3,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  461,
  NOW() + (461 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Van Belt A-63', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  462,
  NOW() + (462 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Van Belt A-65', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  5,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  463,
  NOW() + (463 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Van Belt A-67', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  464,
  NOW() + (464 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Van Belt A-68', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  465,
  NOW() + (465 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Tespen', 'PERALATAN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  25,
  25,
  'PEMBELIAN',
  466,
  NOW() + (466 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Intenso Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  8,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  467,
  NOW() + (467 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Cima Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  8,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  468,
  NOW() + (468 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Oro Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  8,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  469,
  NOW() + (469 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Sabun cuci piring FOOD GRADE', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'CUCI BUCKET DAN BLUE BARREL AFTER FERMENT',
  470,
  NOW() + (470 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lem Silicone', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  2,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-07-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  35,
  70,
  'PEMBELIAN',
  471,
  NOW() + (471 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Seltif', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  10,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-07-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  4,
  40,
  'PEMBELIAN',
  472,
  NOW() + (472 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Bolpen SNOWMAN BP7 Hitam', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-07-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMAKAIAN',
  473,
  NOW() + (473 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Cutter Besar', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-07-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMAKAIAN',
  474,
  NOW() + (474 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Semen Tiga Roda', 'LAIN-LAIN', 'SAK', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  4,
  'PENGGUNAAN',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-07-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMAKAIAN RENOVASI',
  475,
  NOW() + (475 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Wall Board A01', 'LAIN-LAIN', 'LEMBAR', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  19,
  'PEMBELIAN',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-07-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  215,
  NULL,
  'PEMBELIAN',
  476,
  NOW() + (476 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Besi 3x3x1 mm', 'LAIN-LAIN', 'BATANG', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  24,
  'PEMBELIAN',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-07-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  110,
  NULL,
  'PEMBELIAN',
  477,
  NOW() + (477 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Sekrup Drilling JF 8x32', 'LAIN-LAIN', 'PACK', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-07-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  50,
  50,
  'PEMBELIAN',
  478,
  NOW() + (478 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Standing Pouch 500 Gram (16 X 24)', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  50,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-07-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  1.26,
  63,
  'PEMBELIAN',
  479,
  NOW() + (479 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Standing Pouch 300 Gram (14 X 22)', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  100,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-07-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  67000,
  67,
  'PEMBELIAN',
  480,
  NOW() + (480 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Standing Pouch 50 Gram (10 X 17)', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  50,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-07-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  38000,
  19,
  'PEMBELIAN',
  481,
  NOW() + (481 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Prodigy  Pichia Yeast (Berlian Biotech)', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  4,
  'SAMPLE',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-12-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  482,
  NOW() + (482 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Anti Mould Yeast (Berlian Biotech)', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  3,
  'SAMPLE',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-12-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  483,
  NOW() + (483 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Luwak Kluyveromyces Yeast (Berlian Biotech)', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  16,
  'SAMPLE',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-12-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  484,
  NOW() + (484 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Saccharomyces Yeast (Berlian Biotech)', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  7,
  'SAMPLE',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-12-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  485,
  NOW() + (485 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Standing Pouch 100 Gram (12 X 20)', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  100,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-12-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  50000,
  50,
  'PEMBELIAN',
  486,
  NOW() + (486 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Sticker Tom & Jerry', 'LAIN-LAIN', 'PACK', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-12-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  4,
  4,
  'PEMBELIAN',
  487,
  NOW() + (487 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Standing Pouch 300 Gram (14 X 22)', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  100,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-12-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING SAMPLE ALL EXPERIMENT 2026 ON THE SITE',
  488,
  NOW() + (488 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Standing Pouch 50 Gram (10 X 17)', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  50,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-12-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING HASIL ROAST 50gr',
  489,
  NOW() + (489 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Mata Bor Beton 6X6X100', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-12-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  23,
  23,
  'PEMBELIAN',
  490,
  NOW() + (490 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Mangkuk Sample cek KA', 'LAIN-LAIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  24,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-12-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  1.584,
  38.016,
  'PEMBELIAN',
  491,
  NOW() + (491 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Water Jet Pump Pro Quip 3500', 'MESIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-12-05'::date,
  'ASET',
  'Pembelian Water Jet Pum Proquip dan Laptop HP 14.pdf',
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  492,
  NOW() + (492 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Laptop HP 14"', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-12-05'::date,
  'ASET',
  'Pembelian Water Jet Pum Proquip dan Laptop HP 14.pdf',
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  493,
  NOW() + (493 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pouch Sampling Brown HEQA', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  11,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-12-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING ROAST GB AFTER CUPPING  ( 1 pouch Rusak )',
  494,
  NOW() + (494 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Cupping Spoon (Sendok)', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'OUT',
  2,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-12-05'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'DIBAWA KO JEREMY DI SURABAYA',
  495,
  NOW() + (495 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Box Sampling HEQA 28x18x10', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  19,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-12-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'DIBAWA KO JEREMY DI SURABAYA',
  496,
  NOW() + (496 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Bolpen SNOWMAN BP7 Hitam', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  2,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-12-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'DI PAKAI UNTUK ROAST KE SURABYA',
  497,
  NOW() + (497 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Baterai Moist Meter  Alkaline 6LR61 9Volt', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  12,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-12-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  498,
  NOW() + (498 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pouch Sampling Brown HEQA', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  200,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-12-05'::date,
  'BARANG BISA HABIS',
  'Pouch Brown & Gray.jpeg',
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  499,
  NOW() + (499 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pouch Sampling Gray BTM', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  200,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-12-05'::date,
  'BARANG BISA HABIS',
  'Pouch Brown & Gray.jpeg',
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  500,
  NOW() + (500 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kawat Las', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  820,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-13'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMAKAIAN RENOVASI DRY MILL',
  501,
  NOW() + (501 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kawat Las', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  2000,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-13'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  502,
  NOW() + (502 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Prodigy  Pichia Yeast (Berlian Biotech)', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  4,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-13'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  503,
  NOW() + (503 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Luwak Kluyveromyces Yeast (Berlian Biotech)', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  16,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-13'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  504,
  NOW() + (504 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Saccharomyces Yeast (Berlian Biotech)', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  6,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-13'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  505,
  NOW() + (505 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Intenso Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  12,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-13'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  506,
  NOW() + (506 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Cima Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  12,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-13'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  507,
  NOW() + (507 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Gula RJ Polos', 'LAIN-LAIN', 'KG', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  3,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-13'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  508,
  NOW() + (508 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Saf - Instant Bread Yeast  ( 1 pack 500gr )', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  500,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-13'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  509,
  NOW() + (509 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Sarung Tangan/Gloves', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  6,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-05'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  510,
  NOW() + (510 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Baut Baja', 'LAIN-LAIN', 'BOX', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-16'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  35,
  35,
  'PEMBELIAN',
  511,
  NOW() + (511 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Mata Gerinda', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  6,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-16'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  3.4,
  20.4,
  'PEMBELIAN',
  512,
  NOW() + (512 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Reaim Mesin Potong Rumput 4 Tak', 'MESIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-16'::date,
  'ASET',
  'Pembelian Mesin Potong Rumput, Hygrometer, Tray rack .jpeg',
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  513,
  NOW() + (513 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Termometer Hygrometer', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  8,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-16'::date,
  'ASET',
  'Pembelian Mesin Potong Rumput, Hygrometer, Tray rack .jpeg',
  NULL,
  NULL,
  24.955,
  199.64,
  'PEMBELIAN',
  514,
  NOW() + (514 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Castrol OLI 4T', 'LAIN-LAIN', 'BOTOL', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-16'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  81.99,
  81.99,
  'PEMBELIAN',
  515,
  NOW() + (515 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Standing Pouch 100 Gram (12 X 20)', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  24,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-16'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING SAMPLE ROASTING',
  516,
  NOW() + (516 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Standing Pouch 500 Gram (16 X 24)', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  22,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-16'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING SAMPLE GB ON THE SITE',
  517,
  NOW() + (517 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Tape/Lakban Bening', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-16'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PRODUKSI',
  518,
  NOW() + (518 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Besi 3x3x1 mm', 'LAIN-LAIN', 'BATANG', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  24,
  'PENGGUNAAN',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-16'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'MAINTENANCE DYING ROOM',
  519,
  NOW() + (519 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Dokument Tray Rak', 'PERLENGKAPAN KANTOR', 'SET', 'ASET', 0, NOW(), NOW())
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
  'IN',
  4,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-18'::date,
  'ASET',
  'Pembelian Mesin Potong Rumput, Hygrometer, Tray rack .jpeg',
  NULL,
  NULL,
  64.167,
  256.668,
  'PEMBELIAN',
  520,
  NOW() + (520 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Intenso Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  48,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-18'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  521,
  NOW() + (521 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Cima Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  48,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-18'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  522,
  NOW() + (522 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Oro Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  48,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-18'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  523,
  NOW() + (523 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Sarung Tangan/Gloves', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  6,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-18'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  524,
  NOW() + (524 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Tabung Ukur Density 250ml', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-19'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  120,
  120,
  'PEMBELIAN',
  525,
  NOW() + (525 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Silicone Sealant', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-19'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENAMBALAN AREA GH',
  526,
  NOW() + (526 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Silicone Sealant', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  2,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-19'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  30,
  60,
  'PEMBELIAN',
  527,
  NOW() + (527 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Timbangan Duduk Digital Sonic 200kg', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-19'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  528,
  NOW() + (528 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Tabung N2', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-20'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  529,
  NOW() + (529 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Workshirt HEQA', 'LAIN-LAIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  26,
  'PEMBELIAN',
  'PUTRI',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-20'::date,
  'ASET',
  'WORKSHIRT HEQA 26 PCS INV.pdf',
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  530,
  NOW() + (530 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Workshirt HEQA', 'LAIN-LAIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'OUT',
  21,
  'PEMBELIAN',
  'PUTRI',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-20'::date,
  'ASET',
  'WORKSHIRT HEQA 26 PCS INV.pdf',
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  531,
  NOW() + (531 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('T-Shirt HEQA', 'LAIN-LAIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  20,
  'PEMBELIAN',
  'PUTRI',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-20'::date,
  'ASET',
  'T-SHIRT HEQA 20 PCS INV.jpg',
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  532,
  NOW() + (532 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('T-Shirt HEQA', 'LAIN-LAIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'OUT',
  20,
  'PEMBELIAN',
  'PUTRI',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-20'::date,
  'ASET',
  'T-SHIRT HEQA 20 PCS INV.jpg',
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  533,
  NOW() + (533 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Dji Mini 4 Pro', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'PUTRI',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-20'::date,
  'ASET',
  'DJI MINI 4 PRO.jpg',
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  534,
  NOW() + (534 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Name Card HEQA & Kopi Fabriek', 'LAIN-LAIN', 'BOX', 'ASET', 0, NOW(), NOW())
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
  'IN',
  2,
  'PEMBELIAN',
  'PUTRI',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-20'::date,
  'ASET',
  'CETAK KARTU NAMA HEQA & KOPI FABRIEK.jpg',
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  535,
  NOW() + (535 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Cupping Card HEQA', 'LAIN-LAIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  9,
  'PEMBELIAN',
  'PUTRI',
  'SURABAYA',
  'PROCESSING FACILITY',
  '2026-05-20'::date,
  'ASET',
  'PRINT CUPPING CARD HEQA.jpg',
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  536,
  NOW() + (536 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Adaptor Dji Mini 4 Pro', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'PUTRI',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-20'::date,
  'ASET',
  'ADAPTOR DJI MINI 4 PRO INV.jpg',
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  537,
  NOW() + (537 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pectic Enzyme Powder', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  200,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-20'::date,
  'BARANG BISA HABIS',
  'Invoice pectic Enzim .jpeg',
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  538,
  NOW() + (538 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Cupping Bowl Black', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  24,
  'PEMBELIAN',
  'HARIS',
  'SURABAYA',
  'PROCESSING FACILITY',
  '2026-05-20'::date,
  'ASET',
  'Pembelian Cupping Bowl.jpeg',
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  539,
  NOW() + (539 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Saf - Instant Bread Yeast  ( 1 pack 500gr )', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  500,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-20'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PRODUKSI',
  540,
  NOW() + (540 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Airlock', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  20,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-20'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN  AWAL ( 5 PCS RUSAK)',
  541,
  NOW() + (541 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Airlock', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'OUT',
  20,
  'SALDO AWAL',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-20'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN  AWAL ( 5 PCS RUSAK)',
  542,
  NOW() + (542 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Sarung Tangan/Gloves', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  6,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-20'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PRODUKSI',
  543,
  NOW() + (543 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Cutter Besar', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-20'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PRODUKSI',
  544,
  NOW() + (544 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pouch Sampling Gray BTM', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  2,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-21'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'KIRIM SAMPLE DAPUR KOPI BALI',
  545,
  NOW() + (545 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Box Sampling HEQA 28x18x10', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-21'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'KIRIM SAMPLE DAPUR KOPI BALI',
  546,
  NOW() + (546 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Difluid Scale', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PENYESUAIAN',
  'ALFIAN',
  'JAKARTA',
  'PROCESSING FACILITY',
  '2026-05-21'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN  AWAL',
  547,
  NOW() + (547 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Vacum Sealer Krisbow', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PENYESUAIAN',
  'ALFIAN',
  'JAKARTA',
  'PROCESSING FACILITY',
  '2026-05-21'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN  AWAL',
  548,
  NOW() + (548 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Plastik Vacum 13x18', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  37,
  'PENYESUAIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-21'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN STOCK',
  549,
  NOW() + (549 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Time More Scale', 'LAIN-LAIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PENYESUAIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-21'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN STOCK',
  550,
  NOW() + (550 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Cupping Bowl KF', 'LAIN-LAIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  35,
  'PENYESUAIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-21'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN STOCK',
  551,
  NOW() + (551 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Sabun cuci piring FOOD GRADE', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-21'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'CUCI BUCKET DAN BLUE BARREL AFTER FERMENT',
  552,
  NOW() + (552 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Saf - Instant Bread Yeast  ( 1 pack 500gr )', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  500,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-21'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PRODUKSI',
  553,
  NOW() + (553 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lem G', 'LAIN-LAIN', 'PACK', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  2,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-22'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  8,
  16,
  'PEMBELIAN',
  554,
  NOW() + (554 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lem G', 'LAIN-LAIN', 'PACK', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  2,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-22'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  8,
  NULL,
  'MAINTENANCE PINTU OFFICE',
  555,
  NOW() + (555 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Saf - Instant Bread Yeast  ( 1 pack 500gr )', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1000,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-22'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PRODUKSI',
  556,
  NOW() + (556 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Baterai Moist Meter  Alkaline 6LR61 9Volt', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  2,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-23'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'GANTI BATERAI MOISTURE METER',
  557,
  NOW() + (557 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Coffmeter Moisture M1', 'PERALATAN', 'SET', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-23'::date,
  'BARANG BISA HABIS',
  'Pembelian Coffmeter dan Rak  Tray.jpeg',
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  558,
  NOW() + (558 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Saf - Instant Bread Yeast  ( 1 pack 500gr )', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  266,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-25'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  559,
  NOW() + (559 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Intenso Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  24,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-25'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  560,
  NOW() + (560 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Cima Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  16,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-25'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  561,
  NOW() + (561 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Memory Card - Drone', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'PUTRI',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-25'::date,
  'BARANG BISA HABIS',
  'Pembelian Card Reader .jpeg',
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  562,
  NOW() + (562 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Card Reader', 'LAIN-LAIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'PUTRI',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-25'::date,
  'ASET',
  'Pembelian Card Reader .jpeg',
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  563,
  NOW() + (563 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Yeast Nutrient LD Carlson', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  75,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-25'::date,
  'BARANG BISA HABIS',
  'Pembelian LD Carlson yeast.jpeg',
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  564,
  NOW() + (564 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Cutter Besar', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  3,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-25'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMAKAIAN UNTUK PRODUKSI',
  565,
  NOW() + (565 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Trolley Besi 3 Tingkat/ Tool Box Kotak Perkakas', 'LAIN-LAIN', 'SET', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-25'::date,
  'ASET',
  'inv Rak tray .jpeg',
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  566,
  NOW() + (566 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kartu Nama Alican', 'LAIN-LAIN', 'BOX', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'PUTRI',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-25'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  567,
  NOW() + (567 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pouch Sampling Brown HEQA', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  8,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-27'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMAKAIAN UNTUK PACKING SAMPLE',
  568,
  NOW() + (568 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Box Sampling HEQA 28x18x10', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-27'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMAKAIAN UNTUK PACKING SAMPLE',
  569,
  NOW() + (569 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Tape/Lakban Bening', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-27'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENGGUNNAAN PRODUKSI',
  570,
  NOW() + (570 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pouch Sampling Gray BTM', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-27'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMAKAIAN UNTUK PACKING SAMPLE',
  571,
  NOW() + (571 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pouch Sampling KF', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  16,
  'PENYESUAIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-27'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN AWAL',
  572,
  NOW() + (572 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pouch Sampling KF', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  3,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-27'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMAKAIAN UNTUK PACKING SAMPLE',
  573,
  NOW() + (573 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Saf - Instant Bread Yeast  ( 1 pack 500gr )', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  16,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-27'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  574,
  NOW() + (574 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pectic Enzyme Powder', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  4,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-27'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  575,
  NOW() + (575 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Yeast Nutrient LD Carlson', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  2,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-27'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  576,
  NOW() + (576 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Standing Pouch 500 Gram (16 X 24)', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  28,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-27'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING SAMPLE GB ON THE SITE',
  577,
  NOW() + (577 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Sticker Tom & Jerry', 'LAIN-LAIN', 'PACK', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  3,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-27'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  3.8,
  11.4,
  'PEMBELIAN',
  578,
  NOW() + (578 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Double Tape 48mm', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  2,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-27'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  14.2,
  28.4,
  'PEMBELIAN',
  579,
  NOW() + (579 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Standing Pouch 500 Gram (16 X 24)', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  50,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-27'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  1.26,
  63,
  'PEMBELIAN',
  580,
  NOW() + (580 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Standing Pouch 300 Gram (14 X 22)', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  50,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-27'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  67000,
  33.5,
  'PEMBELIAN',
  581,
  NOW() + (581 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Workshirt HEQA', 'LAIN-LAIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PENYESUAIAN',
  'PUTRI',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-27'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN',
  582,
  NOW() + (582 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Cupping Spoon (Sendok)', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  4,
  'PENYESUAIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-27'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN',
  583,
  NOW() + (583 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Keranjang Basket', 'LAIN-LAIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  21,
  'PENYESUAIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-28'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN',
  584,
  NOW() + (584 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Keranjang Basket', 'LAIN-LAIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  10,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-28'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  53,
  530,
  'PEMBELIAN',
  585,
  NOW() + (585 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Double Tape 48mm', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-28'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'NUMBERING PALLET WH',
  586,
  NOW() + (586 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Saf - Instant Bread Yeast  ( 1 pack 500gr )', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  35,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-28'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  587,
  NOW() + (587 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Cima Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  20,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-28'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  588,
  NOW() + (588 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Intenso Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  10,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-28'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  589,
  NOW() + (589 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Cupping Card Production Lot 2025', 'LAIN-LAIN', 'SET', 'ASET', 0, NOW(), NOW())
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
  'IN',
  2,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-28'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  590,
  NOW() + (590 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Cupping Card Experiment 2026', 'LAIN-LAIN', 'SET', 'ASET', 0, NOW(), NOW())
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
  'IN',
  2,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-28'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  591,
  NOW() + (591 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Keranjang Plastik Kotak Sample GB', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  5,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-29'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  125,
  625,
  'PEMBELIAN',
  592,
  NOW() + (592 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Cupping Flush Glass', 'LAIN-LAIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  6,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-29'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  8,
  48,
  'PEMBELIAN',
  593,
  NOW() + (593 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Mangkuk Sample cek KA', 'LAIN-LAIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  24,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-29'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  516.583,
  NULL,
  'PEMBELIAN',
  594,
  NOW() + (594 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Saf - Instant Bread Yeast  ( 1 pack 500gr )', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  20000,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-29'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  10900,
  NULL,
  'PEMBELIAN (satuan pack dirubah ke gram)',
  595,
  NOW() + (595 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pouch Sampling Gray BTM', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  7,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-30'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMAKAIAN UNTUK PACKING SAMPLE',
  596,
  NOW() + (596 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pouch Sampling Brown HEQA', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  49,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-30'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMAKAIAN UNTUK PACKING SAMPLE',
  597,
  NOW() + (597 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pouch Sampling Brown HEQA', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  27,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-30'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'RUSAK',
  598,
  NOW() + (598 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Box Sampling HEQA 28x18x10', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  3,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-30'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMAKAIAN UNTUK PACKING SAMPLE',
  599,
  NOW() + (599 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Baterai Moist Meter  Alkaline 6LR61 9Volt', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  2,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-30'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'GANTI BATERAI MOISTURE METER',
  600,
  NOW() + (600 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Leaflet Card', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  50,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-30'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  601,
  NOW() + (601 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pouch Sampling Gray BTM', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-30'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'RUSAK',
  602,
  NOW() + (602 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Sabun cuci piring FOOD GRADE', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-31'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  603,
  NOW() + (603 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Sabun cuci piring FOOD GRADE', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-31'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  604,
  NOW() + (604 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Oro Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  10,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-31'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  605,
  NOW() + (605 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Cima Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  10,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-31'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  606,
  NOW() + (606 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Standing Pouch 500 Gram (16 X 24)', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  100,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-31'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  0,
  NULL,
  'PACKING SAMPLE ON THE SITE',
  607,
  NOW() + (607 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Standing Pouch 500 Gram (16 X 24)', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  50,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-31'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  0,
  NULL,
  'PACKING SAMPLE ON THE SITE',
  608,
  NOW() + (608 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('TP Link Omada POE', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  3,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-06'::date,
  'ASET',
  'Invoice TP Link  POeE.pdf',
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  609,
  NOW() + (609 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Sarung Tangan Panjang Karet (Merah)', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  10,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-06'::date,
  'BARANG BISA HABIS',
  'invoice OTG, Kabel Ties, Sarung Tangan.pdf',
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  610,
  NOW() + (610 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kabel Ties Putih (1pack 100pcs)', 'LAIN-LAIN', 'PACK', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  10,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-06'::date,
  'BARANG BISA HABIS',
  'invoice OTG, Kabel Ties, Sarung Tangan.pdf',
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  611,
  NOW() + (611 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kabel OTG', 'LAIN-LAIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-06'::date,
  'ASET',
  'invoice OTG, Kabel Ties, Sarung Tangan.pdf',
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  612,
  NOW() + (612 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Mesin Husker 1000 (Dinamo)', 'MESIN', 'UNIT', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-06'::date,
  'ASET',
  'Invoice_20260521_192715_0000.pdf',
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  613,
  NOW() + (613 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Mesin Mini Husker 100 (Dinamo)', 'MESIN', 'UNIT', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-06'::date,
  'ASET',
  'Invoice_20260521_192715_0000.pdf',
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  614,
  NOW() + (614 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Elbow 1 Inchi', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  4,
  'PEMBELIAN',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  7,
  28,
  'PEMBELIAN',
  615,
  NOW() + (615 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Elbow 3 Inchi', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  4,
  'PEMBELIAN',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  45,
  180,
  'PEMBELIAN',
  616,
  NOW() + (616 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Elbow 6 Inchi', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  115,
  115,
  'PEMBELIAN',
  617,
  NOW() + (617 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Vanbelt A63', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  75,
  75,
  'PEMBELIAN',
  618,
  NOW() + (618 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Ganjal Karet CA', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  4,
  'PEMBELIAN',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  35,
  140,
  'PEMBELIAN',
  619,
  NOW() + (619 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Ganjal Karet CK', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  4,
  'PEMBELIAN',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  20,
  80,
  'PEMBELIAN',
  620,
  NOW() + (620 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('CCTV Hikvision', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-06'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  425,
  425,
  'PEMBELIAN',
  621,
  NOW() + (621 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Handle 30A', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  2,
  'PEMBELIAN',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  100,
  200,
  'PEMBELIAN',
  622,
  NOW() + (622 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Handle 15A', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  60,
  60,
  'PEMBELIAN',
  623,
  NOW() + (623 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Silicone Sealant', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  2,
  'PEMBELIAN',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  37.5,
  75,
  'PEMBELIAN',
  624,
  NOW() + (624 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('MCB', 'LAIN-LAIN', 'BOX', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  5,
  'PEMBELIAN',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  10,
  50,
  'PEMBELIAN',
  625,
  NOW() + (625 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Steker Broco', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  20,
  20,
  'PEMBELIAN',
  626,
  NOW() + (626 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kontra Arde Broco', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  25,
  25,
  'PEMBELIAN',
  627,
  NOW() + (627 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Klem 20', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  32,
  32,
  'PEMBELIAN',
  628,
  NOW() + (628 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kabel Ties 30CM', 'LAIN-LAIN', 'PACK', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  30,
  30,
  'PEMBELIAN',
  629,
  NOW() + (629 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Stop L Broco', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  2,
  'PEMBELIAN',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  52,
  104,
  'PEMBELIAN',
  630,
  NOW() + (630 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Steker Meval', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  2,
  'PEMBELIAN',
  'BONANG',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  20,
  40,
  'PEMBELIAN',
  631,
  NOW() + (631 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Air Galon AMIDIS', 'LAIN-LAIN', 'BOTOL', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  23,
  23,
  'PEMBELIAN',
  632,
  NOW() + (632 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Saf - Instant Bread Yeast  ( 1 pack 500gr )', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  15,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  10900,
  NULL,
  'EXPERIMENT',
  633,
  NOW() + (633 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pectic Enzyme Powder', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  2,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  634,
  NOW() + (634 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Yeast Nutrient LD Carlson', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  2,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  635,
  NOW() + (635 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Box Sampling HEQA 28x18x10', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING SAMPLE TO SURABAYA',
  636,
  NOW() + (636 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pouch Sampling Gray BTM', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  15,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING SAMPLE TO SURABAYA',
  637,
  NOW() + (637 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pouch Sampling Brown HEQA', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  14,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PACKING SAMPLE TO SURABAYA',
  638,
  NOW() + (638 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Intenso Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  15,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-01-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  639,
  NOW() + (639 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Oro Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  10,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-02-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  640,
  NOW() + (640 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kursi kantor', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  5,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-02-06'::date,
  'ASET',
  'Invoice Kursi Kantor.pdf',
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  641,
  NOW() + (641 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Kursi kantor', 'PERLENGKAPAN KANTOR', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'OUT',
  2,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-02-06'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'RUSAK',
  642,
  NOW() + (642 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Sprayer', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-02-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  643,
  NOW() + (643 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Saringan', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-02-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  644,
  NOW() + (644 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('MCB 1 Phase 32 A', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-02-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN  (Instalasi Listrik di Site)',
  645,
  NOW() + (645 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('MCB 3 Phase 25 A', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-02-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN  (Instalasi Listrik di Site)',
  646,
  NOW() + (646 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Extrana nym 2 x 1,5 100m', 'LAIN-LAIN', 'ROLL', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-02-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN  (Instalasi Listrik di Site)',
  647,
  NOW() + (647 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Meval Kabel Ties 30cm', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  2,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-02-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN  (Instalasi Listrik di Site)',
  648,
  NOW() + (648 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Isolasi Meval', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  2,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-02-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN  (Instalasi Listrik di Site)',
  649,
  NOW() + (649 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Saf - Instant Bread Yeast  ( 1 pack 500gr )', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  3,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-02-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  10900,
  NULL,
  'EXPERIMENT',
  650,
  NOW() + (650 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Cima Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  27,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-02-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  651,
  NOW() + (651 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Intenso Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  2,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-02-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  652,
  NOW() + (652 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pectic Enzyme Powder', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  0.57,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-02-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  653,
  NOW() + (653 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Yeast Nutrient LD Carlson', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  0.28,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-02-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  654,
  NOW() + (654 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Mesin Laminating', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  655,
  NOW() + (655 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pouch Sampling Gray BTM', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  2,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'KIRIM SAMPLE PT.  FAIR TRADE',
  656,
  NOW() + (656 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Box Sampling HEQA 28x18x10', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  1,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'KIRIM SAMPLE PT.  FAIR TRADE',
  657,
  NOW() + (657 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Saf - Instant Bread Yeast  ( 1 pack 500gr )', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  337,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-03-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT PROD.LOT',
  658,
  NOW() + (658 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pouch Sampling Gray BTM', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  12,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'KIRIM SAMPLE SURABAYA',
  659,
  NOW() + (659 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pouch Sampling Brown HEQA', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  20,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'KIRIM SAMPLE SURABAYA',
  660,
  NOW() + (660 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Tali Rafia', 'LAIN-LAIN', 'BALL', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-04-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  661,
  NOW() + (661 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('T-Shirt HEQA', 'LAIN-LAIN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  2,
  'PEMBELIAN',
  'PUTRI',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-06'::date,
  'ASET',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  662,
  NOW() + (662 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Cima Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  10,
  'PENYESUAIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN',
  663,
  NOW() + (663 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Oro Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  51,
  'PENYESUAIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN',
  664,
  NOW() + (664 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Intenso Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  42,
  'PENYESUAIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-01'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'PENYESUAIAN',
  665,
  NOW() + (665 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Lalcafe Cima Yeast', 'LAIN-LAIN', 'Gram', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  50,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-05-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'EXPERIMENT',
  666,
  NOW() + (666 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Coffe Screen Gradig (Ayakan Kopi No.4)', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-06-06'::date,
  'ASET',
  'Invoice Ayakan .pdf',
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  667,
  NOW() + (667 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Coffe Screen Gradig (Ayakan Kopi No.5)', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-06-06'::date,
  'ASET',
  'Invoice Ayakan .pdf',
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  668,
  NOW() + (668 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Coffe Screen Gradig (Ayakan Kopi No.6)', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-06-06'::date,
  'ASET',
  'Invoice Ayakan .pdf',
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  669,
  NOW() + (669 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Coffe Screen Gradig (Ayakan Kopi No.7)', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-06-06'::date,
  'ASET',
  'Invoice Ayakan .pdf',
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  670,
  NOW() + (670 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Coffe Screen Gradig (Ayakan Kopi No.8)', 'PERALATAN', 'PCS', 'ASET', 0, NOW(), NOW())
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
  'IN',
  1,
  'PEMBELIAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-06-06'::date,
  'ASET',
  'Invoice Ayakan .pdf',
  NULL,
  NULL,
  NULL,
  NULL,
  'PEMBELIAN',
  671,
  NOW() + (671 * interval '1 millisecond')
FROM upsert_item;

WITH upsert_item AS (
  INSERT INTO "OfficeInventoryItems" (name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt")
  VALUES ('Pouch Sampling Brown HEQA', 'LAIN-LAIN', 'PCS', 'BARANG BISA HABIS', 0, NOW(), NOW())
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
  'OUT',
  8,
  'PENGGUNAAN',
  'HARIS',
  'BALI',
  'PROCESSING FACILITY',
  '2026-06-06'::date,
  'BARANG BISA HABIS',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'RUSAK',
  672,
  NOW() + (672 * interval '1 millisecond')
FROM upsert_item;

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
