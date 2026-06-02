-- Purpose of fermentation experiment (run on platform Postgres)
ALTER TABLE "FermentationData"
  ADD COLUMN IF NOT EXISTS "purpose" TEXT NULL;
