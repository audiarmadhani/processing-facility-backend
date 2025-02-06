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

    if (!file) {
      console.error('No file uploaded');
      throw new Error('No file uploaded');
    }

    const { path: filePath } = file;

    const batchNumber = body.batchNumber;
    if (!batchNumber) throw new Error('Batch number is required');

    // Set the specific parent folder ID where you want to search/create folders
    const parentFolderId = '1zYmbuJ1jv06E0uHyG3cTf3Vyn5a9OoUP';
    let folderId;

    const folderSearch = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${batchNumber}' and '${parentFolderId}' in parents`,
      fields: 'files(id, name)',
    });

    if (folderSearch.data.files.length > 0) {
      folderId = folderSearch.data.files[0].id;
    } else {
      console.log('Folder not found, creating new folder');
      const folder = await drive.files.create({
        resource: {
          name: batchNumber,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentFolderId], // Set parent folder
        },
        fields: 'id',
      });
      folderId = folder.data.id;
    }

    // Upload file to the folder
    const fileMetadata = {
      name: `${batchNumber}.jpg`, // Use backticks for template literal
      parents: [folderId],
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