const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

// Reserve cherry inventory for an order
router.post('/inventory/cherries/reserve', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { order_id, batchNumber, quantity, createdBy, updatedBy } = req.body;

    if (!order_id || !batchNumber || !quantity || quantity <= 0 || !createdBy || !updatedBy) {
      await t.rollback();
      return res.status(400).json({ error: 'order_id, batchNumber, quantity, createdBy, and updatedBy are required, and quantity must be positive' });
    }

    // Verify order exists
    const [order] = await sequelize.query(
      `SELECT order_id FROM "Orders" WHERE order_id = :order_id`,
      { replacements: { order_id }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    if (!order) {
      await t.rollback();
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check batch status
    const [batch] = await sequelize.query(
      `SELECT status FROM "CherryInventoryStatus" WHERE "batchNumber" = :batchNumber AND "exitedAt" IS NULL`,
      { replacements: { batchNumber }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    if (!batch) {
      await t.rollback();
      return res.status(404).json({ error: `Cherry batch ${batchNumber} not found or already exited` });
    }

    if (batch.status === 'Reserved' || batch.status === 'Picked') {
      await t.rollback();
      return res.status(400).json({ error: `Cherry batch ${batchNumber} is already ${batch.status.toLowerCase()}` });
    }

    // Update inventory status
    await sequelize.query(
      `UPDATE "CherryInventoryStatus" 
       SET status = 'Reserved', orderId = :order_id, "updatedAt" = NOW(), "updatedBy" = :updatedBy
       WHERE "batchNumber" = :batchNumber AND "exitedAt" IS NULL`,
      { replacements: { batchNumber, order_id, updatedBy }, transaction: t }
    );

    // Log inventory movement
    await sequelize.query(
      `INSERT INTO "CherryInventoryMovements" ("batchNumber", "movementType", orderId, "movedAt", "createdBy")
       VALUES (:batchNumber, 'Reservation', :order_id, NOW(), :createdBy)`,
      {
        replacements: { batchNumber, order_id, createdBy },
        transaction: t,
        type: sequelize.QueryTypes.INSERT,
      }
    );

    // Update OrderItems
    await sequelize.query(
      `INSERT INTO "OrderItems" (order_id, product, quantity, price, batchNumber, product_type, created_at)
       VALUES (:order_id, :product, :quantity, 0, :batchNumber, 'cherry', NOW())
       ON CONFLICT (order_id, batchNumber) DO UPDATE 
       SET quantity = EXCLUDED.quantity, updated_at = NOW()`,
      {
        replacements: { order_id, product: `Cherry Batch ${batchNumber}`, quantity, batchNumber },
        transaction: t,
        type: sequelize.QueryTypes.INSERT,
      }
    );

    await t.commit();
    res.status(200).json({ message: `Cherry batch ${batchNumber} reserved for order ${order_id}` });
  } catch (error) {
    await t.rollback();
    console.error('Error reserving cherry inventory:', error);
    res.status(500).json({ error: 'Failed to reserve cherry inventory', details: error.message });
  }
});

// Reserve green bean inventory for an order
router.post('/inventory/greenbeans/reserve', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { order_id, batchNumber, quantity, createdBy, updatedBy } = req.body;

    if (!order_id || !batchNumber || !quantity || quantity <= 0 || !createdBy || !updatedBy) {
      await t.rollback();
      return res.status(400).json({ error: 'order_id, batchNumber, quantity, createdBy, and updatedBy are required, and quantity must be positive' });
    }

    // Verify order exists
    const [order] = await sequelize.query(
      `SELECT order_id FROM "Orders" WHERE order_id = :order_id`,
      { replacements: { order_id }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    if (!order) {
      await t.rollback();
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check batch status
    const [batch] = await sequelize.query(
      `SELECT status FROM "GreenBeansInventoryStatus" WHERE "batchNumber" = :batchNumber AND "exitedAt" IS NULL`,
      { replacements: { batchNumber }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    if (!batch) {
      await t.rollback();
      return res.status(404).json({ error: `Green bean batch ${batchNumber} not found or already exited` });
    }

    if (batch.status === 'Reserved' || batch.status === 'Picked') {
      await t.rollback();
      return res.status(400).json({ error: `Green bean batch ${batchNumber} is already ${batch.status.toLowerCase()}` });
    }

    // Update inventory status
    await sequelize.query(
      `UPDATE "GreenBeansInventoryStatus" 
       SET status = 'Reserved', orderId = :order_id, "updatedAt" = NOW(), "updatedBy" = :updatedBy
       WHERE "batchNumber" = :batchNumber AND "exitedAt" IS NULL`,
      { replacements: { batchNumber, order_id, updatedBy }, transaction: t }
    );

    // Log inventory movement
    await sequelize.query(
      `INSERT INTO "GreenBeansInventoryMovements" ("batchNumber", "movementType", orderId, "movedAt", "createdBy")
       VALUES (:batchNumber, 'Reservation', :order_id, NOW(), :createdBy)`,
      {
        replacements: { batchNumber, order_id, createdBy },
        transaction: t,
        type: sequelize.QueryTypes.INSERT,
      }
    );

    // Update OrderItems
    await sequelize.query(
      `INSERT INTO "OrderItems" (order_id, product, quantity, price, batchNumber, product_type, created_at)
       VALUES (:order_id, :product, :quantity, 0, :batchNumber, 'greenbeans', NOW())
       ON CONFLICT (order_id, batchNumber) DO UPDATE 
       SET quantity = EXCLUDED.quantity, updated_at = NOW()`,
      {
        replacements: { order_id, product: `Green Bean Batch ${batchNumber}`, quantity, batchNumber },
        transaction: t,
        type: sequelize.QueryTypes.INSERT,
      }
    );

    await t.commit();
    res.status(200).json({ message: `Green bean batch ${batchNumber} reserved for order ${order_id}` });
  } catch (error) {
    await t.rollback();
    console.error('Error reserving green bean inventory:', error);
    res.status(500).json({ error: 'Failed to reserve green bean inventory', details: error.message });
  }
});

// Mark cherry batch as exited (shipped)
router.post('/inventory/cherries/exit', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { order_id, batchNumber, createdBy, updatedBy, desa, kecamatan, kabupaten, cost, paidTo, farmerID, paymentMethod, bankAccount, bankName } = req.body;

    if (!order_id || !batchNumber || !createdBy || !updatedBy) {
      await t.rollback();
      return res.status(400).json({ error: 'order_id, batchNumber, createdBy, and updatedBy are required' });
    }

    // Verify order exists and is in transit
    const [order] = await sequelize.query(
      `SELECT status FROM "Orders" WHERE order_id = :order_id AND status = 'In Transit'`,
      { replacements: { order_id }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    if (!order) {
      await t.rollback();
      return res.status(400).json({ error: 'Order not found or not in In Transit status' });
    }

    // Check batch status
    const [batch] = await sequelize.query(
      `SELECT status, orderId FROM "CherryInventoryStatus" WHERE "batchNumber" = :batchNumber AND "exitedAt" IS NULL`,
      { replacements: { batchNumber }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    if (!batch) {
      await t.rollback();
      return res.status(404).json({ error: `Cherry batch ${batchNumber} not found or already exited` });
    }

    if (batch.status !== 'Reserved' || batch.orderId !== order_id) {
      await t.rollback();
      return res.status(400).json({ error: `Cherry batch ${batchNumber} is not reserved for this order` });
    }

    // Update inventory status
    await sequelize.query(
      `UPDATE "CherryInventoryStatus" 
       SET status = 'Picked', "exitedAt" = NOW(), "updatedAt" = NOW(), "updatedBy" = :updatedBy
       WHERE "batchNumber" = :batchNumber AND "exitedAt" IS NULL`,
      { replacements: { batchNumber, updatedBy }, transaction: t }
    );

    // Log inventory movement
    await sequelize.query(
      `INSERT INTO "CherryInventoryMovements" ("batchNumber", "movementType", orderId, "movedAt", "createdBy")
       VALUES (:batchNumber, 'Exit', :order_id, NOW(), :createdBy)`,
      {
        replacements: { batchNumber, order_id, createdBy },
        transaction: t,
        type: sequelize.QueryTypes.INSERT,
      }
    );

    // Log transport details if provided
    if (desa && kecamatan && kabupaten && cost && paidTo && paymentMethod) {
      await sequelize.query(
        `INSERT INTO "TransportData" ("batchNumber", "desa", "kecamatan", "kabupaten", "cost", "paidTo", "farmerID", "paymentMethod", "bankAccount", "bankName", "createdAt")
         VALUES (:batchNumber, :desa, :kecamatan, :kabupaten, :cost, :paidTo, :farmerID, :paymentMethod, :bankAccount, :bankName, NOW())`,
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
    res.status(200).json({ message: `Cherry batch ${batchNumber} marked as exited for order ${order_id}` });
  } catch (error) {
    await t.rollback();
    console.error('Error exiting cherry inventory:', error);
    res.status(500).json({ error: 'Failed to exit cherry inventory', details: error.message });
  }
});

// Mark green bean batch as shipped
router.post('/inventory/greenbeans/ship', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { order_id, batchNumber, createdBy, updatedBy, desa, kecamatan, kabupaten, cost, paidTo, farmerID, paymentMethod, bankAccount, bankName } = req.body;

    if (!order_id || !batchNumber || !createdBy || !updatedBy) {
      await t.rollback();
      return res.status(400).json({ error: 'order_id, batchNumber, createdBy, and updatedBy are required' });
    }

    // Verify order exists and is in transit
    const [order] = await sequelize.query(
      `SELECT status FROM "Orders" WHERE order_id = :order_id AND status = 'In Transit'`,
      { replacements: { order_id }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    if (!order) {
      await t.rollback();
      return res.status(400).json({ error: 'Order not found or not in In Transit status' });
    }

    // Check batch status
    const [batch] = await sequelize.query(
      `SELECT status, orderId FROM "GreenBeansInventoryStatus" WHERE "batchNumber" = :batchNumber AND "exitedAt" IS NULL`,
      { replacements: { batchNumber }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );

    if (!batch) {
      await t.rollback();
      return res.status(404).json({ error: `Green bean batch ${batchNumber} not found or already exited` });
    }

    if (batch.status !== 'Reserved' || batch.orderId !== order_id) {
      await t.rollback();
      return res.status(400).json({ error: `Green bean batch ${batchNumber} is not reserved for this order` });
    }

    // Update inventory status
    await sequelize.query(
      `UPDATE "GreenBeansInventoryStatus" 
       SET status = 'Picked', "exitedAt" = NOW(), "updatedAt" = NOW(), "updatedBy" = :updatedBy
       WHERE "batchNumber" = :batchNumber AND "exitedAt" IS NULL`,
      { replacements: { batchNumber, updatedBy }, transaction: t }
    );

    // Log inventory movement
    await sequelize.query(
      `INSERT INTO "GreenBeansInventoryMovements" ("batchNumber", "movementType", orderId, "movedAt", "createdBy")
       VALUES (:batchNumber, 'Exit', :order_id, NOW(), :createdBy)`,
      {
        replacements: { batchNumber, order_id, createdBy },
        transaction: t,
        type: sequelize.QueryTypes.INSERT,
      }
    );

    // Log transport details if provided
    if (desa && kecamatan && kabupaten && cost && paidTo && paymentMethod) {
      await sequelize.query(
        `INSERT INTO "TransportData" ("batchNumber", "desa", "kecamatan", "kabupaten", "cost", "paidTo", "farmerID", "paymentMethod", "bankAccount", "bankName", "createdAt")
         VALUES (:batchNumber, :desa, :kecamatan, :kabupaten, :cost, :paidTo, :farmerID, :paymentMethod, :bankAccount, :bankName, NOW())`,
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
    res.status(200).json({ message: `Green bean batch ${batchNumber} marked as shipped for order ${order_id}` });
  } catch (error) {
    await t.rollback();
    console.error('Error shipping green bean inventory:', error);
    res.status(500).json({ error: 'Failed to ship green bean inventory', details: error.message });
  }
});

module.exports = router;