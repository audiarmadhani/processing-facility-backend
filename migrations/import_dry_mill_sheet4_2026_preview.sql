-- PREVIEW ONLY — run this before import_dry_mill_sheet4_2026.sql
-- entered_at will be set from DryingData.exited_at; rfid from DryingData or ReceivingData.
-- Huller weights are inserted only when no huller event exists yet.
--
-- IMPORTANT: Select ALL of this file and run it in one go (do not run statements separately).
-- Wrapped in BEGIN/ROLLBACK so the staging table survives until the preview queries finish.

BEGIN;

CREATE TEMP TABLE dry_mill_import_staging (
  batch_number TEXT PRIMARY KEY,
  input_weight NUMERIC,
  hulled_weight NUMERIC NOT NULL
);

INSERT INTO dry_mill_import_staging (batch_number, input_weight, hulled_weight)
VALUES
  ('2026-04-20-0001', 1.5::numeric, 1.0::numeric),
  ('2026-04-20-0008', 2.2::numeric, 1.0::numeric),
  ('2026-04-20-0016', 2.4::numeric, 1.0::numeric),
  ('2026-04-27-0015', 2.7::numeric, 1.0::numeric),
  ('2026-05-13-0025', 0.3::numeric, 105.0::numeric),
  ('2026-05-13-0003', 285.0::numeric, 225.0::numeric),
  ('2026-05-13-0002', 0.3::numeric, 235.0::numeric),
  ('2026-05-13-0001', 0.43::numeric, 255.0::numeric),
  ('2026-05-13-0004', 635.0::numeric, 385.0::numeric),
  ('2026-05-13-0008', 0.51::numeric, 405.0::numeric),
  ('2026-05-01-0020', 0.5::numeric, 422.0::numeric),
  ('2026-05-01-0016', 0.55::numeric, 423.0::numeric),
  ('2026-05-01-0017', 0.55::numeric, 424.0::numeric),
  ('2026-05-01-0008', 0.5::numeric, 435.0::numeric),
  ('2026-05-01-0011', 0.55::numeric, 452.0::numeric),
  ('2026-05-01-0005', 0.55::numeric, 463.0::numeric),
  ('2026-05-01-0014', 0.6::numeric, 471.0::numeric),
  ('2026-05-13-0007', 0.84::numeric, 495.0::numeric),
  ('2026-05-13-0012', 0.59::numeric, 495.0::numeric),
  ('2026-05-13-0010', 1.38::numeric, 765.0::numeric),
  ('2026-05-13-0023', 1.61::numeric, 895.0::numeric),
  ('2026-05-13-0021', 1.84::numeric, 1005.0::numeric),
  ('2026-05-13-0020', 2.0::numeric, 1065.0::numeric),
  ('2026-04-27-0014', 2.25::numeric, 1134.0::numeric),
  ('2026-05-18-0011', 1.37::numeric, 1145.0::numeric),
  ('2026-04-27-0009', 2.6::numeric, 1199.0::numeric),
  ('2026-04-27-0013', 2.25::numeric, 1211.0::numeric),
  ('2026-04-27-0003', 2.1::numeric, 1229.0::numeric),
  ('2026-05-18-0022', 1.53::numeric, 1255.0::numeric),
  ('2026-05-18-0016', 1.56::numeric, 1265.0::numeric),
  ('2026-04-27-0010', 2.55::numeric, 1303.0::numeric),
  ('2026-04-27-0007', 2.3::numeric, 1356.0::numeric),
  ('2026-04-27-0011', 2.4::numeric, 1366.0::numeric),
  ('2026-04-27-0012', 2.5::numeric, 1484.0::numeric),
  ('2026-05-13-0015', 3.42::numeric, 2825.0::numeric),
  ('2026-05-13-0014', 3.62::numeric, 2875.0::numeric),
  ('2026-05-30-0004', 0.17::numeric, 0.1::numeric),
  ('2026-04-23-0015', 0.55::numeric, 0.2::numeric),
  ('2026-05-01-0009', 0.55::numeric, 0.25::numeric),
  ('2026-05-13-0006', 365.0::numeric, 0.29::numeric),
  ('2026-06-02-0002', 0.43::numeric, 0.3::numeric),
  ('2026-05-13-0005', 0.38::numeric, 0.31::numeric),
  ('2026-06-02-0007', 0.4::numeric, 0.32::numeric),
  ('2026-05-01-0021', 0.7::numeric, 0.35::numeric),
  ('2026-06-03-0008', 0.44::numeric, 0.37::numeric),
  ('2026-05-01-0004', 0.55::numeric, 0.4::numeric),
  ('2026-05-01-0006', 0.7::numeric, 0.4::numeric),
  ('2026-05-01-0012', 0.75::numeric, 0.4::numeric),
  ('2026-05-01-0015', 0.75::numeric, 0.4::numeric),
  ('2026-05-01-0019', 0.6::numeric, 0.4::numeric),
  ('2026-05-13-0009', 515.0::numeric, 0.42::numeric),
  ('2026-05-01-0007', 0.5::numeric, 0.45::numeric),
  ('2026-05-01-0010', 0.6::numeric, 0.45::numeric),
  ('2026-05-01-0013', 0.6::numeric, 0.45::numeric),
  ('2026-05-01-0018', 0.7::numeric, 0.45::numeric),
  ('2026-05-01-0022', 1.25::numeric, 0.45::numeric),
  ('2026-05-13-0011', 625.0::numeric, 0.49::numeric),
  ('2026-05-04-0002', 0.6::numeric, 0.5::numeric),
  ('2026-04-20-0004', 0.75::numeric, 0.55::numeric),
  ('2026-05-26-0014', 0.72::numeric, 0.57::numeric),
  ('2026-04-20-0018', 0.95::numeric, 0.58::numeric),
  ('2026-05-18-0025', 1.54::numeric, 0.58::numeric),
  ('2026-05-26-0013', 0.72::numeric, 0.58::numeric),
  ('2026-04-17-0006', 0.7::numeric, 0.6::numeric),
  ('2026-04-19-0001', 1.05::numeric, 0.6::numeric),
  ('2026-04-20-0005', 1.05::numeric, 0.6::numeric),
  ('2026-04-23-0001', 0.75::numeric, 0.6::numeric),
  ('2026-04-23-0003', 0.8::numeric, 0.6::numeric),
  ('2026-04-23-0005', 0.75::numeric, 0.6::numeric),
  ('2026-04-23-0009', 0.75::numeric, 0.6::numeric),
  ('2026-05-04-0004', 0.7::numeric, 0.6::numeric),
  ('2026-05-04-0006', 0.7::numeric, 0.6::numeric),
  ('2026-05-26-0012', 0.75::numeric, 0.6::numeric),
  ('2026-05-26-0015', 0.77::numeric, 0.62::numeric),
  ('2026-05-26-0006', 0.79::numeric, 0.64::numeric),
  ('2026-04-23-0004', 0.85::numeric, 0.65::numeric),
  ('2026-04-23-0006', 0.8::numeric, 0.65::numeric),
  ('2026-04-23-0007', 0.8::numeric, 0.65::numeric),
  ('2026-04-23-0008', 0.8::numeric, 0.65::numeric),
  ('2026-04-23-0010', 0.85::numeric, 0.65::numeric),
  ('2026-04-23-0011', 0.75::numeric, 0.65::numeric),
  ('2026-04-23-0012', 0.85::numeric, 0.65::numeric),
  ('2026-05-13-0017', 1.13::numeric, 0.66::numeric),
  ('2026-05-26-0003', 0.83::numeric, 0.66::numeric),
  ('2026-05-31-0006', 1.07::numeric, 0.67::numeric),
  ('2026-05-26-0004', 0.82::numeric, 0.68::numeric),
  ('2026-05-26-0005', 0.83::numeric, 0.69::numeric),
  ('2026-04-17-0005', 1.2::numeric, 0.7::numeric),
  ('2026-04-23-0002', 0.85::numeric, 0.7::numeric),
  ('2026-06-01-0010', 1.02::numeric, 0.73::numeric),
  ('2026-05-04-0001', 0.9::numeric, 0.75::numeric),
  ('2026-05-04-0003', 0.9::numeric, 0.75::numeric),
  ('2026-05-04-0005', 0.95::numeric, 0.75::numeric),
  ('2026-06-01-0002', 1.03::numeric, 0.75::numeric),
  ('2026-05-23-0004', 1.44::numeric, 0.76::numeric),
  ('2026-06-01-0011', 0.92::numeric, 0.76::numeric),
  ('2026-06-01-0003', 0.97::numeric, 0.77::numeric),
  ('2026-05-31-0005', 1.0::numeric, 0.78::numeric),
  ('2026-05-23-0003', 1.56::numeric, 0.8::numeric),
  ('2026-06-01-0001', 1.02::numeric, 0.8::numeric),
  ('2026-05-23-0005', 1.39::numeric, 0.85::numeric),
  ('2026-05-13-0024', 1.08::numeric, 0.87::numeric),
  ('2026-05-28-0001', 2.0::numeric, 0.95::numeric),
  ('2026-05-13-0022', 1.1::numeric, 0.96::numeric),
  ('2026-06-06-0009', 1.21::numeric, 0.96::numeric),
  ('2026-05-13-0019', 1.81::numeric, 1.04::numeric),
  ('2026-04-20-0015', 2.35::numeric, 1.05::numeric),
  ('2026-05-18-0012', 1.79::numeric, 1.09::numeric),
  ('2026-04-17-0008', 1.9::numeric, 1.1::numeric),
  ('2026-04-17-0014', 2.3::numeric, 1.1::numeric),
  ('2026-04-17-0015', 1.51::numeric, 1.1::numeric),
  ('2026-04-20-0006', 1.5::numeric, 1.1::numeric),
  ('2026-04-20-0017', 1.35::numeric, 1.1::numeric),
  ('2026-05-13-0016', 2.0::numeric, 1.11::numeric),
  ('2026-04-17-0013', 1.5::numeric, 1.15::numeric),
  ('2026-04-27-0004', 2.1::numeric, 1.15::numeric),
  ('2026-05-18-0020', 1.38::numeric, 1.15::numeric),
  ('2026-05-18-0009', 1.44::numeric, 1.19::numeric),
  ('2026-05-18-0023', 1.43::numeric, 1.19::numeric),
  ('2026-04-20-0009', 1.9::numeric, 1.2::numeric),
  ('2026-04-20-0010', 2.2::numeric, 1.2::numeric),
  ('2026-04-20-0011', 2.25::numeric, 1.2::numeric),
  ('2026-05-18-0014', 1.45::numeric, 1.2::numeric),
  ('2026-05-26-0010', 2.19::numeric, 1.2::numeric),
  ('2026-05-26-0011', 2.1::numeric, 1.22::numeric),
  ('2026-05-18-0004', 2.0::numeric, 1.23::numeric),
  ('2026-05-18-0008', 1.51::numeric, 1.23::numeric),
  ('2026-04-17-0010', 2.25::numeric, 1.25::numeric),
  ('2026-04-17-0012', 2.25::numeric, 1.25::numeric),
  ('2026-04-20-0002', 1.8::numeric, 1.25::numeric),
  ('2026-04-20-0003', 2.15::numeric, 1.25::numeric),
  ('2026-04-20-0007', 1.8::numeric, 1.25::numeric),
  ('2026-04-20-0012', 2.3::numeric, 1.25::numeric),
  ('2026-04-27-0005', 2.2::numeric, 1.25::numeric),
  ('2026-05-18-0010', 1.54::numeric, 1.25::numeric),
  ('2026-05-18-0013', 1.53::numeric, 1.25::numeric),
  ('2026-05-18-0017', 1.51::numeric, 1.25::numeric),
  ('2026-05-18-0015', 1.92::numeric, 1.26::numeric),
  ('2026-05-18-0021', 1.93::numeric, 1.26::numeric),
  ('2026-05-18-0006', 1.53::numeric, 1.28::numeric),
  ('2026-05-18-0019', 1.58::numeric, 1.28::numeric),
  ('2026-05-18-0024', 1.91::numeric, 1.28::numeric),
  ('2026-04-17-0003', 2.2::numeric, 1.3::numeric),
  ('2026-04-17-0004', 1.65::numeric, 1.3::numeric),
  ('2026-04-17-0007', 2.2::numeric, 1.3::numeric),
  ('2026-04-17-0011', 2.35::numeric, 1.3::numeric),
  ('2026-04-27-0008', 2.35::numeric, 1.3::numeric),
  ('2026-05-18-0001', 2.09::numeric, 1.3::numeric),
  ('2026-05-18-0002', 2.17::numeric, 1.31::numeric),
  ('2026-05-18-0003', 1.58::numeric, 1.31::numeric),
  ('2026-05-18-0007', 1.96::numeric, 1.31::numeric),
  ('2026-05-18-0005', 1.58::numeric, 1.32::numeric),
  ('2026-05-18-0018', 1.99::numeric, 1.33::numeric),
  ('2026-05-26-0001', 2.32::numeric, 1.33::numeric),
  ('2026-05-25-0005', 1.63::numeric, 1.34::numeric),
  ('2026-04-17-0009', 2.2::numeric, 1.35::numeric),
  ('2026-04-27-0006', 2.25::numeric, 1.35::numeric),
  ('2026-05-13-0018', 2.16::numeric, 1.37::numeric),
  ('2026-05-25-0006', 2.22::numeric, 1.4::numeric),
  ('2026-05-26-0002', 2.23::numeric, 1.4::numeric),
  ('2026-05-25-0003', 2.3::numeric, 1.41::numeric),
  ('2026-05-25-0001', 2.27::numeric, 1.42::numeric),
  ('2026-05-25-0008', 2.15::numeric, 1.43::numeric),
  ('2026-04-17-0001', 2.1::numeric, 1.45::numeric),
  ('2026-05-25-0007', 2.22::numeric, 1.45::numeric),
  ('2026-04-17-0002', 2.5::numeric, 1.5::numeric),
  ('2026-05-28-0008', 1.9::numeric, 1.54::numeric),
  ('2026-05-25-0004', 2.38::numeric, 1.55::numeric),
  ('2026-05-25-0002', 2.42::numeric, 1.57::numeric),
  ('2026-05-28-0010', 2.83::numeric, 1.59::numeric),
  ('2026-05-28-0014', 2.0::numeric, 1.62::numeric),
  ('2026-05-28-0009', 2.81::numeric, 1.65::numeric),
  ('2026-06-03-0002', NULL::numeric, 1.65::numeric),
  ('2026-06-04-0003', 2.0::numeric, 1.65::numeric),
  ('2026-06-03-0005', NULL::numeric, 1.66::numeric),
  ('2026-05-28-0007', 2.97::numeric, 1.68::numeric),
  ('2026-05-28-0013', 2.06::numeric, 1.7::numeric),
  ('2026-05-28-0012', 3.09::numeric, 1.72::numeric),
  ('2026-05-20-0002', 2.13::numeric, 1.74::numeric),
  ('2026-05-28-0011', 2.76::numeric, 1.75::numeric),
  ('2026-05-21-0004', 121.65::numeric, 100.12::numeric),
  ('2026-05-25-0009', 129.85::numeric, 109.37::numeric),
  ('2026-05-20-0001', 142.58::numeric, 115.01::numeric),
  ('2026-05-25-0014', 16.82::numeric, 12.74::numeric),
  ('2026-05-21-0001', 146.17::numeric, 120.82::numeric),
  ('2026-05-21-0003', 155.99::numeric, 128.04::numeric),
  ('2026-05-25-0012', 164.0::numeric, 130.7::numeric),
  ('2026-05-25-0013', 168.81::numeric, 137.83::numeric),
  ('2026-05-30-0001', 174.04::numeric, 143.97::numeric),
  ('2026-05-23-0006', 216.0::numeric, 178.37::numeric),
  ('2026-05-23-0007', 228.17::numeric, 190.45::numeric),
  ('2026-05-30-0008', 238.0::numeric, 196.34::numeric),
  ('2026-05-31-0008', 165.67::numeric, 2.01::numeric),
  ('2026-05-26-0016', 142.5::numeric, 2.03::numeric),
  ('2026-05-28-0003', 93.45::numeric, 2.05::numeric),
  ('2026-05-01-0002', 2.95::numeric, 2.45::numeric),
  ('2026-05-01-0001', 3.2::numeric, 2.6::numeric),
  ('2026-05-01-0003', 4.1::numeric, 2.6::numeric),
  ('2026-05-26-0007', 266.8::numeric, 223.46::numeric),
  ('2026-05-13-0013', 5.24::numeric, 3.16::numeric),
  ('2026-05-28-0016', 6.87::numeric, 3.7::numeric),
  ('2026-04-20-0014', 7.25::numeric, 3.8::numeric),
  ('2026-04-20-0013', 5.1::numeric, 3.9::numeric),
  ('2026-05-27-0002', 7.68::numeric, 3.96::numeric),
  ('2026-05-27-0006', 396.04::numeric, 315.99::numeric),
  ('2026-05-27-0001', 7.44::numeric, 4.13::numeric),
  ('2026-05-25-0010', 5.6::numeric, 4.21::numeric),
  ('2026-04-23-0013', 5.45::numeric, 4.3::numeric),
  ('2026-04-27-0001', 5.3::numeric, 4.3::numeric),
  ('2026-04-23-0014', 7.4::numeric, 4.4::numeric),
  ('2026-04-27-0002', 7.4::numeric, 4.4::numeric),
  ('2026-05-27-0003', 8.14::numeric, 5.06::numeric),
  ('2026-05-26-0017', 8.95::numeric, 6.12::numeric),
  ('2026-05-23-0001', 15.26::numeric, 7.98::numeric),
  ('2026-05-28-0002', 98.18::numeric, 79.4::numeric),
  ('2026-05-28-0015', 14.6::numeric, 8.29::numeric);

