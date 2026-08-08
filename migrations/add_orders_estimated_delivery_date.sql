-- Estimated delivery date entered when generating the Delivery Order (DO)
ALTER TABLE "Orders"
  ADD COLUMN IF NOT EXISTS estimated_delivery_date DATE;

COMMENT ON COLUMN "Orders".estimated_delivery_date IS 'Estimated delivery date from DO generation dialog';
