const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

const toNullableFloat = (v) =>
  v === '' || v === undefined || v === null ? null : parseFloat(v);

const toNullableInt = (v) =>
  v === '' || v === undefined || v === null ? null : parseInt(v, 10);

const toNullableDate = (v) =>
  v ? new Date(v) : null;

// Route for fetching available tanks
router.get('/fermentation/available-tanks', async (req, res) => {
  try {
    const allBlueBarrelCodes = Array.from({ length: 15 }, (_, i) => 
      `BB-HQ-${String(i + 1).padStart(4, '0')}`
    );

    const allBucketCodes = Array.from({ length: 10 }, (_, i) => 
      `BUC-HQ-${String(i + 1).padStart(4, '0')}`
    );

    const allTanks = [
      'Biomaster',
      'Carrybrew',
      'Washing Track',
      ...allBlueBarrelCodes,
      ...allBucketCodes
    ];

    const inUseTanks = await sequelize.query(
      `SELECT DISTINCT tank 
       FROM "FermentationData" 
       WHERE status = :status`,
      {
        replacements: { status: 'In Progress' },
        type: sequelize.QueryTypes.SELECT
      }
    );

    const inUseTanksArray = Array.isArray(inUseTanks) ? inUseTanks : inUseTanks ? [inUseTanks] : [];
    console.log('inUseTanks:', inUseTanksArray);

    const inUseTankNames = inUseTanksArray.map(row => row.tank).filter(tank => tank);

    const availableTanks = allTanks.filter(tank => !inUseTankNames.includes(tank));
    
    res.json(availableTanks);
  } catch (err) {
    console.error('Error fetching available tanks:', err);
    res.status(500).json({ error: 'Failed to fetch available tanks', details: err.message });
  }
});

// Route for fetching available batches for fermentation
router.get('/fermentation/available-batches', async (req, res) => {
  try {
    const rows = await sequelize.query(
      `SELECT DISTINCT 
        r."batchNumber",
        r."farmerName",
        r."type",
        r.weight,
        MIN(p."lotNumber") as "lotNumber"
      FROM "ReceivingData" r
      LEFT JOIN "PreprocessingData" p ON r."batchNumber" = p."batchNumber" AND p.merged = FALSE
      LEFT JOIN "DryingData" d ON r."batchNumber" = d."batchNumber"
      WHERE r.merged = FALSE
      AND d."batchNumber" IS NULL
      AND r."commodityType" = 'Cherry'
      GROUP BY r."batchNumber", r."farmerName", r."type", r.weight
      ORDER BY r."batchNumber" DESC;`,
      {
        type: sequelize.QueryTypes.SELECT
      }
    );

    const result = Array.isArray(rows) ? rows : rows ? [rows] : [];

    res.json(result);
  } catch (err) {
    console.error('Error fetching available batches:', err);
    res.status(500).json({ error: 'Failed to fetch available batches', details: err.message });
  }
});