SELECT
  s.batch_number,
  pp."processingType",
  pp."producer",
  r."farmerName",
  COALESCE(d.rfid, r.rfid) AS rfid,
  d.exited_at AS drying_exited_at,
  d.exited_at AS dry_mill_entered_at,
  s.input_weight,
  s.hulled_weight,
  dm.id AS existing_dry_mill_id,
  dm.entered_at AS existing_entered_at,
  huller."outputWeight" AS existing_huller_weight,
  CASE
    WHEN pp."batchNumber" IS NULL THEN 'MISSING PreprocessingData'
    WHEN d."batchNumber" IS NULL OR d.exited_at IS NULL THEN 'MISSING DryingData.exited_at'
    WHEN COALESCE(d.rfid, r.rfid) IS NULL THEN 'MISSING rfid'
    WHEN s.hulled_weight IS NULL OR s.hulled_weight <= 0 THEN 'INVALID hulled weight'
    WHEN huller.event_id IS NOT NULL THEN 'SKIP huller (already exists)'
    WHEN dm.entered_at IS NOT NULL AND dm.exited_at IS NULL THEN 'ALREADY In Dry Mill'
    ELSE 'OK'
  END AS import_status
FROM dry_mill_import_staging s
LEFT JOIN "ReceivingData" r ON r."batchNumber" = s.batch_number
LEFT JOIN LATERAL (
  SELECT pp2."batchNumber", pp2."processingType", pp2."producer"
  FROM "PreprocessingData" pp2
  WHERE pp2."batchNumber" = s.batch_number
  ORDER BY pp2."createdAt" DESC NULLS LAST, pp2.id DESC
  LIMIT 1
) pp ON true
LEFT JOIN LATERAL (
  SELECT d2."batchNumber", d2.exited_at, d2.rfid
  FROM "DryingData" d2
  WHERE d2."batchNumber" = s.batch_number
  ORDER BY d2.exited_at DESC NULLS LAST, d2.id DESC
  LIMIT 1
) d ON true
LEFT JOIN "DryMillData" dm
  ON dm."batchNumber" = s.batch_number
 AND dm."processingType" = pp."processingType"
