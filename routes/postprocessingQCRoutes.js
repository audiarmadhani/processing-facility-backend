const express = require('express');
const router = express.Router();
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Define PostprocessingData model
const PostprocessingData = sequelize.define(
  'PostprocessingData',
  {
    batchNumber: { type: DataTypes.STRING, primaryKey: true },
    referenceNumber: { type: DataTypes.STRING },
    storedDate: { type: DataTypes.DATE },
    parentBatchNumber: { type: DataTypes.STRING },
    processingType: { type: DataTypes.STRING },
    productLine: { type: DataTypes.STRING },
    producer: { type: DataTypes.STRING },
    type: { type: DataTypes.STRING },
    quality: { type: DataTypes.STRING },
    weight: { type: DataTypes.FLOAT },
    totalBags: { type: DataTypes.INTEGER },
    notes: { type: DataTypes.STRING },
  },
  { tableName: 'PostprocessingData', timestamps: false }
);

// Define PostprocessingQCData model
const PostprocessingQCData = sequelize.define(
  'PostprocessingQCData',
  {
    batchNumber: { type: DataTypes.STRING, primaryKey: true },
    seranggaHidup: { type: DataTypes.BOOLEAN },
    bijiBauBusuk: { type: DataTypes.BOOLEAN },
    kelembapan: { type: DataTypes.FLOAT },
    bijiHitam: { type: DataTypes.INTEGER },
    bijiHitamSebagian: { type: DataTypes.INTEGER },
    bijiHitamPecah: { type: DataTypes.INTEGER },
    kopiGelondong: { type: DataTypes.INTEGER },
    bijiCoklat: { type: DataTypes.INTEGER },
    kulitKopiBesar: { type: DataTypes.INTEGER },
    kulitKopiSedang: { type: DataTypes.INTEGER },
    kulitKopiKecil: { type: DataTypes.INTEGER },
    bijiBerKulitTanduk: { type: DataTypes.INTEGER },
    kulitTandukBesar: { type: DataTypes.INTEGER },
    kulitTandukSedang: { type: DataTypes.INTEGER },
    kulitTandukKecil: { type: DataTypes.INTEGER },
    bijiPecah: { type: DataTypes.INTEGER },
    bijiMuda: { type: DataTypes.INTEGER },
    bijiBerlubangSatu: { type: DataTypes.INTEGER },
    bijiBerlubangLebihSatu: { type: DataTypes.INTEGER },
    bijiBertutul: { type: DataTypes.INTEGER },
    rantingBesar: { type: DataTypes.INTEGER },
    rantingSedang: { type: DataTypes.INTEGER },
    rantingKecil: { type: DataTypes.INTEGER },
    totalBobotKotoran: { type: DataTypes.FLOAT },
    isCompleted: { type: DataTypes.BOOLEAN },
  },
  { tableName: 'PostprocessingQCData', timestamps: true }
);

// Define ReceivingData model (for type fallback)
const ReceivingData = sequelize.define(
  'ReceivingData',
  {
    batchNumber: { type: DataTypes.STRING, primaryKey: true },
    type: { type: DataTypes.STRING },
  },
  { tableName: 'ReceivingData', timestamps: false }
);

