-- Office inventory: item master + movement ledger
CREATE TABLE IF NOT EXISTS "OfficeInventoryItems" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  "currentStock" NUMERIC(18, 4) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT office_inventory_items_unique_name UNIQUE (
    lower(trim(name)),
    lower(trim(category)),
    lower(trim(unit))
  )
);

CREATE TABLE IF NOT EXISTS "OfficeInventoryMovements" (
  id SERIAL PRIMARY KEY,
  "itemId" INTEGER NOT NULL REFERENCES "OfficeInventoryItems"(id) ON DELETE RESTRICT,
  "movementType" TEXT NOT NULL CHECK ("movementType" IN ('IN', 'OUT')),
  quantity NUMERIC(18, 4) NOT NULL CHECK (quantity > 0),
  remarks TEXT,
  pic TEXT,
  location TEXT,
  project TEXT,
  "transactionDate" DATE NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_office_inventory_movements_transaction_date
  ON "OfficeInventoryMovements" ("transactionDate");

CREATE INDEX IF NOT EXISTS idx_office_inventory_movements_item_date_created
  ON "OfficeInventoryMovements" ("itemId", "transactionDate", "createdAt");
