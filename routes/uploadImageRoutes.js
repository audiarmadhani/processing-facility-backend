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
  limits: { fileSize: 100 * 1024 * 1024 }, // Set a file size limit (e.g., 100MB)
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
      console.error('Invalid file type');
      return cb(new Error('Only JPG, JPEG, or PNG files are allowed'), false);
    }
    cb(null, true);
  },
});

// POST route for uploading an image
router.post('/upload-image', upload.single('file'), async (req, res) => {
  try {
    console.log('File upload initiated');
    const { file, body } = req;

    // Validate file and batch number
    if (!file) {
      console.error('No file uploaded');
      throw new Error('No file uploaded');
    }
    const { path: filePath } = file;
    const batchNumber = body.batchNumber;
    if (!batchNumber) throw new Error('Batch number is required');

    // Use the specific parent folder ID where all files will be uploaded
    const parentFolderId = '1zYmbuJ1jv06E0uHyG3cTf3Vyn5a9OoUP';

    // Upload file to the parent folder
    const fileMetadata = {
      name: `${batchNumber}.jpg`, // File name based on batch number
      parents: [parentFolderId], // Directly use the parent folder ID
    };
    const media = {
      mimeType: 'image/jpeg',
      body: fs.createReadStream(filePath),
    };

    const uploadedFile = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id, name, webViewLink, webContentLink',
    });

    // Clean up local file
    fs.unlinkSync(filePath);

    res.json({
      message: 'File uploaded successfully!',
      file: uploadedFile.data,
    });
  } catch (error) {
    console.error('Error during file upload:', error);
    // Clean up the file if an error occurs
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to upload file', details: error.message });
  }
});

module.exports = router;