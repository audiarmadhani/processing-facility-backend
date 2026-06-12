const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');
const {
  ALL_TANK_CODES,
  NON_BLOCKING_TANKS,
  normalizeTanksInput,
  validateTanks,
  tanksToDenormalized,
  deriveTankAmount,
  assertTanksAvailable,
  replaceFermentationTanks,
  attachTanksToRows,
  applyTanksPatchUpdate,
} = require('../utils/fermentationTanks');

const toNullableFloat = (v) =>
  v === '' || v === undefined || v === null ? null : parseFloat(v);

const toNullableInt = (v) =>
  v === '' || v === undefined || v === null ? null : parseInt(v, 10);

const toNullableDate = (v) =>
  v ? new Date(v) : null;

const ACTIVE_BATCH_STATUSES = ['Awaiting Batch', 'In Progress'];

const WITA_TZ = 'Asia/Makassar';
const MORNING_WINDOW_START = 6;
const MORNING_WINDOW_END = 12;
const EVENING_WINDOW_START = 17;
const EVENING_WINDOW_END = 21;

function getWitaNow() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: WITA_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const get = (type) => parts.find((p) => p.type === type)?.value;
  const hourPart = get('hour');
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    hour: hourPart === '24' ? 0 : parseInt(hourPart, 10),
  };
}

function getActivePeriodFromHour(hour) {
  if (hour >= MORNING_WINDOW_START && hour < MORNING_WINDOW_END) return 'morning';
  if (hour >= EVENING_WINDOW_START && hour < EVENING_WINDOW_END) return 'evening';
  return null;
}

function mapFermentationRow(row) {
  const tanks = row.tanks?.length
    ? row.tanks
    : normalizeTanksInput({ tank: row.tank });
  return {
    id: row.id,
    batchNumber: row.batchNumber,
    experimentNumber: row.experimentNumber,
    referenceNumber: row.referenceNumber,
    version: row.version,
    tank: tanks.length ? tanksToDenormalized(tanks) : row.tank,
    tanks,
    status: row.status,
  };
}

async function assertBatchNotActivelyUsed(batchNumber, excludeId = null) {
  if (!batchNumber) return;
  const [row] = await sequelize.query(
    `SELECT id FROM "FermentationData"
     WHERE "batchNumber" = :batchNumber
     AND status IN ('Awaiting Batch', 'In Progress')
     AND (:excludeId IS NULL OR id != :excludeId)
     LIMIT 1`,
    {
      replacements: { batchNumber, excludeId: excludeId ?? null },
      type: sequelize.QueryTypes.SELECT,
    }
  );
  if (row) {
    const err = new Error(`Batch ${batchNumber} is already linked to an active fermentation entry`);
    err.statusCode = 400;
    throw err;
  }
}