// Route for creating fermentation data
router.post('/fermentation', async (req, res) => {
  try {
    const {
      batchNumber,
      tank,
      fermentationStart,
      fermentationEnd,
      createdBy,
      processingType,
      referenceNumber,
      version,
      experimentNumber,
      description,
      farmerName,
      type,
      variety,

      // PRE
      preStorage,
      preStorageCondition,
      preFermentationStorageGoal,
      preFermentationStorageStart,
      preFermentationStorageEnd,
      prePulped,
      prePulpedDelva,
      preFermentationTimeAfterPulping,
      prePulpedWeight,
      cherryType,

      // FERMENTATION
      fermentation,
      fermentationCherryWeight,
      fermentationStarter,
      fermentationStarterAmount,
      gas,
      pressure,
      isSubmerged,
      pH,
      fermentationTimeTarget,
      totalVolume,
      waterUsed,
      starterUsed,
      stirring,
      fermentationTemperature,
      avgTemperature,

      // HARVEST
      harvestAt,
      harvestDate,
      receivedAt,
      receivedWeight,
      rejectWeight,
      defectWeight,
      damagedWeight,
      lostWeight,
      preprocessingWeight,
      quality,
      brix,

      // POST
      finalPH,
      finalTDS,
      finalTemperature,
      postFermentationWeight,
      postPulped,
      postPulpedDelva,

      // SECOND FERMENTATION
      secondFermentation,
      secondFermentationTank,
      secondWashedDelva,
      secondWashed,
      secondFermentationCherryWeight,
      secondFermentationPulpedWeight,
      secondStarterType,
      secondGas,
      secondPressure,
      secondIsSubmerged,
      secondTotalVolume,
      secondWaterUsed,
      secondMosstoUsed,
      secondActualVolume,
      secondTemperature,
      secondFermentationTimeTarget,
      secondFermentationStart,
      secondFermentationEnd,

      // DRYING
      drying,
      dryingArea,
      preDryingWeight,
      finalMoisture,
      postDryingWeight,
      dryingStart,
      dryingEnd,

      // SECOND DRYING
      secondDrying,
      secondDryingArea,
      secondAverageTemperature,
      secondFinalMoisture,
      secondPostDryingWeight,
      secondDryingStart,
      secondDryingEnd,

      // FINAL
      rehydration,
      storage,
      storageTemperature,
      hullingTime,
      bagType,
      postHullingWeight,
      productLine,
      wesorter,
      preClassifier,
      airlock,

      // EXTRA
      tankAmount,
      leachateTarget,
      leachate,
      brewTankTemperature,
      waterTemperature,
      coolerTemperature

    } = req.body;

    // ---- required guards ----
    if (!batchNumber || !tank || !fermentationStart || !createdBy || !version) {
      return res.status(400).json({
        error: 'batchNumber, tank, fermentationStart, createdBy, and version are required',
      });
    }

    // ---- canonical dates ----
    const startDate = new Date(fermentationStart);
    const endDate = toNullableDate(fermentationEnd);

    if (isNaN(startDate.getTime())) {
      return res.status(400).json({ error: 'Invalid fermentationStart' });
    }

    if (startDate > new Date()) {
      return res.status(400).json({ error: 'fermentationStart cannot be in the future' });
    }

    // ---- normalize numeric fields ----
    const numeric = {
      pressure: toNullableFloat(pressure),
      totalVolume: toNullableFloat(totalVolume),
      waterUsed: toNullableFloat(waterUsed),
      starterUsed: toNullableFloat(starterUsed),
      stirring: toNullableFloat(stirring),
      fermentationTemperature: toNullableFloat(fermentationTemperature),
      avgTemperature: toNullableFloat(avgTemperature),
      receivedWeight: toNullableFloat(receivedWeight),
      rejectWeight: toNullableFloat(rejectWeight),
      defectWeight: toNullableFloat(defectWeight),
      damagedWeight: toNullableFloat(damagedWeight),
      lostWeight: toNullableFloat(lostWeight),
      preprocessingWeight: toNullableFloat(preprocessingWeight),
      quality: toNullableFloat(quality),
      brix: toNullableFloat(brix),
      pH: toNullableFloat(pH),
      tankAmount: toNullableInt(tankAmount),
      leachateTarget: toNullableFloat(leachateTarget),
      leachate: toNullableFloat(leachate),
      brewTankTemperature: toNullableFloat(brewTankTemperature),
      waterTemperature: toNullableFloat(waterTemperature),
      coolerTemperature: toNullableFloat(coolerTemperature),
      secondPressure: toNullableFloat(secondPressure),
      secondTemperature: toNullableFloat(secondTemperature),
      fermentationTimeTarget: toNullableInt(fermentationTimeTarget),
      secondFermentationTimeTarget: toNullableInt(secondFermentationTimeTarget),
    };

    if (Object.values(numeric).some((v) => isNaN(v) && v !== null)) {
      return res.status(400).json({ error: 'Invalid numeric field format' });
    }

    // ---- INSERT ----
    await sequelize.query(
      `
      INSERT INTO "FermentationData" (
        "batchNumber",
        "tank",
        "startDate",
        "endDate",
        "createdBy",
        "status",

        "processingType",
        "referenceNumber",
        "version",
        "experimentNumber",
        "description",
        "farmerName",
        "type",
        "variety",

        -- PRE
        "preStorage",
        "preStorageCondition",
        "preFermentationStorageGoal",
        "preFermentationStorageStart",
        "preFermentationStorageEnd",
        "prePulped",
        "prePulpedDelva",
        "preFermentationTimeAfterPulping",
        "prePulpedWeight",
        "cherryType",

        -- FERMENTATION
        "fermentation",
        "fermentationCherryWeight",
        "fermentationStarter",
        "fermentationStarterAmount",
        "gas",
        "pressure",
        "isSubmerged",
        "pH",
        "fermentationTimeTarget",
        "totalVolume",
        "waterUsed",
        "starterUsed",
        "stirring",
        "fermentationTemperature",
        "avgTemperature",

        -- HARVEST / RECEIVING
        "harvestAt",
        "harvestDate",
        "receivedAt",
        "receivedWeight",
        "rejectWeight",
        "defectWeight",
        "damagedWeight",
        "lostWeight",
        "preprocessingWeight",
        "quality",
        "brix",

        -- POST FERMENTATION
        "finalPH",
        "finalTDS",
        "finalTemperature",
        "postFermentationWeight",
        "postPulped",
        "postPulpedDelva",

        -- SECOND FERMENTATION
        "secondFermentation",
        "secondFermentationTank",
        "secondWashedDelva",
        "secondWashed",
        "secondFermentationCherryWeight",
        "secondFermentationPulpedWeight",
        "secondStarterType",
        "secondGas",
        "secondPressure",
        "secondIsSubmerged",
        "secondTotalVolume",
        "secondWaterUsed",
        "secondMosstoUsed",
        "secondActualVolume",
        "secondTemperature",
        "secondFermentationTimeTarget",
        "secondFermentationStart",
        "secondFermentationEnd",

        -- DRYING
        "drying",
        "dryingArea",
        "preDryingWeight",
        "finalMoisture",
        "postDryingWeight",
        "dryingStart",
        "dryingEnd",

        -- SECOND DRYING
        "secondDrying",
        "secondDryingArea",
        "secondAverageTemperature",
        "secondFinalMoisture",
        "secondPostDryingWeight",
        "secondDryingStart",
        "secondDryingEnd",

        -- FINAL
        "rehydration",
        "storage",
        "storageTemperature",
        "hullingTime",
        "bagType",
        "postHullingWeight",
        "productLine",
        "wesorter",
        "preClassifier",
        "airlock",

        -- EXTRA
        "tankAmount",
        "leachateTarget",
        "leachate",
        "brewTankTemperature",
        "waterTemperature",
        "coolerTemperature",

        "createdAt",
        "updatedAt"
      )
      VALUES (
        :batchNumber,
        :tank,
        :startDate,
        :endDate,
        :createdBy,
        'In Progress',

        :processingType,
        :referenceNumber,
        :version,
        :experimentNumber,
        :description,
        :farmerName,
        :type,
        :variety,

        :preStorage,
        :preStorageCondition,
        :preFermentationStorageGoal,
        :preFermentationStorageStart,
        :preFermentationStorageEnd,
        :prePulped,
        :prePulpedDelva,
        :preFermentationTimeAfterPulping,
        :prePulpedWeight,
        :cherryType,

        :fermentation,
        :fermentationCherryWeight,
        :fermentationStarter,
        :fermentationStarterAmount,
        :gas,
        :pressure,
        :isSubmerged,
        :pH,
        :fermentationTimeTarget,
        :totalVolume,
        :waterUsed,
        :starterUsed,
        :stirring,
        :fermentationTemperature,
        :avgTemperature,

        :harvestAt,
        :harvestDate,
        :receivedAt,
        :receivedWeight,
        :rejectWeight,
        :defectWeight,
        :damagedWeight,
        :lostWeight,
        :preprocessingWeight,
        :quality,
        :brix,

        :finalPH,
        :finalTDS,
        :finalTemperature,
        :postFermentationWeight,
        :postPulped,
        :postPulpedDelva,

        :secondFermentation,
        :secondFermentationTank,
        :secondWashedDelva,
        :secondWashed,
        :secondFermentationCherryWeight,
        :secondFermentationPulpedWeight,
        :secondStarterType,
        :secondGas,
        :secondPressure,
        :secondIsSubmerged,
        :secondTotalVolume,
        :secondWaterUsed,
        :secondMosstoUsed,
        :secondActualVolume,
        :secondTemperature,
        :secondFermentationTimeTarget,
        :secondFermentationStart,
        :secondFermentationEnd,

        :drying,
        :dryingArea,
        :preDryingWeight,
        :finalMoisture,
        :postDryingWeight,
        :dryingStart,
        :dryingEnd,

        :secondDrying,
        :secondDryingArea,
        :secondAverageTemperature,
        :secondFinalMoisture,
        :secondPostDryingWeight,
        :secondDryingStart,
        :secondDryingEnd,

        :rehydration,
        :storage,
        :storageTemperature,
        :hullingTime,
        :bagType,
        :postHullingWeight,
        :productLine,
        :wesorter,
        :preClassifier,
        :airlock,

        :tankAmount,
        :leachateTarget,
        :leachate,
        :brewTankTemperature,
        :waterTemperature,
        :coolerTemperature,

        NOW(),
        NOW()
      )
      ON CONFLICT ("batchNumber", "referenceNumber", "experimentNumber")
      DO UPDATE SET
        "tank" = EXCLUDED."tank",
        "startDate" = EXCLUDED."startDate",
        "endDate" = EXCLUDED."endDate",
        "processingType" = EXCLUDED."processingType",
        "version" = EXCLUDED."version",
        "description" = EXCLUDED."description",
        "farmerName" = EXCLUDED."farmerName",
        "type" = EXCLUDED."type",
        "variety" = EXCLUDED."variety",

        "preStorage" = EXCLUDED."preStorage",
        "preStorageCondition" = EXCLUDED."preStorageCondition",
        "preFermentationStorageGoal" = EXCLUDED."preFermentationStorageGoal",
        "preFermentationStorageStart" = EXCLUDED."preFermentationStorageStart",
        "preFermentationStorageEnd" = EXCLUDED."preFermentationStorageEnd",

        "fermentation" = EXCLUDED."fermentation",
        "fermentationStarter" = EXCLUDED."fermentationStarter",

        "pressure" = EXCLUDED."pressure",
        "pH" = EXCLUDED."pH",
        "totalVolume" = EXCLUDED."totalVolume",
        "waterUsed" = EXCLUDED."waterUsed",

        "finalPH" = EXCLUDED."finalPH",
        "finalTemperature" = EXCLUDED."finalTemperature",

        "dryingArea" = EXCLUDED."dryingArea",
        "finalMoisture" = EXCLUDED."finalMoisture",
        "dryingStart" = EXCLUDED."dryingStart",
        "dryingEnd" = EXCLUDED."dryingEnd",

        "storage" = EXCLUDED."storage",
        "productLine" = EXCLUDED."productLine",

        "tankAmount" = EXCLUDED."tankAmount",
        "leachateTarget" = EXCLUDED."leachateTarget",

        "updatedAt" = NOW();
      `,
      {
        replacements: {
          batchNumber,
          tank,
          startDate,
          endDate,
          createdBy,

          processingType,
          referenceNumber,
          version: toNullableInt(version),
          experimentNumber,
          description,
          farmerName,
          type,
          variety,

          // PRE
          preStorage,
          preStorageCondition,
          preFermentationStorageGoal: toNullableFloat(preFermentationStorageGoal),
          preFermentationStorageStart: toNullableDate(preFermentationStorageStart),
          preFermentationStorageEnd: toNullableDate(preFermentationStorageEnd),
          prePulped,
          prePulpedDelva,
          preFermentationTimeAfterPulping: toNullableFloat(preFermentationTimeAfterPulping),
          prePulpedWeight: toNullableFloat(prePulpedWeight),
          cherryType,

          // FERMENTATION
          fermentation,
          fermentationCherryWeight: toNullableFloat(fermentationCherryWeight),
          fermentationStarter,
          fermentationStarterAmount: toNullableFloat(fermentationStarterAmount),
          gas,
          pressure: toNullableFloat(pressure),
          isSubmerged,
          pH: toNullableFloat(pH),
          fermentationTimeTarget: toNullableInt(fermentationTimeTarget),
          totalVolume: toNullableFloat(totalVolume),
          waterUsed: toNullableFloat(waterUsed),
          starterUsed: toNullableFloat(starterUsed),
          stirring: toNullableFloat(stirring),
          fermentationTemperature: toNullableFloat(fermentationTemperature),
          avgTemperature: toNullableFloat(avgTemperature),

          // HARVEST / RECEIVING
          harvestAt: toNullableDate(harvestAt),
          harvestDate: toNullableDate(harvestDate),
          receivedAt: toNullableDate(receivedAt),
          receivedWeight: toNullableFloat(receivedWeight),
          rejectWeight: toNullableFloat(rejectWeight),
          defectWeight: toNullableFloat(defectWeight),
          damagedWeight: toNullableFloat(damagedWeight),
          lostWeight: toNullableFloat(lostWeight),
          preprocessingWeight: toNullableFloat(preprocessingWeight),
          quality: toNullableFloat(quality),
          brix: toNullableFloat(brix),

          // POST FERMENTATION
          finalPH: toNullableFloat(finalPH),
          finalTDS: toNullableFloat(finalTDS),
          finalTemperature: toNullableFloat(finalTemperature),
          postFermentationWeight: toNullableFloat(postFermentationWeight),
          postPulped,
          postPulpedDelva,

          // SECOND FERMENTATION
          secondFermentation,
          secondFermentationTank,
          secondWashedDelva,
          secondWashed,
          secondFermentationCherryWeight: toNullableFloat(secondFermentationCherryWeight),
          secondFermentationPulpedWeight: toNullableFloat(secondFermentationPulpedWeight),
          secondStarterType,
          secondGas,
          secondPressure: toNullableFloat(secondPressure),
          secondIsSubmerged,
          secondTotalVolume: toNullableFloat(secondTotalVolume),
          secondWaterUsed: toNullableFloat(secondWaterUsed),
          secondMosstoUsed: toNullableFloat(secondMosstoUsed),
          secondActualVolume: toNullableFloat(secondActualVolume),
          secondTemperature: toNullableFloat(secondTemperature),
          secondFermentationTimeTarget: toNullableInt(secondFermentationTimeTarget),
          secondFermentationStart: toNullableDate(secondFermentationStart),
          secondFermentationEnd: toNullableDate(secondFermentationEnd),

          // DRYING
          drying,
          dryingArea,
          preDryingWeight: toNullableFloat(preDryingWeight),
          finalMoisture: toNullableFloat(finalMoisture),
          postDryingWeight: toNullableFloat(postDryingWeight),
          dryingStart: toNullableDate(dryingStart),
          dryingEnd: toNullableDate(dryingEnd),

          // SECOND DRYING
          secondDrying,
          secondDryingArea,
          secondAverageTemperature: toNullableFloat(secondAverageTemperature),
          secondFinalMoisture: toNullableFloat(secondFinalMoisture),
          secondPostDryingWeight: toNullableFloat(secondPostDryingWeight),
          secondDryingStart: toNullableDate(secondDryingStart),
          secondDryingEnd: toNullableDate(secondDryingEnd),

          // FINAL
          rehydration,
          storage,
          storageTemperature: toNullableFloat(storageTemperature),
          hullingTime: toNullableDate(hullingTime),
          bagType,
          postHullingWeight: toNullableFloat(postHullingWeight),
          productLine,
          wesorter,
          preClassifier,
          airlock,

          // EXTRA
          tankAmount: toNullableInt(tankAmount),
          leachateTarget: toNullableFloat(leachateTarget),
          leachate: toNullableFloat(leachate),
          brewTankTemperature: toNullableFloat(brewTankTemperature),
          waterTemperature: toNullableFloat(waterTemperature),
          coolerTemperature: toNullableFloat(coolerTemperature),
        },
      }
    );

    res.status(201).json({ message: 'Fermentation created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Failed to create fermentation data',
      details: err.message,
    });
  }
});

