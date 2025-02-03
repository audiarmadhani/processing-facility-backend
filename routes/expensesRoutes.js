const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');
const { google } = require('googleapis');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Local upload for temporary storage

// Google Drive setup
const drive = google.drive({
  version: 'v3',
  auth: 'YOUR_GOOGLE_API_KEY', // Use OAuth2 for better security
});

// Route for creating expense data
router.post('/expenses', upload.array('invoices'), async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { type, subType, detail, invoiceAmount, recipient, amountPaid, accountDetails } = req.body;

    // Handle file uploads to Google Drive
    const invoiceFiles = [];

    for (const file of req.files) {
      const fileMetadata = {
        name: file.originalname,
        mimeType: file.mimetype,
      };

      const media = {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.path),
      };

      const driveFile = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id',
      });

      invoiceFiles.push(driveFile.data.id); // Store the Google Drive file ID
    }

    // Save the expense data
    const [expenseData] = await sequelize.query(
      'INSERT INTO "Expenses" ("type", "subType", "detail", "invoiceAmount", "recipient", "amountPaid", "accountDetails", "invoiceFiles") VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      {
        replacements: [type, subType, detail, invoiceAmount, recipient, amountPaid, accountDetails, JSON.stringify(invoiceFiles)],
        transaction: t,
      }
    );

    // Commit the transaction
    await t.commit();

    // Respond with success
    res.status(201).json({
      message: `Expense created successfully`,
      expenseData: expenseData[0], // Return the created record
    });
  } catch (err) {
    // Rollback transaction on error
    await t.rollback();
    console.error('Error creating expense data:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Route for fetching all expense data
router.get('/expenses', async (req, res) => {
  try {
    const [expenses] = await sequelize.query('SELECT * FROM "Expenses" ORDER BY "createdAt" DESC');
    res.json(expenses);
  } catch (err) {
    console.error('Error fetching expense data:', err);
    res.status(500).json({ message: 'Failed to fetch expense data.' });
  }
});

// Route to get expense data by ID
router.get('/expenses/:id', async (req, res) => {
  const { id } = req.params;

  console.log('Received request for Expense ID:', id);

  try {
    const [rows] = await sequelize.query(
      'SELECT * FROM "Expenses" WHERE "id" = ?',
      { replacements: [id] }
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No expense data found for this ID.' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching expense data by ID:', err);
    res.status(500).json({ message: 'Failed to fetch expense data by ID.' });
  }
});

module.exports = router;