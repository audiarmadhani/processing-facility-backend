const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');
const { google } = require('googleapis');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

// Google Drive OAuth2 Setup (reused from your code)
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_API_CLIENT_ID,
  process.env.GOOGLE_API_CLIENT_SECRET,
  process.env.GOOGLE_API_REDIRECT_URI
);
oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_API_REFRESH_TOKEN });
const drive = google.drive({ version: 'v3', auth: oauth2Client });

// Multer configuration (reused from your code)
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

// Google Drive Folder IDs (replace with your actual folder IDs)
const folderIds = {
  'SPB': '1IlyAX9P8JbcCgPppftXPf-8W7Axai3MF',
  'SPK': '1Wzf31eoapE8CjPFd_WKCJgjh-v_LaXRP',
  'SPM': '18Z7ouAVOwPqOF-7sf3YYlyhXX1168Y0Z',
  'DO': '15YAWgvww1y3kzczT1rvB5vy8Ub1pUcMP',
  'Surat Jalan': '1CWDcsME8_iEIwcPbpu33CC_j4JhwF-rP',
  'BAST': '1Wyj0IS94IDSLU-_-vzG23F54uXf33KnD',
  'Order List': '1Ykw1OnktdPiG50vhF4GFcpou7cF8fyFP',
};

// Reused upload function (adapted for OMS)
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

// --- Customers Routes ---

// Get all customers
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

// Add a new customer
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

// --- Drivers Routes ---

// Get all drivers
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

// Add a new driver
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

