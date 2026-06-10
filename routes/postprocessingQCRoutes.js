const express = require('express');
const router = express.Router();
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const multer = require("multer");
const fs = require("fs");
const { google } = require("googleapis");

const upload = multer({ dest: "uploads/" });
const { fermentationExperimentJoin } = require('../utils/fermentationExperiment');

const VALID_CUPPING_OUTCOMES = ['Production', 'Good', 'Redo', 'Not Good'];

function normalizeCuppingOutcome(value) {
  if (value == null || value === '') return null;
  const trimmed = String(value).trim();
  return VALID_CUPPING_OUTCOMES.includes(trimmed) ? trimmed : null;
}

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
    tastingNotes: { type: DataTypes.TEXT },
    okForFurtherProcess: { type: DataTypes.BOOLEAN },
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

async function syncCuppingEntries(batchNumber, cuppingEntries, cuppedBy, transaction) {
  if (!Array.isArray(cuppingEntries)) {
    return;
  }

  const normalized = cuppingEntries
    .map((entry) => {
      let cuppingOutcome = normalizeCuppingOutcome(entry.cuppingOutcome);
      if (!cuppingOutcome && entry.okForFurtherProcess != null) {
        cuppingOutcome =
          entry.okForFurtherProcess === true || entry.okForFurtherProcess === 'true'
            ? 'Good'
            : 'Not Good';
      }
      return {
        id: entry.id != null && entry.id !== '' ? Number(entry.id) : null,
        cuppedAt: entry.cuppedAt || null,
        notes: typeof entry.notes === 'string' ? entry.notes.trim() : '',
        cuppingOutcome,
      };
    })
    .filter(
      (entry) =>
        entry.cuppedAt &&
        entry.notes !== '' &&
        entry.cuppingOutcome !== null
    );

  const keepIds = normalized.filter((entry) => Number.isInteger(entry.id)).map((entry) => entry.id);

  if (keepIds.length > 0) {
    await sequelize.query(
      `DELETE FROM "GbQcCuppingLog"
       WHERE "batchNumber" = :batchNumber
         AND id NOT IN (:keepIds)`,
      {
        replacements: { batchNumber, keepIds },
        type: sequelize.QueryTypes.DELETE,
        transaction,
      }
    );
  } else {
    await sequelize.query(
      `DELETE FROM "GbQcCuppingLog" WHERE "batchNumber" = :batchNumber`,
      {
        replacements: { batchNumber },
        type: sequelize.QueryTypes.DELETE,
        transaction,
      }
    );
  }

  for (const entry of normalized) {
    if (Number.isInteger(entry.id)) {
      await sequelize.query(
        `UPDATE "GbQcCuppingLog"
         SET "cuppedAt" = :cuppedAt,
             notes = :notes,
             "cuppingOutcome" = :cuppingOutcome,
             "cuppedBy" = COALESCE("cuppedBy", :cuppedBy)
         WHERE id = :id AND "batchNumber" = :batchNumber`,
        {
          replacements: {
            id: entry.id,
            batchNumber,
            cuppedAt: entry.cuppedAt,
            notes: entry.notes,
            cuppingOutcome: entry.cuppingOutcome,
            cuppedBy: cuppedBy || null,
          },
          type: sequelize.QueryTypes.UPDATE,
          transaction,
        }
      );
    } else {
      await sequelize.query(
        `INSERT INTO "GbQcCuppingLog" (
          "batchNumber", "cuppedAt", notes, "cuppingOutcome", "cuppedBy", "createdAt"
        ) VALUES (
          :batchNumber, :cuppedAt, :notes, :cuppingOutcome, :cuppedBy, NOW()
        )`,
        {
          replacements: {
            batchNumber,
            cuppedAt: entry.cuppedAt,
            notes: entry.notes,
            cuppingOutcome: entry.cuppingOutcome,
            cuppedBy: cuppedBy || null,
          },
          type: sequelize.QueryTypes.INSERT,
          transaction,
        }
      );
    }
  }
}

