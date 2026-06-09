-- Allow up to two moisture readings per batch per calendar day (was 1 via unique index)
DROP INDEX IF EXISTS idx_drying_measurements_batch_date;
