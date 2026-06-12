-- Ledger for drying area assignments and inter-area moves per batch
CREATE TABLE IF NOT EXISTS "DryingAreaMovements" (
  id SERIAL PRIMARY KEY,
  "batchNumber" TEXT NOT NULL,
  "fromArea" TEXT,
  "toArea" TEXT NOT NULL,
  "movedAt" TIMESTAMPTZ NOT NULL,
  "createdBy" TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drying_area_movements_batch_moved
  ON "DryingAreaMovements" ("batchNumber", "movedAt" DESC);
