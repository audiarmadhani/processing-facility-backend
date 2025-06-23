const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');
const rateLimit = require('express-rate-limit');

// Rate limiter: 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: 'Too many requests, please try again later.' },
  statusCode: 429,
});

// Apply rate limiter to all API endpoints
router.use(apiLimiter);

/**
 * GET /wetmill-data
 * Fetches all wet mill scan data (RFID scans) with lotNumber and referenceNumber from PreprocessingData.
 */
router.get('/wetmill-data', async (req, res) => {
  try {
    const data = await sequelize.query(`
      SELECT 
        w.rfid, 
        w."batchNumber", 
        w.entered_at, 
        w.exited_at, 
        w.created_at,
        COALESCE(
          (SELECT array_agg(DISTINCT p."lotNumber") 
           FROM "PreprocessingData" p 
           WHERE p."batchNumber" = w."batchNumber"),
          '{}'
        ) AS "lotNumbers",
        COALESCE(
          (SELECT array_agg(DISTINCT p."referenceNumber") 
           FROM "PreprocessingData" p 
           WHERE p."batchNumber" = w."batchNumber" AND p."referenceNumber" IS NOT NULL),
          '{}'
        ) AS "referenceNumbers"
      FROM "WetMillData" w
      ORDER BY w.created_at DESC;
    `, {
      type: sequelize.QueryTypes.SELECT,
    });
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching wet mill data:', error);
    res.status(500).json({ error: 'Failed to fetch wet mill data', details: error.message });
  }
});

/**
 * POST /wetmill-weight-measurement
 * Adds a new weight measurement for a batch.
 * Requires: batchNumber, processingType, bagNumber, weight (>0), measurement_date.
 */
router.post('/wetmill-weight-measurement', async (req, res) => {
  const { batchNumber, processingType, bagNumber, weight, measurement_date } = req.body;

  // Validate inputs
  if (!batchNumber || !processingType || bagNumber === undefined || weight === undefined || !measurement_date) {
    return res.status(400).json({ error: 'batchNumber, processingType, bagNumber, weight, and measurement_date are required' });
  }
  if (typeof weight !== 'number' || weight <= 0) {
    return res.status(400).json({ error: 'Weight must be a positive number' });
  }
  if (typeof bagNumber !== 'number' || bagNumber <= 0 || !Number.isInteger(bagNumber)) {
    return res.status(400).json({ error: 'Bag number must be a positive integer' });
  }
  const parsedDate = new Date(measurement_date);
  if (isNaN(parsedDate) || parsedDate > new Date()) {
    return res.status(400).json({ error: 'Invalid or future measurement_date' });
  }

  try {
    const [result] = await sequelize.query(`
      INSERT INTO "WetMillWeightMeasurements" ("batchNumber", "processingType", "bagNumber", weight, measurement_date, created_at)
      VALUES (:batchNumber, :processingType, :bagNumber, :weight, :measurement_date, NOW())
      RETURNING id, "batchNumber", "processingType", "bagNumber", weight, measurement_date, created_at
    `, {
      replacements: { batchNumber, processingType, bagNumber, weight, measurement_date },
      type: sequelize.QueryTypes.INSERT,
    });

    res.status(201).json({ message: 'Weight measurement added', measurement: result });
  } catch (error) {
    console.error('Error adding weight measurement:', error);
    res.status(500).json({ error: 'Failed to add weight measurement', details: error.message });
  }
});

/**
 * PUT /wetmill-weight-measurement/:id
 * Updates a weight measurement's weight and measurement_date.
 * Requires: weight (>0), measurement_date.
 */
router.put('/wetmill-weight-measurement/:id', async (req, res) => {
  const { id } = req.params;
  const { weight, measurement_date } = req.body;

  // Validate inputs
  if (weight === undefined || !measurement_date) {
    return res.status(400).json({ error: 'weight and measurement_date are required' });
  }
  if (typeof weight !== 'number' || weight <= 0) {
    return res.status(400).json({ error: 'Weight must be a positive number' });
  }
  const parsedDate = new Date(measurement_date);
  if (isNaN(parsedDate) || parsedDate > new Date()) {
    return res.status(400).json({ error: 'Invalid or future measurement_date' });
  }

  try {
    const [result] = await sequelize.query(`
      UPDATE "WetMillWeightMeasurements"
      SET weight = :weight, measurement_date = :measurement_date
      WHERE id = :id
      RETURNING id, "batchNumber", "processingType", "bagNumber", weight, measurement_date, created_at
    `, {
      replacements: { id, weight, measurement_date },
      type: sequelize.QueryTypes.UPDATE,
    });

    if (!result) {
      return res.status(404).json({ error: `Weight measurement with id ${id} not found` });
    }

    res.status(200).json({ message: 'Weight measurement updated', measurement: result });
  } catch (error) {
    console.error('Error updating weight measurement:', error);
    res.status(500).json({ error: 'Failed to update weight measurement', details: error.message });
  }
});

