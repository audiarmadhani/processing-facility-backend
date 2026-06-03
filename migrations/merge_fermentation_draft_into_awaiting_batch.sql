-- Merge Draft status into Awaiting Batch (run on platform Postgres)
UPDATE "FermentationData"
SET status = 'Awaiting Batch'
WHERE status = 'Draft';

ALTER TABLE "FermentationData"
  DROP CONSTRAINT IF EXISTS "FermentationData_status_check";

ALTER TABLE "FermentationData"
  ADD CONSTRAINT "FermentationData_status_check"
  CHECK (status IN ('Awaiting Batch', 'In Progress', 'Finished'));
