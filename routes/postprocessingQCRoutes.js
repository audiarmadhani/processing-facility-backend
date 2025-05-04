const express = require("express");
const router = express.Router();
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize(
  process.env.POSTGRES_URL || "postgres://user:password@localhost:5432/dbname",
  { dialect: "postgres" }
);

// Define Postprocessing model
const Postprocessing = sequelize.define(
  "Postprocessing",
  {
    batchNumber: { type: DataTypes.STRING, primaryKey: true },
    referenceNumber: { type: DataTypes.STRING },
    storedDate: { type: DataTypes.DATE },
    processingType: { type: DataTypes.STRING },
    productLine: { type: DataTypes.STRING },
    producer: { type: DataTypes.STRING },
    type: { type: DataTypes.STRING },
    quality: { type: DataTypes.STRING },
    weight: { type: DataTypes.FLOAT },
    totalBags: { type: DataTypes.INTEGER },
    notes: { type: DataTypes.STRING },
  },
  { tableName: "Postprocessing", timestamps: false }
);

// Define PostprocessingQCData model
const PostprocessingQCData = sequelize.define(
  "PostprocessingQCData",
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
  { tableName: "PostprocessingQCData", timestamps: true }
);

router.get("/postprocessing/not-qced", async (req, res) => {
  try {
    // Fetch batches that are not in PostprocessingQCData with isCompleted = true
    const batches = await sequelize.query(
      `
      SELECT p.*
      FROM "Postprocessing" p
      LEFT JOIN "PostprocessingQCData" qc ON p."batchNumber" = qc."batchNumber" AND qc."isCompleted" = true
      WHERE qc."batchNumber" IS NULL
      `,
      { type: sequelize.QueryTypes.SELECT }
    );

    // For each batch, check if QC has started (exists in PostprocessingQCData but isCompleted = false)
    const batchesWithStatus = await Promise.all(
      batches.map(async (batch) => {
        const qcData = await sequelize.query(
          `
          SELECT "isCompleted"
          FROM "PostprocessingQCData"
          WHERE "batchNumber" = :batchNumber
          `,
          {
            replacements: { batchNumber: batch.batchNumber },
            type: sequelize.QueryTypes.SELECT,
          }
        );

        let status;
        if (qcData.length === 0) {
          status = "QC Not Started";
        } else if (qcData[0].isCompleted === false) {
          status = "QC Started";
        } else {
          status = "QC Completed"; // This should not appear due to the WHERE clause above
        }

        return { ...batch, status };
      })
    );

    res.json(batchesWithStatus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/postproqcfin", async (req, res) => {
  try {
    const batches = await sequelize.query(
      `
      SELECT p.*, qc.*, DATE(qc."createdAt") as "qcDate",
      CASE
        WHEN qc."kelembapan" <= 12.5 THEN 'Good'
        WHEN qc."kelembapan" <= 13 THEN 'Fair'
        ELSE 'Poor'
      END as "generalQuality",
      CASE
        WHEN qc."totalBobotKotoran" <= 0.5 THEN 'Grade 1'
        WHEN qc."totalBobotKotoran" <= 1 THEN 'Grade 2'
        ELSE 'Grade 3'
      END as "actualGrade",
      (SELECT SUM(CASE
        WHEN "bijiHitam" > 0 THEN "bijiHitam" * 5
        ELSE 0 END +
        CASE WHEN "bijiHitamSebagian" > 0 THEN "bijiHitamSebagian" * 2
        ELSE 0 END +
        CASE WHEN "bijiHitamPecah" > 0 THEN "bijiHitamPecah" * 2
        ELSE 0 END +
        CASE WHEN "kopiGelondong" > 0 THEN "kopiGelondong" * 5
        ELSE 0 END +
        CASE WHEN "bijiCoklat" > 0 THEN "bijiCoklat" * 1
        ELSE 0 END +
        CASE WHEN "bijiBerKulitTanduk" > 0 THEN "bijiBerKulitTanduk" * 5
        ELSE 0 END +
        CASE WHEN "bijiPecah" > 0 THEN "bijiPecah" * 1
        ELSE 0 END +
        CASE WHEN "bijiMuda" > 0 THEN "bijiMuda" * 1
        ELSE 0 END +
        CASE WHEN "bijiBerlubangSatu" > 0 THEN "bijiBerlubangSatu" * 1
        ELSE 0 END +
        CASE WHEN "bijiBerlubangLebihSatu" > 0 THEN "bijiBerlubangLebihSatu" * 3
        ELSE 0 END +
        CASE WHEN "bijiBertutul" > 0 THEN "bijiBertutul" * 1
        ELSE 0 END
      )) as "defectScore",
      (SELECT CASE
        WHEN p."weight" > 0 THEN (qc."totalBobotKotoran" / p."weight") * 100
        ELSE 0
      END) as "defectWeightPercentage"
      FROM "Postprocessing" p
      JOIN "PostprocessingQCData" qc ON p."batchNumber" = qc."batchNumber"
      WHERE qc."isCompleted" = true
      `,
      { type: sequelize.QueryTypes.SELECT }
    );
    res.json(batches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/postproqc/:batchNumber", async (req, res) => {
  try {
    const batchNumber = req.params.batchNumber;
    const qcData = await sequelize.query(
      `
      SELECT *
      FROM "PostprocessingQCData"
      WHERE "batchNumber" = :batchNumber
      `,
      {
        replacements: { batchNumber },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    res.json(qcData[0] || null);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/postproqc", async (req, res) => {
  const {
    batchNumber,
    seranggaHidup,
    bijiBauBusuk,
    kelembapan,
    bijiHitam,
    bijiHitamSebagian,
    bijiHitamPecah,
    kopiGelondong,
    bijiCoklat,
    kulitKopiBesar,
    kulitKopiSedang,
    kulitKopiKecil,
    bijiBerKulitTanduk,
    kulitTandukBesar,
    kulitTandukSedang,
    kulitTandukKecil,
    bijiPecah,
    bijiMuda,
    bijiBerlubangSatu,
    bijiBerlubangLebihSatu,
    bijiBertutul,
    rantingBesar,
    rantingSedang,
    rantingKecil,
    totalBobotKotoran,
    isCompleted,
  } = req.body;

  try {
    const existingQC = await sequelize.query(
      `
      SELECT *
      FROM "PostprocessingQCData"
      WHERE "batchNumber" = :batchNumber
      `,
      {
        replacements: { batchNumber },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (existingQC.length > 0) {
      await sequelize.query(
        `
        UPDATE "PostprocessingQCData"
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
        WHERE "batchNumber" = :batchNumber
        `,
        {
          replacements: {
            batchNumber,
            seranggaHidup,
            bijiBauBusuk,
            kelembapan,
            bijiHitam,
            bijiHitamSebagian,
            bijiHitamPecah,
            kopiGelondong,
            bijiCoklat,
            kulitKopiBesar,
            kulitKopiSedang,
            kulitKopiKecil,
            bijiBerKulitTanduk,
            kulitTandukBesar,
            kulitTandukSedang,
            kulitTandukKecil,
            bijiPecah,
            bijiMuda,
            bijiBerlubangSatu,
            bijiBerlubangLebihSatu,
            bijiBertutul,
            rantingBesar,
            rantingSedang,
            rantingKecil,
            totalBobotKotoran,
            isCompleted,
          },
          type: sequelize.QueryTypes.UPDATE,
        }
      );
    } else {
      await sequelize.query(
        `
        INSERT INTO "PostprocessingQCData" (
          "batchNumber", "seranggaHidup", "bijiBauBusuk", "kelembapan", "bijiHitam",
          "bijiHitamSebagian", "bijiHitamPecah", "kopiGelondong", "bijiCoklat",
          "kulitKopiBesar", "kulitKopiSedang", "kulitKopiKecil", "bijiBerKulitTanduk",
          "kulitTandukBesar", "kulitTandukSedang", "kulitTandukKecil", "bijiPecah",
          "bijiMuda", "bijiBerlubangSatu", "bijiBerlubangLebihSatu", "bijiBertutul",
          "rantingBesar", "rantingSedang", "rantingKecil", "totalBobotKotoran",
          "isCompleted", "createdAt", "updatedAt"
        ) VALUES (
          :batchNumber, :seranggaHidup, :bijiBauBusuk, :kelembapan, :bijiHitam,
          :bijiHitamSebagian, :bijiHitamPecah, :kopiGelondong, :bijiCoklat,
          :kulitKopiBesar, :kulitKopiSedang, :kulitKopiKecil, :bijiBerKulitTanduk,
          :kulitTandukBesar, :kulitTandukSedang, :kulitTandukKecil, :bijiPecah,
          :bijiMuda, :bijiBerlubangSatu, :bijiBerlubangLebihSatu, :bijiBertutul,
          :rantingBesar, :rantingSedang, :rantingKecil, :totalBobotKotoran,
          :isCompleted, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        `,
        {
          replacements: {
            batchNumber,
            seranggaHidup,
            bijiBauBusuk,
            kelembapan,
            bijiHitam,
            bijiHitamSebagian,
            bijiHitamPecah,
            kopiGelondong,
            bijiCoklat,
            kulitKopiBesar,
            kulitKopiSedang,
            kulitKopiKecil,
            bijiBerKulitTanduk,
            kulitTandukBesar,
            kulitTandukSedang,
            kulitTandukKecil,
            bijiPecah,
            bijiMuda,
            bijiBerlubangSatu,
            bijiBerlubangLebihSatu,
            bijiBertutul,
            rantingBesar,
            rantingSedang,
            rantingKecil,
            totalBobotKotoran,
            isCompleted,
          },
          type: sequelize.QueryTypes.INSERT,
        }
      );
    }
    res.status(200).json({ message: "QC data saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;