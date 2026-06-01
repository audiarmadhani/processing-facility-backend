-- Optional link from receiving batch to driver pickup (run on platform Postgres)
ALTER TABLE "ReceivingData"
  ADD COLUMN IF NOT EXISTS "driverPickupHandoffCode" VARCHAR(6) NULL;

CREATE INDEX IF NOT EXISTS idx_receiving_driver_handoff
  ON "ReceivingData" ("driverPickupHandoffCode")
  WHERE "driverPickupHandoffCode" IS NOT NULL;
