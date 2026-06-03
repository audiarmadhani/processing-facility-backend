-- Allow Draft and Awaiting Batch status values (run on platform Postgres)
ALTER TABLE "FermentationData"
  DROP CONSTRAINT IF EXISTS "FermentationData_status_check";

ALTER TABLE "FermentationData"
  ADD CONSTRAINT "FermentationData_status_check"
  CHECK (status IN ('Draft', 'Awaiting Batch', 'In Progress', 'Finished'));
