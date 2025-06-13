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
  let tempFilePath = null;
  try {
    console.log('Received upload request:', req.body, req.file);
    const { batchNumber, invoiceType } = req.body;
    const file = req.file;

    if (!file || !batchNumber || !invoiceType) {
      return res.status(400).json({ message: 'Missing required fields: batchNumber, invoiceType, or file' });
    }

    tempFilePath = file.path; // Store path for cleanup

    const parentFolderId = '1ZCai9GarLHaJwnlB6T9z_d5QYLqsr_p4';
    const subFolderId = folderIds[invoiceType.toLowerCase()] || await getOrCreateSubFolder(invoiceType.charAt(0).toUpperCase() + invoiceType.slice(1), parentFolderId);
    console.log('Using subFolderId:', subFolderId);

    const fileName = file.originalname;
    console.log(`Searching for existing file: ${fileName}`);
    const searchResponse = await drive.files.list({
      q: `name='${fileName}' and '${subFolderId}' in parents and trashed=false`,
      fields: 'files(id, name)',
    });
    console.log('File search result:', searchResponse.data.files);

    const existingFile = searchResponse.data.files[0];
    let fileId;
    let updated = false;
    let webViewLink;

    const media = {
      mimeType: 'application/pdf',
      body: fs.createReadStream(file.path),
    };

    if (existingFile) {
      console.log(`Updating existing file: ${fileName}, ID: ${existingFile.id}`);
      const updateResponse = await drive.files.update({
        fileId: existingFile.id,
        media,
        fields: 'id, name, webViewLink',
      });
      fileId = updateResponse.data.id;
      webViewLink = updateResponse.data.webViewLink;
      updated = true;
    } else {
      console.log(`Uploading new file: ${fileName}`);
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
      webViewLink = createResponse.data.webViewLink;
    }

    // Clean up temporary file if it exists
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
      console.log(`Deleted temp file: ${tempFilePath}`);
    }
    tempFilePath = null; // Prevent double cleanup

    console.log(`Invoice ${fileName} ${updated ? 'updated' : 'uploaded'} successfully`);

    res.status(200).json({
      message: `Invoice ${updated ? 'updated' : 'uploaded'} successfully`,
      fileId,
      fileName,
      webViewLink,
      updated,
    });
  } catch (err) {
    console.error('Error uploading invoice:', err);
    // Clean up only if file exists and hasn't been deleted
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
      console.log(`Deleted temp file on error: ${tempFilePath}`);
    }
    res.status(500).json({ message: 'Server error', details: err.message });
  }
});

module.exports = router;