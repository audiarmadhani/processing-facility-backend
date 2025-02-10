const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

// Route for creating postprocessing data
// Route for creating postprocessing data
router.post('/postprocessing', async (req, res) => {
  let t;
  try {
    const { type, processingType, productLine, producer, weight, totalBags, notes, quality } = req.body;

    if (!type || !processingType || !weight || !totalBags || !quality || !productLine || !producer) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    t = await sequelize.transaction();

    // Fetch product line and processing type abbreviations
    const [productResults] = await sequelize.query(
      'SELECT abbreviation FROM "ProductLines" WHERE "productLine" = ?',
      { replacements: [productLine], transaction: t }
    );

    const [processingResults] = await sequelize.query(
      'SELECT abbreviation FROM "ProcessingTypes" WHERE "processingType" = ?',
      { replacements: [processingType], transaction: t }
    );

    // Check if product and processing type were found
    if (productResults.length === 0 || processingResults.length === 0) {
      return res.status(400).json({ error: 'Invalid product line or processing type' });
    }

    // Extract the abbreviations
    const productAbbreviation = productResults[0].abbreviation; // Access the first element
    const processingAbbreviation = processingResults[0].abbreviation; // Access the first element

    // Fetch the reference number
    const [referenceResults] = await sequelize.query(
      'SELECT "referenceNumber" FROM "ReferenceMappings_duplicate" WHERE "productLine" = ? AND "processingType" = ? AND "producer" = ? AND "quality" = ? AND "type" = ?',
      { replacements: [productLine, processingType, producer, quality, type], transaction: t }
    );

    if (referenceResults.length === 0) {
      return res.status(400).json({ error: 'No matching reference number found for the given product line and processing type' });
    }

    const referenceNumber = referenceResults[0].referenceNumber;

    // Determine the current year
    const currentYear = new Date().getFullYear().toString().slice(-2);

    // Generate the prefix for batch number
    const batchPrefix = `${producer}${currentYear}${productAbbreviation}-${processingAbbreviation}`;

    // Retrieve existing batches with the same prefix to determine the sequence number
    const [existingBatches] = await sequelize.query(
      'SELECT "batchNumber" FROM "PostprocessingData" WHERE "batchNumber" LIKE ? ORDER BY "batchNumber" DESC LIMIT 1',
      { replacements: [`${batchPrefix}-%`], transaction: t }
    );

    // Determine the sequence number
    let sequenceNumber = existingBatches.length > 0 ? parseInt(existingBatches[0].batchNumber.split('-').pop(), 10) + 1 : 1;

    // Generate the new batch number
    const batchNumber = `${batchPrefix}-${String(sequenceNumber).padStart(4, '0')}`;

    console.log('Generated Batch Number:', batchNumber);

    const [postprocessingData] = await sequelize.query(
      `INSERT INTO "PostprocessingData" ("batchNumber", "referenceNumber", type, "processingType", "productLine", weight, "totalBags", notes, quality, producer, "storedDate", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
      {
        replacements: [
          batchNumber, referenceNumber, type, processingType, productLine, weight, totalBags, notes, quality, producer,
          new Date(), new Date(), new Date()
        ],
        transaction: t,
      }
    );

    await t.commit();

    res.status(201).json({
      message: `Batch ${batchNumber} stored successfully`,
      postprocessingData,
    });
  } catch (err) {
    if (t) await t.rollback();
    console.error('Error creating postprocessing data:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Route for fetching all postprocessing data
router.get('/postprocessing', async (req, res) => {
  try {
    const [allRows] = await sequelize.query('SELECT a.*, DATE("storedDate") storedDateTrunc FROM "PostprocessingData" a');
    const [latestRows] = await sequelize.query('SELECT a.*, DATE("storedDate") storedDateTrunc FROM "PostprocessingData" a ORDER BY a."storedDate" DESC LIMIT 1');
    
    res.json({ latestRows, allRows });
  } catch (err) {
    console.error('Error fetching post processing data:', err);
    res.status(500).json({ message: 'Failed to fetch post processing data.' });
  }
});

// Route to get postprocessing data by batch number
router.get('/postprocessing/:batchNumber', async (req, res) => {
  const { batchNumber } = req.params;

  console.log('Received request for batch number:', batchNumber);

  try {
    const [rows] = await sequelize.query(
      'SELECT a.*, DATE("storedDate") storedDateTrunc FROM "PostprocessingData" a WHERE LOWER(a."batchNumber") = LOWER(?)',
      { replacements: [batchNumber.trim()] }
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No post processing data found for this batch number.' });
    }

    res.json(rows);
  } catch (err) {
    console.error('Error fetching post processing data by batch number:', err);
    res.status(500).json({ message: 'Failed to fetch postprocessing data by batch number.' });
  }
});

module.exports = router;