// Route for fetching all fermentation data
router.get('/fermentation', async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      `SELECT 
        f.*, 
        r."farmerName",
        r.weight AS receiving_weight,
        "startDate" as "fermentationStart",
        "endDate" as "fermentationEnd"
      FROM "FermentationData" f
      LEFT JOIN "ReceivingData" r ON f."batchNumber" = r."batchNumber"
      WHERE r.merged = FALSE
      ORDER BY f."fermentationStart" DESC;`
    );

    res.json(rows || []);
  } catch (err) {
    console.error('Error fetching fermentation data:', err);
    res.status(500).json({ error: 'Failed to fetch fermentation data', details: err.message });
  }
});

router.get('/fermentation/details/:batchNumber', async (req, res) => {
  const { batchNumber } = req.params;

  try {
    const fermentation = await sequelize.query(`
      SELECT * FROM "FermentationData" f WHERE f."batchNumber" = :batchNumber
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.SELECT,
    });

    res.status(200).json(fermentation);
  } catch (error) {
    console.error('Error fetching fermentation data:', error);
    res.status(500).json({ error: 'Failed to fetch fermentation data', details: error.message });
  }
});

// Route for saving a new weight measurement
router.post('/fermentation-weight-measurement', async (req, res) => {
  const { batchNumber, processingType, weight, measurement_date, producer } = req.body;

  if (!batchNumber || !weight || !measurement_date || !producer) {
    return res.status(400).json({ error: 'batchNumber, weight, measurement_date, and producer are required' });
  }

  if (typeof weight !== 'number' || weight <= 0) {
    return res.status(400).json({ error: 'Weight must be a positive number' });
  }

  const parsedDate = new Date(measurement_date);
  if (isNaN(parsedDate) || parsedDate > new Date()) {
    return res.status(400).json({ error: 'Invalid or future measurement_date' });
  }

  if (!['HQ', 'BTM'].includes(producer)) {
    return res.status(400).json({ error: 'Producer must be either "HQ" or "BTM"' });
  }

  const t = await sequelize.transaction();
  try {
    const [batchCheck] = await sequelize.query(
      'SELECT 1 FROM "FermentationData" WHERE "batchNumber" = :batchNumber',
      {
        replacements: { batchNumber },
        transaction: t,
        type: sequelize.QueryTypes.SELECT
      }
    );
    if (!batchCheck) {
      await t.rollback();
      return res.status(400).json({ error: 'Batch not found in fermentation data' });
    }

    let finalProcessingType = processingType;
    if (!finalProcessingType) {
      const [processingTypes] = await sequelize.query(
        `SELECT DISTINCT "processingType" 
         FROM "ReferenceMappings_duplicate" 
         ORDER BY "processingType" ASC`,
        {
          transaction: t,
          type: sequelize.QueryTypes.SELECT
        }
      );
      finalProcessingType = processingTypes.length > 0 ? processingTypes[0].processingType : null;
      if (!finalProcessingType) {
        await t.rollback();
        return res.status(400).json({ error: 'No default processing type available' });
      }
    }

    const [result] = await sequelize.query(`
      INSERT INTO "FermentationWeightMeasurements" (
        "batchNumber", "processingType", weight, measurement_date, producer, created_at, updated_at
      ) VALUES (
        :batchNumber, :processingType, :weight, :measurement_date, :producer, NOW(), NOW()
      ) RETURNING *;
    `, {
      replacements: { batchNumber, processingType: finalProcessingType, weight, measurement_date: parsedDate, producer },
      transaction: t,
      type: sequelize.QueryTypes.INSERT
    });

    await t.commit();
    res.status(201).json({ message: 'Weight measurement saved', measurement: result[0] });
  } catch (err) {
    await t.rollback();
    console.error('Error saving weight measurement:', err);
    res.status(500).json({ error: 'Failed to save weight measurement', details: err.message });
  }
});

// Route for fetching weight measurements for a batch
router.get('/fermentation-weight-measurements/:batchNumber', async (req, res) => {
  const { batchNumber } = req.params;

  try {
    const [measurements] = await sequelize.query(`
      SELECT id, "batchNumber", "processingType", weight, measurement_date, producer, created_at
      FROM "FermentationWeightMeasurements"
      WHERE "batchNumber" = :batchNumber
      ORDER BY measurement_date DESC
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.SELECT
    });

    res.status(200).json(measurements || []);
  } catch (err) {
    console.error('Error fetching weight measurements:', err);
    res.status(500).json({ error: 'Failed to fetch weight measurements', details: err.message });
  }
});

