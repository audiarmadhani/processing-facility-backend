const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

// --- Cherry Inventory Routes ---

// Store a cherry batch in inventory
router.post('/cherries/store', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { batchNumber, createdBy, updatedBy } = req.body;

    if (!batchNumber || !createdBy || !updatedBy) {
      await t.rollback();
      return res.status(400).json({ error: 'Batch number, createdBy, and updatedBy are required.' });
    }

    // Verify batch exists in CherryData_v
    const [batch] = await sequelize.query(
      `SELECT "batchNumber", "receivingDate", "batchStatus" 
       FROM "CherryData_v" 
       WHERE "batchNumber" = :batchNumber`,
      { replacements: { batchNumber }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    if (!batch) {
      await t.rollback();
      return res.status(404).json({ error: 'Batch not found in CherryData_v.' });
    }

    if (batch.batchStatus !== 'Receiving' && batch.batchStatus !== 'QC') {
      await t.rollback();
      return res.status(400).json({ error: 'Cherry batch must be in Receiving or QC status to enter inventory.' });
    }

    // Check if batch is already in cherry inventory
    const existing = await sequelize.query(
      `SELECT "batchNumber" FROM "CherryInventoryStatus" WHERE "batchNumber" = :batchNumber`,
      { replacements: { batchNumber }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    if (existing.length > 0) {
      await t.rollback();
      return res.status(400).json({ error: 'Batch is already in cherry inventory.' });
    }

    // Insert into CherryInventoryStatus
    const [inventoryStatus] = await sequelize.query(
      `INSERT INTO "CherryInventoryStatus" ("batchNumber", status, "enteredAt", "createdAt", "updatedAt", "createdBy", "updatedBy")
       VALUES (:batchNumber, 'Stored', :enteredAt, NOW(), NOW(), :createdBy, :updatedBy)
       RETURNING *`,
      {
        replacements: { batchNumber, enteredAt: batch.receivingDate, createdBy, updatedBy },
        transaction: t,
        type: sequelize.QueryTypes.INSERT,
      }
    );

    // Log movement
    await sequelize.query(
      `INSERT INTO "CherryInventoryMovements" ("batchNumber", "movementType", "movedAt", "createdBy")
       VALUES (:batchNumber, 'Entry', NOW(), :createdBy)`,
      {
        replacements: { batchNumber, createdBy },
        transaction: t,
        type: sequelize.QueryTypes.INSERT,
      }
    );

    await t.commit();
    res.status(201).json({
      message: `Cherry batch ${batchNumber} stored in inventory successfully`,
      inventoryStatus: inventoryStatus[0],
    });
  } catch (err) {
    await t.rollback();
    console.error('Error storing cherry batch in inventory:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Mark a cherry batch as exited (non-order-related, e.g., processed or disposed)
router.post('/cherries/exit', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { batchNumber, createdBy, updatedBy, desa, kecamatan, kabupaten, cost, paidTo, farmerID, paymentMethod, bankAccount, bankName } = req.body;

    if (!batchNumber || !createdBy || !updatedBy) {
      await t.rollback();
      return res.status(400).json({ error: 'Batch number, createdBy, and updatedBy are required.' });
    }

    // Verify batch exists in CherryInventoryStatus
    const [batch] = await sequelize.query(
      `SELECT status FROM "CherryInventoryStatus" WHERE "batchNumber" = :batchNumber AND "exitedAt" IS NULL`,
      { replacements: { batchNumber }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    if (!batch) {
      await t.rollback();
      return res.status(404).json({ error: 'Cherry batch not found in inventory or already exited.' });
    }

    // Update batch status and exit time
    await sequelize.query(
      `UPDATE "CherryInventoryStatus" 
       SET status = 'Picked', "exitedAt" = NOW(), "updatedAt" = NOW(), "updatedBy" = :updatedBy
       WHERE "batchNumber" = :batchNumber AND "exitedAt" IS NULL`,
      { replacements: { batchNumber, updatedBy }, transaction: t }
    );

    // Log movement
    await sequelize.query(
      `INSERT INTO "CherryInventoryMovements" ("batchNumber", "movementType", "movedAt", "createdBy")
       VALUES (:batchNumber, 'Exit', NOW(), :createdBy)`,
      {
        replacements: { batchNumber, createdBy },
        transaction: t,
        type: sequelize.QueryTypes.INSERT,
      }
    );

    // Log transport details if provided
    if (desa && kecamatan && kabupaten && cost && paidTo && paymentMethod) {
      await sequelize.query(
        `INSERT INTO "TransportData" ("batchNumber", "desa", "kecamatan", "kabupaten", "cost", "paidTo", "farmerID", "paymentMethod", "bankAccount", "bankName", "createdAt")
         VALUES (:batchNumber, :desa, :kecamatan, :kabupaten, :cost, :paidTo, :farmerID, :paymentMethod, :bankAccount, :bankName, NOW())
         RETURNING *`,
        {
          replacements: {
            batchNumber,
            desa,
            kecamatan,
            kabupaten,
            cost,
            paidTo,
            farmerID: farmerID || null,
            paymentMethod,
            bankAccount: bankAccount || null,
            bankName: bankName || null,
          },
          transaction: t,
          type: sequelize.QueryTypes.INSERT,
        }
      );
    }

    await t.commit();
    res.status(200).json({ message: `Cherry batch ${batchNumber} exited inventory` });
  } catch (err) {
    await t.rollback();
    console.error('Error exiting cherry batch:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Fetch all cherry inventory
router.get('/cherries', async (req, res) => {
  try {
    const inventory = await sequelize.query(
      `SELECT 
         cis.*,
         c.weight,
         c."totalBags",
         c."availableBags",
         c."processedBags",
         c."cherryScore",
         c."cherryGroup",
         c."priceGroup",
         c."minPrice",
         c."maxPrice",
         c.price,
         c."batchStatus",
         c.producer,
         c."productLine",
         c."processingType",
         c.quality,
         c."farmerName"
       FROM "CherryInventoryStatus" cis
       LEFT JOIN "CherryData_v" c ON cis."batchNumber" = c."batchNumber"
       WHERE cis."exitedAt" IS NULL
       ORDER BY cis."enteredAt" DESC`,
      { type: sequelize.QueryTypes.SELECT }
    );
    res.json(inventory);
  } catch (err) {
    console.error('Error fetching cherry inventory:', err);
    res.status(500).json({ message: 'Failed to fetch cherry inventory.' });
  }
});

// Fetch cherry inventory movement history
router.get('/cherries/movements/:batchNumber', async (req, res) => {
  const { batchNumber } = req.params;
  try {
    const movements = await sequelize.query(
      `SELECT * FROM "CherryInventoryMovements" WHERE "batchNumber" = :batchNumber ORDER BY movedAt DESC`,
      { replacements: { batchNumber }, type: sequelize.QueryTypes.SELECT }
    );
    res.json(movements);
  } catch (err) {
    console.error('Error fetching cherry inventory movements:', err);
    res.status(500).json({ message: 'Failed to fetch cherry inventory movements.' });
  }
});

// --- Green Beans Inventory Routes ---

// Store a green beans batch in inventory
router.post('/greenbeans/store', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { batchNumber, createdBy, updatedBy } = req.body;

    if (!batchNumber || !createdBy || !updatedBy) {
      await t.rollback();
      return res.status(400).json({ error: 'Batch number, createdBy, and updatedBy are required.' });
    }

    // Verify batch exists in PostprocessingData
    const [batch] = await sequelize.query(
      `SELECT "batchNumber", "storedDate", "parentBatchNumber" 
       FROM "PostprocessingData" 
       WHERE "batchNumber" = :batchNumber`,
      { replacements: { batchNumber }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    if (!batch) {
      await t.rollback();
      return res.status(404).json({ error: 'Batch not found in PostprocessingData.' });
    }

    if (!batch.storedDate) {
      await t.rollback();
      return res.status(400).json({ error: 'Batch has not been marked as stored (storedDate is null).' });
    }

    // Verify parent batch in CherryData_v
    const [cherryData] = await sequelize.query(
      `SELECT "batchNumber", "batchStatus" 
       FROM "CherryData_v" 
       WHERE "batchNumber" = :parentBatchNumber`,
      { 
        replacements: { parentBatchNumber: batch.parentBatchNumber }, 
        type: sequelize.QueryTypes.SELECT, 
        transaction: t 
      }
    );

    if (!cherryData || cherryData.batchStatus !== 'Exited Dry Mill') {
      await t.rollback();
      return res.status(400).json({ 
        error: 'Parent batch not found or not ready for inventory (must have exited dry mill).' 
      });
    }

    // Check if batch is already in green beans inventory
    const existing = await sequelize.query(
      `SELECT "batchNumber" FROM "GreenBeansInventoryStatus" WHERE "batchNumber" = :batchNumber`,
      { replacements: { batchNumber }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    if (existing.length > 0) {
      await t.rollback();
      return res.status(400).json({ error: 'Batch is already in green beans inventory.' });
    }

    // Insert into GreenBeansInventoryStatus
    const [inventoryStatus] = await sequelize.query(
      `INSERT INTO "GreenBeansInventoryStatus" ("batchNumber", status, "enteredAt", "createdAt", "updatedAt", "createdBy", "updatedBy")
       VALUES (:batchNumber, 'Stored', :enteredAt, NOW(), NOW(), :createdBy, :updatedBy)
       RETURNING *`,
      {
        replacements: { batchNumber, enteredAt: batch.storedDate, createdBy, updatedBy },
        transaction: t,
        type: sequelize.QueryTypes.INSERT,
      }
    );

    // Log movement
    await sequelize.query(
      `INSERT INTO "GreenBeansInventoryMovements" ("batchNumber", "movementType", "movedAt", "createdBy")
       VALUES (:batchNumber, 'Entry', NOW(), :createdBy)`,
      {
        replacements: { batchNumber, createdBy },
        transaction: t,
        type: sequelize.QueryTypes.INSERT,
      }
    );

    await t.commit();
    res.status(201).json({
      message: `Green beans batch ${batchNumber} stored in inventory successfully`,
      inventoryStatus: inventoryStatus[0],
    });
  } catch (err) {
    await t.rollback();
    console.error('Error storing green beans batch in inventory:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Fetch all green beans inventory
router.get('/greenbeans', async (req, res) => {
  try {
    const inventory = await sequelize.query(
      `SELECT 
         gbis.*,
         p."referenceNumber", 
         p."processingType", 
         p."productLine", 
         p.producer, 
         p.quality, 
         p.type, 
         p.weight, 
         p."totalBags",
         p."parentBatchNumber",
         p."storedDate",
         c."cherryScore",
         c."cherryGroup",
         c."priceGroup",
         c."minPrice",
         c."maxPrice",
         c.price,
         dmg."subBatchId",
         dmg.grade,
         dmg."is_stored" AS grade_stored
       FROM "GreenBeansInventoryStatus" gbis
       LEFT JOIN "PostprocessingData" p ON gbis."batchNumber" = p."batchNumber"
       LEFT JOIN "CherryData_v" c ON p."parentBatchNumber" = c."batchNumber"
       LEFT JOIN "DryMillGrades" dmg ON p."batchNumber" = dmg."batchNumber" OR p."parentBatchNumber" = dmg."batchNumber"
       WHERE gbis."exitedAt" IS NULL
       ORDER BY gbis."enteredAt" DESC`,
      { type: sequelize.QueryTypes.SELECT }
    );
    res.json(inventory);
  } catch (err) {
    console.error('Error fetching green beans inventory:', err);
    res.status(500).json({ message: 'Failed to fetch green beans inventory.' });
  }
});

// Fetch bag-level green beans inventory details
router.get('/greenbeans/bags/:batchNumber', async (req, res) => {
  const { batchNumber } = req.params;
  try {
    const bags = await sequelize.query(
      `SELECT 
         bd.*,
         dmg."subBatchId",
         dmg.grade,
         dmg."is_stored" AS grade_stored
       FROM "BagDetails" bd
       LEFT JOIN "DryMillGrades" dmg ON bd.grade_id = dmg."subBatchId"
       LEFT JOIN "PostprocessingData" p ON p."batchNumber" = :batchNumber
       WHERE dmg."batchNumber" = p."parentBatchNumber" AND p."batchNumber" = :batchNumber
       ORDER BY bd.bag_number`,
      { replacements: { batchNumber }, type: sequelize.QueryTypes.SELECT }
    );
    if (bags.length === 0) {
      return res.status(404).json({ message: 'No bag details found for this batch.' });
    }
    res.json(bags);
  } catch (err) {
    console.error('Error fetching green beans bag details:', err);
    res.status(500).json({ message: 'Failed to fetch green beans bag details.' });
  }
});

// Fetch green beans inventory movement history
router.get('/greenbeans/movements/:batchNumber', async (req, res) => {
  const { batchNumber } = req.params;
  try {
    const movements = await sequelize.query(
      `SELECT * FROM "GreenBeansInventoryMovements" WHERE "batchNumber" = :batchNumber ORDER BY movedAt DESC`,
      { replacements: { batchNumber }, type: sequelize.QueryTypes.SELECT }
    );
    res.json(movements);
  } catch (err) {
    console.error('Error fetching green beans inventory movements:', err);
    res.status(500).json({ message: 'Failed to fetch green beans inventory movements.' });
  }
});

module.exports = router;