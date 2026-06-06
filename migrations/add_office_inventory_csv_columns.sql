-- Extra columns from Google Sheet "Inventory Log" CSV
ALTER TABLE "OfficeInventoryItems"
  ADD COLUMN IF NOT EXISTS "itemType" TEXT;

ALTER TABLE "OfficeInventoryMovements"
  ADD COLUMN IF NOT EXISTS "itemType" TEXT,
  ADD COLUMN IF NOT EXISTS "invoiceReference" TEXT,
  ADD COLUMN IF NOT EXISTS "requestDate" DATE,
  ADD COLUMN IF NOT EXISTS "paidDate" DATE,
  ADD COLUMN IF NOT EXISTS "unitPrice" NUMERIC(18, 4),
  ADD COLUMN IF NOT EXISTS "totalPrice" NUMERIC(18, 4),
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS "importSortOrder" INTEGER;

CREATE INDEX IF NOT EXISTS idx_office_inventory_movements_import_sort
  ON "OfficeInventoryMovements" ("importSortOrder");