// Route for fetching available tanks
router.get('/fermentation/available-tanks', async (req, res) => {
  try {
    const excludeId = req.query.excludeFermentationId
      ? parseInt(req.query.excludeFermentationId, 10)
      : null;

    const inUseRows = await sequelize.query(
      `SELECT DISTINCT ft.tank
       FROM "FermentationTanks" ft
       INNER JOIN "FermentationData" f ON f.id = ft."fermentationId"
       WHERE f.status = :status
       AND ft.tank NOT IN (:nonBlocking)
       AND (:excludeId IS NULL OR f.id != :excludeId)`,
      {
        replacements: {
          status: 'In Progress',
          nonBlocking: NON_BLOCKING_TANKS,
          excludeId: excludeId && !Number.isNaN(excludeId) ? excludeId : null,
        },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const inUseTankNames = inUseRows.map((row) => row.tank).filter(Boolean);
    const availableTanks = ALL_TANK_CODES.filter((t) => !inUseTankNames.includes(t));

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
      AND r."batchNumber" NOT IN (
        SELECT "batchNumber" FROM "FermentationData"
        WHERE "batchNumber" IS NOT NULL
        AND status IN ('Awaiting Batch', 'In Progress')
      )
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
      tanks: tanksBody,
      fermentationStart,
      fermentationEnd,
      createdBy,
      processingType,
      referenceNumber,
      version,
      experimentNumber,
      purpose,
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
      secondPostPulped,
      secondPostPulpedDelva,
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
    if (!createdBy || version === undefined || version === null || version === '') {
      return res.status(400).json({
        error: 'createdBy and version are required',
      });
    }

    if (!referenceNumber || !experimentNumber) {
      return res.status(400).json({
        error: 'referenceNumber and experimentNumber are required',
      });
    }

    const tanksList = normalizeTanksInput({ tanks: tanksBody, tank });
    const tanksError = validateTanks(tanksList);
    if (tanksError) {
      return res.status(400).json({ error: tanksError });
    }

    try {
      await assertTanksAvailable(sequelize, tanksList, null);
    } catch (err) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }

    const denormalizedTank = tanksToDenormalized(tanksList);
    const resolvedTankAmount = deriveTankAmount(tanksList, toNullableInt(tankAmount));

    const trimmedBatch = batchNumber?.trim() || null;

    try {
      await assertBatchNotActivelyUsed(trimmedBatch, null);
    } catch (err) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }

    // ---- canonical dates & status ----
    let startDate = null;
    let endDate = toNullableDate(fermentationEnd);
    let status;

    if (trimmedBatch) {
      if (fermentationStart) {
        startDate = new Date(fermentationStart);
      } else {
        startDate = new Date();
      }
      if (isNaN(startDate.getTime())) {
        return res.status(400).json({ error: 'Invalid fermentationStart' });
      }
      status = 'In Progress';
    } else {
      status = 'Awaiting Batch';
      if (fermentationStart) {
        const parsed = new Date(fermentationStart);
        if (!isNaN(parsed.getTime())) startDate = parsed;
      }
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
      tankAmount: resolvedTankAmount,
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
    const inserted = await sequelize.query(
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
        "purpose",
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
        "secondPostPulped",
        "secondPostPulpedDelva",
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
        :status,

        :processingType,
        :referenceNumber,
        :version,
        :experimentNumber,
        :purpose,
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
        :secondPostPulped,
        :secondPostPulpedDelva,
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
      ON CONFLICT ("referenceNumber", "version", "experimentNumber")
      DO UPDATE SET
        "batchNumber" = EXCLUDED."batchNumber",
        "tank" = EXCLUDED."tank",
        "startDate" = EXCLUDED."startDate",
        "endDate" = EXCLUDED."endDate",
        "status" = EXCLUDED."status",
        "processingType" = EXCLUDED."processingType",
        "version" = EXCLUDED."version",
        "purpose" = EXCLUDED."purpose",
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

        "updatedAt" = NOW()
      RETURNING id;
      `,
      {
        replacements: {
          batchNumber: trimmedBatch,
          tank: denormalizedTank,
          startDate,
          endDate,
          createdBy,
          status,

          processingType,
          referenceNumber,
          version: toNullableInt(version),
          experimentNumber,
          purpose,
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
          secondPostPulped,
          secondPostPulpedDelva,
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
          tankAmount: resolvedTankAmount,
          leachateTarget: toNullableFloat(leachateTarget),
          leachate: toNullableFloat(leachate),
          brewTankTemperature: toNullableFloat(brewTankTemperature),
          waterTemperature: toNullableFloat(waterTemperature),
          coolerTemperature: toNullableFloat(coolerTemperature),
        },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const fermentationId = inserted[0]?.id;
    if (fermentationId) {
      await replaceFermentationTanks(sequelize, fermentationId, tanksList);
    }

    res.status(201).json({
      message: trimmedBatch
        ? 'Fermentation started successfully'
        : 'Order sheet saved — awaiting batch assignment',
      id: fermentationId,
      status,
      tanks: tanksList,
    });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      error: err.message || 'Failed to create fermentation data',
      details: err.message,
    });
  }
});

// Route for fetching all fermentation data
router.get('/fermentation', async (req, res) => {
  try {
    const rows = await sequelize.query(
      `SELECT 
        f.*, 
        COALESCE(r."farmerName", f."farmerName") AS "farmerName",
        r.weight AS receiving_weight,
        f."startDate" as "fermentationStart",
        f."endDate" as "fermentationEnd"
      FROM "FermentationData" f
      LEFT JOIN "ReceivingData" r ON f."batchNumber" = r."batchNumber"
      WHERE f."batchNumber" IS NULL OR r.merged = FALSE
      ORDER BY f."createdAt" DESC, f."startDate" DESC NULLS LAST;`,
      { type: sequelize.QueryTypes.SELECT }
    );

    const withTanks = await attachTanksToRows(sequelize, rows || []);
    res.json(withTanks);
  } catch (err) {
    console.error('Error fetching fermentation data:', err);
    res.status(500).json({ error: 'Failed to fetch fermentation data', details: err.message });
  }
});

router.get('/fermentation/details/id/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const fermentation = await sequelize.query(`
      SELECT f.*,
        f."startDate" AS "fermentationStart",
        f."endDate" AS "fermentationEnd"
      FROM "FermentationData" f WHERE f.id = :id
    `, {
      replacements: { id: parseInt(id, 10) },
      type: sequelize.QueryTypes.SELECT,
    });

    const withTanks = await attachTanksToRows(sequelize, fermentation || []);
    res.status(200).json(withTanks);
  } catch (error) {
    console.error('Error fetching fermentation data:', error);
    res.status(500).json({ error: 'Failed to fetch fermentation data', details: error.message });
  }
});

router.get('/fermentation/details/:batchNumber', async (req, res) => {
  const { batchNumber } = req.params;

  try {
    const fermentation = await sequelize.query(`
      SELECT f.*,
        f."startDate" AS "fermentationStart",
        f."endDate" AS "fermentationEnd"
      FROM "FermentationData" f WHERE f."batchNumber" = :batchNumber
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.SELECT,
    });

    const withTanks = await attachTanksToRows(sequelize, fermentation || []);
    res.status(200).json(withTanks);
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
    const measurements = await sequelize.query(`
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

router.patch('/fermentation/details/id/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const d = req.body;
    const entryId = parseInt(id, 10);

    const [entry] = await sequelize.query(
      `SELECT id, status FROM "FermentationData" WHERE id = :id`,
      { replacements: { id: entryId }, type: sequelize.QueryTypes.SELECT }
    );

    if (!entry) {
      return res.status(404).json({ error: 'Fermentation entry not found' });
    }

    let tanksPatch = { updated: false };
    try {
      tanksPatch = await applyTanksPatchUpdate(sequelize, {
        fermentationId: entryId,
        status: entry.status,
        body: d,
      });
    } catch (err) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }

    const updates = {};
    const replacements = { id: entryId };

    const setIfValid = (key, value) => {
      if (value !== undefined && value !== null && value !== '') {
        updates[key] = `:${key}`;
        replacements[key] = value;
      }
    };

    const setNumber = (key, value) => {
      if (value !== undefined && value !== null && value !== '') {
        const num = Number(value);
        if (isNaN(num)) throw new Error(`Invalid number for ${key}`);
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

    setDate('startDate', d.fermentationStart);
    setDate('endDate', d.fermentationEnd);
    setDate('harvestAt', d.harvestAt);
    setDate('harvestDate', d.harvestDate);
    setDate('receivedAt', d.receivedAt);
    setDate('preFermentationStorageStart', d.preFermentationStorageStart);
    setDate('preFermentationStorageEnd', d.preFermentationStorageEnd);

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

    setIfValid('processingType', d.processingType);
    setIfValid('referenceNumber', d.referenceNumber);
    setIfValid('experimentNumber', d.experimentNumber);
    setIfValid('purpose', d.purpose);
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
    if (!d.tanks && d.tank !== undefined) {
      setIfValid('tank', d.tank);
    }
    setIfValid('fermentationStarter', d.fermentationStarter);
    setNumber('fermentationStarterAmount', d.fermentationStarterAmount);
    setIfValid('drying', d.drying);

    if (Object.keys(updates).length === 0 && !tanksPatch.updated) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    if (Object.keys(updates).length > 0) {
      const setClause = Object.entries(updates)
        .map(([key, val]) => `"${key}" = ${val}`)
        .join(', ');

      await sequelize.query(
        `UPDATE "FermentationData"
         SET ${setClause}, "updatedAt" = NOW()
         WHERE id = :id`,
        { replacements }
      );
    }

    res.json({
      message: 'Fermentation updated safely',
      tanks: tanksPatch.updated ? tanksPatch.tanks : undefined,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Failed to update fermentation data',
      details: err.message,
    });
  }
});

router.patch('/fermentation/:id/assign-batch', async (req, res) => {
  const entryId = parseInt(req.params.id, 10);
  const { batchNumber } = req.body;

  if (!entryId || !batchNumber?.trim()) {
    return res.status(400).json({ error: 'id and batchNumber are required' });
  }

  const trimmedBatch = batchNumber.trim();

  try {
    const [entry] = await sequelize.query(
      `SELECT id, status, "batchNumber", "farmerName", type, variety
       FROM "FermentationData"
       WHERE id = :id`,
      { replacements: { id: entryId }, type: sequelize.QueryTypes.SELECT }
    );

    if (!entry) {
      return res.status(404).json({ error: 'Fermentation entry not found' });
    }

    if (entry.status !== 'Awaiting Batch') {
      return res.status(400).json({ error: 'Batch can only be assigned to Awaiting Batch entries' });
    }

    if (entry.batchNumber) {
      return res.status(400).json({ error: 'Batch cannot be reassigned once assigned' });
    }

    await assertBatchNotActivelyUsed(trimmedBatch, entryId);

    const [receiving] = await sequelize.query(
      `SELECT "farmerName", type, variety FROM "ReceivingData"
       WHERE "batchNumber" = :batchNumber AND merged = FALSE
       LIMIT 1`,
      { replacements: { batchNumber: trimmedBatch }, type: sequelize.QueryTypes.SELECT }
    );

    if (!receiving) {
      return res.status(404).json({ error: 'Batch not found in receiving data' });
    }

    const farmerName = entry.farmerName || receiving.farmerName || null;
    const type = entry.type || receiving.type || null;
    const variety = entry.variety || receiving.variety || null;
    const newStatus = 'In Progress';

    await sequelize.query(
      `UPDATE "FermentationData"
       SET "batchNumber" = :batchNumber,
           "farmerName" = :farmerName,
           type = :type,
           variety = :variety,
           status = :status,
           "startDate" = COALESCE("startDate", NOW()),
           "updatedAt" = NOW()
       WHERE id = :id`,
      {
        replacements: {
          id: entryId,
          batchNumber: trimmedBatch,
          farmerName,
          type,
          variety,
          status: newStatus,
        },
      }
    );

    res.json({
      message: `Batch ${trimmedBatch} assigned successfully`,
      status: newStatus,
      farmerName,
      type,
      variety,
    });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      error: err.message || 'Failed to assign batch',
      details: err.message,
    });
  }
});

// Route to update fermentation details
router.patch('/fermentation/details/:batchNumber', async (req, res) => {
  try {
    const { batchNumber } = req.params;
    const d = req.body;

    const [entry] = await sequelize.query(
      `SELECT id, status FROM "FermentationData"
       WHERE "batchNumber" = :batchNumber
       ORDER BY "createdAt" DESC
       LIMIT 1`,
      { replacements: { batchNumber }, type: sequelize.QueryTypes.SELECT }
    );

    if (!entry) {
      return res.status(404).json({ error: 'Fermentation entry not found' });
    }

    let tanksPatch = { updated: false };
    try {
      tanksPatch = await applyTanksPatchUpdate(sequelize, {
        fermentationId: entry.id,
        status: entry.status,
        body: d,
      });
    } catch (err) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }

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
    setDate('preFermentationStorageStart', d.preFermentationStorageStart);
    setDate('preFermentationStorageEnd', d.preFermentationStorageEnd);

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
    setIfValid('purpose', d.purpose);
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
    if (!d.tanks && d.tank !== undefined) {
      setIfValid('tank', d.tank);
    }
    setIfValid('fermentationStarter', d.fermentationStarter);
    setNumber('fermentationStarterAmount', d.fermentationStarterAmount);
    setIfValid('drying', d.drying);

    if (Object.keys(updates).length === 0 && !tanksPatch.updated) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    if (Object.keys(updates).length > 0) {
      const setClause = Object.entries(updates)
        .map(([key, val]) => `"${key}" = ${val}`)
        .join(', ');

      const query = `
        UPDATE "FermentationData"
        SET ${setClause},
            "updatedAt" = NOW()
        WHERE id = (
          SELECT id FROM "FermentationData"
          WHERE "batchNumber" = :batchNumber
          ORDER BY "createdAt" DESC
          LIMIT 1
        )
      `;

      await sequelize.query(query, { replacements });
    }

    res.json({
      message: 'Fermentation updated safely',
      tanks: tanksPatch.updated ? tanksPatch.tanks : undefined,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Failed to update fermentation data',
      details: err.message,
    });
  }
});

router.put('/fermentation/finish/id/:id', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const entryId = parseInt(req.params.id, 10);
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

    if (parsedEndDate > new Date()) {
      await t.rollback();
      return res.status(400).json({ error: 'fermentationEnd cannot be in the future' });
    }

    const [entry] = await sequelize.query(
      `SELECT id, "batchNumber", "startDate", status FROM "FermentationData"
       WHERE id = :id AND status = 'In Progress'`,
      { replacements: { id: entryId }, transaction: t, type: sequelize.QueryTypes.SELECT }
    );

    if (!entry) {
      await t.rollback();
      return res.status(400).json({ error: 'Entry not found or not in progress' });
    }

    if (!entry.batchNumber) {
      await t.rollback();
      return res.status(400).json({ error: 'Assign a batch before finishing fermentation' });
    }

    const parsedStartDate = new Date(entry.startDate);
    if (parsedEndDate < parsedStartDate) {
      await t.rollback();
      return res.status(400).json({ error: 'fermentationEnd cannot be before fermentationStart' });
    }

    const [fermentationData] = await sequelize.query(
      `UPDATE "FermentationData"
       SET "endDate" = :fermentationEnd, status = 'Finished', "updatedAt" = NOW()
       WHERE id = :id
       RETURNING *`,
      {
        replacements: { id: entryId, fermentationEnd: parsedEndDate },
        transaction: t,
        type: sequelize.QueryTypes.UPDATE,
      }
    );

    await t.commit();
    res.json({
      message: `Fermentation finished for batch ${entry.batchNumber}`,
      fermentationData: fermentationData[0],
    });
  } catch (err) {
    await t.rollback();
    console.error('Error finishing fermentation:', err);
    res.status(500).json({ error: 'Failed to finish fermentation', details: err.message });
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
  const { experimentNumber, excludeId } = req.query;

  if (!experimentNumber) {
    return res.json({ exists: false });
  }

  const result = await sequelize.query(
    `
    SELECT 1 FROM "FermentationData"
    WHERE "experimentNumber" = :experimentNumber
    AND (:excludeId IS NULL OR id != :excludeId)
    LIMIT 1
    `,
    {
      replacements: {
        experimentNumber,
        excludeId: excludeId ? parseInt(excludeId, 10) : null,
      },
      type: sequelize.QueryTypes.SELECT,
    }
  );

  res.json({ exists: result.length > 0 });
});

router.delete('/fermentation/id/:id', async (req, res) => {
  try {
    const entryId = parseInt(req.params.id, 10);
    if (!entryId) {
      return res.status(400).json({ error: 'Valid id is required' });
    }

    const deleted = await sequelize.query(
      `
      DELETE FROM "FermentationData"
      WHERE id = :id
      AND status IN ('Awaiting Batch', 'Finished')
      RETURNING id
      `,
      { replacements: { id: entryId }, type: sequelize.QueryTypes.SELECT }
    );

    if (!deleted.length) {
      return res.status(400).json({ error: 'Entry not found or cannot be deleted while in progress' });
    }

    res.json({ message: 'Entry deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Failed to delete entry',
      details: err.message,
    });
  }
});

// DELETE /api/fermentation/:batchNumber
router.delete('/fermentation/:batchNumber', async (req, res) => {
  try {
    const { batchNumber } = req.params;
    const { tank } = req.query; // pass tank as query param

    if (!batchNumber) {
      return res.status(400).json({ error: 'batchNumber is required' });
    }

    await sequelize.query(
      `
      DELETE FROM "FermentationData"
      WHERE "batchNumber" = :batchNumber
      AND COALESCE("tank",'') = COALESCE(:tank,'')
      AND ("endDate" IS NOT NULL)
      `,
      {
        replacements: { batchNumber, tank },
      }
    );

    res.json({ message: 'Batch deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Failed to delete batch',
      details: err.message,
    });
  }
});

router.delete('/fermentation-weight-measurements', async (req, res) => {
  try {
    const {
      id,
      batchNumber,
      processingType,
      measurement_date,
    } = req.query;

    const parsedId = id ? parseInt(id, 10) : null;

    if (id && Number.isNaN(parsedId)) {
      return res.status(400).json({ error: 'id must be a valid number' });
    }

    let whereClause = 'id = :id';
    const replacements = { id: parsedId };

    if (!parsedId) {
      if (!batchNumber || !processingType || !measurement_date) {
        return res.status(400).json({
          error: 'id or batchNumber, processingType, and measurement_date are required',
        });
      }

      whereClause = `
        "batchNumber" = :batchNumber
        AND "processingType" = :processingType
        AND measurement_date::date = CAST(:measurement_date AS date)
      `;
      Object.assign(replacements, { batchNumber, processingType, measurement_date });
    }

    const deletedRows = await sequelize.query(
      `
      DELETE FROM "FermentationWeightMeasurements"
      WHERE ${whereClause}
      RETURNING id
      `,
      {
        replacements,
        type: sequelize.QueryTypes.DELETE,
      }
    );

    res.json({
      success: true,
      deleted: deletedRows.length,
      deletedIds: deletedRows.map((row) => row.id),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Delete failed',
    });
  }
});

router.get('/fermentation/check-ins/pending', async (req, res) => {
  try {
    const { date: checkInDate, hour } = getWitaNow();
    const activePeriod = getActivePeriodFromHour(hour);
    const inReminderWindow = activePeriod !== null;

    const activeRowsRaw = await sequelize.query(
      `SELECT id, "batchNumber", "experimentNumber", "referenceNumber", version, tank, status
       FROM "FermentationData"
       WHERE status = 'In Progress'
       AND "batchNumber" IS NOT NULL
       ORDER BY "batchNumber" ASC`,
      { type: sequelize.QueryTypes.SELECT }
    );

    const activeRows = await attachTanksToRows(sequelize, activeRowsRaw || []);

    if (!activeRows.length) {
      return res.json({
        activePeriod,
        inReminderWindow,
        checkInDate,
        pending: [],
        overdue: [],
      });
    }

    const fermentationIds = activeRows.map((r) => r.id);
    const checkIns = await sequelize.query(
      `SELECT "fermentationId", period
       FROM "FermentationCheckIns"
       WHERE "fermentationId" IN (:fermentationIds)
       AND "checkInDate" = :checkInDate`,
      {
        replacements: { fermentationIds, checkInDate },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const checkInMap = new Map();
    for (const ci of checkIns) {
      if (!checkInMap.has(ci.fermentationId)) {
        checkInMap.set(ci.fermentationId, new Set());
      }
      checkInMap.get(ci.fermentationId).add(ci.period);
    }

    const pending = [];
    const overdue = [];

    for (const row of activeRows) {
      const periods = checkInMap.get(row.id) || new Set();
      const hasMorning = periods.has('morning');
      const hasEvening = periods.has('evening');
      const base = mapFermentationRow(row);

      if (activePeriod === 'morning' && !hasMorning) {
        pending.push({ ...base, missingPeriod: 'morning' });
      }
      if (activePeriod === 'evening' && !hasEvening) {
        pending.push({ ...base, missingPeriod: 'evening' });
      }

      if (!hasMorning && hour >= MORNING_WINDOW_END) {
        overdue.push({ ...base, missingPeriod: 'morning' });
      }
      if (!hasEvening && hour >= EVENING_WINDOW_END) {
        overdue.push({ ...base, missingPeriod: 'evening' });
      }
    }

    res.json({
      activePeriod,
      inReminderWindow,
      checkInDate,
      pending,
      overdue,
    });
  } catch (err) {
    console.error('Error fetching pending check-ins:', err);
    res.status(500).json({ error: 'Failed to fetch pending check-ins', details: err.message });
  }
});

router.get('/fermentation/:id/check-ins', async (req, res) => {
  try {
    const fermentationId = parseInt(req.params.id, 10);
    if (!fermentationId) {
      return res.status(400).json({ error: 'Valid fermentation id is required' });
    }

    const rows = await sequelize.query(
      `SELECT id, "fermentationId", "batchNumber", period, "checkInDate", notes, "imageUrl", "createdBy", "createdAt"
       FROM "FermentationCheckIns"
       WHERE "fermentationId" = :fermentationId
       ORDER BY "checkInDate" DESC, period DESC, "createdAt" DESC`,
      {
        replacements: { fermentationId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json(rows);
  } catch (err) {
    console.error('Error fetching check-ins:', err);
    res.status(500).json({ error: 'Failed to fetch check-ins', details: err.message });
  }
});

router.post('/fermentation/:id/check-in', async (req, res) => {
  try {
    const fermentationId = parseInt(req.params.id, 10);
    const { notes, imageUrl, period: bodyPeriod, createdBy } = req.body;

    if (!fermentationId) {
      return res.status(400).json({ error: 'Valid fermentation id is required' });
    }
    if (!imageUrl?.trim()) {
      return res.status(400).json({ error: 'imageUrl is required' });
    }
    if (!createdBy?.trim()) {
      return res.status(400).json({ error: 'createdBy is required' });
    }

    const [entry] = await sequelize.query(
      `SELECT id, "batchNumber", status FROM "FermentationData" WHERE id = :id`,
      {
        replacements: { id: fermentationId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!entry) {
      return res.status(404).json({ error: 'Fermentation entry not found' });
    }
    if (entry.status !== 'In Progress') {
      return res.status(400).json({ error: 'Check-in is only allowed for In Progress fermentations' });
    }
    if (!entry.batchNumber) {
      return res.status(400).json({ error: 'Assign a batch before checking in' });
    }

    const { date: checkInDate, hour } = getWitaNow();
    const period = bodyPeriod || getActivePeriodFromHour(hour);
    if (!period) {
      return res.status(400).json({
        error: 'Check-in is only allowed during morning (06:00–12:00 WITA) or evening (17:00–21:00 WITA) windows',
      });
    }
    if (bodyPeriod && !['morning', 'evening'].includes(bodyPeriod)) {
      return res.status(400).json({ error: 'period must be morning or evening' });
    }

    const [inserted] = await sequelize.query(
      `INSERT INTO "FermentationCheckIns" (
        "fermentationId", "batchNumber", period, "checkInDate", notes, "imageUrl", "createdBy"
      ) VALUES (
        :fermentationId, :batchNumber, :period, :checkInDate, :notes, :imageUrl, :createdBy
      )
      RETURNING *`,
      {
        replacements: {
          fermentationId,
          batchNumber: entry.batchNumber,
          period,
          checkInDate,
          notes: notes?.trim() || null,
          imageUrl: imageUrl.trim(),
          createdBy: createdBy.trim(),
        },
        type: sequelize.QueryTypes.INSERT,
      }
    );

    res.status(201).json({
      message: `${period === 'morning' ? 'Morning' : 'Evening'} check-in saved`,
      checkIn: inserted[0],
    });
  } catch (err) {
    if (err.parent?.code === '23505') {
      return res.status(409).json({
        error: 'Already checked in for this period today',
      });
    }
    console.error('Error saving check-in:', err);
    res.status(500).json({ error: 'Failed to save check-in', details: err.message });
  }
});

module.exports = router;
