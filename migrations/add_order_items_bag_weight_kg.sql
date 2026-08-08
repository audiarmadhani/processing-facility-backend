-- Per-item bag weight for OMS order lines (bag count derived as ceil(qty / bag_weight_kg))
ALTER TABLE "OrderItems"
  ADD COLUMN IF NOT EXISTS bag_weight_kg NUMERIC(10, 2);

COMMENT ON COLUMN "OrderItems".bag_weight_kg IS 'Weight per bag (kg) for this line item; jumlah_karung is derived from quantity / bag_weight_kg';
