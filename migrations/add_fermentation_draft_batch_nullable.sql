-- Batch-less fermentation drafts (run on platform Postgres)
ALTER TABLE "FermentationData"
  ALTER COLUMN "batchNumber" DROP NOT NULL;

ALTER TABLE "FermentationData"
  DROP CONSTRAINT IF EXISTS "FermentationData_batchNumber_referenceNumber_experimentNumber_key";

CREATE UNIQUE INDEX IF NOT EXISTS idx_fermentation_experiment_number
  ON "FermentationData" ("experimentNumber");

CREATE UNIQUE INDEX IF NOT EXISTS idx_fermentation_ref_version_experiment
  ON "FermentationData" ("referenceNumber", "version", "experimentNumber");
