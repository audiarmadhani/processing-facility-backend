-- Allow multiple roast entries per batch + add roast detail fields
ALTER TABLE "GbQcRoastLog"
  DROP CONSTRAINT IF EXISTS "GbQcRoastLog_batchNumber_processingType_key";

ALTER TABLE "GbQcRoastLog"
  ADD COLUMN IF NOT EXISTS "roastProfile" TEXT,
  ADD COLUMN IF NOT EXISTS "endTemp" NUMERIC,
  ADD COLUMN IF NOT EXISTS "firstCrackMinutes" NUMERIC;

CREATE INDEX IF NOT EXISTS idx_gb_qc_roast_log_batch_type
  ON "GbQcRoastLog" ("batchNumber", "processingType");
