-- Per-order bag weight used for SPK/SPM/DO/SJ/BAST bag counts
ALTER TABLE "Orders"
  ADD COLUMN IF NOT EXISTS bag_weight_kg NUMERIC(10, 2);

COMMENT ON COLUMN "Orders".bag_weight_kg IS 'Bag weight (kg) used when generating OMS shipment documents';
