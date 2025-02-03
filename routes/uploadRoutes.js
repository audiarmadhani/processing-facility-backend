const express = require('express');
const { google } = require('googleapis');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const router = express.Router();

require('dotenv').config(); // Load environment variables

// Set up Google OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_API_CLIENT_ID,
  process.env.GOOGLE_API_CLIENT_SECRET,
  process.env.GOOGLE_API_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_API_REFRESH_TOKEN,
});

const drive = google.drive({ version: 'v3', auth: oauth2Client });

// Configure Multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // Set a file size limit (e.g., 5MB)
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.pdf'].includes(ext)) {
      console.error('Invalid file type');
      return cb(new Error('Only JPG, JPEG, PNG, or PDF files are allowed'), false);
    }
    cb(null, true);
  },
});

// Route for creating expenses data
router.post('/expenses', upload.array('invoices'), async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { type, subType, expensesDetail, invoiceAmount, invoiceRecipient, amountPaid, accountDetails, year } = req.body;

    // Save expenses data to the database
    const [expensesData] = await sequelize.query(
      'INSERT INTO "Expenses" (type, "subType", "expensesDetail", "invoiceAmount", "invoiceRecipient", "amountPaid", "accountDetails") VALUES (?, ?, ?, ?, ?, ?, ?)',
      {
        replacements: [type, subType, expensesDetail, invoiceAmount, invoiceRecipient, amountPaid, accountDetails],
        transaction: t,
      }
    );

    // Upload files to Google Drive
    const folderId = await getOrCreateYearFolder(year);
    const fileIds = await uploadFilesToDrive(req.files, folderId);

    // Commit the transaction
    await t.commit();

    res.status(201).json({
      message: 'Expenses data created successfully',
      expensesData: expensesData[0], // Return the created record
      fileIds,
    });
  } catch (err) {
    // Rollback transaction on error
    await t.rollback();
    console.error('Error creating expenses data:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Function to get or create a folder for the given year
const getOrCreateYearFolder = async (year) => {
  const parentFolderId = '1KiEixsrplWdKad-CJiSdOUnP_mlEBlxx'; // Your parent folder ID

  const folderSearch = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='${year}' and '${parentFolderId}' in parents`,
    fields: 'files(id, name)',
  });

  let folderId;
  if (folderSearch.data.files.length > 0) {
    folderId = folderSearch.data.files[0].id;
  } else {
    console.log('Folder not found, creating new folder');
    const folder = await drive.files.create({
      resource: {
        name: year,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId], // Set parent folder
      },
      fields: 'id',
    });
    folderId = folder.data.id;
  }
  return folderId;
};

// Function to upload files to Google Drive
const uploadFilesToDrive = async (files, folderId) => {
  const fileIds = [];
  for (const file of files) {
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

    // Clean up local file
    fs.unlinkSync(file.path);
    fileIds.push(uploadedFile.data.id);
  }
  return fileIds;
};

// Route for fetching all expenses data
router.get('/expenses', async (req, res) => {
  try {
    const [expenses] = await sequelize.query('SELECT * FROM "Expenses" ORDER BY "createdAt" DESC');
    res.json(expenses);
  } catch (err) {
    console.error('Error fetching expenses data:', err);
    res.status(500).json({ message: 'Failed to fetch expenses data.' });
  }
});

module.exports = router;