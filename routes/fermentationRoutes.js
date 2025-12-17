const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

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
  const t = await sequelize.transaction();
  try {
    const {
      batchNumber, referenceNumber, experimentNumber, processingType, description, farmerName,
      type, variety, harvestDate, harvestAt, receivedAt, receivedWeight, rejectWeight,
      defectWeight, damagedWeight, lostWeight, preprocessingWeight, quality, brix,
      preStorage, preStorageCondition, preFermentationStorageGoal, preFermentationStorageStart,
      preFermentationStorageEnd, prePulped, prePulpedDelva, preFermentationTimeAfterPulping,
      prePulpedWeight, cherryType, fermentationCherryWeight, fermentation, fermentationTank,
      fermentationStarter, fermentationStarterAmount, gas, pressure, isSubmerged, totalVolume,
      waterUsed, starterUsed, stirring, fermentationTemperature, pH, fermentationTimeTarget,
      fermentationStart, fermentationEnd, finalPH, finalTDS, finalTemperature, postFermentationWeight,
      postPulped, secondFermentation, secondFermentationTank, secondWashedDelva, secondWashed,
      secondFermentationCherryWeight, secondFermentationPulpedWeight, secondStarterType, secondGas,
      secondPressure, secondIsSubmerged, secondTotalVolume, secondWaterUsed, secondMosstoUsed,
      secondActualVolume, secondTemperature, secondFermentationTimeTarget, secondFermentationStart,
      secondFermentationEnd, dryingArea, avgTemperature, preDryingWeight, finalMoisture,
      postDryingWeight, dryingStart, dryingEnd, secondDrying, secondDryingArea, secondAverageTemperature,
      secondFinalMoisture, secondPostDryingWeight, secondDryingStart, secondDryingEnd, rehydration,
      storage, storageTemperature, hullingTime, bagType, postHullingWeight, createdBy,
      productLine, wesorter, preClassifier, airlock, tankAmount, leachateTarget, leachate,
      brewTankTemperature, waterTemperature, coolerTemperature, drying
    } = req.body;

    const requiredFields = { batchNumber, fermentationTank, fermentationStart, createdBy };
    if (Object.values(requiredFields).some(field => !field)) {
      await t.rollback();
      return res.status(400).json({ error: 'batchNumber, fermentationTank, fermentationStart, and createdBy are required.' });
    }

    if (!['Biomaster', 'Carrybrew', 'Washing Track', 'Fermentation Bucket'].includes(fermentationTank) && !/^BB-HQ-\d{4}$/.test(fermentationTank)) {
      await t.rollback();
      return res.status(400).json({ error: 'Invalid fermentationTank. Must be Biomaster, Carrybrew, Washing Track, Fermentation Bucket, or BB-HQ-XXXX.' });
    }

    const parsedStartDate = new Date(fermentationStart);
    if (isNaN(parsedStartDate)) {
      await t.rollback();
      return res.status(400).json({ error: 'Invalid fermentationStart format.' });
    }

    const now = new Date();
    if (parsedStartDate > now) {
      await t.rollback();
      return res.status(400).json({ error: 'fermentationStart cannot be in the future.' });
    }

    const parsedFermentationEnd = fermentationEnd ? new Date(fermentationEnd) : null;
    if (fermentationEnd && isNaN(parsedFermentationEnd)) {
      await t.rollback();
      return res.status(400).json({ error: 'Invalid fermentationEnd format.' });
    }

    if (parsedFermentationEnd && parsedFermentationEnd < parsedStartDate) {
      await t.rollback();
      return res.status(400).json({ error: 'fermentationEnd cannot be before fermentationStart.' });
    }

    if (parsedFermentationEnd && parsedFermentationEnd > now) {
      await t.rollback();
      return res.status(400).json({ error: 'fermentationEnd cannot be in the future.' });
    }

    if (drying && !['Pulped Natural', 'Natural', 'Washed'].includes(drying)) {
      await t.rollback();
      return res.status(400).json({ error: 'Invalid drying value. Must be Pulped Natural, Natural, or Washed.' });
    }

    const numericFields = {
      receivedWeight: parseFloat(receivedWeight),
      rejectWeight: parseFloat(rejectWeight),
      defectWeight: parseFloat(defectWeight),
      damagedWeight: parseFloat(damagedWeight),
      lostWeight: parseFloat(lostWeight),
      preprocessingWeight: parseFloat(preprocessingWeight),
      quality: parseFloat(quality),
      brix: parseFloat(brix),
      preFermentationStorageGoal: parseFloat(preFermentationStorageGoal),
      preFermentationTimeAfterPulping: parseFloat(preFermentationTimeAfterPulping),
      prePulpedWeight: parseFloat(prePulpedWeight),
      fermentationCherryWeight: parseFloat(fermentationCherryWeight),
      fermentationStarterAmount: parseFloat(fermentationStarterAmount),
      pressure: parseFloat(pressure),
      totalVolume: parseFloat(totalVolume),
      waterUsed: parseFloat(waterUsed),
      starterUsed: parseFloat(starterUsed),
      stirring: parseFloat(stirring),
      fermentationTemperature: parseFloat(fermentationTemperature),
      pH: parseFloat(pH),
      fermentationTimeTarget: parseInt(fermentationTimeTarget),
      finalPH: parseFloat(finalPH),
      finalTDS: parseFloat(finalTDS),
      finalTemperature: parseFloat(finalTemperature),
      postFermentationWeight: parseFloat(postFermentationWeight),
      secondFermentationCherryWeight: parseFloat(secondFermentationCherryWeight),
      secondFermentationPulpedWeight: parseFloat(secondFermentationPulpedWeight),
      secondPressure: parseFloat(secondPressure),
      secondTotalVolume: parseFloat(secondTotalVolume),
      secondWaterUsed: parseFloat(secondWaterUsed),
      secondMosstoUsed: parseFloat(secondMosstoUsed),
      secondActualVolume: parseFloat(secondActualVolume),
      secondTemperature: parseFloat(secondTemperature),
      secondFermentationTimeTarget: parseInt(secondFermentationTimeTarget),
      avgTemperature: parseFloat(avgTemperature),
      preDryingWeight: parseFloat(preDryingWeight),
      finalMoisture: parseFloat(finalMoisture),
      postDryingWeight: parseFloat(postDryingWeight),
      secondAverageTemperature: parseFloat(secondAverageTemperature),
      secondFinalMoisture: parseFloat(secondFinalMoisture),
      secondPostDryingWeight: parseFloat(secondPostDryingWeight),
      storageTemperature: parseFloat(storageTemperature),
      postHullingWeight: parseFloat(postHullingWeight),
      tankAmount: parseInt(tankAmount),
      leachateTarget: parseFloat(leachateTarget),
      leachate: parseFloat(leachate),
      brewTankTemperature: parseFloat(brewTankTemperature),
      waterTemperature: parseFloat(waterTemperature),
      coolerTemperature: parseFloat(coolerTemperature)
    };
    if (Object.values(numericFields).some(v => isNaN(v) && v !== null)) {
      await t.rollback();
      return res.status(400).json({ error: 'Invalid numeric field format.', details: `Invalid value in one of: ${Object.keys(numericFields).join(', ')}` });
    }

    const [batchCheck] = await sequelize.query(
      `SELECT 1 
      FROM "ReceivingData" r
      WHERE r."batchNumber" = :batchNumber 
      AND r.merged = FALSE 
      AND r."commodityType" = 'Cherry'`,
      {
        replacements: { batchNumber },
        transaction: t,
        type: sequelize.QueryTypes.SELECT
      }
    );
    if (!batchCheck) {
      await t.rollback();
      return res.status(400).json({ error: 'Batch number not found, merged, or not Cherry.' });
    }

    const [tankCheck] = await sequelize.query(
      'SELECT 1 FROM "FermentationData" WHERE tank = :tank AND status = :status',
      {
        replacements: { tank: fermentationTank, status: 'In Progress' },
        transaction: t,
        type: sequelize.QueryTypes.SELECT
      }
    );
    if (tankCheck) {
      await t.rollback();
      return res.status(400).json({ error: `Tank ${fermentationTank} is already in use.` });
    }

    const [dryingCheck] = await sequelize.query(
      'SELECT 1 FROM "DryingData" WHERE "batchNumber" = :batchNumber',
      {
        replacements: { batchNumber },
        transaction: t,
        type: sequelize.QueryTypes.SELECT
      }
    );
    if (dryingCheck) {
      await t.rollback();
      return res.status(400).json({ error: 'Batch is already in drying.' });
    }

    const [fermentationData] = await sequelize.query(`
      INSERT INTO "FermentationData" (
        "batchNumber", "referenceNumber", "experimentNumber", "processingType", "description", 
        "farmerName", "type", "variety", "harvestDate", "harvestAt", "receivedAt", 
        "receivedWeight", "rejectWeight", "defectWeight", "damagedWeight", "lostWeight", 
        "preprocessingWeight", "quality", "brix", "preStorage", "preStorageCondition", 
        "preFermentationStorageGoal", "preFermentationStorageStart", "preFermentationStorageEnd", 
        "prePulped", "prePulpedDelva", "preFermentationTimeAfterPulping", "prePulpedWeight", 
        "cherryType", "fermentationCherryWeight", "fermentation", "tank", "fermentationStarter", 
        "fermentationStarterAmount", "gas", "pressure", "isSubmerged", "totalVolume", 
        "waterUsed", "starterUsed", "stirring", "fermentationTemperature", "pH", 
        "fermentationTimeTarget", "fermentationStart", "fermentationEnd", "finalPH", 
        "finalTDS", "finalTemperature", "postFermentationWeight", "postPulped", 
        "secondFermentation", "secondFermentationTank", "secondWashedDelva", "secondWashed", 
        "secondFermentationCherryWeight", "secondFermentationPulpedWeight", "secondStarterType", 
        "secondGas", "secondPressure", "secondIsSubmerged", "secondTotalVolume", 
        "secondWaterUsed", "secondMosstoUsed", "secondActualVolume", "secondTemperature", 
        "secondFermentationTimeTarget", "secondFermentationStart", "secondFermentationEnd", 
        "dryingArea", "avgTemperature", "preDryingWeight", "finalMoisture", "postDryingWeight", 
        "dryingStart", "dryingEnd", "secondDrying", "secondDryingArea", "secondAverageTemperature", 
        "secondFinalMoisture", "secondPostDryingWeight", "secondDryingStart", "secondDryingEnd", 
        "rehydration", "storage", "storageTemperature", "hullingTime", "bagType", 
        "postHullingWeight", "productLine", "wesorter", "preClassifier", "airlock", 
        "tankAmount", "leachateTarget", "leachate", "brewTankTemperature", "waterTemperature", 
        "coolerTemperature", "drying", "status", "createdBy", "createdAt", "updatedAt"
      ) VALUES (
        :batchNumber, :referenceNumber, :experimentNumber, :processingType, :description, 
        :farmerName, :type, :variety, :harvestDate, :harvestAt, :receivedAt, 
        :receivedWeight, :rejectWeight, :defectWeight, :damagedWeight, :lostWeight, 
        :preprocessingWeight, :quality, :brix, :preStorage, :preStorageCondition, 
        :preFermentationStorageGoal, :preFermentationStorageStart, :preFermentationStorageEnd, 
        :prePulped, :prePulpedDelva, :preFermentationTimeAfterPulping, :prePulpedWeight, 
        :cherryType, :fermentationCherryWeight, :fermentation, :tank, :fermentationStarter, 
        :fermentationStarterAmount, :gas, :pressure, :isSubmerged, :totalVolume, 
        :waterUsed, :starterUsed, :stirring, :fermentationTemperature, :pH, 
        :fermentationTimeTarget, :fermentationStart, :fermentationEnd, :finalPH, 
        :finalTDS, :finalTemperature, :postFermentationWeight, :postPulped, 
        :secondFermentation, :secondFermentationTank, :secondWashedDelva, :secondWashed, 
        :secondFermentationCherryWeight, :secondFermentationPulpedWeight, :secondStarterType, 
        :secondGas, :secondPressure, :secondIsSubmerged, :secondTotalVolume, 
        :secondWaterUsed, :secondMosstoUsed, :secondActualVolume, :secondTemperature, 
        :secondFermentationTimeTarget, :secondFermentationStart, :secondFermentationEnd, 
        :dryingArea, :avgTemperature, :preDryingWeight, :finalMoisture, :postDryingWeight, 
        :dryingStart, :dryingEnd, :secondDrying, :secondDryingArea, :secondAverageTemperature, 
        :secondFinalMoisture, :secondPostDryingWeight, :secondDryingStart, :secondDryingEnd, 
        :rehydration, :storage, :storageTemperature, :hullingTime, :bagType, 
        :postHullingWeight, :productLine, :wesorter, :preClassifier, :airlock, 
        :tankAmount, :leachateTarget, :leachate, :brewTankTemperature, :waterTemperature, 
        :coolerTemperature, :drying, :status, :createdBy, NOW(), NOW()
      ) RETURNING *;
    `, {
      replacements: {
        batchNumber,
        referenceNumber: referenceNumber || null,
        experimentNumber: experimentNumber || null,
        processingType: processingType || null,
        description: description || null,
        farmerName: farmerName || null,
        type: type || null,
        variety: variety || null,
        harvestDate: harvestDate || null,
        harvestAt: harvestAt || null,
        receivedAt: receivedAt || null,
        receivedWeight: receivedWeight || null,
        rejectWeight: rejectWeight || null,
        defectWeight: defectWeight || null,
        damagedWeight: damagedWeight || null,
        lostWeight: lostWeight || null,
        preprocessingWeight: preprocessingWeight || null,
        quality: quality || null,
        brix: brix || null,
        preStorage: preStorage || null,
        preStorageCondition: preStorageCondition || null,
        preFermentationStorageGoal: preFermentationStorageGoal || null,
        preFermentationStorageStart: preFermentationStorageStart || null,
        preFermentationStorageEnd: preFermentationStorageEnd || null,
        prePulped: prePulped || null,
        prePulpedDelva: prePulpedDelva || null,
        preFermentationTimeAfterPulping: preFermentationTimeAfterPulping || null,
        prePulpedWeight: prePulpedWeight || null,
        cherryType: cherryType || null,
        fermentationCherryWeight: fermentationCherryWeight || null,
        fermentation: fermentation || null,
        tank: fermentationTank,
        fermentationStarter: fermentationStarter || null,
        fermentationStarterAmount: fermentationStarterAmount || null,
        gas: gas || null,
        pressure: pressure || null,
        isSubmerged: isSubmerged || null,
        totalVolume: totalVolume || null,
        waterUsed: waterUsed || null,
        starterUsed: starterUsed || null,
        stirring: stirring || null,
        fermentationTemperature: fermentationTemperature || null,
        pH: pH || null,
        fermentationTimeTarget: fermentationTimeTarget || null,
        fermentationStart: parsedStartDate,
        fermentationEnd: parsedFermentationEnd || null,
        finalPH: finalPH || null,
        finalTDS: finalTDS || null,
        finalTemperature: finalTemperature || null,
        postFermentationWeight: postFermentationWeight || null,
        postPulped: postPulped || null,
        secondFermentation: secondFermentation || null,
        secondFermentationTank: secondFermentationTank || null,
        secondWashedDelva: secondWashedDelva || null,
        secondWashed: secondWashed || null,
        secondFermentationCherryWeight: secondFermentationCherryWeight || null,
        secondFermentationPulpedWeight: secondFermentationPulpedWeight || null,
        secondStarterType: secondStarterType || null,
        secondGas: secondGas || null,
        secondPressure: secondPressure || null,
        secondIsSubmerged: secondIsSubmerged || null,
        secondTotalVolume: secondTotalVolume || null,
        secondWaterUsed: secondWaterUsed || null,
        secondMosstoUsed: secondMosstoUsed || null,
        secondActualVolume: secondActualVolume || null,
        secondTemperature: secondTemperature || null,
        secondFermentationTimeTarget: secondFermentationTimeTarget || null,
        secondFermentationStart: secondFermentationStart || null,
        secondFermentationEnd: secondFermentationEnd || null,
        dryingArea: dryingArea || null,
        avgTemperature: avgTemperature || null,
        preDryingWeight: preDryingWeight || null,
        finalMoisture: finalMoisture || null,
        postDryingWeight: postDryingWeight || null,
        dryingStart: dryingStart || null,
        dryingEnd: dryingEnd || null,
        secondDrying: secondDrying || null,
        secondDryingArea: secondDryingArea || null,
        secondAverageTemperature: secondAverageTemperature || null,
        secondFinalMoisture: secondFinalMoisture || null,
        secondPostDryingWeight: secondPostDryingWeight || null,
        secondDryingStart: secondDryingStart || null,
        secondDryingEnd: secondDryingEnd || null,
        rehydration: rehydration || null,
        storage: storage || null,
        storageTemperature: storageTemperature || null,
        hullingTime: hullingTime || null,
        bagType: bagType || null,
        postHullingWeight: postHullingWeight || null,
        productLine: productLine || null,
        wesorter: wesorter || null,
        preClassifier: preClassifier || null,
        airlock: airlock || null,
        tankAmount: tankAmount || null,
        leachateTarget: leachateTarget || null,
        leachate: leachate || null,
        brewTankTemperature: brewTankTemperature || null,
        waterTemperature: waterTemperature || null,
        coolerTemperature: coolerTemperature || null,
        drying: drying || null,
        status: 'In Progress',
        createdBy
      },
      transaction: t,
      type: sequelize.QueryTypes.INSERT
    });

    await t.commit();
    res.status(201).json({
      message: `Fermentation started for batch ${batchNumber} in ${fermentationTank}`,
      fermentationData: fermentationData[0],
    });
  } catch (err) {
    await t.rollback();
    console.error('Error creating fermentation data:', err);
    res.status(500).json({ error: 'Failed to create fermentation data', details: err.message });
  }
});

