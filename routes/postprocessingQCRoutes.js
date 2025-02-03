const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

// Route for fetching batch details
router.get('/postprocessing/:batchNumber', async (req, res) => {
  try {
    const { batchNumber } = req.params;

    const [batchData] = await sequelize.query(
      'SELECT "referenceNumber", "storedDate", "processingType", "productLine", producer, type, quality, "weight", "totalBags", notes FROM "PostprocessingData" WHERE "batchNumber" = ?',
      { replacements: [batchNumber] }
    );

    if (!batchData.length) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    res.json(batchData[0]);
  } catch (err) {
    console.error('Error fetching batch details:', err);
    res.status(500).json({ message: 'Failed to fetch batch details' });
  }
});

// Route for posting QC data
router.post('/postproqc', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      batchNumber, seranggaHidup, bijiBauBusuk, kelembapan, bijiHitam, bijiHitamSebagian, bijiHitamPecah,
      kopiGelondong, bijiCoklat, kulitKopiBesar, kulitKopiSedang, kulitKopiKecil, bijiBerKulitTanduk,
      kulitTandukBesar, kulitTandukSedang, kulitTandukKecil, bijiPecah, bijiMuda, bijiBerlubangSatu,
      bijiBerlubangLebihSatu, bijiBertutul, rantingBesar, rantingSedang, rantingKecil, totalBobotKotoran
    } = req.body;

    await sequelize.query(
      `INSERT INTO "PostprocessingQCData" 
      ("batchNumber", "seranggaHidup", "bijiBauBusuk", "kelembapan", "bijiHitam", "bijiHitamSebagian", "bijiHitamPecah",
      "kopiGelondong", "bijiCoklat", "kulitKopiBesar", "kulitKopiSedang", "kulitKopiKecil", "bijiBerKulitTanduk",
      "kulitTandukBesar", "kulitTandukSedang", "kulitTandukKecil", "bijiPecah", "bijiMuda", "bijiBerlubangSatu",
      "bijiBerlubangLebihSatu", "bijiBertutul", "rantingBesar", "rantingSedang", "rantingKecil", "totalBobotKotoran")
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          batchNumber, seranggaHidup, bijiBauBusuk, kelembapan, bijiHitam, bijiHitamSebagian, bijiHitamPecah,
          kopiGelondong, bijiCoklat, kulitKopiBesar, kulitKopiSedang, kulitKopiKecil, bijiBerKulitTanduk,
          kulitTandukBesar, kulitTandukSedang, kulitTandukKecil, bijiPecah, bijiMuda, bijiBerlubangSatu,
          bijiBerlubangLebihSatu, bijiBertutul, rantingBesar, rantingSedang, rantingKecil, totalBobotKotoran
        ],
        transaction: t
      }
    );

    await t.commit();
    res.status(201).json({ message: 'QC data added successfully' });
  } catch (err) {
    await t.rollback();
    console.error('Error saving QC data:', err);
    res.status(500).json({ message: 'Failed to save QC data' });
  }
});

// Route for fetching all QC data
router.get('/postproqc', async (req, res) => {
  try {
    const [qcData] = await sequelize.query('SELECT * FROM "PostprocessingQCData" ORDER BY "createdAt" DESC');
    res.json(qcData);
  } catch (err) {
    console.error('Error fetching QC data:', err);
    res.status(500).json({ message: 'Failed to fetch QC data' });
  }
});

module.exports = router;