// Get all orders with associated items
router.get('/orders', async (req, res) => {
  try {
    const orders = await sequelize.query(`
      SELECT 
        o.order_id, 
        o.customer_id, 
        o.driver_id, 
        o.shipping_method, 
        o.status, 
        o.created_at::DATE, 
        o.updated_at::DATE, 
        o.driver_details, 
        COALESCE(o.price::FLOAT, 0) price, 
        COALESCE(o.tax_percentage::FLOAT, 0) tax_percentage, 
        COALESCE(ROUND(CAST(o.price * o.tax_percentage / 100 AS numeric), 2), 0)::FLOAT AS tax, 
        COALESCE(ROUND(CAST(o.price * (1 + o.tax_percentage / 100) AS numeric), 2), 0)::FLOAT AS grand_total, 
        c.name AS customer_name, 
        c.address AS customer_address, 
        c.phone AS customer_phone, 
        c.email AS customer_email, 
        c.country AS customer_country, 
        c.state AS customer_state, 
        c.city AS customer_city, 
        c.zip_code AS customer_zip_code, 
        d.name AS driver_name, 
        d.vehicle_number AS driver_vehicle_number, 
        d.vehicle_type AS driver_vehicle_type, 
        d.max_capacity AS driver_max_capacity,
        o.process_at,
        o.reject_at,
        o.ready_at,
        o.ship_at,
        o.arrive_at,
        o.paid_at
      FROM "Orders" o
      LEFT JOIN "Customers" c ON o.customer_id = c.customer_id
      LEFT JOIN "Drivers" d ON o.driver_id = d.driver_id
      ORDER BY o.created_at DESC
    `, {
      type: sequelize.QueryTypes.SELECT,
    });

    // Fetch order items for each order
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

// Get a specific order with associated items
router.get('/orders/:order_id', async (req, res) => {
  const { order_id } = req.params;
  try {
    const order = await sequelize.query(`
      SELECT 
        o.order_id, 
        o.customer_id, 
        o.driver_id, 
        o.shipping_method, 
        o.status, 
        o.created_at::DATE, 
        o.updated_at::DATE, 
        o.driver_details, 
        COALESCE(o.price::FLOAT, 0) price, 
        COALESCE(o.tax_percentage::FLOAT, 0) tax_percentage, 
        COALESCE(ROUND(CAST(o.price * o.tax_percentage / 100 AS numeric), 2), 0)::FLOAT AS tax, 
        COALESCE(ROUND(CAST(o.price * (1 + o.tax_percentage / 100) AS numeric), 2), 0)::FLOAT AS grand_total, 
        c.name AS customer_name, 
        c.address AS customer_address, 
        c.phone AS customer_phone, 
        c.email AS customer_email, 
        c.country AS customer_country, 
        c.state AS customer_state, 
        c.city AS customer_city, 
        c.zip_code AS customer_zip_code, 
        d.name AS driver_name, 
        d.vehicle_number AS driver_vehicle_number, 
        d.vehicle_type AS driver_vehicle_type, 
        d.max_capacity AS driver_max_capacity,
        o.process_at,
        o.reject_at,
        o.ready_at,
        o.ship_at,
        o.arrive_at,
        o.paid_at
      FROM "Orders" o
      LEFT JOIN "Customers" c ON o.customer_id = c.customer_id
      LEFT JOIN "Drivers" d ON o.driver_id = d.driver_id
      WHERE o.order_id = :order_id
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

// Create a new order with SPB upload and associated order items
router.post('/orders', upload.single('spb_file'), async (req, res) => {
  const t = await sequelize.transaction();
  try {
    let { customer_id, driver_id, shipping_method, driver_details, price, tax_percentage, items } = req.body;

    // Handle items as a JSON string (sent from FormData)
    if (items && typeof items === 'string') {
      try {
        items = JSON.parse(items); // Parse the JSON string into an array
      } catch (error) {
        await t.rollback();
        return res.status(400).json({ error: 'Invalid items format: must be a valid JSON array', details: error.message });
      }
    } else if (!items || !Array.isArray(items)) {
      items = []; // Default to empty array if not provided or invalid
    }

    if (!customer_id || !shipping_method) {
      await t.rollback();
      return res.status(400).json({ error: 'customer_id and shipping_method are required' });
    }

    // Validate and parse numeric fields
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

    // Create the order
    const [order] = await sequelize.query(`
      INSERT INTO "Orders" (customer_id, driver_id, shipping_method, driver_details, price, tax_percentage, created_at, updated_at, status)
      VALUES (:customer_id, :driver_id, :shipping_method, :driver_details, :price, :tax_percentage, NOW(), NOW(), :status)
      RETURNING *;
    `, {
      replacements: { 
        customer_id, 
        driver_id: shipping_method === 'Self' ? driver_id : null, 
        shipping_method, 
        driver_details: shipping_method === 'Customer' ? JSON.stringify(driver_details) : null, 
        price: parsedPrice, 
        tax_percentage: parsedTaxPercentage,
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

    // Create order items
    if (!items.length) {
      await t.rollback();
      return res.status(400).json({ error: 'At least one item is required for the order' });
    }

    for (const item of items) {
      const itemPrice = parseFloat(item.price) || 0;
      const itemQuantity = parseFloat(item.quantity) || 0;

      if (isNaN(itemPrice) || itemPrice < 0 || isNaN(itemQuantity) || itemQuantity < 0) {
        await t.rollback();
        return res.status(400).json({ error: 'Invalid item price or quantity: must be non-negative numbers' });
      }

      await sequelize.query(`
        INSERT INTO "OrderItems" (order_id, product, quantity, price, created_at)
        VALUES (:order_id, :product, :quantity, :price, NOW())
      `, {
        replacements: { 
          order_id: orderId, // Use the captured order_id
          product: item.product, 
          quantity: itemQuantity, 
          price: itemPrice 
        },
        transaction: t,
      });
    }

    // Upload SPB file to Google Drive (if provided)
    let spbUrl = null;
    if (req.file) {
      spbUrl = await uploadFileToDrive(req.file, folderIds['SPB']);
      await sequelize.query(`
        INSERT INTO "Documents" (order_id, type, drive_url, created_at)
        VALUES (:order_id, 'SPB', :drive_url, NOW());
      `, {
        replacements: { order_id: orderId, drive_url: spbUrl }, // Use the captured order_id
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

// Update order status or details, including items
router.put('/orders/:order_id', upload.single('spb_file'), async (req, res) => {
  const { order_id } = req.params;
  const t = await sequelize.transaction();
  try {
    let { customer_id, driver_id, shipping_method, driver_details, price, tax_percentage, items, status } = req.body;

    // Handle items as a JSON string (sent from FormData)
    if (items && typeof items === 'string') {
      try {
        items = JSON.parse(items); // Parse the JSON string into an array
      } catch (error) {
        await t.rollback();
        return res.status(400).json({ error: 'Invalid items format: must be a valid JSON array', details: error.message });
      }
    } else if (!items || !Array.isArray(items)) {
      items = []; // Default to empty array if not provided or invalid
    }

    if (!customer_id || !shipping_method) {
      await t.rollback();
      return res.status(400).json({ error: 'customer_id and shipping_method are required' });
    }

    // Validate and parse numeric fields
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

    // Fetch the current order to check its existing status for validation
    const existingOrder = await sequelize.query(`
      SELECT status, process_at, reject_at, ready_at, ship_at, arrive_at, paid_at 
      FROM "Orders" 
      WHERE order_id = :order_id
    `, {
      replacements: { order_id },
      type: sequelize.QueryTypes.SELECT,
      transaction: t,
    });

    if (!existingOrder.length) {
      await t.rollback();
      return res.status(404).json({ error: 'Order not found' });
    }

    const currentStatus = existingOrder[0].status;

    // Define valid status transitions
    const validStatusTransitions = {
      Pending: ['Processing', 'Rejected'],
      Processing: ['Ready for Shipment', 'Rejected'],
      'Ready for Shipment': ['In Transit', 'Rejected'],
      'In Transit': ['Delivered', 'Rejected'],
      Delivered: ['Paid'],
      Rejected: [], // No further transitions allowed
      Paid: [], // No further transitions allowed
    };

    if (!validStatusTransitions[currentStatus]?.includes(status)) {
      await t.rollback();
      return res.status(400).json({ error: 'Invalid status transition' });
    }

    // Prepare the update data
    let updateData = {
      customer_id,
      driver_id: shipping_method === 'Self' ? driver_id : null, // Only for Self-Arranged
      shipping_method,
      driver_details: shipping_method === 'Customer' ? JSON.stringify(driver_details) : null,
      price: parsedPrice,
      tax_percentage: parsedTaxPercentage,
      updated_at: new Date(), // Update updated_at with current timestamp
    };

    // Determine the new status and update the corresponding timestamp
    let timestampUpdate = {};
    switch (status) {
      case 'Processing':
        timestampUpdate.process_at = new Date();
        break;
      case 'Rejected':
        timestampUpdate.reject_at = new Date();
        break;
      case 'Ready for Shipment':
        timestampUpdate.ready_at = new Date();
        break;
      case 'In Transit':
        timestampUpdate.ship_at = new Date();
        break;
      case 'Delivered':
        timestampUpdate.arrive_at = new Date();
        break;
      case 'Paid':
        timestampUpdate.paid_at = new Date();
        break;
      default:
        break;
    }

    // Merge timestamp updates with other updates
    updateData = { ...updateData, ...timestampUpdate, status: status || currentStatus };

    // Update the order in the database
    const [updatedOrder] = await sequelize.query(`
      UPDATE "Orders"
      SET customer_id = :customer_id, 
          driver_id = :driver_id, 
          shipping_method = :shipping_method, 
          driver_details = :driver_details, 
          price = :price, 
          tax_percentage = :tax_percentage, 
          status = :status, 
          process_at = :process_at, 
          reject_at = :reject_at, 
          ready_at = :ready_at, 
          ship_at = :ship_at, 
          arrive_at = :arrive_at, 
          paid_at = :paid_at, 
          updated_at = NOW()
      WHERE order_id = :order_id
      RETURNING *;
    `, {
      replacements: { 
        order_id, 
        customer_id, 
        driver_id: updateData.driver_id, 
        shipping_method, 
        driver_details: updateData.driver_details, 
        price: parsedPrice, 
        tax_percentage: parsedTaxPercentage,
        status: updateData.status,
        process_at: updateData.process_at || null,
        reject_at: updateData.reject_at || null,
        ready_at: updateData.ready_at || null,
        ship_at: updateData.ship_at || null,
        arrive_at: updateData.arrive_at || null,
        paid_at: updateData.paid_at || null,
        updated_at: updateData.updated_at,
      },
      transaction: t,
      type: sequelize.QueryTypes.UPDATE,
    });

    if (!updatedOrder) {
      await t.rollback();
      return res.status(404).json({ error: 'Order not found' });
    }

    // Handle order items (delete existing, then insert new)
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
          INSERT INTO "OrderItems" (order_id, product, quantity, price, created_at)
          VALUES (:order_id, :product, :quantity, :price, NOW())
        `, {
          replacements: { 
            order_id, 
            product: item.product, 
            quantity: itemQuantity, 
            price: itemPrice 
          },
          transaction: t,
        });
      }
    }

    // Upload SPB file to Google Drive (if provided)
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

// --- OrderItems Routes ---

// Get all items for an order
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

// Create a new order item
router.post('/order-items', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { order_id, product, quantity, price } = req.body;
    if (!order_id || !product || !quantity || !price) {
      await t.rollback();
      return res.status(400).json({ error: 'order_id, product, quantity, and price are required' });
    }

    // Parse and validate numeric fields (handling strings from frontend)
    const parsedQuantity = parseFloat(quantity) || 0;
    const parsedPrice = parseFloat(price) || 0;

    if (isNaN(parsedQuantity) || parsedQuantity < 0 || isNaN(parsedPrice) || parsedPrice < 0) {
      await t.rollback();
      return res.status(400).json({ error: 'Invalid quantity or price: must be non-negative numbers' });
    }

    // Check if the order exists
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

// Update an existing order item
router.put('/order-items/:order_item_id', async (req, res) => {
  const { order_item_id } = req.params;
  const { product, quantity, price } = req.body;
  try {
    // Parse and validate numeric fields (handling strings from frontend)
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

// Delete an order item
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

// --- Documents Routes ---

// Upload document (SPK, SPM, DO, Surat Jalan, BAST, Order List)
router.post('/documents/upload', upload.single('file'), async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { order_id, type, details } = req.body;
    if (!order_id || !type || !req.file) {
      await t.rollback();
      return res.status(400).json({ error: 'order_id, type, and file are required' });
    }

    // Parse and validate order_id as an integer
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

// Get documents for an order
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

module.exports = router;