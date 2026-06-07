const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

const PICKUPS_QUERY = `
  SELECT
    p.id,
    p.latitude,
    p.longitude,
    p.arrival_timestamp,
    p.departure_timestamp,
    p.estimated_weight,
    p.species,
    p.variety,
    p.road_condition,
    p.vehicle_used,
    p.handoff_code,
    p.created_at,
    f.farm_name,
    f.farmer_name,
    f.village,
    f.district,
    u.name AS driver_name,
    recv."batchNumber",
    recv."farmerName" AS registered_farmer_name,
    recv.weight AS received_weight
  FROM driver_pickups p
  INNER JOIN driver_farms f ON f.id = p.farm_id
  LEFT JOIN users u ON u.id = p.created_by
  LEFT JOIN LATERAL (
    SELECT rd."batchNumber", rd."farmerName", rd.weight
    FROM "ReceivingData" rd
    WHERE rd."driverPickupHandoffCode" = p.handoff_code
      AND rd.merged = FALSE
    ORDER BY rd."createdAt" DESC NULLS LAST
    LIMIT 1
  ) recv ON TRUE
  WHERE p.arrival_timestamp >= :yearStart
    AND p.arrival_timestamp < :yearEnd
  ORDER BY p.arrival_timestamp DESC
`;

function parseYear(value) {
  const year = parseInt(value, 10);
  if (!Number.isFinite(year) || year < 2000 || year > 2100) {
    return new Date().getFullYear();
  }
  return year;
}

router.get('/driver-pickups', async (req, res) => {
  try {
    const year = parseYear(req.query.year);
    const yearStart = `${year}-01-01T00:00:00.000Z`;
    const yearEnd = `${year + 1}-01-01T00:00:00.000Z`;

    const [rows] = await sequelize.query(PICKUPS_QUERY, {
      replacements: { yearStart, yearEnd },
    });

    res.json({ rows, year });
  } catch (err) {
    console.error('Error fetching driver pickups:', err);
    if (err.message && err.message.includes('driver_pickups')) {
      return res.status(503).json({
        error: 'Driver pickup tables not found. Run driver-app migrations on the database.',
        details: err.message,
      });
    }
    res.status(500).json({ error: 'Failed to fetch driver pickups.', details: err.message });
  }
});

const MAP_PICKUPS_QUERY = `
  SELECT
    p.id,
    p.latitude,
    p.longitude,
    p.handoff_code,
    p.species,
    p.estimated_weight,
    p.arrival_timestamp,
    p.departure_timestamp,
    p.created_at,
    f.farm_name,
    f.farmer_name,
    f.village,
    f.district,
    recv."batchNumber",
    recv."farmerName" AS receiving_farmer_name,
    recv."receivingDate",
    recv.type AS receiving_type
  FROM driver_pickups p
  INNER JOIN driver_farms f ON f.id = p.farm_id
  LEFT JOIN LATERAL (
    SELECT rd."batchNumber", rd."farmerName", rd."receivingDate", rd.type
    FROM "ReceivingData" rd
    WHERE rd."driverPickupHandoffCode" = p.handoff_code
      AND rd.merged = FALSE
    ORDER BY rd."createdAt" DESC NULLS LAST
    LIMIT 1
  ) recv ON TRUE
  WHERE p.latitude IS NOT NULL
    AND p.longitude IS NOT NULL
    AND p.latitude BETWEEN -90 AND 90
    AND p.longitude BETWEEN -180 AND 180
    AND (:species IS NULL OR p.species ILIKE :species)
  ORDER BY p.created_at DESC
  LIMIT :limit
`;

function parseLimit(value) {
  const limit = parseInt(value, 10);
  if (!Number.isFinite(limit) || limit < 1) return 500;
  return Math.min(limit, 2000);
}

function normalizeSpecies(value) {
  if (!value || typeof value !== 'string') return null;
  const normalized = value.trim();
  if (/^arabica$/i.test(normalized)) return 'Arabica';
  if (/^robusta$/i.test(normalized)) return 'Robusta';
  return null;
}

function mapPickupRow(row) {
  const handoffCode = row.handoff_code
    ? String(row.handoff_code).toUpperCase()
    : null;
  const linkedToReceiving = Boolean(row.batchNumber);

  return {
    id: row.id,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    species: row.species,
    handoffCode,
    batchNumber: row.batchNumber || null,
    receivingFarmerName: row.receiving_farmer_name || null,
    receivingDate: row.receivingDate || null,
    receivingType: row.receiving_type || null,
    driverFarmName: row.farm_name || null,
    driverFarmerName: row.farmer_name || null,
    village: row.village || null,
    district: row.district || null,
    estimatedWeight: row.estimated_weight != null ? Number(row.estimated_weight) : null,
    arrivalTimestamp: row.arrival_timestamp || null,
    departureTimestamp: row.departure_timestamp || null,
    createdAt: row.created_at || null,
    linkedToReceiving,
  };
}

router.get('/driver-pickups/map', async (req, res) => {
  try {
    const species = normalizeSpecies(req.query.species);
    const limit = parseLimit(req.query.limit);

    const [rows] = await sequelize.query(MAP_PICKUPS_QUERY, {
      replacements: { species, limit },
    });

    res.json({ points: rows.map(mapPickupRow) });
  } catch (err) {
    console.error('Error fetching driver pickup map points:', err);
    if (err.message && err.message.includes('driver_pickups')) {
      return res.status(503).json({
        error: 'Driver pickup tables not found. Run driver-app migrations on the database.',
        details: err.message,
      });
    }
    res.status(500).json({ error: 'Failed to fetch driver pickup map points.', details: err.message });
  }
});

module.exports = router;