// Route for fetching all fermentation data
router.get('/fermentation', async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      `SELECT 
        f.*, 
        r."farmerName",
        r.weight AS receiving_weight
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
  const { referenceNumber, experimentNumber } = req.query;

  try {
    let query = `
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
      WHERE LOWER(f."batchNumber") = LOWER(:batchNumber)
    `;
    const replacements = { batchNumber: batchNumber.trim() };

    if (referenceNumber) {
      query += ` AND LOWER(f."referenceNumber") = LOWER(:referenceNumber)`;
      replacements.referenceNumber = referenceNumber.trim();
    }

    if (experimentNumber) {
      query += ` AND LOWER(f."experimentNumber") = LOWER(:experimentNumber)`;
      replacements.experimentNumber = experimentNumber.trim();
    }

    const [rows] = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    if (!rows.length) {
      return res.status(404).json({ error: 'No fermentation data found for the specified criteria' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching fermentation details:', err);
    res.status(500).json({ error: 'Failed to fetch fermentation details', details: err.message });
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
  const t = await sequelize.transaction();
  try {
    const { batchNumber } = req.params;
    const {
      referenceNumber, experimentNumber, processingType, description, farmerName,
      type, variety, harvestDate, harvestAt, receivedAt, receivedWeight, rejectWeight,
      defectWeight, damagedWeight, lostWeight, preprocessingWeight, quality, brix,
      preStorage, preStorageCondition, preFermentationStorageGoal, preFermentationStorageStart,
      preFermentationStorageEnd, prePulped, prePulpedDelva, preFermentationTimeAfterPulping,
      prePulpedWeight, cherryType, fermentationCherryWeight, fermentation, fermentationTank,
      fermentationStarter, fermentationStarterAmount, gas, pressure, isSubmerged, totalVolume,
      waterUsed, starterUsed, stirring, fermentationTemperature, pH, fermentationTimeTarget,
      fermentationStart, fermentationEnd, finalPH, finalTDS, finalTemperature, postFermentationWeight,
      postPulped, secondFermentation, secondFermentationTank, secondWashedDelva, secondWashed,
      secondFermentationCherryWeight, secondFermentationPulpedWeight, secondStarterType, secondGas,
      secondPressure, secondIsSubmerged, secondTotalVolume, secondWaterUsed, secondMosstoUsed,
      secondActualVolume, secondTemperature, secondFermentationTimeTarget, secondFermentationStart,
      secondFermentationEnd, dryingArea, avgTemperature, preDryingWeight, finalMoisture,
      postDryingWeight, dryingStart, dryingEnd, secondDrying, secondDryingArea, secondAverageTemperature,
      secondFinalMoisture, secondPostDryingWeight, secondDryingStart, secondDryingEnd, rehydration,
      storage, storageTemperature, hullingTime, bagType, postHullingWeight, productLine,
      wesorter, preClassifier, airlock, tankAmount, leachateTarget, leachate,
      brewTankTemperature, waterTemperature, coolerTemperature, drying, createdBy
    } = req.body;

    const requiredFields = { batchNumber, fermentationTank, fermentationStart, createdBy };
    if (Object.values(requiredFields).some(field => !field)) {
      await t.rollback();
      return res.status(400).json({ error: 'batchNumber, fermentationTank, fermentationStart, and createdBy are required' });
    }

    if (!['Biomaster', 'Carrybrew', 'Washing Track', 'Fermentation Bucket'].includes(fermentationTank) && !/^BB-HQ-\d{4}$/.test(fermentationTank)) {
      await t.rollback();
      return res.status(400).json({ error: 'Invalid fermentationTank. Must be Biomaster, Carrybrew, Washing Track, Fermentation Bucket, or BB-HQ-XXXX' });
    }

    const parsedStartDate = new Date(fermentationStart);
    if (isNaN(parsedStartDate)) {
      await t.rollback();
      return res.status(400).json({ error: 'Invalid fermentationStart format' });
    }

    const now = new Date();
    if (parsedStartDate > now) {
      await t.rollback();
      return res.status(400).json({ error: 'fermentationStart cannot be in the future' });
    }

    const parsedFermentationEnd = fermentationEnd ? new Date(fermentationEnd) : null;
    if (fermentationEnd && isNaN(parsedFermentationEnd)) {
      await t.rollback();
      return res.status(400).json({ error: 'Invalid fermentationEnd format' });
    }

    if (parsedFermentationEnd && parsedFermentationEnd < parsedStartDate) {
      await t.rollback();
      return res.status(400).json({ error: 'fermentationEnd cannot be before fermentationStart' });
    }

    if (parsedFermentationEnd && parsedFermentationEnd > now) {
      await t.rollback();
      return res.status(400).json({ error: 'fermentationEnd cannot be in the future' });
    }

    if (drying && !['Pulped Natural', 'Natural', 'Washed'].includes(drying)) {
      await t.rollback();
      return res.status(400).json({ error: 'Invalid drying value. Must be Pulped Natural, Natural, or Washed' });
    }

    const toNullableFloat = (v) =>
      v === '' || v === undefined ? null : parseFloat(v);

    const toNullableInt = (v) =>
      v === '' || v === undefined ? null : parseInt(v);

    const numericFields = {
      receivedWeight: toNullableFloat(receivedWeight),
      rejectWeight: toNullableFloat(rejectWeight),
      defectWeight: toNullableFloat(defectWeight),
      damagedWeight: toNullableFloat(damagedWeight),
      lostWeight: toNullableFloat(lostWeight),
      preprocessingWeight: toNullableFloat(preprocessingWeight),
      quality: toNullableFloat(quality),
      brix: toNullableFloat(brix),
      preFermentationStorageGoal: toNullableFloat(preFermentationStorageGoal),
      preFermentationTimeAfterPulping: toNullableFloat(preFermentationTimeAfterPulping),
      prePulpedWeight: toNullableFloat(prePulpedWeight),
      fermentationCherryWeight: toNullableFloat(fermentationCherryWeight),
      fermentationStarterAmount: toNullableFloat(fermentationStarterAmount),
      pressure: toNullableFloat(pressure),
      totalVolume: toNullableFloat(totalVolume),
      waterUsed: toNullableFloat(waterUsed),
      starterUsed: toNullableFloat(starterUsed),
      stirring: toNullableFloat(stirring),
      fermentationTemperature: toNullableFloat(fermentationTemperature),
      pH: toNullableFloat(pH),
      fermentationTimeTarget: toNullableInt(fermentationTimeTarget),
      finalPH: toNullableFloat(finalPH),
      finalTDS: toNullableFloat(finalTDS),
      finalTemperature: toNullableFloat(finalTemperature),
      postFermentationWeight: toNullableFloat(postFermentationWeight),
      secondFermentationCherryWeight: toNullableFloat(secondFermentationCherryWeight),
      secondFermentationPulpedWeight: toNullableFloat(secondFermentationPulpedWeight),
      secondPressure: toNullableFloat(secondPressure),
      secondTotalVolume: toNullableFloat(secondTotalVolume),
      secondWaterUsed: toNullableFloat(secondWaterUsed),
      secondMosstoUsed: toNullableFloat(secondMosstoUsed),
      secondActualVolume: toNullableFloat(secondActualVolume),
      secondTemperature: toNullableFloat(secondTemperature),
      secondFermentationTimeTarget: toNullableInt(secondFermentationTimeTarget),
      avgTemperature: toNullableFloat(avgTemperature),
      preDryingWeight: toNullableFloat(preDryingWeight),
      finalMoisture: toNullableFloat(finalMoisture),
      postDryingWeight: toNullableFloat(postDryingWeight),
      secondAverageTemperature: toNullableFloat(secondAverageTemperature),
      secondFinalMoisture: toNullableFloat(secondFinalMoisture),
      secondPostDryingWeight: toNullableFloat(secondPostDryingWeight),
      storageTemperature: toNullableFloat(storageTemperature),
      postHullingWeight: toNullableFloat(postHullingWeight),
      tankAmount: toNullableInt(tankAmount),
      leachateTarget: toNullableFloat(leachateTarget),
      leachate: toNullableFloat(leachate),
      brewTankTemperature: toNullableFloat(brewTankTemperature),
      waterTemperature: toNullableFloat(waterTemperature),
      coolerTemperature: toNullableFloat(coolerTemperature)
    };
    if (Object.values(numericFields).some(v => isNaN(v) && v !== null)) {
      await t.rollback();
      return res.status(400).json({ error: 'Invalid numeric field format', details: `Invalid value in one of: ${Object.keys(numericFields).join(', ')}` });
    }

    const [batchCheck] = await sequelize.query(
      `SELECT 1 
      FROM "FermentationData" 
      WHERE "batchNumber" = :batchNumber`,
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

    const [tankCheck] = await sequelize.query(
      'SELECT 1 FROM "FermentationData" WHERE tank = :tank AND status = :status AND "batchNumber" != :batchNumber',
      {
        replacements: { tank: fermentationTank, status: 'In Progress', batchNumber },
        transaction: t,
        type: sequelize.QueryTypes.SELECT
      }
    );
    if (tankCheck) {
      await t.rollback();
      return res.status(400).json({ error: `Tank ${fermentationTank} is already in use by another batch` });
    }

    const [fermentationData] = await sequelize.query(`
      UPDATE "FermentationData"
      SET
        "referenceNumber" = :referenceNumber,
        "experimentNumber" = :experimentNumber,
        "processingType" = :processingType,
        "description" = :description,
        "farmerName" = :farmerName,
        "type" = :type,
        "variety" = :variety,
        "harvestDate" = :harvestDate,
        "harvestAt" = :harvestAt,
        "receivedAt" = :receivedAt,
        "receivedWeight" = :receivedWeight,
        "rejectWeight" = :rejectWeight,
        "defectWeight" = :defectWeight,
        "damagedWeight" = :damagedWeight,
        "lostWeight" = :lostWeight,
        "preprocessingWeight" = :preprocessingWeight,
        "quality" = :quality,
        "brix" = :brix,
        "preStorage" = :preStorage,
        "preStorageCondition" = :preStorageCondition,
        "preFermentationStorageGoal" = :preFermentationStorageGoal,
        "preFermentationStorageStart" = :preFermentationStorageStart,
        "preFermentationStorageEnd" = :preFermentationStorageEnd,
        "prePulped" = :prePulped,
        "prePulpedDelva" = :prePulpedDelva,
        "preFermentationTimeAfterPulping" = :preFermentationTimeAfterPulping,
        "prePulpedWeight" = :prePulpedWeight,
        "cherryType" = :cherryType,
        "fermentationCherryWeight" = :fermentationCherryWeight,
        "fermentation" = :fermentation,
        "tank" = :fermentationTank,
        "fermentationStarter" = :fermentationStarter,
        "fermentationStarterAmount" = :fermentationStarterAmount,
        "gas" = :gas,
        "pressure" = :pressure,
        "isSubmerged" = :isSubmerged,
        "totalVolume" = :totalVolume,
        "waterUsed" = :waterUsed,
        "starterUsed" = :starterUsed,
        "stirring" = :stirring,
        "fermentationTemperature" = :fermentationTemperature,
        "pH" = :pH,
        "fermentationTimeTarget" = :fermentationTimeTarget,
        "fermentationStart" = :fermentationStart,
        "fermentationEnd" = :fermentationEnd,
        "finalPH" = :finalPH,
        "finalTDS" = :finalTDS,
        "finalTemperature" = :finalTemperature,
        "postFermentationWeight" = :postFermentationWeight,
        "postPulped" = :postPulped,
        "secondFermentation" = :secondFermentation,
        "secondFermentationTank" = :secondFermentationTank,
        "secondWashedDelva" = :secondWashedDelva,
        "secondWashed" = :secondWashed,
        "secondFermentationCherryWeight" = :secondFermentationCherryWeight,
        "secondFermentationPulpedWeight" = :secondFermentationPulpedWeight,
        "secondStarterType" = :secondStarterType,
        "secondGas" = :secondGas,
        "secondPressure" = :secondPressure,
        "secondIsSubmerged" = :secondIsSubmerged,
        "secondTotalVolume" = :secondTotalVolume,
        "secondWaterUsed" = :secondWaterUsed,
        "secondMosstoUsed" = :secondMosstoUsed,
        "secondActualVolume" = :secondActualVolume,
        "secondTemperature" = :secondTemperature,
        "secondFermentationTimeTarget" = :secondFermentationTimeTarget,
        "secondFermentationStart" = :secondFermentationStart,
        "secondFermentationEnd" = :secondFermentationEnd,
        "dryingArea" = :dryingArea,
        "avgTemperature" = :avgTemperature,
        "preDryingWeight" = :preDryingWeight,
        "finalMoisture" = :finalMoisture,
        "postDryingWeight" = :postDryingWeight,
        "dryingStart" = :dryingStart,
        "dryingEnd" = :dryingEnd,
        "secondDrying" = :secondDrying,
        "secondDryingArea" = :secondDryingArea,
        "secondAverageTemperature" = :secondAverageTemperature,
        "secondFinalMoisture" = :secondFinalMoisture,
        "secondPostDryingWeight" = :secondPostDryingWeight,
        "secondDryingStart" = :secondDryingStart,
        "secondDryingEnd" = :secondDryingEnd,
        "rehydration" = :rehydration,
        "storage" = :storage,
        "storageTemperature" = :storageTemperature,
        "hullingTime" = :hullingTime,
        "bagType" = :bagType,
        "postHullingWeight" = :postHullingWeight,
        "productLine" = :productLine,
        "wesorter" = :wesorter,
        "preClassifier" = :preClassifier,
        "airlock" = :airlock,
        "tankAmount" = :tankAmount,
        "leachateTarget" = :leachateTarget,
        "leachate" = :leachate,
        "brewTankTemperature" = :brewTankTemperature,
        "waterTemperature" = :waterTemperature,
        "coolerTemperature" = :coolerTemperature,
        "drying" = :drying,
        "updatedAt" = NOW()
      WHERE "batchNumber" = :batchNumber
      RETURNING *;
    `, {
      replacements: {
        batchNumber,
        referenceNumber: referenceNumber || null,
        experimentNumber: experimentNumber || null,
        processingType: processingType || null,
        description: description || null,
        farmerName: farmerName || null,
        type: type || null,
        variety: variety || null,
        harvestDate: harvestDate || null,
        harvestAt: harvestAt || null,
        receivedAt: receivedAt || null,
        receivedWeight: receivedWeight || null,
        rejectWeight: rejectWeight || null,
        defectWeight: defectWeight || null,
        damagedWeight: damagedWeight || null,
        lostWeight: lostWeight || null,
        preprocessingWeight: preprocessingWeight || null,
        quality: quality || null,
        brix: brix || null,
        preStorage: preStorage || null,
        preStorageCondition: preStorageCondition || null,
        preFermentationStorageGoal: preFermentationStorageGoal || null,
        preFermentationStorageStart: preFermentationStorageStart || null,
        preFermentationStorageEnd: preFermentationStorageEnd || null,
        prePulped: prePulped || null,
        prePulpedDelva: prePulpedDelva || null,
        preFermentationTimeAfterPulping: preFermentationTimeAfterPulping || null,
        prePulpedWeight: prePulpedWeight || null,
        cherryType: cherryType || null,
        fermentationCherryWeight: fermentationCherryWeight || null,
        fermentation: fermentation || null,
        fermentationTank,
        fermentationStarter: fermentationStarter || null,
        fermentationStarterAmount: fermentationStarterAmount || null,
        gas: gas || null,
        pressure: pressure || null,
        isSubmerged: isSubmerged || null,
        totalVolume: totalVolume || null,
        waterUsed: waterUsed || null,
        starterUsed: starterUsed || null,
        stirring: stirring || null,
        fermentationTemperature: fermentationTemperature || null,
        pH: pH || null,
        fermentationTimeTarget: fermentationTimeTarget || null,
        fermentationStart: parsedStartDate,
        fermentationEnd: parsedFermentationEnd || null,
        finalPH: finalPH || null,
        finalTDS: finalTDS || null,
        finalTemperature: finalTemperature || null,
        postFermentationWeight: postFermentationWeight || null,
        postPulped: postPulped || null,
        secondFermentation: secondFermentation || null,
        secondFermentationTank: secondFermentationTank || null,
        secondWashedDelva: secondWashedDelva || null,
        secondWashed: secondWashed || null,
        secondFermentationCherryWeight: secondFermentationCherryWeight || null,
        secondFermentationPulpedWeight: secondFermentationPulpedWeight || null,
        secondStarterType: secondStarterType || null,
        secondGas: secondGas || null,
        secondPressure: secondPressure || null,
        secondIsSubmerged: secondIsSubmerged || null,
        secondTotalVolume: secondTotalVolume || null,
        secondWaterUsed: secondWaterUsed || null,
        secondMosstoUsed: secondMosstoUsed || null,
        secondActualVolume: secondActualVolume || null,
        secondTemperature: secondTemperature || null,
        secondFermentationTimeTarget: secondFermentationTimeTarget || null,
        secondFermentationStart: secondFermentationStart || null,
        secondFermentationEnd: secondFermentationEnd || null,
        dryingArea: dryingArea || null,
        avgTemperature: avgTemperature || null,
        preDryingWeight: preDryingWeight || null,
        finalMoisture: finalMoisture || null,
        postDryingWeight: postDryingWeight || null,
        dryingStart: dryingStart || null,
        dryingEnd: dryingEnd || null,
        secondDrying: secondDrying || null,
        secondDryingArea: secondDryingArea || null,
        secondAverageTemperature: secondAverageTemperature || null,
        secondFinalMoisture: secondFinalMoisture || null,
        secondPostDryingWeight: secondPostDryingWeight || null,
        secondDryingStart: secondDryingStart || null,
        secondDryingEnd: secondDryingEnd || null,
        rehydration: rehydration || null,
        storage: storage || null,
        storageTemperature: storageTemperature || null,
        hullingTime: hullingTime || null,
        bagType: bagType || null,
        postHullingWeight: postHullingWeight || null,
        productLine: productLine || null,
        wesorter: wesorter || null,
        preClassifier: preClassifier || null,
        airlock: airlock || null,
        tankAmount: tankAmount || null,
        leachateTarget: leachateTarget || null,
        leachate: leachate || null,
        brewTankTemperature: brewTankTemperature || null,
        waterTemperature: waterTemperature || null,
        coolerTemperature: coolerTemperature || null,
        drying: drying || null
      },
      transaction: t,
      type: sequelize.QueryTypes.UPDATE
    });

    await t.commit();
    res.status(200).json({
      message: `Fermentation details updated for batch ${batchNumber}`,
      fermentationData: fermentationData[0],
    });
  } catch (err) {
    await t.rollback();
    console.error('Error updating fermentation details:', err);
    res.status(500).json({ error: 'Failed to update fermentation details', details: err.message });
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
      'SELECT fermentationStart FROM "FermentationData" WHERE "batchNumber" = :batchNumber AND status = :status',
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