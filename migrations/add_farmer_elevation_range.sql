-- Elevation range (meters ASL) on farmer registration (run on platform Postgres)
ALTER TABLE "Farmers"
  ADD COLUMN IF NOT EXISTS "elevationMin" REAL NULL,
  ADD COLUMN IF NOT EXISTS "elevationMax" REAL NULL;