// Route for fetching batch details
router.get('/postprocessingqcdata/:batchNumber', async (req, res) => {
  try {
    const { batchNumber } = req.params;
    const batchData = await sequelize.query(
      `SELECT 
         "referenceNumber", 
         DATE("storedDate") AS "storedDate", 
         "processingType", 
         "productLine", 
         "producer", 
         "type", 
         "quality", 
         "weight", 
         "totalBags", 
         "notes" 
       FROM "PostprocessingData" 
       WHERE "batchNumber" = :batchNumber`,
      {
        replacements: { batchNumber },
        type: sequelize.QueryTypes.SELECT,
      }
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

// Route for saving or completing QC data
router.post('/postproqc', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      batchNumber, seranggaHidup, bijiBauBusuk, kelembapan, bijiHitam, bijiHitamSebagian, bijiHitamPecah,
      kopiGelondong, bijiCoklat, kulitKopiBesar, kulitKopiSedang, kulitKopiKecil, bijiBerKulitTanduk,
      kulitTandukBesar, kulitTandukSedang, kulitTandukKecil, bijiPecah, bijiMuda, bijiBerlubangSatu,
      bijiBerlubangLebihSatu, bijiBertutul, rantingBesar, rantingSedang, rantingKecil, totalBobotKotoran,
      isCompleted
    } = req.body;

    const existingQC = await sequelize.query(
      `SELECT * FROM "PostprocessingQCData" WHERE "batchNumber" = :batchNumber`,
      {
        replacements: { batchNumber },
        type: sequelize.QueryTypes.SELECT,
        transaction: t,
      }
    );

    if (existingQC.length > 0) {
      // Update existing record
      await sequelize.query(
        `UPDATE "PostprocessingQCData" 
         SET 
           "seranggaHidup" = :seranggaHidup, 
           "bijiBauBusuk" = :bijiBauBusuk, 
           "kelembapan" = :kelembapan, 
           "bijiHitam" = :bijiHitam, 
           "bijiHitamSebagian" = :bijiHitamSebagian, 
           "bijiHitamPecah" = :bijiHitamPecah,
           "kopiGelondong" = :kopiGelondong, 
           "bijiCoklat" = :bijiCoklat, 
           "kulitKopiBesar" = :kulitKopiBesar, 
           "kulitKopiSedang" = :kulitKopiSedang, 
           "kulitKopiKecil" = :kulitKopiKecil, 
           "bijiBerKulitTanduk" = :bijiBerKulitTanduk,
           "kulitTandukBesar" = :kulitTandukBesar, 
           "kulitTandukSedang" = :kulitTandukSedang, 
           "kulitTandukKecil" = :kulitTandukKecil, 
           "bijiPecah" = :bijiPecah, 
           "bijiMuda" = :bijiMuda, 
           "bijiBerlubangSatu" = :bijiBerlubangSatu,
           "bijiBerlubangLebihSatu" = :bijiBerlubangLebihSatu, 
           "bijiBertutul" = :bijiBertutul, 
           "rantingBesar" = :rantingBesar, 
           "rantingSedang" = :rantingSedang, 
           "rantingKecil" = :rantingKecil, 
           "totalBobotKotoran" = :totalBobotKotoran,
           "isCompleted" = :isCompleted, 
           "updatedAt" = CURRENT_TIMESTAMP
         WHERE "batchNumber" = :batchNumber`,
        {
          replacements: {
            batchNumber, seranggaHidup, bijiBauBusuk, kelembapan, bijiHitam, bijiHitamSebagian, bijiHitamPecah,
            kopiGelondong, bijiCoklat, kulitKopiBesar, kulitKopiSedang, kulitKopiKecil, bijiBerKulitTanduk,
            kulitTandukBesar, kulitTandukSedang, kulitTandukKecil, bijiPecah, bijiMuda, bijiBerlubangSatu,
            bijiBerlubangLebihSatu, bijiBertutul, rantingBesar, rantingSedang, rantingKecil, totalBobotKotoran,
            isCompleted,
          },
          type: sequelize.QueryTypes.UPDATE,
          transaction: t,
        }
      );
    } else {
      // Insert new record
      await sequelize.query(
        `INSERT INTO "PostprocessingQCData" 
         ("batchNumber", "seranggaHidup", "bijiBauBusuk", "kelembapan", "bijiHitam", "bijiHitamSebagian", "bijiHitamPecah",
         "kopiGelondong", "bijiCoklat", "kulitKopiBesar", "kulitKopiSedang", "kulitKopiKecil", "bijiBerKulitTanduk",
         "kulitTandukBesar", "kulitTandukSedang", "kulitTandukKecil", "bijiPecah", "bijiMuda", "bijiBerlubangSatu",
         "bijiBerlubangLebihSatu", "bijiBertutul", "rantingBesar", "rantingSedang", "rantingKecil", "totalBobotKotoran", 
         "isCompleted", "createdAt", "updatedAt")
         VALUES (:batchNumber, :seranggaHidup, :bijiBauBusuk, :kelembapan, :bijiHitam, :bijiHitamSebagian, :bijiHitamPecah,
         :kopiGelondong, :bijiCoklat, :kulitKopiBesar, :kulitKopiSedang, :kulitKopiKecil, :bijiBerKulitTanduk,
         :kulitTandukBesar, :kulitTandukSedang, :kulitTandukKecil, :bijiPecah, :bijiMuda, :bijiBerlubangSatu,
         :bijiBerlubangLebihSatu, :bijiBertutul, :rantingBesar, :rantingSedang, :rantingKecil, :totalBobotKotoran, 
         :isCompleted, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        {
          replacements: {
            batchNumber, seranggaHidup, bijiBauBusuk, kelembapan, bijiHitam, bijiHitamSebagian, bijiHitamPecah,
            kopiGelondong, bijiCoklat, kulitKopiBesar, kulitKopiSedang, kulitKopiKecil, bijiBerKulitTanduk,
            kulitTandukBesar, kulitTandukSedang, kulitTandukKecil, bijiPecah, bijiMuda, bijiBerlubangSatu,
            bijiBerlubangLebihSatu, bijiBertutul, rantingBesar, rantingSedang, rantingKecil, totalBobotKotoran,
            isCompleted,
          },
          type: sequelize.QueryTypes.INSERT,
          transaction: t,
        }
      );
    }

    await t.commit();
    res.status(201).json({ message: isCompleted ? 'QC completed successfully' : 'QC data saved successfully' });
  } catch (err) {
    await t.rollback();
    console.error('Error saving QC data:', err);
    res.status(500).json({ message: 'Failed to save QC data' });
  }
});

// Route for fetching completed QC data (isCompleted = true)
router.get('/postproqcfin', async (req, res) => {
  try {
    const qcData = await sequelize.query(`
      WITH MAIN AS (
        SELECT 
          a.*,
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
            "kulitKopiKecil"*0.2 +
            "bijiBerKulitTanduk"*0.5 +
            "kulitTandukBesar"*0.5 +
            "kulitTandukSedang"*0.2 +
            "kulitTandukKecil"*0.1 +
            "bijiPecah"*0.2 +
            "bijiMuda"*0.2 +
            "bijiBerlubangSatu"*0.1 +
            "bijiBerlubangLebihSatu"*0.2 +
            "bijiBertutul"*0.1 +
            "rantingBesar"*5 +
            "rantingSedang"*2 +
            "rantingKecil"*1
          )::float AS "defectScore",
          ROUND(CAST(("totalBobotKotoran" / 300.0) * 100 AS numeric), 1)::FLOAT AS "defectWeightPercentage"
        FROM "PostprocessingQCData" a
        WHERE a."isCompleted" = true
      )

      SELECT 
        a."batchNumber",
        b."referenceNumber",
        DATE(b."storedDate") AS "storedDate",
        DATE(a."createdAt") AS "qcDate",
        a."generalQuality",
        CASE
          WHEN a."defectScore" <= 5 THEN 'Specialty'
          WHEN a."defectScore" <= 11 THEN 'Grade 1'
          WHEN a."defectScore" <= 25 THEN 'Grade 2'
          WHEN a."defectScore" <= 44 THEN 'Grade 3'
          WHEN a."defectScore" <= 60 THEN 'Grade 4a'
          WHEN a."defectScore" <= 80 THEN 'Grade 4b'
          WHEN a."defectScore" <= 150 THEN 'Grade 5'
          WHEN a."defectScore" <= 225 THEN 'Grade 6'
          ELSE 'Unknown'
        END AS "actualGrade",
        a.kelembapan,
        a."seranggaHidup",
        a."bijiBauBusuk",
        a."defectScore",
        a."totalBobotKotoran",
        a."defectWeightPercentage",
        a."bijiHitam",
        a."bijiHitamSebagian",
        a."bijiHitamPecah",
        a."kopiGelondong",
        a."bijiCoklat",
        a."kulitKopiBesar",
        a."kulitKopiSedang",
        a."kulitKopiKecil",
        a."bijiBerKulitTanduk",
        a."kulitTandukBesar",
        a."kulitTandukSedang",
        a."kulitTandukKecil",
        a."bijiPecah",
        a."bijiMuda",
        a."bijiBerlubangSatu",
        a."bijiBerlubangLebihSatu",
        a."bijiBertutul",
        a."rantingBesar",
        a."rantingSedang",
        a."rantingKecil"
      FROM MAIN a
      LEFT JOIN "PostprocessingData" b ON a."batchNumber" = b."batchNumber"
      ORDER BY a."createdAt" DESC;
    `, { type: sequelize.QueryTypes.SELECT });

    res.json(qcData);
  } catch (err) {
    console.error('Error fetching completed QC data:', err);
    res.status(500).json({ message: 'Failed to fetch completed QC data' });
  }
});

// Route for fetching batches that have not been QCed (or not fully completed)
router.get('/postprocessing/not-qced', async (req, res) => {
  try {
    const notQcedData = await sequelize.query(`
      SELECT 
        p."batchNumber",
        p."referenceNumber",
        DATE(p."storedDate") AS "storedDate",
        p."processingType",
        p."productLine",
        p."producer",
        COALESCE(p."type", rd."type") AS "type",
        p."quality",
        p."weight",
        p."totalBags",
        p."notes",
        CASE 
          WHEN q."batchNumber" IS NULL THEN 'QC Not Started'
          WHEN q."isCompleted" = false THEN 'QC Started'
          ELSE 'QC Completed'
        END AS "status"
      FROM "PostprocessingData" p
      LEFT JOIN "PostprocessingQCData" q ON p."batchNumber" = q."batchNumber"
      LEFT JOIN "ReceivingData" rd ON p."parentBatchNumber" = rd."batchNumber"
      WHERE q."batchNumber" IS NULL OR q."isCompleted" = false
      ORDER BY p."storedDate" DESC;
    `, { type: sequelize.QueryTypes.SELECT });

    res.json(notQcedData);
  } catch (err) {
    console.error('Error fetching not QCed batches:', err);
    res.status(500).json({ message: 'Failed to fetch not QCed batches' });
  }
});

// Route for fetching existing QC data for a batch (for loading partial saves)
router.get('/postproqc/:batchNumber', async (req, res) => {
  try {
    const { batchNumber } = req.params;
    const qcData = await sequelize.query(
      `SELECT * FROM "PostprocessingQCData" WHERE "batchNumber" = :batchNumber`,
      {
        replacements: { batchNumber },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (qcData.length === 0) {
      return res.json(null);
    }
    res.json(qcData[0]);
  } catch (err) {
    console.error('Error fetching QC data for batch:', err);
    res.status(500).json({ message: 'Failed to fetch QC data for batch' });
  }
});

module.exports = router;