-- Twice-daily fermentation check-ins (run on platform Postgres)
CREATE TABLE IF NOT EXISTS "FermentationCheckIns" (
  id SERIAL PRIMARY KEY,
  "fermentationId" INTEGER NOT NULL REFERENCES "FermentationData"(id) ON DELETE CASCADE,
  "batchNumber" VARCHAR(255),
  period VARCHAR(10) NOT NULL CHECK (period IN ('morning', 'evening')),
  "checkInDate" DATE NOT NULL,
  notes TEXT,
  "imageUrl" TEXT NOT NULL,
  "createdBy" VARCHAR(255),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("fermentationId", "checkInDate", period)
);

CREATE INDEX IF NOT EXISTS idx_fermentation_check_ins_date
  ON "FermentationCheckIns" ("checkInDate", period);
