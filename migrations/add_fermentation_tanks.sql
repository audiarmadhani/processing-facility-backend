-- Multiple tank assignments per fermentation order sheet (run on platform Postgres)
CREATE TABLE IF NOT EXISTS "FermentationTanks" (
  id SERIAL PRIMARY KEY,
  "fermentationId" INTEGER NOT NULL REFERENCES "FermentationData"(id) ON DELETE CASCADE,
  tank TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE ("fermentationId", tank)
);

CREATE INDEX IF NOT EXISTS idx_fermentation_tanks_tank
  ON "FermentationTanks" (tank);

-- Backfill from legacy single tank column (comma-separated or single code)
INSERT INTO "FermentationTanks" ("fermentationId", tank)
SELECT f.id, TRIM(code) AS tank
FROM "FermentationData" f
CROSS JOIN LATERAL unnest(
  string_to_array(COALESCE(f.tank, ''), ',')
) AS code
WHERE TRIM(code) <> ''
ON CONFLICT ("fermentationId", tank) DO NOTHING;
