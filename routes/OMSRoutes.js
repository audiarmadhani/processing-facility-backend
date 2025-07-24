const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');
const { google } = require('googleapis');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

// Google Drive OAuth2 Setup (unchanged)
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_API_CLIENT_ID,
  process.env.GOOGLE_API_CLIENT_SECRET,
  process.env.GOOGLE_API_REDIRECT_URI
);
oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_API_REFRESH_TOKEN });
const drive = google.drive({ version: 'v3', auth: oauth2Client });

// Multer configuration (unchanged)
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.pdf'].includes(ext)) {
      return cb(new Error('Only JPG, JPEG, PNG, or PDF files are allowed'), false);
    }
    cb(null, true);
  },
});

// Google Drive Folder IDs (unchanged)
const folderIds = {
  'SPB': '1IlyAX9P8JbcCgPppftXPf-8W7Axai3MF',
  'SPK': '1Wzf31eoapE8CjPFd_WKCJgjh-v_LaXRP',
  'SPM': '18Z7ouAVOwPqOF-7sf3YYlyhXX1168Y0Z',
  'DO': '15YAWgvww1y3kzczT1rvB5vy8Ub1pUcMP',
  'Surat Jalan': '1CWDcsME8_iEIwcPbpu33CC_j4JhwF-rP',
  'BAST': '1Wyj0IS94IDSLU-_-vzG23F54uXf33KnD',
  'Order List': '1Ykw1OnktdPiG50vhF4GFcpou7cF8fyFP',
};

// Reused upload function (unchanged)
const uploadFileToDrive = async (file, folderId) => {
  const fileMetadata = {
    name: file.originalname,
    parents: [folderId],
  };
  const media = {
    mimeType: file.mimetype,
    body: fs.createReadStream(file.path),
  };

  const uploadedFile = await drive.files.create({
    resource: fileMetadata,
    media,
    fields: 'id, name, webViewLink, webContentLink',
  });

  fs.unlinkSync(file.path); // Clean up local file
  return uploadedFile.data.webViewLink; // Return URL for database storage
};