LEFT JOIN "DryMillProcessEvents" huller
  ON huller."batchNumber" = s.batch_number
 AND huller."processingType" = pp."processingType"
 AND huller."processStep" = 'huller'
ORDER BY import_status DESC, s.batch_number;

SELECT import_status, COUNT(*) AS batch_count
FROM (
  SELECT
    CASE
      WHEN pp."batchNumber" IS NULL THEN 'MISSING PreprocessingData'
      WHEN d."batchNumber" IS NULL OR d.exited_at IS NULL THEN 'MISSING DryingData.exited_at'
      WHEN COALESCE(d.rfid, r.rfid) IS NULL THEN 'MISSING rfid'
      WHEN s.hulled_weight IS NULL OR s.hulled_weight <= 0 THEN 'INVALID hulled weight'
      ELSE 'IMPORTABLE'
    END AS import_status
  FROM dry_mill_import_staging s
  LEFT JOIN "ReceivingData" r ON r."batchNumber" = s.batch_number
  LEFT JOIN LATERAL (
    SELECT pp2."batchNumber"
    FROM "PreprocessingData" pp2
    WHERE pp2."batchNumber" = s.batch_number
    LIMIT 1
  ) pp ON true
  LEFT JOIN LATERAL (
    SELECT d2."batchNumber", d2.exited_at, d2.rfid
    FROM "DryingData" d2
    WHERE d2."batchNumber" = s.batch_number
    ORDER BY d2.exited_at DESC NULLS LAST, d2.id DESC
    LIMIT 1
  ) d ON true
) x
GROUP BY import_status
ORDER BY import_status;

ROLLBACK;
