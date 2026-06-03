const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

function parseElevation(value) {
  if (value === undefined || value === null || value === '') return null;
  const num = parseFloat(value);
  return Number.isFinite(num) ? num : null;
}

function validateFarmerPayload(body) {
  const {
    farmerName,
    farmerAddress,
    farmerContact,
    farmerLandArea,
    farmType,
    contractType,
    paymentMethod,
    bankAccount,
    bankName,
    elevationMin,
    elevationMax,
  } = body;

  if (!farmerName || !farmerAddress || !farmerContact || !farmerLandArea ||
      !farmType || !contractType) {
    return 'Missing required fields';
  }

  const elevMin = parseElevation(elevationMin);
  const elevMax = parseElevation(elevationMax);
  if (elevMin === null || elevMax === null) {
    return 'Elevation min and max are required';
  }
  if (elevMin < 0 || elevMax < 0) {
    return 'Elevation must be non-negative';
  }
  if (elevMin > elevMax) {
    return 'Elevation min must be less than or equal to max';
  }

  if (['Bank Transfer to Farmer', 'Bank Transfer to Broker'].includes(paymentMethod) &&
      (!bankAccount || !bankName)) {
    return 'Bank account and bank name are required for bank transfer methods';
  }

  return null;
}

function buildFarmerReplacements(body) {
  const {
    farmerName, desa, kecamatan, kabupaten, farmerAddress,
    bankAccount, bankName, bankAccountName, farmerLandArea, farmerContact,
    latitude, longitude, farmType, notes, farmVarieties,
    contractType, broker, paymentMethod, elevationMin, elevationMax,
  } = body;

  return {
    farmerName: farmerName.trim(),
    desa: desa || null,
    kecamatan: kecamatan || null,
    kabupaten: kabupaten || null,
    farmerAddress: farmerAddress.trim(),
    bankAccount: bankAccount ? bankAccount.trim() : null,
    bankName: bankName ? bankName.trim() : null,
    bankAccountName: bankAccountName ? bankAccountName.trim() : null,
    farmerLandArea: farmerLandArea.trim(),
    farmerContact: farmerContact.trim(),
    latitude: latitude !== undefined && latitude !== null && String(latitude).trim() !== ''
      ? parseFloat(latitude) : null,
    longitude: longitude !== undefined && longitude !== null && String(longitude).trim() !== ''
      ? parseFloat(longitude) : null,
    farmType,
    notes: notes || null,
    farmVarieties: farmVarieties ? String(farmVarieties).trim() : null,
    contractType,
    broker: broker || null,
    paymentMethod: paymentMethod || null,
    elevationMin: parseElevation(elevationMin),
    elevationMax: parseElevation(elevationMax),
  };
}

const SUMMARY_ROWS_QUERY = `
  SELECT
    f."farmerID",
    f."farmerName",
    f.desa,
    f.kecamatan,
    f.broker,
    f."farmType" AS type,
    f."farmVarieties" AS varieties,
    CASE
      WHEN f."elevationMin" IS NULL OR f."elevationMax" IS NULL THEN NULL
      WHEN f."elevationMin" = f."elevationMax" THEN f."elevationMin"::text || ' m'
      ELSE f."elevationMin"::text || '–' || f."elevationMax"::text || ' m'
    END AS elevation,
    brix_agg."brixAverageThisYear",
    recv_agg."lastReceivedYear",
    price_agg."averageCherryPriceThisYear"
  FROM "Farmers" f
  LEFT JOIN (
    SELECT rd."farmerID", AVG(rd.brix) AS "brixAverageThisYear"
    FROM "ReceivingData" rd
    WHERE rd.merged = FALSE
      AND rd."commodityType" = 'Cherry'
      AND rd."batchNumber" LIKE TO_CHAR(CURRENT_DATE, 'YYYY') || '%'
      AND rd.brix IS NOT NULL
    GROUP BY rd."farmerID"
  ) brix_agg ON f."farmerID" = brix_agg."farmerID"
  LEFT JOIN (
    SELECT rd."farmerID",
      MAX(SUBSTRING(rd."batchNumber", 1, 4)::int) AS "lastReceivedYear"
    FROM "ReceivingData" rd
    WHERE rd.merged = FALSE
      AND rd."commodityType" = 'Cherry'
    GROUP BY rd."farmerID"
  ) recv_agg ON f."farmerID" = recv_agg."farmerID"
  LEFT JOIN (
    SELECT rd."farmerID",
      SUM(bp.price * rd.weight) / NULLIF(SUM(rd.weight), 0) AS "averageCherryPriceThisYear"
    FROM "ReceivingData" rd
    INNER JOIN (
      SELECT "batchNumber", MAX(price) AS price
      FROM "QCData"
      GROUP BY "batchNumber"
    ) bp ON rd."batchNumber" = bp."batchNumber"
    WHERE rd.merged = FALSE
      AND rd."commodityType" = 'Cherry'
      AND rd."batchNumber" LIKE TO_CHAR(CURRENT_DATE, 'YYYY') || '%'
      AND bp.price IS NOT NULL
      AND rd.weight > 0
    GROUP BY rd."farmerID"
  ) price_agg ON f."farmerID" = price_agg."farmerID"
  ORDER BY f."farmerName" ASC
`;

