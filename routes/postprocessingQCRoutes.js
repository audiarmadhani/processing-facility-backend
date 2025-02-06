const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

// Route for fetching batch details
router.get('/postprocessing/:batchNumber', async (req, res) => {
  try {
    const { batchNumber } = req.params;

    const [batchData] = await sequelize.query(
      'SELECT "referenceNumber", DATE("storedDate") "storedDate", "processingType", "productLine", producer, type, quality, "weight", "totalBags", notes FROM "PostprocessingData" WHERE "batchNumber" = ?',
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
    const [qcData] = await sequelize.query('SELECT a.*, DATE("createdAt") "createdAtTrunc" FROM "PostprocessingQCData" a ORDER BY a."createdAt" DESC');
    res.json(qcData);
  } catch (err) {
    console.error('Error fetching QC data:', err);
    res.status(500).json({ message: 'Failed to fetch QC data' });
  }
});

// Route for fetching all QC data
router.get('/postproqcfin', async (req, res) => {
    try {
      const [qcData] = await sequelize.query(`
        WITH MAIN AS (
            SELECT 
                a.* ,
                CASE
                WHEN "seranggaHidup" = true THEN 'Rejected, insect'
                WHEN "bijiBauBusuk" = true THEN 'Rejected, rotten smell'
                WHEN kelembapan >= 20 THEN 'Rejected, high moisture'
                WHEN ("totalBobotKotoran"/300)*100 >= 20 THEN 'Rejected, defect weight too much'
                ELSE 'Approved'
                END AS "generalQuality",
                (
                "bijiHitam"*1 + 
                "bijiHitamSebagian"*0.5 +
                "bijiHitamPecah"*0.5 +
                "kopiGelondong"*1 +
                "bijiCoklat"*0.25 +
                "kulitKopiBesar"*1 +
                "kulitKopiSedang"*0.5 +
                "kulitKopiKecil" * 0.2 +
                "bijiBerKulitTanduk" * 0.5 +
                "kulitTandukBesar" * 0.5 +
                "kulitTandukSedang" * 0.2 +
                "kulitTandukKecil" * 0.1 +
                "bijiPecah" * 0.2 +
                "bijiMuda" * 0.2 +
                "bijiBerlubangSatu" * 0.1 +
                "bijiBerlubangLebihSatu" * 0.2 +
                "bijiBertutul" * 0.1 +
                "rantingBesar" * 5 +
                "rantingSedang" * 2 +
                "rantingKecil" * 1
                )::float AS "defectScore",
                ROUND(CAST(("totalBobotKotoran" / 300.0) * 100 AS numeric), 1)::FLOAT AS "defectWeightPercentage"
            FROM "PostprocessingQCData" a
            )

            SELECT 
            a."batchNumber",
            b."referenceNumber",
            DATE(b."storedDate") "storedDate",
            DATE(a."createdAt") "qcDate",
            "generalQuality",
            CASE
                WHEN "defectScore" <= 5 THEN 'Specialty'
                WHEN "defectScore" <= 11 THEN 'Grade 1'
                WHEN "defectScore" <= 25 THEN 'Grade 2'
                WHEN "defectScore" <= 44 THEN 'Grade 3'
                WHEN "defectScore" <= 60 THEN 'Grade 4a'
                WHEN "defectScore" <= 80 THEN 'Grade 4b'
                WHEN "defectScore" <= 150 THEN 'Grade 5'
                WHEN "defectScore" <= 225 THEN 'Grade 6'
            ELSE 'Unknown'
            END AS "actualGrade",
            kelembapan,
            "seranggaHidup",
            "bijiBauBusuk",
            "defectScore",
            "totalBobotKotoran",
            "defectWeightPercentage",
            "bijiHitam",
            "bijiHitamSebagian",
            "bijiPecah",
            "kopiGelondong",
            "bijiCoklat",
            "kulitKopiBesar",
            "kulitKopiSedang",
            "kulitKopiKecil",
            "bijiBerKulitTanduk",
            "kulitTandukBesar",
            "kulitTandukSedang",
            "kulitTandukKecil",
            "bijiPecah",
            "bijiMuda",
            "bijiBerlubangSatu",
            "bijiBerlubangLebihSatu",
            "bijiBertutul",
            "rantingBesar",
            "rantingSedang",
            "rantingKecil"
            FROM MAIN a
            LEFT JOIN "PostprocessingData" b on a."batchNumber" = b."batchNumber";
        `);
      res.json(qcData);
    } catch (err) {
      console.error('Error fetching QC data:', err);
      res.status(500).json({ message: 'Failed to fetch QC data' });
    }
  });

module.exports = router;