// --- Customers Routes --- (unchanged)
router.get('/customers/:customer_id', async (req, res) => {
  const { customer_id } = req.params;
  try {
    const customer = await sequelize.query(`
      SELECT * FROM "Customers"
      WHERE customer_id = :customer_id
    `, {
      replacements: { customer_id },
      type: sequelize.QueryTypes.SELECT,
    });

    if (!customer.length) return res.status(404).json({ error: 'Customer not found' });

    res.json({ ...customer[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer details', details: error.message });
  }
});

// --- Drivers Routes --- (unchanged)
router.get('/drivers/:customer_id', async (req, res) => {
  const { driver_id } = req.params;
  try {
    const driver = await sequelize.query(`
      SELECT * FROM "Drivers"
      WHERE driver_id = :driver_id
    `, {
      replacements: { driver_id },
      type: sequelize.QueryTypes.SELECT,
    });

    if (!driver.length) return res.status(404).json({ error: 'Driver not found' });

    res.json({ ...driver[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch driver details', details: error.message });
  }
});

router.get('/customers', async (req, res) => {
  try {
    const customers = await sequelize.query('SELECT * FROM "Customers" ORDER BY created_at DESC', {
      type: sequelize.QueryTypes.SELECT,
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers', details: error.message });
  }
});

router.post('/customers', async (req, res) => {
  const { name, address, country, state, city, zip_code, phone, email, special_requests } = req.body;
  if (!name || !address || !phone) {
    return res.status(400).json({ error: 'Name, address, and phone are required' });
  }
  try {
    const [customer] = await sequelize.query(`
      INSERT INTO "Customers" (name, address, country, state, city, zip_code, phone, email, special_requests, created_at, updated_at)
      VALUES (:name, :address, :country, :state, :city, :zip_code, :phone, :email, :special_requests, NOW(), NOW())
      RETURNING *;
    `, {
      replacements: { name, address, country, state, city, zip_code, phone, email, special_requests },
      type: sequelize.QueryTypes.INSERT,
    });
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add customer', details: error.message });
  }
});

// --- Drivers Routes --- (unchanged)
router.get('/drivers', async (req, res) => {
  try {
    const drivers = await sequelize.query('SELECT * FROM "Drivers" ORDER BY created_at DESC', {
      type: sequelize.QueryTypes.SELECT,
    });
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch drivers', details: error.message });
  }
});

router.post('/drivers', async (req, res) => {
  const { name, phone, vehicle_number, vehicle_type, availability_status = 'Available', max_capacity } = req.body;
  if (!name || !phone || !vehicle_number) {
    return res.status(400).json({ error: 'Name, phone, and vehicle_number are required' });
  }
  try {
    const [driver] = await sequelize.query(`
      INSERT INTO "Drivers" (name, phone, vehicle_number, vehicle_type, availability_status, max_capacity, created_at, updated_at)
      VALUES (:name, :phone, :vehicle_number, :vehicle_type, :availability_status, :max_capacity, NOW(), NOW())
      RETURNING *;
    `, {
      replacements: { name, phone, vehicle_number, vehicle_type, availability_status, max_capacity },
      type: sequelize.QueryTypes.INSERT,
    });
    res.status(201).json(driver);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add driver', details: error.message });
  }
});

// --- Orders Routes ---

router.get('/orders', async (req, res) => {
  try {
    const orders = await sequelize.query(`
      SELECT * FROM "Orders_v"
    `, {
      type: sequelize.QueryTypes.SELECT,
    });

    const ordersWithItems = await Promise.all(orders.map(async order => {
      const items = await sequelize.query(`
        SELECT * FROM "OrderItems" WHERE order_id = :order_id ORDER BY created_at DESC
      `, {
        replacements: { order_id: order.order_id },
        type: sequelize.QueryTypes.SELECT,
      });
      return { ...order, items };
    }));

    res.json(ordersWithItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders', details: error.message });
  }
});

router.get('/orders/:order_id', async (req, res) => {
  const { order_id } = req.params;
  try {
    const order = await sequelize.query(`
      SELECT * FROM "Orders_v"
      WHERE order_id = :order_id
    `, {
      replacements: { order_id },
      type: sequelize.QueryTypes.SELECT,
    });

    if (!order.length) return res.status(404).json({ error: 'Order not found' });

    const items = await sequelize.query(`
      SELECT * FROM "OrderItems" WHERE order_id = :order_id ORDER BY created_at DESC
    `, {
      replacements: { order_id },
      type: sequelize.QueryTypes.SELECT,
    });

    res.json({ ...order[0], items });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order details', details: error.message });
  }
});

router.post('/orders', upload.single('spb_file'), async (req, res) => {
  const t = await sequelize.transaction();
  try {
    let { customer_id, driver_id, shipping_method, driver_details, price, tax_percentage, items, shipping_address, billing_address } = req.body;

    if (items && typeof items === 'string') {
      try {
        items = JSON.parse(items);
      } catch (error) {
        await t.rollback();
        return res.status(400).json({ error: 'Invalid items format: must be a valid JSON array', details: error.message });
      }
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: 'Items array is required and must not be empty' });
    }

    if (!customer_id || !shipping_method || !shipping_address || !billing_address) {
      await t.rollback();
      return res.status(400).json({ error: 'customer_id, shipping_method, shipping_address, and billing_address are required' });
    }

    if (typeof shipping_address !== 'string' || shipping_address.trim() === '') {
      await t.rollback();
      return res.status(400).json({ error: 'Shipping address must be a non-empty string' });
    }
    if (typeof billing_address !== 'string' || billing_address.trim() === '') {
      await t.rollback();
      return res.status(400).json({ error: 'Billing address must be a non-empty string' });
    }

    const parsedPrice = parseFloat(price) || 0;
    const parsedTaxPercentage = parseFloat(tax_percentage) || 0;

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      await t.rollback();
      return res.status(400).json({ error: 'Invalid price value: must be a non-negative number' });
    }
    if (isNaN(parsedTaxPercentage) || parsedTaxPercentage < 0 || parsedTaxPercentage > 100) {
      await t.rollback();
      return res.status(400).json({ error: 'Invalid tax percentage: must be a number between 0 and 100' });
    }

    for (const item of items) {
      if (!item.batch_number || !item.quantity || !item.price || !item.product) {
        await t.rollback();
        return res.status(400).json({ error: 'Each item must have batch_number, quantity, price, and product' });
      }

      const itemQuantity = parseFloat(item.quantity) || 0;
      const itemPrice = parseFloat(item.price) || 0;

      if (isNaN(itemQuantity) || itemQuantity <= 0 || isNaN(itemPrice) || itemPrice < 0) {
        await t.rollback();
        return res.status(400).json({ error: 'Invalid item quantity or price: quantity must be positive, price must be non-negative' });
      }
    }

    const [order] = await sequelize.query(`
      INSERT INTO "Orders" (customer_id, driver_id, shipping_method, driver_details, price, tax_percentage, shipping_address, billing_address, created_at, updated_at, status)
      VALUES (:customer_id, :driver_id, :shipping_method, :driver_details, :price, :tax_percentage, :shipping_address, :billing_address, NOW(), NOW(), :status)
      RETURNING *;
    `, {
      replacements: { 
        customer_id, 
        driver_id: shipping_method === 'Self' ? driver_id : null, 
        shipping_method, 
        driver_details: shipping_method === 'Customer' ? JSON.stringify(driver_details) : null, 
        price: parsedPrice, 
        tax_percentage: parsedTaxPercentage,
        shipping_address,
        billing_address,
        status: 'Pending',
      },
      transaction: t,
      type: sequelize.QueryTypes.INSERT,
    });

    const [orders] = await sequelize.query(`
      SELECT last_value FROM "Orders_order_id_seq";
    `, {
      type: sequelize.QueryTypes.SELECT,
      transaction: t,
    });
    const orderId = orders.last_value;

    for (const item of items) {
      const itemPrice = parseFloat(item.price) || 0;
      const itemQuantity = parseFloat(item.quantity) || 0;

      await sequelize.query(`
        INSERT INTO "OrderItems" (order_id, product, quantity, price, batch_number, created_at)
        VALUES (:order_id, :product, :quantity, :price, :batch_number, NOW())
      `, {
        replacements: { 
          order_id: orderId, 
          product: item.product, 
          quantity: itemQuantity, 
          price: itemPrice,
          batch_number: item.batch_number,
        },
        transaction: t,
      });
    }

    let spbUrl = null;
    if (req.file) {
      spbUrl = await uploadFileToDrive(req.file, folderIds['SPB']);
      await sequelize.query(`
        INSERT INTO "Documents" (order_id, type, drive_url, created_at)
        VALUES (:order_id, 'SPB', :drive_url, NOW());
      `, {
        replacements: { order_id: orderId, drive_url: spbUrl },
        transaction: t,
      });
    }

    await t.commit();
    res.status(201).json({ order_id: orderId, spb_url: spbUrl, message: 'Order created successfully' });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
});

router.put('/orders/:order_id', upload.single('spb_file'), async (req, res) => {
  const { order_id } = req.params;
  const t = await sequelize.transaction();
  try {
    let { customer_id, driver_id, shipping_method, driver_details, price, tax_percentage, items, status, shipping_address, billing_address } = req.body;

    if (items && typeof items === 'string') {
      try {
        items = JSON.parse(items);
      } catch (error) {
        await t.rollback();
        return res.status(400).json({ error: 'Invalid items format: must be a valid JSON array', details: error.message });
      }
    } else if (!items || !Array.isArray(items)) {
      items = [];
    }

    if (!customer_id || !shipping_method || !shipping_address || !billing_address) {
      await t.rollback();
      return res.status(400).json({ error: 'customer_id, shipping_method, shipping_address, and billing_address are required' });
    }

    if (typeof shipping_address !== 'string' || shipping_address.trim() === '') {
      await t.rollback();
      return res.status(400).json({ error: 'Shipping address must be a non-empty string' });
    }
    if (typeof billing_address !== 'string' || billing_address.trim() === '') {
      await t.rollback();
      return res.status(400).json({ error: 'Billing address must be a non-empty string' });
    }

    const parsedPrice = parseFloat(price) || 0;
    const parsedTaxPercentage = parseFloat(tax_percentage) || 0;

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      await t.rollback();
      return res.status(400).json({ error: 'Invalid price value: must be a non-negative number' });
    }
    if (isNaN(parsedTaxPercentage) || parsedTaxPercentage < 0 || parsedTaxPercentage > 100) {
      await t.rollback();
      return res.status(400).json({ error: 'Invalid tax percentage: must be a number between 0 and 100' });
    }

    const [existingOrder] = await sequelize.query(`
      SELECT COALESCE(ROUND(CAST(price * (1 + tax_percentage / 100) AS numeric), 2), 0)::FLOAT AS grand_total 
      FROM "Orders" 
      WHERE order_id = :order_id
    `, {
      replacements: { order_id },
      type: sequelize.QueryTypes.SELECT,
      transaction: t,
    });

    if (!existingOrder) {
      await t.rollback();
      return res.status(404).json({ error: 'Order not found' });
    }

    if (items.length > 0) {
      for (const item of items) {
        if (!item.batch_number || !item.quantity || !item.price || !item.product) {
          await t.rollback();
          return res.status(400).json({ error: 'Each item must have batch_number, quantity, price, and product' });
        }

        const itemQuantity = parseFloat(item.quantity) || 0;
        const itemPrice = parseFloat(item.price) || 0;

        if (isNaN(itemQuantity) || itemQuantity <= 0 || isNaN(itemPrice) || itemPrice < 0) {
          await t.rollback();
          return res.status(400).json({ error: 'Invalid item quantity or price: quantity must be positive, price must be non-negative' });
        }
      }
    }

    const [updatedOrder] = await sequelize.query(`
      UPDATE "Orders"
      SET customer_id = :customer_id, 
          driver_id = :driver_id, 
          shipping_method = :shipping_method, 
          driver_details = :driver_details, 
          price = :price, 
          tax_percentage = :tax_percentage,
          shipping_address = :shipping_address,
          billing_address = :billing_address,
          status = :status, 
          updated_at = NOW()
      WHERE order_id = :order_id
      RETURNING *;
    `, {
      replacements: { 
        order_id, 
        customer_id, 
        driver_id: shipping_method === 'Self' ? driver_id : null, 
        shipping_method, 
        driver_details: shipping_method === 'Customer' ? JSON.stringify(driver_details) : null, 
        price: parsedPrice, 
        tax_percentage: parsedTaxPercentage,
        shipping_address,
        billing_address,
        status: status || 'Pending',
      },
      transaction: t,
      type: sequelize.QueryTypes.UPDATE,
    });

    if (!updatedOrder) {
      await t.rollback();
      return res.status(404).json({ error: 'Order not found' });
    }

    await sequelize.query(`
      DELETE FROM "OrderItems" WHERE order_id = :order_id
    `, {
      replacements: { order_id },
      transaction: t,
    });

    if (items.length) {
      for (const item of items) {
        const itemPrice = parseFloat(item.price) || 0;
        const itemQuantity = parseFloat(item.quantity) || 0;

        if (isNaN(itemPrice) || itemPrice < 0 || isNaN(itemQuantity) || itemQuantity < 0) {
          await t.rollback();
          return res.status(400).json({ error: 'Invalid item price or quantity: must be non-negative numbers' });
        }

        await sequelize.query(`
          INSERT INTO "OrderItems" (order_id, product, quantity, price, batch_number, created_at)
          VALUES (:order_id, :product, :quantity, :price, :batch_number, NOW())
        `, {
          replacements: { 
            order_id, 
            product: item.product, 
            quantity: itemQuantity, 
            price: itemPrice,
            batch_number: item.batch_number
          },
          transaction: t,
        });
      }
    }

    let spbUrl = null;
    if (req.file) {
      spbUrl = await uploadFileToDrive(req.file, folderIds['SPB']);
      await sequelize.query(`
        INSERT INTO "Documents" (order_id, type, drive_url, created_at)
        VALUES (:order_id, 'SPB', :drive_url, NOW())
        ON CONFLICT (order_id, type) DO UPDATE SET drive_url = EXCLUDED.drive_url, created_at = EXCLUDED.created_at;
      `, {
        replacements: { order_id, drive_url: spbUrl },
        transaction: t,
      });
    }

    await t.commit();
    res.json({ ...updatedOrder[0], items, spb_url: spbUrl, message: 'Order updated successfully' });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: 'Failed to update order', details: error.message });
  }
});

// --- OrderItems Routes --- (unchanged)
router.get('/order-items/:order_id', async (req, res) => {
  const { order_id } = req.params;
  try {
    const items = await sequelize.query(`
      SELECT * FROM "OrderItems" WHERE order_id = :order_id ORDER BY created_at DESC
    `, {
      replacements: { order_id },
      type: sequelize.QueryTypes.SELECT,
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order items', details: error.message });
  }
});

router.post('/order-items', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { order_id, product, quantity, price } = req.body;
    if (!order_id || !product || !quantity || !price) {
      await t.rollback();
      return res.status(400).json({ error: 'order_id, product, quantity, and price are required' });
    }

    const parsedQuantity = parseFloat(quantity) || 0;
    const parsedPrice = parseFloat(price) || 0;

    if (isNaN(parsedQuantity) || parsedQuantity < 0 || isNaN(parsedPrice) || parsedPrice < 0) {
      await t.rollback();
      return res.status(400).json({ error: 'Invalid quantity or price: must be non-negative numbers' });
    }

    const [order] = await sequelize.query(`
      SELECT * FROM "Orders" WHERE order_id = :order_id
    `, {
      replacements: { order_id },
      type: sequelize.QueryTypes.SELECT,
      transaction: t,
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ error: 'Order not found' });
    }

    const [item] = await sequelize.query(`
      INSERT INTO "OrderItems" (order_id, product, quantity, price, created_at)
      VALUES (:order_id, :product, :quantity, :price, NOW())
      RETURNING *;
    `, {
      replacements: { order_id, product, quantity: parsedQuantity, price: parsedPrice },
      transaction: t,
      type: sequelize.QueryTypes.INSERT,
    });

    await t.commit();
    res.status(201).json(item);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: 'Failed to create order item', details: error.message });
  }
});

router.put('/order-items/:order_item_id', async (req, res) => {
  const { order_item_id } = req.params;
  const { product, quantity, price } = req.body;
  try {
    const parsedQuantity = parseFloat(quantity) || 0;
    const parsedPrice = parseFloat(price) || 0;

    if (isNaN(parsedQuantity) || parsedQuantity < 0 || isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ error: 'Invalid quantity or price: must be non-negative numbers' });
    }

    const [updated] = await sequelize.query(`
      UPDATE "OrderItems"
      SET product = :product, 
          quantity = :quantity, 
          price = :price, 
          updated_at = NOW()
      WHERE order_item_id = :order_item_id
      RETURNING *;
    `, {
      replacements: { order_item_id, product, quantity: parsedQuantity, price: parsedPrice },
      type: sequelize.QueryTypes.UPDATE,
    });

    if (!updated) return res.status(404).json({ error: 'Order item not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order item', details: error.message });
  }
});