/**
 * POST /wetmill-weight-measurements/delete
 * Deletes multiple weight measurements by their IDs in a single transaction.
 * Requires: ids (array of measurement IDs).
 */
router.post('/wetmill-weight-measurements/delete', async (req, res) => {
  const { ids } = req.body;

  // Validate inputs
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'ids must be a non-empty array' });
  }

  const t = await sequelize.transaction();
  try {
    const deletedCount = await sequelize.query(`
      DELETE FROM "WetMillWeightMeasurements"
      WHERE id IN (:ids)
      RETURNING id
    `, {
      replacements: { ids },
      type: sequelize.QueryTypes.DELETE,
      transaction: t,
    });

    if (deletedCount.length === 0) {
      await t.rollback();
      return res.status(404).json({ error: 'No weight measurements found for the provided IDs' });
    }

    await t.commit();
    res.status(200).json({ 
      message: `${deletedCount.length} weight measurement${deletedCount.length > 1 ? 's' : ''} deleted`,
      deletedIds: deletedCount.map(row => row.id)
    });
  } catch (error) {
    await t.rollback();
    console.error('Error deleting weight measurements:', error);
    res.status(500).json({ error: 'Failed to delete weight measurements', details: error.message });
  }
});

/**
 * GET /wetmill-weight-measurements/:batchNumber
 * Fetches all weight measurements for a specific batch with lotNumber and referenceNumber.
 */
router.get('/wetmill-weight-measurements/:batchNumber', async (req, res) => {
  const { batchNumber } = req.params;

  try {
    const data = await sequelize.query(`
      SELECT 
        w.id, 
        w."batchNumber", 
        w."processingType", 
        w."bagNumber", 
        w.weight, 
        w.measurement_date, 
        w.created_at,
        COALESCE(
          (SELECT array_agg(DISTINCT p."lotNumber") 
           FROM "PreprocessingData" p 
           WHERE p."batchNumber" = w."batchNumber"),
          '{}'
        ) AS "lotNumbers",
        COALESCE(
          (SELECT array_agg(DISTINCT p."referenceNumber") 
           FROM "PreprocessingData" p 
           WHERE p."batchNumber" = w."batchNumber" AND p."referenceNumber" IS NOT NULL),
          '{}'
        ) AS "referenceNumbers"
      FROM "WetMillWeightMeasurements" w
      WHERE w."batchNumber" = :batchNumber
      ORDER BY w.measurement_date DESC, w.created_at DESC
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.SELECT,
    });

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching weight measurements:', error);
    res.status(500).json({ error: 'Failed to fetch weight measurements', details: error.message });
  }
});

/**
 * GET /wetmill-weight-measurements/aggregated
 * Fetches aggregated weight measurements for specified batch numbers.
 * Query param: batchNumbers (comma-separated list).
 */
router.get('/wetmill-weight-measurements/aggregated', async (req, res) => {
  const { batchNumbers } = req.query;

  if (!batchNumbers) {
    return res.status(400).json({ error: 'batchNumbers query parameter is required' });
  }

  const batchNumberArray = batchNumbers.split(',').map(num => num.trim()).filter(num => num);

  if (batchNumberArray.length === 0) {
    return res.status(400).json({ error: 'batchNumbers must contain at least one valid batch number' });
  }

  try {
    const data = await sequelize.query(`
      SELECT 
        "batchNumber",
        SUM(weight) as total_weight,
        MAX(measurement_date) as measurement_date
      FROM "WetMillWeightMeasurements"
      WHERE "batchNumber" IN (:batchNumbers)
      GROUP BY "batchNumber"
    `, {
      replacements: { batchNumbers: batchNumberArray },
      type: sequelize.QueryTypes.SELECT,
    });

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching aggregated weight measurements:', error);
    res.status(500).json({ error: 'Failed to fetch aggregated weight measurements', details: error.message });
  }
});

/**
 * GET /wetmill-weight-measurements/:batchNumber/:processingType/max-bag-number
 * Fetches the maximum bag number for a batch and processing type.
 */
router.get('/wetmill-weight-measurements/:batchNumber/:processingType/max-bag-number', async (req, res) => {
  const { batchNumber, processingType } = req.params;

  try {
    const [result] = await sequelize.query(`
      SELECT COALESCE(MAX("bagNumber"), 0) as "maxBagNumber"
      FROM "WetMillWeightMeasurements"
      WHERE "batchNumber" = :batchNumber AND "processingType" = :processingType
    `, {
      replacements: { batchNumber, processingType },
      type: sequelize.QueryTypes.SELECT,
    });

    res.status(200).json({ maxBagNumber: result.maxBagNumber });
  } catch (error) {
    console.error('Error fetching max bag number:', error);
    res.status(500).json({ error: 'Failed to fetch max bag number', details: error.message });
  }
});

module.exports = router;