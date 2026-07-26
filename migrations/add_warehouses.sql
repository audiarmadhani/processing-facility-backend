-- Shipping-from warehouses for DO / Surat Jalan / BAST PDFs
CREATE TABLE IF NOT EXISTS "Warehouses" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE "Orders"
  ADD COLUMN IF NOT EXISTS warehouse_id INTEGER REFERENCES "Warehouses"(id);

CREATE INDEX IF NOT EXISTS idx_orders_warehouse_id ON "Orders" (warehouse_id);

-- Seed common locations (Bali = current hardcoded PDF address)
INSERT INTO "Warehouses" (name, company_name, address, phone, is_default)
VALUES
  (
    'Bali',
    'PT. BERKAS TUAIAN MELIMPAH',
    'Bengkala, Kubutambahan, Buleleng, Bali',
    'Telp. 085175027797',
    TRUE
  ),
  (
    'Jakarta',
    'PT. BERKAS TUAIAN MELIMPAH',
    'Jakarta (update address in OMS Warehouses)',
    'Telp. 085175027797',
    FALSE
  ),
  (
    'Surabaya',
    'PT. BERKAS TUAIAN MELIMPAH',
    'Surabaya (update address in OMS Warehouses)',
    'Telp. 085175027797',
    FALSE
  )
ON CONFLICT (name) DO NOTHING;