// Route to update fermentation details
router.patch('/fermentation/details/:batchNumber', async (req, res) => {
  try {
    const { batchNumber } = req.params;
    const d = req.body;

    const updates = {};
    const replacements = { batchNumber };

    // -------------------------
    // 🧠 HELPER FUNCTIONS
    // -------------------------
    const setIfValid = (key, value) => {
      if (value !== undefined && value !== null && value !== '') {
        updates[key] = `:${key}`;
        replacements[key] = value;
      }
    };

    const setNumber = (key, value) => {
      if (value !== undefined && value !== null && value !== '') {
        const num = Number(value);
        if (isNaN(num)) {
          throw new Error(`Invalid number for ${key}`);
        }
        updates[key] = `:${key}`;
        replacements[key] = num;
      }
    };

    const setDate = (key, value) => {
      if (value !== undefined && value !== null && value !== '') {
        updates[key] = `:${key}`;
        replacements[key] = new Date(value);
      }
    };

    // -------------------------
    // ✏️ MAP FIELDS
    // -------------------------

    // Dates
    setDate('startDate', d.fermentationStart);
    setDate('endDate', d.fermentationEnd);
    setDate('harvestAt', d.harvestAt);
    setDate('harvestDate', d.harvestDate);
    setDate('receivedAt', d.receivedAt);

    // Numbers
    setNumber('pressure', d.pressure);
    setNumber('pH', d.pH);
    setNumber('totalVolume', d.totalVolume);
    setNumber('waterUsed', d.waterUsed);
    setNumber('starterUsed', d.starterUsed);
    setNumber('stirring', d.stirring);
    setNumber('avgTemperature', d.avgTemperature);
    setNumber('tankAmount', d.tankAmount);
    setNumber('leachateTarget', d.leachateTarget);
    setNumber('leachate', d.leachate);
    setNumber('brewTankTemperature', d.brewTankTemperature);
    setNumber('waterTemperature', d.waterTemperature);
    setNumber('coolerTemperature', d.coolerTemperature);
    setNumber('secondPressure', d.secondPressure);
    setNumber('secondTemperature', d.secondTemperature);
    setNumber('fermentationTimeTarget', d.fermentationTimeTarget);
    setNumber('secondFermentationTimeTarget', d.secondFermentationTimeTarget);

    // Strings / enums
    setIfValid('processingType', d.processingType);
    setIfValid('referenceNumber', d.referenceNumber);
    setIfValid('experimentNumber', d.experimentNumber);
    setIfValid('description', d.description);
    setIfValid('farmerName', d.farmerName);
    setIfValid('type', d.type);
    setIfValid('variety', d.variety);
    setIfValid('fermentation', d.fermentation);
    setIfValid('secondFermentation', d.secondFermentation);
    setIfValid('secondFermentationTank', d.secondFermentationTank);
    setIfValid('gas', d.gas);
    setIfValid('secondGas', d.secondGas);
    setIfValid('isSubmerged', d.isSubmerged);
    setIfValid('secondIsSubmerged', d.secondIsSubmerged);
    setIfValid('quality', d.quality);
    setIfValid('brix', d.brix);
    setIfValid('tank', d.tank);

    // -------------------------
    // 🚨 NOTHING TO UPDATE
    // -------------------------
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // -------------------------
    // 🧱 BUILD QUERY
    // -------------------------
    const setClause = Object.entries(updates)
      .map(([key, val]) => `"${key}" = ${val}`)
      .join(', ');

    const query = `
      UPDATE "FermentationData"
      SET ${setClause},
          "updatedAt" = NOW()
      WHERE "batchNumber" = :batchNumber
        AND COALESCE("tank",'') = COALESCE(:tank,'')
    `;

    await sequelize.query(query, { replacements });

    res.json({ message: 'Fermentation updated safely' });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Failed to update fermentation data',
      details: err.message,
    });
  }
});