// Route for creating farmer data
router.post('/farmer', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const validationError = validateFarmerPayload(req.body);
    if (validationError) {
      await t.rollback();
      return res.status(400).json({ error: validationError });
    }

    const r = buildFarmerReplacements(req.body);

    await sequelize.query(
      `INSERT INTO "Farmers" (
        "farmerName", desa, kecamatan, kabupaten, "farmerAddress",
        "bankAccount", "bankName", "bankAccountName", "farmerLandArea", "farmerContact",
        latitude, longitude, "farmType", notes, "farmVarieties",
        "contractType", broker, "paymentMethod", "elevationMin", "elevationMax"
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          r.farmerName, r.desa, r.kecamatan, r.kabupaten, r.farmerAddress,
          r.bankAccount, r.bankName, r.bankAccountName, r.farmerLandArea, r.farmerContact,
          r.latitude, r.longitude, r.farmType, r.notes, r.farmVarieties,
          r.contractType, r.broker, r.paymentMethod, r.elevationMin, r.elevationMax,
        ],
        transaction: t,
      }
    );

    await t.commit();

    res.status(201).json({
      message: `Farmer ${r.farmerName} created successfully`,
    });
  } catch (err) {
    await t.rollback();
    console.error('Error creating farmer data:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Route for updating farmer data
router.put('/farmer/:farmerID', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { farmerID } = req.params;
    if (!/^\d+$/.test(String(farmerID))) {
      await t.rollback();
      return res.status(400).json({ error: 'Invalid farmer ID' });
    }

    const validationError = validateFarmerPayload(req.body);
    if (validationError) {
      await t.rollback();
      return res.status(400).json({ error: validationError });
    }

    const r = buildFarmerReplacements(req.body);

    const [existing] = await sequelize.query(
      'SELECT "farmerID" FROM "Farmers" WHERE "farmerID" = ?',
      { replacements: [farmerID], transaction: t }
    );

    if (!existing.length) {
      await t.rollback();
      return res.status(404).json({ error: 'Farmer not found' });
    }

    await sequelize.query(
      `UPDATE "Farmers" SET
        "farmerName" = ?,
        desa = ?,
        kecamatan = ?,
        kabupaten = ?,
        "farmerAddress" = ?,
        "bankAccount" = ?,
        "bankName" = ?,
        "bankAccountName" = ?,
        "farmerLandArea" = ?,
        "farmerContact" = ?,
        latitude = ?,
        longitude = ?,
        "farmType" = ?,
        notes = ?,
        "farmVarieties" = ?,
        "contractType" = ?,
        broker = ?,
        "paymentMethod" = ?,
        "elevationMin" = ?,
        "elevationMax" = ?
      WHERE "farmerID" = ?`,
      {
        replacements: [
          r.farmerName, r.desa, r.kecamatan, r.kabupaten, r.farmerAddress,
          r.bankAccount, r.bankName, r.bankAccountName, r.farmerLandArea, r.farmerContact,
          r.latitude, r.longitude, r.farmType, r.notes, r.farmVarieties,
          r.contractType, r.broker, r.paymentMethod, r.elevationMin, r.elevationMax,
          farmerID,
        ],
        transaction: t,
      }
    );

    await t.commit();

    res.json({ message: `Farmer ${r.farmerName} updated successfully` });
  } catch (err) {
    await t.rollback();
    console.error('Error updating farmer data:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Route for fetching all farmer data
router.get('/farmer', async (req, res) => {
  try {
    const [allRows] = await sequelize.query('SELECT * FROM "Farmers" ORDER BY "registrationDate" ASC');
    const [farmershipperRows] = await sequelize.query(`
      SELECT "farmerID", "farmerName", "farmerAddress", "bankAccount", "bankAccountName", "bankName" FROM "Farmers"
      UNION all
      SELECT "shipperID", "shipperName", "shipperAddress", "bankAccount", "bankAccountName", "bankName" FROM "Shippers"`);
    const [latestRows] = await sequelize.query('SELECT * FROM "Farmers" ORDER BY "registrationDate" DESC, "farmerID" DESC LIMIT 1');
    const [arabicaFarmers] = await sequelize.query(`SELECT * FROM "Farmers" WHERE "farmType" = 'Arabica' ORDER BY "registrationDate" ASC`);
    const [robustaFarmers] = await sequelize.query(`SELECT * FROM "Farmers" WHERE "farmType" = 'Robusta' ORDER BY "registrationDate" ASC`);
    const [summaryRows] = await sequelize.query(SUMMARY_ROWS_QUERY);

    res.json({ latestRows, allRows, arabicaFarmers, robustaFarmers, farmershipperRows, summaryRows });
  } catch (err) {
    console.error('Error fetching farmer data:', err);
    res.status(500).json({ message: 'Failed to fetch farmer data.' });
  }
});

// Route to get farmer data by farmer name
router.get('/farmer/:farmerName', async (req, res) => {
  const { farmerName } = req.params;

  console.log('Received request for Farmer Name:', farmerName);

  try {
    const [rows] = await sequelize.query(
      'SELECT * FROM "Farmers" WHERE LOWER("farmerName") = LOWER(?)',
      { replacements: [farmerName.trim()] }
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No farmer data found for this batch number.' });
    }

    res.json(rows);
  } catch (err) {
    console.error('Error fetching farmer data by farmer name:', err);
    res.status(500).json({ message: 'Failed to fetch farmer data by farmer name.' });
  }
});

module.exports = router;
