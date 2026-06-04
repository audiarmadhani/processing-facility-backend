-- Roast log for GB QC pipeline (sample roast before QC)
CREATE TABLE IF NOT EXISTS "GbQcRoastLog" (
  id SERIAL PRIMARY KEY,
  "batchNumber" TEXT NOT NULL,
  "processingType" TEXT NOT NULL,
  "roastedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "roastedBy" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE ("batchNumber", "processingType")
);

CREATE INDEX IF NOT EXISTS idx_gb_qc_roast_log_batch ON "GbQcRoastLog" ("batchNumber");