// Route to finish fermentation for a batch
router.put('/fermentation/finish/:batchNumber', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { batchNumber } = req.params;
    const { fermentationEnd } = req.body;

    if (!fermentationEnd) {
      await t.rollback();
      return res.status(400).json({ error: 'fermentationEnd is required' });
    }

    const parsedEndDate = new Date(fermentationEnd);
    if (isNaN(parsedEndDate)) {
      await t.rollback();
      return res.status(400).json({ error: 'Invalid fermentationEnd format' });
    }

    const now = new Date();
    if (parsedEndDate > now) {
      await t.rollback();
      return res.status(400).json({ error: 'fermentationEnd cannot be in the future' });
    }

    const [batchCheck] = await sequelize.query(
      'SELECT "startDate" FROM "FermentationData" WHERE "batchNumber" = :batchNumber AND status = :status',
      {
        replacements: { batchNumber, status: 'In Progress' },
        transaction: t,
        type: sequelize.QueryTypes.SELECT
      }
    );
    if (!batchCheck) {
      await t.rollback();
      return res.status(400).json({ error: 'Batch not found or fermentation already finished' });
    }

    const parsedStartDate = new Date(batchCheck.fermentationStart);
    if (parsedEndDate < parsedStartDate) {
      await t.rollback();
      return res.status(400).json({ error: 'fermentationEnd cannot be before fermentationStart' });
    }

    const [fermentationData] = await sequelize.query(`
      UPDATE "FermentationData"
      SET "endDate" = :fermentationEnd, status = :status, "updatedAt" = NOW()
      WHERE "batchNumber" = :batchNumber
      RETURNING *;
    `, {
      replacements: { batchNumber, fermentationEnd: parsedEndDate, status: 'Finished' },
      transaction: t,
      type: sequelize.QueryTypes.UPDATE
    });

    await t.commit();
    res.json({
      message: `Fermentation finished for batch ${batchNumber}`,
      fermentationData: fermentationData[0],
    });
  } catch (err) {
    await t.rollback();
    console.error('Error finishing fermentation:', err);
    res.status(500).json({ error: 'Failed to finish fermentation', details: err.message });
  }
});

router.get('/fermentation/check-experiment', async (req, res) => {
  const { batchNumber, referenceNumber, experimentNumber } = req.query;

  const result = await sequelize.query(
    `
    SELECT 1 FROM "FermentationData"
    WHERE "batchNumber" = :batchNumber
      AND "referenceNumber" = :referenceNumber
      AND "experimentNumber" = :experimentNumber
    LIMIT 1
    `,
    {
      replacements: { batchNumber, referenceNumber, experimentNumber },
      type: sequelize.QueryTypes.SELECT,
    }
  );

  res.json({ exists: result.length > 0 });
});

module.exports = router;