// Route for saving or completing QC data
router.post('/postproqc', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      batchNumber, seranggaHidup, bijiBauBusuk, kelembapan, waterActivity, triage, bijiHitam, bijiHitamSebagian, bijiHitamPecah,
      kopiGelondong, bijiCoklat, kulitKopiBesar, kulitKopiSedang, kulitKopiKecil, bijiBerKulitTanduk,
      kulitTandukBesar, kulitTandukSedang, kulitTandukKecil, bijiPecah, bijiMuda, bijiBerlubangSatu,
      bijiBerlubangLebihSatu, bijiBertutul, rantingBesar, rantingSedang, rantingKecil, totalBobotKotoran,
      cuppingEntries, cuppedBy, isCompleted
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
           "triage" = :triage,
           "waterActivity" = :waterActivity,
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
            batchNumber, seranggaHidup, bijiBauBusuk, kelembapan, waterActivity, triage, bijiHitam, bijiHitamSebagian, bijiHitamPecah,
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
         ("batchNumber", "seranggaHidup", "bijiBauBusuk", "kelembapan", "waterActivity", "triage", "bijiHitam", "bijiHitamSebagian", "bijiHitamPecah",
         "kopiGelondong", "bijiCoklat", "kulitKopiBesar", "kulitKopiSedang", "kulitKopiKecil", "bijiBerKulitTanduk",
         "kulitTandukBesar", "kulitTandukSedang", "kulitTandukKecil", "bijiPecah", "bijiMuda", "bijiBerlubangSatu",
         "bijiBerlubangLebihSatu", "bijiBertutul", "rantingBesar", "rantingSedang", "rantingKecil", "totalBobotKotoran",
         "isCompleted", "createdAt", "updatedAt")
         VALUES (:batchNumber, :seranggaHidup, :bijiBauBusuk, :kelembapan, :waterActivity, :triage, :bijiHitam, :bijiHitamSebagian, :bijiHitamPecah,
         :kopiGelondong, :bijiCoklat, :kulitKopiBesar, :kulitKopiSedang, :kulitKopiKecil, :bijiBerKulitTanduk,
         :kulitTandukBesar, :kulitTandukSedang, :kulitTandukKecil, :bijiPecah, :bijiMuda, :bijiBerlubangSatu,
         :bijiBerlubangLebihSatu, :bijiBertutul, :rantingBesar, :rantingSedang, :rantingKecil, :totalBobotKotoran,
         :isCompleted, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        {
          replacements: {
            batchNumber, seranggaHidup, bijiBauBusuk, kelembapan, waterActivity, triage, bijiHitam, bijiHitamSebagian, bijiHitamPecah,
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

    if (Array.isArray(cuppingEntries)) {
      await syncCuppingEntries(batchNumber, cuppingEntries, cuppedBy, t);
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
        fer."experimentNumber",
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
        a."waterActivity",
        a.triage,
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
      ${fermentationExperimentJoin('a')}
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

router.get('/gb-qc/cupping-counts', async (req, res) => {
  try {
    const rows = await sequelize.query(
      `
      SELECT "batchNumber", COUNT(*)::int AS "cuppingCount"
      FROM "GbQcCuppingLog"
      GROUP BY "batchNumber"
      `,
      { type: sequelize.QueryTypes.SELECT }
    );

    const counts = {};
    for (const row of rows || []) {
      counts[row.batchNumber] = Number(row.cuppingCount) || 0;
    }
    res.json(counts);
  } catch (err) {
    console.error('Error fetching cupping counts:', err);
    res.status(500).json({ message: 'Failed to fetch cupping counts', details: err.message });
  }
});

router.get('/gb-qc/cupping-summary', async (req, res) => {
  try {
    const rows = await sequelize.query(
      `
      SELECT "batchNumber", "cuppingOutcome", COUNT(*)::int AS count
      FROM "GbQcCuppingLog"
      GROUP BY "batchNumber", "cuppingOutcome"
      `,
      { type: sequelize.QueryTypes.SELECT }
    );

    const summaries = {};
    for (const row of rows || []) {
      const batchNumber = row.batchNumber;
      const outcome = row.cuppingOutcome;
      const count = Number(row.count) || 0;

      if (!summaries[batchNumber]) {
        summaries[batchNumber] = { total: 0, outcomes: {} };
      }

      summaries[batchNumber].total += count;
      summaries[batchNumber].outcomes[outcome] = count;
    }

    res.json(summaries);
  } catch (err) {
    console.error('Error fetching cupping summary:', err);
    res.status(500).json({ message: 'Failed to fetch cupping summary', details: err.message });
  }
});

router.get('/gb-qc/cupping/:batchNumber', async (req, res) => {
  try {
    const { batchNumber } = req.params;
    const cuppingEntries = await sequelize.query(
      `
      SELECT
        id,
        "batchNumber",
        "cuppedAt",
        notes,
        "cuppingOutcome",
        "cuppedBy",
        "createdAt"
      FROM "GbQcCuppingLog"
      WHERE "batchNumber" = :batchNumber
      ORDER BY "cuppedAt" DESC, id DESC
      `,
      {
        replacements: { batchNumber },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json(cuppingEntries);
  } catch (err) {
    console.error('Error fetching cupping log:', err);
    res.status(500).json({ message: 'Failed to fetch cupping log', details: err.message });
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

router.post("/postproqc/image", async (req, res) => {
  try {
    const { batchNumber, imageUrl } = req.body;

    await sequelize.query(
      `
      INSERT INTO "PostprocessingQCImages"
      ("batchNumber","imageUrl")
      VALUES (:batchNumber,:imageUrl)
      `,
      {
        replacements: { batchNumber, imageUrl },
        type: sequelize.QueryTypes.INSERT
      }
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save QC image" });
  }
});

const BATCH_YEAR_FILTER = `AND r."batchNumber" LIKE '2026%'`;

const dryingWeightSubquery = `
  LEFT JOIN (
    SELECT "batchNumber", "processingType", SUM(weight)::numeric(10,2) AS drying_weight
    FROM "DryingWeightMeasurements"
    GROUP BY "batchNumber", "processingType"
  ) dw ON dw."batchNumber" = pp."batchNumber" AND dw."processingType" = pp."processingType"
`;

const latestMoistureSubquery = `
  LEFT JOIN (
    SELECT "batchNumber", moisture AS latest_moisture
    FROM (
      SELECT "batchNumber", moisture,
        ROW_NUMBER() OVER (PARTITION BY "batchNumber" ORDER BY measurement_date DESC NULLS LAST) AS rn
      FROM "DryingMeasurements"
    ) m WHERE rn = 1
  ) lm ON lm."batchNumber" = d."batchNumber"
`;

// GB QC pipeline: drying / dried / roast queues
router.get('/gb-qc/pipeline-lists', async (req, res) => {
  try {
    const drying = await sequelize.query(
      `
      SELECT
        r."batchNumber",
        pp."processingType",
        r."farmerName",
        pp."lotNumber",
        pp."referenceNumber",
        fer."experimentNumber",
        pp."producer",
        pp."productLine",
        d."dryingArea",
        d.entered_at AS "dryingEnteredAt",
        COALESCE(dw.drying_weight, 0)::float AS "dryingWeight",
        lm.latest_moisture AS "latestMoisture",
        'In drying' AS "status"
      FROM "DryingData" d
      INNER JOIN "ReceivingData" r ON d."batchNumber" = r."batchNumber"
      INNER JOIN "PreprocessingData" pp ON pp."batchNumber" = r."batchNumber"
      ${dryingWeightSubquery}
      ${latestMoistureSubquery}
      ${fermentationExperimentJoin('r')}
      WHERE d.exited_at IS NULL
        AND COALESCE(r.merged, false) = false
        ${BATCH_YEAR_FILTER}
      ORDER BY d.entered_at DESC NULLS LAST, r."batchNumber", pp."processingType"
      `,
      { type: sequelize.QueryTypes.SELECT }
    );

    const dried = await sequelize.query(
      `
      SELECT
        r."batchNumber",
        pp."processingType",
        r."farmerName",
        pp."lotNumber",
        pp."referenceNumber",
        fer."experimentNumber",
        pp."producer",
        pp."productLine",
        d."dryingArea",
        d.entered_at AS "dryingEnteredAt",
        d.exited_at AS "dryingExitedAt",
        CASE
          WHEN d.entered_at IS NOT NULL AND d.exited_at IS NOT NULL
          THEN ROUND(EXTRACT(EPOCH FROM (d.exited_at - d.entered_at)) / 86400.0, 1)
          ELSE NULL
        END AS "dryingDays",
        COALESCE(dw.drying_weight, 0)::float AS "dryingWeight",
        lm.latest_moisture AS "latestMoisture",
        'Dried — awaiting dry mill' AS "status"
      FROM "DryingData" d
      INNER JOIN "ReceivingData" r ON d."batchNumber" = r."batchNumber"
      INNER JOIN "PreprocessingData" pp ON pp."batchNumber" = r."batchNumber"
      ${dryingWeightSubquery}
      ${latestMoistureSubquery}
      ${fermentationExperimentJoin('r')}
      WHERE d.exited_at IS NOT NULL
        AND COALESCE(r.merged, false) = false
        ${BATCH_YEAR_FILTER}
        AND NOT EXISTS (
          SELECT 1 FROM "DryMillData" dm
          WHERE dm."batchNumber" = pp."batchNumber"
            AND dm."processingType" = pp."processingType"
            AND dm.entered_at IS NOT NULL
        )
      ORDER BY d.exited_at DESC NULLS LAST, r."batchNumber", pp."processingType"
      `,
      { type: sequelize.QueryTypes.SELECT }
    );

    const roast = await sequelize.query(
      `
      SELECT *
      FROM (
        SELECT DISTINCT ON (dm."batchNumber", dm."processingType")
          dm."batchNumber",
          dm."processingType",
          r."farmerName",
          pp."lotNumber",
          pp."referenceNumber",
          fer."experimentNumber",
          pp."producer",
          pp."productLine",
          dm.entered_at AS "dryMillEnteredAt",
          COALESCE(hw.huller_weight, 0)::float AS "hullerWeight",
          COALESCE(dw.drying_weight, 0)::float AS "dryingWeight",
          CASE
            WHEN q."batchNumber" IS NULL THEN 'Awaiting roast'
            WHEN q."isCompleted" = false THEN 'QC in progress'
            ELSE 'Awaiting roast'
          END AS "status"
        FROM (
          SELECT DISTINCT ON ("batchNumber", "processingType")
            "batchNumber",
            "processingType",
            entered_at,
            exited_at,
            "dryMillMerged"
          FROM "DryMillData"
          ORDER BY "batchNumber", "processingType", entered_at DESC NULLS LAST
        ) dm
        INNER JOIN "ReceivingData" r ON dm."batchNumber" = r."batchNumber"
        INNER JOIN LATERAL (
          SELECT pp."lotNumber", pp."referenceNumber", pp."producer", pp."productLine"
          FROM "PreprocessingData" pp
          WHERE pp."batchNumber" = dm."batchNumber"
            AND pp."processingType" = dm."processingType"
          ORDER BY pp."createdAt" DESC NULLS LAST, pp."batchNumber"
          LIMIT 1
        ) pp ON true
        LEFT JOIN (
          SELECT "batchNumber", "processingType", SUM(weight)::numeric(10,2) AS drying_weight
          FROM "DryingWeightMeasurements"
          GROUP BY "batchNumber", "processingType"
        ) dw ON dw."batchNumber" = dm."batchNumber" AND dw."processingType" = dm."processingType"
        ${fermentationExperimentJoin('r')}
        LEFT JOIN LATERAL (
          SELECT SUM(e."outputWeight")::float AS huller_weight
          FROM "DryMillProcessEvents" e
          WHERE e."batchNumber" = dm."batchNumber"
            AND e."processingType" = dm."processingType"
            AND e."processStep" = 'huller'
        ) hw ON true
        LEFT JOIN "PostprocessingQCData" q ON q."batchNumber" = dm."batchNumber"
        WHERE dm.entered_at IS NOT NULL
          AND dm.exited_at IS NULL
          AND COALESCE(dm."dryMillMerged", false) = false
          AND COALESCE(r.merged, false) = false
          AND COALESCE(hw.huller_weight, 0) > 0
          ${BATCH_YEAR_FILTER}
          AND NOT EXISTS (
            SELECT 1 FROM "GbQcRoastLog" rl
            WHERE rl."batchNumber" = dm."batchNumber"
              AND rl."processingType" = dm."processingType"
          )
          AND (q."isCompleted" IS NULL OR q."isCompleted" = false)
        ORDER BY dm."batchNumber", dm."processingType", dm.entered_at DESC NULLS LAST
      ) roast_rows
      ORDER BY "dryMillEnteredAt" DESC NULLS LAST, "batchNumber", "processingType"
      `,
      { type: sequelize.QueryTypes.SELECT }
    );

    const readyForQc = await sequelize.query(
      `
      SELECT
        latest."batchNumber",
        latest."processingType",
        r."farmerName",
        pp."lotNumber",
        pp."referenceNumber",
        fer."experimentNumber",
        pp."producer",
        pp."productLine",
        latest."roastedAt",
        latest."roastedBy",
        latest.notes AS "roastNotes",
        latest."roastCount",
        COALESCE(cup."cuppingCount", 0)::int AS "cuppingCount",
        COALESCE(dw.drying_weight, 0)::float AS "dryingWeight",
        CASE
          WHEN q."batchNumber" IS NULL THEN 'Ready for QC'
          WHEN q."isCompleted" = false THEN 'QC started'
          ELSE 'Ready for QC'
        END AS "status"
      FROM (
        SELECT
          rl."batchNumber",
          rl."processingType",
          COUNT(*)::int AS "roastCount",
          (ARRAY_AGG(rl."roastedAt" ORDER BY rl."roastedAt" DESC))[1] AS "roastedAt",
          (ARRAY_AGG(rl."roastedBy" ORDER BY rl."roastedAt" DESC))[1] AS "roastedBy",
          (ARRAY_AGG(rl.notes ORDER BY rl."roastedAt" DESC))[1] AS notes
        FROM "GbQcRoastLog" rl
        GROUP BY rl."batchNumber", rl."processingType"
      ) latest
      INNER JOIN "ReceivingData" r ON latest."batchNumber" = r."batchNumber"
      INNER JOIN "PreprocessingData" pp
        ON pp."batchNumber" = latest."batchNumber"
        AND pp."processingType" = latest."processingType"
      ${dryingWeightSubquery}
      ${fermentationExperimentJoin('r')}
      LEFT JOIN "PostprocessingQCData" q ON q."batchNumber" = latest."batchNumber"
      LEFT JOIN (
        SELECT "batchNumber", COUNT(*)::int AS "cuppingCount"
        FROM "GbQcCuppingLog"
        GROUP BY "batchNumber"
      ) cup ON cup."batchNumber" = latest."batchNumber"
      WHERE COALESCE(r.merged, false) = false
        ${BATCH_YEAR_FILTER}
        AND (q."isCompleted" IS NULL OR q."isCompleted" = false)
      ORDER BY latest."roastedAt" DESC NULLS LAST
      `,
      { type: sequelize.QueryTypes.SELECT }
    );

    res.json({ drying, dried, roast, readyForQc });
  } catch (err) {
    console.error('Error fetching GB QC pipeline lists:', err);
    res.status(500).json({
      message: 'Failed to fetch pipeline lists',
      details: err.message,
    });
  }
});

router.get('/gb-qc/roasts', async (req, res) => {
  try {
    const { batchNumber, processingType } = req.query;
    if (!batchNumber || !processingType) {
      return res.status(400).json({ message: 'batchNumber and processingType are required' });
    }

    const roasts = await sequelize.query(
      `
      SELECT
        id,
        "batchNumber",
        "processingType",
        "roastedAt",
        "roastedBy",
        notes,
        "roastProfile",
        "endTemp",
        "firstCrackMinutes",
        "firstCrackTemp",
        "createdAt"
      FROM "GbQcRoastLog"
      WHERE "batchNumber" = :batchNumber
        AND "processingType" = :processingType
      ORDER BY "roastedAt" DESC, id DESC
      `,
      {
        replacements: { batchNumber, processingType },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json(roasts);
  } catch (err) {
    console.error('Error fetching roast log:', err);
    res.status(500).json({ message: 'Failed to fetch roast log', details: err.message });
  }
});

router.post('/gb-qc/roast', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      batchNumber,
      processingType,
      roastedAt,
      notes,
      roastedBy,
      roastProfile,
      endTemp,
      firstCrackMinutes,
      firstCrackTemp,
    } = req.body;

    if (!batchNumber || !processingType) {
      await t.rollback();
      return res.status(400).json({ message: 'batchNumber and processingType are required' });
    }

    const [dryMill] = await sequelize.query(
      `
      SELECT dm.entered_at, dm.exited_at, dm."dryMillMerged", COALESCE(hw.huller_weight, 0)::float AS "hullerWeight"
      FROM "DryMillData" dm
      LEFT JOIN LATERAL (
        SELECT SUM(e."outputWeight")::float AS huller_weight
        FROM "DryMillProcessEvents" e
        WHERE e."batchNumber" = dm."batchNumber"
          AND e."processingType" = dm."processingType"
          AND e."processStep" = 'huller'
      ) hw ON true
      WHERE dm."batchNumber" = :batchNumber
        AND dm."processingType" = :processingType
      LIMIT 1
      `,
      {
        replacements: { batchNumber, processingType },
        type: sequelize.QueryTypes.SELECT,
        transaction: t,
      }
    );

    if (!dryMill?.entered_at) {
      await t.rollback();
      return res.status(400).json({
        message: 'Batch must be entered in dry mill before recording roast',
      });
    }

    if (dryMill.exited_at) {
      await t.rollback();
      return res.status(400).json({
        message: 'Batch has already exited dry mill',
      });
    }

    if (dryMill.dryMillMerged === true) {
      await t.rollback();
      return res.status(400).json({
        message: 'Cannot record roast for a batch that was merged away',
      });
    }

    if (!dryMill.hullerWeight || dryMill.hullerWeight <= 0) {
      await t.rollback();
      return res.status(400).json({
        message: 'Batch must have huller output saved before recording roast',
      });
    }

    const roastedAtValue = roastedAt ? new Date(roastedAt) : new Date();
    if (isNaN(roastedAtValue.getTime())) {
      await t.rollback();
      return res.status(400).json({ message: 'Invalid roastedAt date' });
    }

    const parsedEndTemp =
      endTemp === undefined || endTemp === null || endTemp === ''
        ? null
        : parseFloat(endTemp);
    const parsedFirstCrackMinutes =
      firstCrackMinutes === undefined || firstCrackMinutes === null || firstCrackMinutes === ''
        ? null
        : parseFloat(firstCrackMinutes);
    const parsedFirstCrackTemp =
      firstCrackTemp === undefined || firstCrackTemp === null || firstCrackTemp === ''
        ? null
        : parseFloat(firstCrackTemp);

    const rows = await sequelize.query(
      `
      INSERT INTO "GbQcRoastLog" (
        "batchNumber", "processingType", "roastedAt", "roastedBy", "notes",
        "roastProfile", "endTemp", "firstCrackMinutes", "firstCrackTemp", "createdAt"
      )
      VALUES (
        :batchNumber, :processingType, :roastedAt, :roastedBy, :notes,
        :roastProfile, :endTemp, :firstCrackMinutes, :firstCrackTemp, NOW()
      )
      RETURNING *
      `,
      {
        replacements: {
          batchNumber,
          processingType,
          roastedAt: roastedAtValue,
          roastedBy: roastedBy || null,
          notes: notes || null,
          roastProfile: roastProfile?.trim() || null,
          endTemp: Number.isFinite(parsedEndTemp) ? parsedEndTemp : null,
          firstCrackMinutes: Number.isFinite(parsedFirstCrackMinutes) ? parsedFirstCrackMinutes : null,
          firstCrackTemp: Number.isFinite(parsedFirstCrackTemp) ? parsedFirstCrackTemp : null,
        },
        type: sequelize.QueryTypes.SELECT,
        transaction: t,
      }
    );

    await t.commit();
    res.status(201).json(rows[0] || { batchNumber, processingType, roastedAt: roastedAtValue });
  } catch (err) {
    await t.rollback();
    console.error('Error recording roast:', err);
    res.status(500).json({ message: 'Failed to record roast', details: err.message });
  }
});

router.get("/postproqc/images/:batchNumber", async (req,res)=>{

  const images = await sequelize.query(
    `
    SELECT *
    FROM "PostprocessingQCImages"
    WHERE "batchNumber" = :batchNumber
    ORDER BY "createdAt" DESC
    `,
    {
      replacements:{batchNumber:req.params.batchNumber},
      type:sequelize.QueryTypes.SELECT
    }
  )

  res.json(images)

})

module.exports = router;