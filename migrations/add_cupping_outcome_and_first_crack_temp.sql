-- Cupping: replace okForFurtherProcess boolean with cuppingOutcome (4 values)
-- Roast: optional first crack temperature (°C)

ALTER TABLE "GbQcCuppingLog"
  ADD COLUMN IF NOT EXISTS "cuppingOutcome" TEXT;

UPDATE "GbQcCuppingLog"
SET "cuppingOutcome" = CASE
  WHEN "okForFurtherProcess" = TRUE THEN 'Good'
  ELSE 'Not Good'
END
WHERE "cuppingOutcome" IS NULL
  AND "okForFurtherProcess" IS NOT NULL;

UPDATE "GbQcCuppingLog"
SET "cuppingOutcome" = 'Not Good'
WHERE "cuppingOutcome" IS NULL;

ALTER TABLE "GbQcCuppingLog"
  DROP CONSTRAINT IF EXISTS "GbQcCuppingLog_cuppingOutcome_check";

ALTER TABLE "GbQcCuppingLog"
  ADD CONSTRAINT "GbQcCuppingLog_cuppingOutcome_check"
  CHECK ("cuppingOutcome" IN ('Production', 'Good', 'Redo', 'Not Good'));

ALTER TABLE "GbQcCuppingLog"
  ALTER COLUMN "cuppingOutcome" SET NOT NULL;

ALTER TABLE "GbQcCuppingLog"
  DROP COLUMN IF EXISTS "okForFurtherProcess";

ALTER TABLE "GbQcRoastLog"
  ADD COLUMN IF NOT EXISTS "firstCrackTemp" NUMERIC;