router.delete('/order-items/:order_item_id', async (req, res) => {
  const { order_item_id } = req.params;
  try {
    const [deleted] = await sequelize.query(`
      DELETE FROM "OrderItems"
      WHERE order_item_id = :order_item_id
      RETURNING *;
    `, {
      replacements: { order_item_id },
      type: sequelize.QueryTypes.DELETE,
    });

    if (!deleted) return res.status(404).json({ error: 'Order item not found' });
    res.json({ message: 'Order item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete order item', details: error.message });
  }
});

// --- Documents Routes --- (unchanged)
router.post('/documents/upload', upload.single('file'), async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { order_id, type, details } = req.body;
    if (!order_id || !type || !req.file) {
      await t.rollback();
      return res.status(400).json({ error: 'order_id, type, and file are required' });
    }

    const parsedOrderId = parseInt(order_id, 10);
    if (isNaN(parsedOrderId)) {
      await t.rollback();
      return res.status(400).json({ error: 'Invalid order_id: must be a valid integer', details: `Received: ${order_id}` });
    }

    const driveUrl = await uploadFileToDrive(req.file, folderIds[type]);
    const [doc] = await sequelize.query(`
      INSERT INTO "Documents" (order_id, type, details, drive_url, created_at)
      VALUES (:order_id, :type, :details, :drive_url, NOW())
      RETURNING *;
    `, {
      replacements: { order_id: parsedOrderId, type, details: JSON.stringify(details || {}), drive_url: driveUrl },
      transaction: t,
      type: sequelize.QueryTypes.INSERT,
    });

    await t.commit();
    res.status(201).json(doc);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: 'Failed to upload document', details: error.message });
  }
});

