-- Warehouse storage position: row A–E, column 1–10
ALTER TABLE "DryingData"
  ADD COLUMN IF NOT EXISTS "warehouseRow" TEXT,
  ADD COLUMN IF NOT EXISTS "warehouseColumn" SMALLINT;

ALTER TABLE "DryMillProcessEvents"
  ADD COLUMN IF NOT EXISTS "warehouseRow" TEXT,
  ADD COLUMN IF NOT EXISTS "warehouseColumn" SMALLINT;
