const express = require('express');
const { google } = require('googleapis');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const router = express.Router();

require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_API_CLIENT_ID,
  process.env.GOOGLE_API_CLIENT_SECRET,
  process.env.GOOGLE_API_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_API_REFRESH_TOKEN,
});

const drive = google.drive({ version: 'v3', auth: oauth2Client });

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pdf') {
      return cb(new Error('Only PDF files are allowed'), false);
    }
    cb(null, true);
  },
});

const folderIds = {
  shipping: '1funLl0CHam9gVgkYqLUm4j7o3B31Dy29',
  loading: '1l8xw-ROMo0yTqFmhzbTlRpYd9okCb3tY',
  unloading: '1ZCyKgycXLV4m_5PFEImWVTpH8xribNMh',
  harvesting: '1TpYDyUFm06sME58wFwwEk-Xgm4iAhPfm'
};

const getOrCreateSubFolder = async (subFolderName, parentFolderId) => {
  const folderSearch = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='${subFolderName}' and '${parentFolderId}' in parents`,
    fields: 'files(id, name)',
  });

  let folderId;
  if (folderSearch.data.files.length > 0) {
    folderId = folderSearch.data.files[0].id;
  } else {
    console.log(`Creating new folder: ${subFolderName}`);
    const folder = await drive.files.create({
      resource: {
        name: subFolderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId],
      },
      fields: 'id',
    });
    folderId = folder.data.id;
  }
  return folderId;
};

router.post('/upload-invoice', upload.single('file'), async (req, res) => {
  try {
    const { batchNumber, invoiceType } = req.body;
    const file = req.file;

    if (!file || !batchNumber || !invoiceType) {
      return res.status(400).json({ message: 'Missing required fields: batchNumber, invoiceType, or file' });
    }

    const parentFolderId = '1ZCai9GarLHaJwnlB6T9z_d5QYLqsr_p4'; // Parent folder ID
    const subFolderId = folderIds[invoiceType.toLowerCase()] || await getOrCreateSubFolder(invoiceType.charAt(0).toUpperCase() + invoiceType.slice(1), parentFolderId);

    // Check for existing file
    const fileName = file.originalname; // e.g., 2025-06-12-0003-S.pdf
    const searchResponse = await drive.files.list({
      q: `name='${fileName}' and '${subFolderId}' in parents and trashed=false`,
      fields: 'files(id, name)',
    });

    const existingFile = searchResponse.data.files[0];
    let fileId;
    let updated = false;

    const media = {
      mimeType: 'application/pdf',
      body: fs.createReadStream(file.path),
    };

    if (existingFile) {
      // Replace existing file
      const updateResponse = await drive.files.update({
        fileId: existingFile.id,
        media,
        fields: 'id, name, webViewLink',
      });
      fileId = updateResponse.data.id;
      updated = true;
      console.log(`Replaced file ${fileName} with ID ${fileId}`);
    } else {
      // Upload new file
      const fileMetadata = {
        name: fileName,
        parents: [subFolderId],
      };
      const createResponse = await drive.files.create({
        resource: fileMetadata,
        media,
        fields: 'id, name, webViewLink',
      });
      fileId = createResponse.data.id;
      console.log(`Uploaded new file ${fileName} with ID ${fileId}`);
    }

    // Clean up temporary file
    fs.unlinkSync(file.path);

    res.status(200).json({
      message: `Invoice ${updated ? 'updated' : 'uploaded'} successfully`,
      fileId,
      fileName,
      webViewLink: existingFile ? updateResponse?.data.webViewLink : createResponse?.data.webViewLink,
      updated,
    });
  } catch (err) {
    console.error('Error uploading invoice:', err);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Server error', details: err.message });
  }
});

module.exports = router;