router.get('/documents/:order_id', async (req, res) => {
  const { order_id } = req.params;
  try {
    const documents = await sequelize.query(`
      SELECT * FROM "Documents" WHERE order_id = :order_id ORDER BY created_at DESC
    `, {
      replacements: { order_id },
      type: sequelize.QueryTypes.SELECT,
    });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch documents', details: error.message });
  }
});

// --- Payments Routes --- (unchanged)
router.post('/payments', async (req, res) => {
  const { order_id, amount, payment_date, notes } = req.body;

  if (!order_id || !amount) {
    return res.status(400).json({ error: 'order_id and amount are required' });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'Invalid amount: must be a positive number' });
  }

  const t = await sequelize.transaction();
  try {
    const [payment] = await sequelize.query(`
      INSERT INTO "Payments" (order_id, amount, payment_date, payment_status, notes, created_at, updated_at)
      VALUES (:order_id, :amount, :payment_date, :payment_status, :notes, NOW(), NOW())
      RETURNING *;
    `, {
      replacements: { 
        order_id, 
        amount: parsedAmount, 
        payment_date: payment_date || new Date().toISOString(), 
        payment_status: 'Completed', 
        notes 
      },
      type: sequelize.QueryTypes.INSERT,
      transaction: t,
    });

    const [order] = await sequelize.query(`
      SELECT COALESCE(ROUND(CAST(price * (1 + tax_percentage / 100) AS numeric), 2), 0)::FLOAT AS grand_total, payment_status 
      FROM "Orders" 
      WHERE order_id = :order_id
    `, {
      replacements: { order_id },
      type: sequelize.QueryTypes.SELECT,
      transaction: t,
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ error: 'Order not found' });
    }

    const grandTotal = order.grand_total || 0;

    const [payments] = await sequelize.query(`
      SELECT COALESCE(SUM(amount), 0) AS total_paid 
      FROM "Payments" 
      WHERE order_id = :order_id
    `, {
      replacements: { order_id },
      type: sequelize.QueryTypes.SELECT,
      transaction: t,
    });

    const totalPaid = parseFloat(payments.total_paid) || 0;
    let newPaymentStatus = order.payment_status || 'Pending';

    if (totalPaid > 0 && totalPaid < grandTotal) {
      newPaymentStatus = 'Partial Payment';
    } else if (totalPaid >= grandTotal) {
      newPaymentStatus = 'Full Payment';
    } else {
      newPaymentStatus = 'Pending';
    }

    if (newPaymentStatus !== order.payment_status) {
      await sequelize.query(`
        UPDATE "Orders" 
        SET payment_status = :payment_status, 
            paid_at = CASE WHEN :payment_status = 'Full Payment' THEN NOW() ELSE paid_at END, 
            updated_at = NOW()
        WHERE order_id = :order_id
      `, {
        replacements: { order_id, payment_status: newPaymentStatus },
        type: sequelize.QueryTypes.UPDATE,
        transaction: t,
      });
    }

    await t.commit();
    res.status(201).json(payment);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: 'Failed to record payment', details: error.message });
  }
});

router.get('/payments/:order_id', async (req, res) => {
  const { order_id } = req.params;
  try {
    const payments = await sequelize.query(`
      SELECT * FROM "Payments" WHERE order_id = :order_id ORDER BY payment_date DESC
    `, {
      replacements: { order_id },
      type: sequelize.QueryTypes.SELECT,
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments', details: error.message });
  }
});

module.exports = router;