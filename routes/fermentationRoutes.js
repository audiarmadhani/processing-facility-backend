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
    const allTanks = ['Biomaster', 'Carrybrew', 'Washing Track', 'Fermentation Bucket', ...allBlueBarrelCodes];

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
      fermentationTank,
      fermentationStart,
      fermentationEnd,
      createdBy,
      processingType,
      referenceNumber,
      experimentNumber,
      description,
      farmerName,
      type,
      variety,
      fermentation,
      secondFermentation,
      secondFermentationTank,
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
      harvestAt,
      receivedAt,
      receivedWeight,
      rejectWeight,
      defectWeight,
      damagedWeight,
      lostWeight,
      preprocessingWeight,
      quality,
      brix,
      tankAmount,
      leachateTarget,
      leachate,
      brewTankTemperature,
      waterTemperature,
      coolerTemperature,
      secondGas,
      secondPressure,
      secondIsSubmerged,
      secondFermentationTimeTarget,
      secondTemperature,
    } = req.body;

    // ---- required guards ----
    if (!batchNumber || !fermentationTank || !fermentationStart || !createdBy) {
      return res.status(400).json({
        error: 'batchNumber, fermentationTank, fermentationStart, and createdBy are required',
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
        "experimentNumber",
        "description",
        "farmerName",
        "type",
        "variety",
        "fermentation",
        "secondFermentation",
        "secondFermentationTank",
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
        "harvestAt",
        "receivedAt",
        "receivedWeight",
        "rejectWeight",
        "defectWeight",
        "damagedWeight",
        "lostWeight",
        "preprocessingWeight",
        "quality",
        "brix",
        "tankAmount",
        "leachateTarget",
        "leachate",
        "brewTankTemperature",
        "waterTemperature",
        "coolerTemperature",
        "secondGas",
        "secondPressure",
        "secondIsSubmerged",
        "secondFermentationTimeTarget",
        "secondTemperature",
        "createdAt",
        "updatedAt"
      ) VALUES (
        :batchNumber,
        :tank,
        :startDate,
        :endDate,
        :createdBy,
        'In Progress',
        :processingType,
        :referenceNumber,
        :experimentNumber,
        :description,
        :farmerName,
        :type,
        :variety,
        :fermentation,
        :secondFermentation,
        :secondFermentationTank,
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
        :receivedAt,
        :receivedWeight,
        :rejectWeight,
        :defectWeight,
        :damagedWeight,
        :lostWeight,
        :preprocessingWeight,
        :quality,
        :brix,
        :tankAmount,
        :leachateTarget,
        :leachate,
        :brewTankTemperature,
        :waterTemperature,
        :coolerTemperature,
        :secondGas,
        :secondPressure,
        :secondIsSubmerged,
        :secondFermentationTimeTarget,
        :secondTemperature,
        NOW(),
        NOW()
      )
      `,
      {
        replacements: {
          batchNumber,
          tank: fermentationTank,
          startDate,
          endDate,
          createdBy,
          processingType,
          referenceNumber,
          experimentNumber,
          description,
          farmerName,
          type,
          variety,
          fermentation,
          secondFermentation,
          secondFermentationTank,
          gas,
          pressure: numeric.pressure,
          isSubmerged,
          pH: numeric.pH,
          fermentationTimeTarget: numeric.fermentationTimeTarget,
          totalVolume: numeric.totalVolume,
          waterUsed: numeric.waterUsed,
          starterUsed: numeric.starterUsed,
          stirring: numeric.stirring,
          fermentationTemperature: numeric.fermentationTemperature,
          avgTemperature: numeric.avgTemperature,
          harvestAt: toNullableDate(harvestAt),
          receivedAt: toNullableDate(receivedAt),
          receivedWeight: numeric.receivedWeight,
          rejectWeight: numeric.rejectWeight,
          defectWeight: numeric.defectWeight,
          damagedWeight: numeric.damagedWeight,
          lostWeight: numeric.lostWeight,
          preprocessingWeight: numeric.preprocessingWeight,
          quality: numeric.quality,
          brix: numeric.brix,
          tankAmount: numeric.tankAmount,
          leachateTarget: numeric.leachateTarget,
          leachate: numeric.leachate,
          brewTankTemperature: numeric.brewTankTemperature,
          waterTemperature: numeric.waterTemperature,
          coolerTemperature: numeric.coolerTemperature,
          secondGas,
          secondPressure: numeric.secondPressure,
          secondIsSubmerged,
          secondFermentationTimeTarget: numeric.secondFermentationTimeTarget,
          secondTemperature: numeric.secondTemperature,
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
      SELECT 
        f."batchNumber", f."referenceNumber", f."experimentNumber", f."processingType", f."description",
        f."farmerName", f."type", f."variety", f."harvestDate", f."harvestAt", f."receivedAt",
        f."receivedWeight", f."rejectWeight", f."defectWeight", f."damagedWeight", f."lostWeight",
        f."preprocessingWeight", f."quality", f."brix", f."preStorage", f."preStorageCondition",
        f."preFermentationStorageGoal", f."preFermentationStorageStart", f."preFermentationStorageEnd",
        f."prePulped", f."prePulpedDelva", f."preFermentationTimeAfterPulping", f."prePulpedWeight",
        f."cherryType", f."fermentationCherryWeight", f."fermentation", f."tank", f."fermentationStarter",
        f."fermentationStarterAmount", f."gas", f."pressure", f."isSubmerged", f."totalVolume",
        f."waterUsed", f."starterUsed", f."stirring", f."fermentationTemperature", f."pH",
        f."fermentationTimeTarget", f."fermentationStart", f."fermentationEnd", f."finalPH",
        f."finalTDS", f."finalTemperature", f."postFermentationWeight", f."postPulped",
        f."secondFermentation", f."secondFermentationTank", f."secondWashedDelva", f."secondWashed",
        f."secondFermentationCherryWeight", f."secondFermentationPulpedWeight", f."secondStarterType",
        f."secondGas", f."secondPressure", f."secondIsSubmerged", f."secondTotalVolume",
        f."secondWaterUsed", f."secondMosstoUsed", f."secondActualVolume", f."secondTemperature",
        f."secondFermentationTimeTarget", f."secondFermentationStart", f."secondFermentationEnd",
        f."dryingArea", f."avgTemperature", f."preDryingWeight", f."finalMoisture", f."postDryingWeight",
        f."dryingStart", f."dryingEnd", f."secondDrying", f."secondDryingArea", f."secondAverageTemperature",
        f."secondFinalMoisture", f."secondPostDryingWeight", f."secondDryingStart", f."secondDryingEnd",
        f."rehydration", f."storage", f."storageTemperature", f."hullingTime", f."bagType",
        f."postHullingWeight", f."productLine", f."wesorter", f."preClassifier", f."airlock",
        f."tankAmount", f."leachateTarget", f."leachate", f."brewTankTemperature", f."waterTemperature",
        f."coolerTemperature", f."drying"
      FROM "FermentationData" f
      WHERE f."batchNumber" = :batchNumber
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
router.put('/fermentation/details/:batchNumber', async (req, res) => {
  try {
    const { batchNumber } = req.params;
    const d = req.body;

    const startDate = toNullableDate(d.fermentationStart);
    const endDate = toNullableDate(d.fermentationEnd);

    const numeric = {
      pressure: toNullableFloat(d.pressure),
      totalVolume: toNullableFloat(d.totalVolume),
      waterUsed: toNullableFloat(d.waterUsed),
      starterUsed: toNullableFloat(d.starterUsed),
      stirring: toNullableFloat(d.stirring),
      fermentationTemperature: toNullableFloat(d.fermentationTemperature),
      avgTemperature: toNullableFloat(d.avgTemperature),
      pH: toNullableFloat(d.pH),
      tankAmount: toNullableInt(d.tankAmount),
      leachateTarget: toNullableFloat(d.leachateTarget),
      leachate: toNullableFloat(d.leachate),
      brewTankTemperature: toNullableFloat(d.brewTankTemperature),
      waterTemperature: toNullableFloat(d.waterTemperature),
      coolerTemperature: toNullableFloat(d.coolerTemperature),
      secondPressure: toNullableFloat(d.secondPressure),
      secondTemperature: toNullableFloat(d.secondTemperature),
      fermentationTimeTarget: toNullableInt(d.fermentationTimeTarget),
      secondFermentationTimeTarget: toNullableInt(d.secondFermentationTimeTarget),
    };

    if (Object.values(numeric).some((v) => isNaN(v) && v !== null)) {
      return res.status(400).json({ error: 'Invalid numeric field format' });
    }

    await sequelize.query(
      `
      UPDATE "FermentationData"
      SET
        "tank" = :tank,
        "startDate" = COALESCE(:startDate, "startDate"),
        "endDate" = :endDate,
        "pressure" = :pressure,
        "isSubmerged" = :isSubmerged,
        "pH" = :pH,
        "fermentationTimeTarget" = :fermentationTimeTarget,
        "totalVolume" = :totalVolume,
        "waterUsed" = :waterUsed,
        "starterUsed" = :starterUsed,
        "stirring" = :stirring,
        "fermentationTemperature" = :fermentationTemperature,
        "avgTemperature" = :avgTemperature,
        "tankAmount" = :tankAmount,
        "leachateTarget" = :leachateTarget,
        "leachate" = :leachate,
        "brewTankTemperature" = :brewTankTemperature,
        "waterTemperature" = :waterTemperature,
        "coolerTemperature" = :coolerTemperature,
        "secondGas" = :secondGas,
        "secondPressure" = :secondPressure,
        "secondIsSubmerged" = :secondIsSubmerged,
        "secondFermentationTimeTarget" = :secondFermentationTimeTarget,
        "secondTemperature" = :secondTemperature,
        "updatedAt" = NOW()
      WHERE "batchNumber" = :batchNumber
      `,
      {
        replacements: {
          batchNumber,
          tank: d.fermentationTank,
          startDate,
          endDate,
          pressure: numeric.pressure,
          isSubmerged: d.isSubmerged,
          pH: numeric.pH,
          fermentationTimeTarget: numeric.fermentationTimeTarget,
          totalVolume: numeric.totalVolume,
          waterUsed: numeric.waterUsed,
          starterUsed: numeric.starterUsed,
          stirring: numeric.stirring,
          fermentationTemperature: numeric.fermentationTemperature,
          avgTemperature: numeric.avgTemperature,
          tankAmount: numeric.tankAmount,
          leachateTarget: numeric.leachateTarget,
          leachate: numeric.leachate,
          brewTankTemperature: numeric.brewTankTemperature,
          waterTemperature: numeric.waterTemperature,
          coolerTemperature: numeric.coolerTemperature,
          secondGas: d.secondGas,
          secondPressure: numeric.secondPressure,
          secondIsSubmerged: d.secondIsSubmerged,
          secondFermentationTimeTarget: numeric.secondFermentationTimeTarget,
          secondTemperature: numeric.secondTemperature,
        },
      }
    );

    res.json({ message: 'Fermentation updated successfully' });
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
      'SELECT "fermentationStart" FROM "FermentationData" WHERE "batchNumber" = :batchNumber AND status = :status',
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
      SET "fermentationEnd" = :fermentationEnd, status = :status, "updatedAt" = NOW()
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

module.exports = router;