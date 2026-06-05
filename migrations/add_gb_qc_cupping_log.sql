-- Cupping entries for GB QC (multiple per batch)
CREATE TABLE IF NOT EXISTS "GbQcCuppingLog" (
  id SERIAL PRIMARY KEY,
  "batchNumber" TEXT NOT NULL,
  "cuppedAt" DATE NOT NULL,
  "notes" TEXT NOT NULL,
  "okForFurtherProcess" BOOLEAN NOT NULL,
  "cuppedBy" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gb_qc_cupping_batch ON "GbQcCuppingLog" ("batchNumber");
