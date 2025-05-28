const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

// GET route for ProcessingTypes
router.get('/processing-types', async (req, res) => {
  try {
    const processingTypes = await sequelize.query(
      'SELECT id, "processingType", abbreviation FROM "ProcessingTypes" ORDER BY id',
      { type: sequelize.QueryTypes.SELECT }
    );
    res.status(200).json(processingTypes);
  } catch (error) {
    console.error('Error fetching ProcessingTypes:', error);
    res.status(500).json({ error: 'Failed to fetch ProcessingTypes', details: error.message });
  }
});

// GET route for ProductLines
router.get('/product-lines', async (req, res) => {
  try {
    const productLines = await sequelize.query(
      'SELECT id, "productLine", abbreviation FROM "ProductLines" ORDER BY id',
      { type: sequelize.QueryTypes.SELECT }
    );
    res.status(200).json(productLines);
  } catch (error) {
    console.error('Error fetching ProductLines:', error);
    res.status(500).json({ error: 'Failed to fetch ProductLines', details: error.message });
  }
});

// GET route for ReferenceMappings
router.get('/reference-mappings', async (req, res) => {
  try {
    const referenceMappings = await sequelize.query(
      'SELECT id, "referenceNumber", "productLine", "processingType", producer, quality, type FROM "ReferenceMappings_duplicate" ORDER BY id',
      { type: sequelize.QueryTypes.SELECT }
    );
    res.status(200).json(referenceMappings);
  } catch (error) {
    console.error('Error fetching ReferenceMappings:', error);
    res.status(500).json({ error: 'Failed to fetch ReferenceMappings', details: error.message });
  }
});

// GET route for dry mill grades by batch number
router.get('/dry-mill-grades/:batchNumber', async (req, res) => {
  const { batchNumber } = req.params;

  try {
    // Check if batch is a sub-batch
    const [subBatch] = await sequelize.query(`
      SELECT "batchNumber", "parentBatchNumber", "quality"
      FROM "PostprocessingData"
      WHERE "batchNumber" = :batchNumber
      LIMIT 1
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.SELECT
    });

    console.log('subBatch:', subBatch); // Debug log

    let grades;
    let relevantBatchNumber = batchNumber;

    if (subBatch && subBatch.parentBatchNumber && subBatch.quality) {
      // Sub-batch: fetch only the specific grade
      relevantBatchNumber = subBatch.parentBatchNumber;
      console.log('Sub-batch query params:', {
        parentBatchNumber: subBatch.parentBatchNumber,
        quality: subBatch.quality
      });
      grades = await sequelize.query(`
        SELECT 
          dg."subBatchId", dg.grade, dg.weight, dg.bagged_at, dg.is_stored,
          ARRAY_AGG(bd.weight ORDER BY bd.bag_number) FILTER (WHERE bd.weight IS NOT NULL) AS bagWeights,
          COALESCE(dg.temp_sequence, '0001') AS temp_sequence
        FROM "DryMillGrades" dg
        LEFT JOIN "BagDetails" bd ON dg."subBatchId" = bd.grade_id
        WHERE dg."batchNumber" = :parentBatchNumber
          AND dg.grade = :quality
        GROUP BY dg."subBatchId", dg.grade, dg.weight, dg.bagged_at, dg.is_stored, dg.temp_sequence
      `, {
        replacements: { parentBatchNumber: subBatch.parentBatchNumber, quality: subBatch.quality },
        type: sequelize.QueryTypes.SELECT
      });
    } else {
      // Parent batch or no sub-batch found: fetch all grades
      console.log('Parent batch query params:', { batchNumber });
      grades = await sequelize.query(`
        SELECT 
          dg."subBatchId", dg.grade, dg.weight, dg.bagged_at, dg.is_stored,
          ARRAY_AGG(bd.weight ORDER BY bd.bag_number) FILTER (WHERE bd.weight IS NOT NULL) AS bagWeights,
          COALESCE(dg.temp_sequence, '0001') AS temp_sequence
        FROM "DryMillGrades" dg
        LEFT JOIN "BagDetails" bd ON dg."subBatchId" = bd.grade_id
        WHERE dg."batchNumber" = :batchNumber
        GROUP BY dg."subBatchId", dg.grade, dg.weight, dg.bagged_at, dg.is_stored, dg.temp_sequence
      `, {
        replacements: { batchNumber },
        type: sequelize.QueryTypes.SELECT
      });
    }

    console.log('Grades query result:', grades); // Debug log

    const formattedGrades = grades.map(g => ({
      subBatchId: g.subBatchId,
      grade: g.grade,
      weight: g.weight ? parseFloat(g.weight).toFixed(2) : '0.00',
      bagWeights: Array.isArray(g.bagWeights) && g.bagWeights.length > 0 ? g.bagWeights.map(w => String(w)) : [],
      bagged_at: g.bagged_at ? new Date(g.bagged_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      is_stored: g.is_stored || false,
      tempSequence: g.temp_sequence || '0001'
    }));

    if (formattedGrades.length === 0 && subBatch && subBatch.quality) {
      // Default for sub-batch if no grades exist
      console.log('Creating default sub-batch grade:', { batchNumber, quality: subBatch.quality });
      formattedGrades.push({
        subBatchId: `${batchNumber}-${subBatch.quality.replace(/\s+/g, '-')}`,
        grade: subBatch.quality,
        weight: '0.00',
        bagWeights: [],
        bagged_at: new Date().toISOString().split('T')[0],
        is_stored: false,
        tempSequence: '0001'
      });
    } else if (formattedGrades.length === 0 && (!subBatch || !subBatch.parentBatchNumber)) {
      // Default for parent batch
      console.log('Creating default parent batch grades:', { relevantBatchNumber });
      const defaultGrades = ['Specialty Grade', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4'];
      formattedGrades.push(...defaultGrades.map(grade => ({
        subBatchId: `${relevantBatchNumber}-${grade.replace(/\s+/g, '-')}`,
        grade,
        weight: '0.00',
        bagWeights: [],
        bagged_at: new Date().toISOString().split('T')[0],
        is_stored: false,
        tempSequence: '0001'
      })));
    }

    res.status(200).json(formattedGrades);
  } catch (error) {
    console.error(`Error fetching grades for batch ${batchNumber}:`, {
      message: error.message,
      stack: error.stack,
      batchNumber
    });
    res.status(500).json({ error: 'Failed to fetch grades', details: error.message });
  }
});

// POST route for manual green bean splitting, weighing, and bagging
router.post('/dry-mill/:batchNumber/split', async (req, res) => {
  const { batchNumber } = req.params;
  const { grades } = req.body;

  if (!batchNumber || !grades || !Array.isArray(grades) || grades.length === 0) {
    return res.status(400).json({ error: 'Batch number and valid grades are required.' });
  }

  const validGrades = grades.filter(g => Array.isArray(g.bagWeights) && g.bagWeights.length > 0);
  if (validGrades.length === 0) {
    return res.status(400).json({ error: 'At least one grade must have bags added.' });
  }

  let t;
  try {
    t = await sequelize.transaction();

    const [dryMillEntry] = await sequelize.query(`
      SELECT dm."entered_at", pp."processingType", pp."productLine", pp."producer", rd."type", rd."farmerName"
      FROM "DryMillData" dm
      JOIN "PreprocessingData" pp ON dm."batchNumber" = pp."batchNumber"
      JOIN "ReceivingData" rd ON dm."batchNumber" = rd."batchNumber"
      WHERE dm."batchNumber" = :batchNumber
      AND dm."entered_at" IS NOT NULL
      LIMIT 1;
    `, { replacements: { batchNumber }, transaction: t, type: sequelize.QueryTypes.SELECT });

    if (!dryMillEntry) {
      await t.rollback();
      return res.status(400).json({ error: 'Batch must be entered into dry mill first or metadata not found.' });
    }

    const parentBatch = dryMillEntry;

    await sequelize.query(`
      DELETE FROM "BagDetails"
      WHERE grade_id IN (SELECT "subBatchId" FROM "DryMillGrades" WHERE "batchNumber" = :batchNumber)
    `, { replacements: { batchNumber }, transaction: t });

    await sequelize.query(`
      DELETE FROM "DryMillGrades"
      WHERE "batchNumber" = :batchNumber
    `, { replacements: { batchNumber }, transaction: t });

    await sequelize.query(`
      DELETE FROM "PostprocessingData"
      WHERE "parentBatchNumber" = :batchNumber
    `, { replacements: { batchNumber }, transaction: t });

    const results = [];
    const subBatches = [];

    const currentYear = new Date().getFullYear().toString().slice(-2);
    const [productResults] = await sequelize.query(
      'SELECT abbreviation FROM "ProductLines" WHERE "productLine" = ?',
      { replacements: [parentBatch.productLine], transaction: t }
    );
    const [processingResults] = await sequelize.query(
      'SELECT abbreviation FROM "ProcessingTypes" WHERE "processingType" = ?',
      { replacements: [parentBatch.processingType], transaction: t }
    );

    if (productResults.length === 0 || processingResults.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: 'Invalid product line or processing type' });
    }

    const productAbbreviation = productResults[0].abbreviation;
    const processingAbbreviation = processingResults[0].abbreviation;
    const batchPrefix = `${parentBatch.producer}${currentYear}${productAbbreviation}-${processingAbbreviation}`;

    for (const { grade, bagWeights, bagged_at, tempSequence } of validGrades) {
      if (!grade || typeof grade !== 'string' || grade.trim() === '') {
        await t.rollback();
        return res.status(400).json({ error: 'Each entry must have a valid grade.' });
      }

      const weights = bagWeights.map(w => {
        const weightNum = parseFloat(w);
        if (isNaN(weightNum) || weightNum <= 0) {
          throw new Error(`Invalid weight for grade ${grade}: must be a positive number.`);
        }
        return weightNum;
      });
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      const baggedAtValue = bagged_at || null;

      const subBatchId = `${batchNumber}-${grade.replace(/\s+/g, '')}`;

      let sequenceNumber = parseInt(tempSequence, 10) || 1;
      const [sequenceResult] = await sequelize.query(
        `SELECT sequence FROM "LotNumberSequences" 
         WHERE producer = :producer AND productLine = :productLine 
         AND processingType = :processingType AND year = :year AND grade = :grade 
         FOR UPDATE`,
        { 
          replacements: { 
            producer: parentBatch.producer, 
            productLine: parentBatch.productLine, 
            processingType: parentBatch.processingType, 
            year: currentYear,
            grade
          }, 
          transaction: t 
        }
      );

      if (sequenceResult.length > 0) {
        sequenceNumber = Math.max(sequenceNumber, sequenceResult[0].sequence);
      }

      const formattedSequence = String(sequenceNumber).padStart(4, '0');

      await sequelize.query(`
        INSERT INTO "DryMillGrades" ("batchNumber", "subBatchId", grade, weight, split_at, bagged_at, "is_stored")
        VALUES (:batchNumber, :subBatchId, :grade, :weight, NOW(), :bagged_at, FALSE)
      `, { 
        replacements: { 
          batchNumber, 
          subBatchId, 
          grade, 
          weight: totalWeight, 
          bagged_at: baggedAtValue 
        }, 
        transaction: t,
        type: sequelize.QueryTypes.INSERT 
      });

      for (let i = 0; i < weights.length; i++) {
        await sequelize.query(`
          INSERT INTO "BagDetails" (grade_id, bag_number, weight, bagged_at, is_stored)
          VALUES (:gradeId, :bagNumber, :weight, :baggedAt, FALSE)
        `, {
          replacements: {
            gradeId: subBatchId,
            bagNumber: i + 1,
            weight: weights[i],
            baggedAt: baggedAtValue
          },
          transaction: t,
          type: sequelize.QueryTypes.INSERT
        });
      }

      results.push({ subBatchId, grade, weight: totalWeight, bagWeights: weights, bagged_at: baggedAtValue });

      const [referenceResults] = await sequelize.query(
        'SELECT "referenceNumber" FROM "ReferenceMappings_duplicate" WHERE "productLine" = ? AND "processingType" = ? AND "producer" = ? AND "type" = ? LIMIT 1',
        { replacements: [parentBatch.productLine, parentBatch.processingType, parentBatch.producer, parentBatch.type], transaction: t }
      );

      if (referenceResults.length === 0) {
        await t.rollback();
        return res.status(400).json({ error: `No matching reference number found for grade ${grade}` });
      }

      const baseReferenceNumber = referenceResults[0].referenceNumber;

      let qualitySuffix;
      switch (grade) {
        case 'Specialty Grade':
          qualitySuffix = '-S';
          break;
        case 'Grade 1':
          qualitySuffix = '-G1';
          break;
        case 'Grade 2':
          qualitySuffix = '-G2';
          break;
        case 'Grade 3':
          qualitySuffix = '-G3';
          break;
        case 'Grade 4':
          qualitySuffix = '-G4';
          break;
        default:
          await t.rollback();
          return res.status(400).json({ error: `Invalid grade: ${grade}` });
      }

      const referenceNumber = `${baseReferenceNumber}${qualitySuffix}`;
      const newBatchNumber = `${batchPrefix}-${formattedSequence}${qualitySuffix}`;
      const totalBags = bagWeights.length;

      await sequelize.query(`
        INSERT INTO "PostprocessingData" ("batchNumber", "referenceNumber", "processingType", "productLine", weight, "totalBags", notes, quality, producer, "storedDate", "createdAt", "updatedAt", "parentBatchNumber")
        VALUES (:batchNumber, :referenceNumber, :processingType, :productLine, :weight, :totalBags, :notes, :quality, :producer, :storedDate, :createdAt, :updatedAt, :parentBatchNumber)
      `, {
        replacements: {
          batchNumber: newBatchNumber,
          referenceNumber,
          processingType: parentBatch.processingType,
          productLine: parentBatch.productLine,
          weight: totalWeight,
          totalBags,
          notes: '',
          quality: grade,
          producer: parentBatch.producer,
          storedDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          parentBatchNumber: batchNumber,
        },
        transaction: t,
        type: sequelize.QueryTypes.INSERT,
      });

      subBatches.push({
        batchNumber: newBatchNumber,
        referenceNumber,
        quality: grade,
      });

      await sequelize.query(
        `INSERT INTO "LotNumberSequences" (producer, productLine, processingType, year, grade, sequence) 
         VALUES (:producer, :productLine, :processingType, :year, :grade, :sequence)
         ON CONFLICT (producer, productLine, processingType, year, grade) 
         DO UPDATE SET sequence = :sequence`,
        { 
          replacements: { 
            producer: parentBatch.producer, 
            productLine: parentBatch.productLine, 
            processingType: parentBatch.processingType, 
            year: currentYear, 
            grade, 
            sequence: sequenceNumber + 1 
          }, 
          transaction: t,
          type: sequelize.QueryTypes.INSERT 
        }
      );
    }

    await t.commit();

    res.status(201).json({ message: 'Green bean splits saved successfully', grades: results, subBatches });
  } catch (error) {
    if (t) await t.rollback();
    console.error('Error saving green bean splits:', error);
    res.status(500).json({ error: 'Failed to save green bean splits', details: error.message });
  }
});

// POST route to update bags for a specific grade (sub-batch)
router.post('/dry-mill/:batchNumber/update-bags', async (req, res) => {
  const { batchNumber } = req.params;
  const { grade, bagWeights, bagged_at } = req.body;

  if (!batchNumber || !grade || !Array.isArray(bagWeights)) {
    return res.status(400).json({ error: 'Batch number, grade, and bag weights are required.' });
  }

  let t;
  try {
    t = await sequelize.transaction();

    // Verify sub-batch exists
    const [subBatch] = await sequelize.query(`
      SELECT "parentBatchNumber", "quality"
      FROM "PostprocessingData"
      WHERE "batchNumber" = :batchNumber
      AND "quality" = :grade
      LIMIT 1
    `, {
      replacements: { batchNumber, grade },
      transaction: t,
      type: sequelize.QueryTypes.SELECT
    });

    if (!subBatch) {
      await t.rollback();
      return res.status(404).json({ error: 'Sub-batch not found or grade does not match.' });
    }

    const parentBatchNumber = subBatch.parentBatchNumber;
    const subBatchId = `${parentBatchNumber}-${grade.replace(/\s+/g, '')}`;

    // Validate weights
    const weights = bagWeights.map(w => {
      const weightNum = parseFloat(w);
      if (isNaN(weightNum) || weightNum <= 0) {
        throw new Error(`Invalid weight for grade ${grade}: must be a positive number.`);
      }
      return weightNum;
    });
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const baggedAtValue = bagged_at || new Date().toISOString().slice(0, 10);

    // Delete existing bags
    await sequelize.query(`
      DELETE FROM "BagDetails"
      WHERE grade_id = :subBatchId
    `, {
      replacements: { subBatchId },
      transaction: t
    });

    // Update or insert DryMillGrades
    await sequelize.query(`
      INSERT INTO "DryMillGrades" ("batchNumber", "subBatchId", grade, weight, split_at, bagged_at, "is_stored")
      VALUES (:parentBatchNumber, :subBatchId, :grade, :weight, NOW(), :bagged_at, FALSE)
      ON CONFLICT ("subBatchId")
      DO UPDATE SET
        weight = :weight,
        bagged_at = :bagged_at,
        is_stored = FALSE
    `, {
      replacements: {
        parentBatchNumber,
        subBatchId,
        grade,
        weight: totalWeight,
        bagged_at: baggedAtValue
      },
      transaction: t,
      type: sequelize.QueryTypes.INSERT
    });

    // Insert new bags
    for (let i = 0; i < weights.length; i++) {
      await sequelize.query(`
        INSERT INTO "BagDetails" (grade_id, bag_number, weight, bagged_at, is_stored)
        VALUES (:gradeId, :bagNumber, :weight, :baggedAt, FALSE)
      `, {
        replacements: {
          gradeId: subBatchId,
          bagNumber: i + 1,
          weight: weights[i],
          baggedAt: baggedAtValue
        },
        transaction: t,
        type: sequelize.QueryTypes.INSERT
      });
    }

    // Update PostprocessingData
    await sequelize.query(`
      UPDATE "PostprocessingData"
      SET weight = :weight, "totalBags" = :totalBags, "updatedAt" = NOW()
      WHERE "batchNumber" = :batchNumber
    `, {
      replacements: {
        batchNumber,
        weight: totalWeight,
        totalBags: weights.length
      },
      transaction: t,
      type: sequelize.QueryTypes.UPDATE
    });

    await t.commit();

    res.status(200).json({ message: 'Bags updated successfully', grade, weight: totalWeight, bagWeights: weights });
  } catch (error) {
    if (t) await t.rollback();
    console.error(`Error updating bags for batch ${batchNumber}:`, error);
    res.status(500).json({ error: 'Failed to update bags', details: error.message });
  }
});

// POST route to complete a batch
router.post('/dry-mill/:batchNumber/complete', async (req, res) => {
  const { batchNumber } = req.params;
  const { createdBy, updatedBy } = req.body;

  if (!batchNumber) {
    return res.status(400).json({ error: 'Batch number is required.' });
  }
  if (!createdBy || !updatedBy) {
    return res.status(400).json({ error: 'createdBy and updatedBy are required for inventory operations.' });
  }

  let t;
  try {
    t = await sequelize.transaction();

    const [dryMillEntry] = await sequelize.query(`
      SELECT "entered_at", "exited_at" FROM "DryMillData" 
      WHERE "batchNumber" = :batchNumber 
      AND "entered_at" IS NOT NULL 
      AND "exited_at" IS NULL 
      LIMIT 1;
    `, { replacements: { batchNumber }, transaction: t, type: sequelize.QueryTypes.SELECT });

    if (!dryMillEntry) {
      await t.rollback();
      return res.status(400).json({ error: 'Batch is not in dry mill or already processed.' });
    }

    const [splits] = await sequelize.query(`
      SELECT COUNT(*) AS total, SUM(CASE WHEN weight IS NOT NULL AND bagged_at IS NOT NULL THEN 1 ELSE 0 END) AS completed
      FROM "DryMillGrades" 
      WHERE "batchNumber" = :batchNumber;
    `, { replacements: { batchNumber }, transaction: t, type: sequelize.QueryTypes.SELECT });

    const splitData = splits.length > 0 ? splits[0] : { total: 0, completed: 0 };

    if (splitData.completed !== splitData.total) {
      await t.rollback();
      return res.status(400).json({ error: 'All splits must have weights and bagging dates before marking as processed.' });
    }

    // Update DryMillData to mark batch as exited
    const [result] = await sequelize.query(`
      UPDATE "DryMillData" 
      SET exited_at = NOW() 
      WHERE "batchNumber" = :batchNumber 
      AND "entered_at" IS NOT NULL 
      AND "exited_at" IS NULL 
      RETURNING *;
    `, { replacements: { batchNumber }, transaction: t, type: sequelize.QueryTypes.UPDATE });

    // Update ReceivingData to free the RFID tag
    await sequelize.query(`
      UPDATE "ReceivingData"
      SET "currentAssign" = 0
      WHERE "batchNumber" = :batchNumber;
    `, { replacements: { batchNumber }, transaction: t, type: sequelize.QueryTypes.UPDATE });

    // Update DryMillGrades to mark as stored
    await sequelize.query(`
      UPDATE "DryMillGrades"
      SET "is_stored" = TRUE
      WHERE "batchNumber" = :batchNumber;
    `, { replacements: { batchNumber }, transaction: t, type: sequelize.QueryTypes.UPDATE });

    // Update BagDetails to mark all bags as stored
    await sequelize.query(`
      UPDATE "BagDetails"
      SET is_stored = TRUE
      WHERE grade_id IN (SELECT "subBatchId" FROM "DryMillGrades" WHERE "batchNumber" = :batchNumber);
    `, { replacements: { batchNumber }, transaction: t, type: sequelize.QueryTypes.UPDATE });

    // Update PostprocessingData to set storedDate for sub-batches
    await sequelize.query(`
      UPDATE "PostprocessingData"
      SET "storedDate" = NOW()
      WHERE "parentBatchNumber" = :batchNumber;
    `, { replacements: { batchNumber }, transaction: t, type: sequelize.QueryTypes.UPDATE });

    // Remove cherry batch from CherryInventoryStatus
    const [cherryInventory] = await sequelize.query(
      `SELECT status, orderId FROM "CherryInventoryStatus" WHERE "batchNumber" = :batchNumber AND "exitedAt" IS NULL`,
      { replacements: { batchNumber }, transaction: t, type: sequelize.QueryTypes.SELECT }
    );

    if (cherryInventory) {
      if (cherryInventory.orderId) {
        await t.rollback();
        return res.status(400).json({ error: 'Cannot complete batch: cherry batch is reserved for an order.' });
      }

      await sequelize.query(
        `UPDATE "CherryInventoryStatus" 
         SET status = 'Picked', "exitedAt" = NOW(), "updatedAt" = NOW(), "updatedBy" = :updatedBy
         WHERE "batchNumber" = :batchNumber AND "exitedAt" IS NULL`,
        { replacements: { batchNumber, updatedBy }, transaction: t }
      );

      await sequelize.query(
        `INSERT INTO "CherryInventoryMovements" ("batchNumber", "movementType", "movedAt", "createdBy")
         VALUES (:batchNumber, 'Exit', NOW(), :createdBy)`,
        {
          replacements: { batchNumber, createdBy },
          transaction: t,
          type: sequelize.QueryTypes.INSERT,
        }
      );
    }

    // Add green bean sub-batches to GreenBeansInventoryStatus
    const subBatches = await sequelize.query(
      `SELECT "batchNumber", "storedDate" FROM "PostprocessingData" WHERE "parentBatchNumber" = :batchNumber`,
      { replacements: { batchNumber }, transaction: t, type: sequelize.QueryTypes.SELECT }
    );

    for (const subBatch of subBatches) {
      const existing = await sequelize.query(
        `SELECT "batchNumber" FROM "GreenBeansInventoryStatus" WHERE "batchNumber" = :batchNumber`,
        { replacements: { batchNumber: subBatch.batchNumber }, transaction: t, type: sequelize.QueryTypes.SELECT }
      );

      if (existing.length === 0) {
        await sequelize.query(
          `INSERT INTO "GreenBeansInventoryStatus" ("batchNumber", status, "enteredAt", "createdAt", "updatedAt", "createdBy", "updatedBy")
           VALUES (:batchNumber, 'Stored', :enteredAt, NOW(), NOW(), :createdBy, :updatedBy)
           RETURNING *`,
          {
            replacements: {
              batchNumber: subBatch.batchNumber,
              enteredAt: subBatch.storedDate,
              createdBy,
              updatedBy
            },
            transaction: t,
            type: sequelize.QueryTypes.INSERT,
          }
        );

        await sequelize.query(
          `INSERT INTO "GreenBeansInventoryMovements" ("batchNumber", "movementType", "movedAt", "createdBy")
           VALUES (:batchNumber, 'Entry', NOW(), :createdBy)`,
          {
            replacements: { batchNumber: subBatch.batchNumber, createdBy },
            transaction: t,
            type: sequelize.QueryTypes.INSERT,
          }
        );
      }
    }

    await t.commit();

    res.status(200).json({ message: 'Batch marked as processed successfully, inventory updated', exited_at: result[0].exited_at });
  } catch (error) {
    if (t) await t.rollback();
    console.error('Error marking batch as processed:', error);
    res.status(500).json({ error: 'Failed to mark batch as processed', details: error.message });
  }
});

// GET route for dry mill data
router.get('/dry-mill-data', async (req, res) => {
  try {
    const parentBatchesQuery = `
      SELECT 
        dm."batchNumber",
        pp."processingType",
        pp."productLine",
        pp."producer",
        rd."type",
        rd."weight" AS "cherry_weight",
        rd."totalBags",
        rd."farmerName",
        NULL AS "notes",
        NULL AS "referenceNumber",
        NULL AS quality,
        NULL AS "storedDate",
        NULL AS "parentBatchNumber"
      FROM "DryMillData" dm
      JOIN "PreprocessingData" pp ON dm."batchNumber" = pp."batchNumber"
      JOIN "ReceivingData" rd ON dm."batchNumber" = rd."batchNumber"
      ORDER BY dm."batchNumber" DESC;
    `;
    const parentBatchesResult = await sequelize.query(parentBatchesQuery, { type: sequelize.QueryTypes.SELECT, raw: true });
    const parentBatchesArray = Array.isArray(parentBatchesResult) ? parentBatchesResult : parentBatchesResult ? [parentBatchesResult] : [];

    const subBatchesQuery = `
      SELECT 
        ppd."batchNumber",
        ppd."referenceNumber",
        COALESCE(rd."type", 'Unknown') AS type,
        ppd."processingType",
        ppd."productLine",
        ppd."weight",
        ppd."totalBags",
        ppd."notes",
        ppd."quality",
        ppd."producer",
        rd."farmerName",
        DATE(ppd."storedDate") AS storeddatetrunc,
        ppd."parentBatchNumber"
      FROM "PostprocessingData" ppd
      LEFT JOIN "ReceivingData" rd ON ppd."parentBatchNumber" = rd."batchNumber"
      ORDER BY ppd."batchNumber" DESC;
    `;
    const subBatchesResult = await sequelize.query(subBatchesQuery, { type: sequelize.QueryTypes.SELECT, raw: true });
    const subBatchesArray = Array.isArray(subBatchesResult) ? subBatchesResult : subBatchesResult ? [subBatchesResult] : [];

    const postprocessingArray = [...parentBatchesArray, ...subBatchesArray];

    const dryMillDataQuery = `
      SELECT dm."batchNumber", dm.entered_at, dm.exited_at, dm.created_at
      FROM "DryMillData" dm
      ORDER BY dm.created_at DESC;
    `;
    const dryMillDataResult = await sequelize.query(dryMillDataQuery, { type: sequelize.QueryTypes.SELECT, raw: true });
    const dryMillDataArray = Array.isArray(dryMillDataResult) ? dryMillDataResult : dryMillDataResult ? [dryMillDataResult] : [];

    const dryMillGradesQuery = `
      SELECT dg."batchNumber", dg."subBatchId", dg.grade, dg.weight, dg.split_at, dg.bagged_at, dg."is_stored"
      FROM "DryMillGrades" dg
      ORDER BY dg."batchNumber", dg."subBatchId";
    `;
    const dryMillGradesResult = await sequelize.query(dryMillGradesQuery, { type: sequelize.QueryTypes.SELECT, raw: true });
    const dryMillGradesArray = Array.isArray(dryMillGradesResult) ? dryMillGradesResult : dryMillGradesResult ? [dryMillGradesResult] : [];

    const bagDetailsQuery = `
      SELECT bd.*, dg."batchNumber"
      FROM "BagDetails" bd
      JOIN "DryMillGrades" dg ON bd.grade_id = dg."subBatchId"
      ORDER BY dg."batchNumber", bd.bag_number;
    `;
    const bagDetailsResult = await sequelize.query(bagDetailsQuery, { type: sequelize.QueryTypes.SELECT, raw: true });
    const bagDetailsArray = Array.isArray(bagDetailsResult) ? bagDetailsResult : bagDetailsResult ? [bagDetailsResult] : [];

    const receivingDataQuery = `
      SELECT "batchNumber", rfid, "currentAssign"
      FROM "ReceivingData"
      ORDER BY "batchNumber";
    `;
    const receivingDataResult = await sequelize.query(receivingDataQuery, { type: sequelize.QueryTypes.SELECT, raw: true });
    const receivingDataArray = Array.isArray(receivingDataResult) ? receivingDataResult : receivingDataResult ? [receivingDataResult] : [];

    const data = postprocessingArray.map(batch => {
      const relevantBatchNumber = batch.parentBatchNumber || batch.batchNumber;
      const batchDryMillData = dryMillDataArray.filter(data => data.batchNumber === relevantBatchNumber) || [];
      const latestEntry = batchDryMillData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
      const status = latestEntry?.exited_at ? 'Processed' : (latestEntry?.entered_at ? 'In Dry Mill' : 'Not Started');

      const storedGrades = dryMillGradesArray.filter(grade => grade.batchNumber === relevantBatchNumber && grade.is_stored);
      const isStored = storedGrades.length > 0;

      return {
        ...batch,
        status,
        dryMillEntered: latestEntry?.entered_at ? new Date(latestEntry.entered_at).toISOString().slice(0, 10) : 'N/A',
        dryMillExited: latestEntry?.exited_at ? new Date(latestEntry.exited_at).toISOString().slice(0, 10) : 'N/A',
        rfid: receivingDataArray.find(r => r.batchNumber === (batch.parentBatchNumber || batch.batchNumber))?.rfid || 'N/A',
        bagWeights: bagDetailsArray.filter(bag => dryMillGradesArray.some(g => g.subBatchId === bag.grade_id && g.batchNumber === relevantBatchNumber)).map(b => b.weight),
        green_bean_splits: dryMillGradesArray.filter(g => g.batchNumber === relevantBatchNumber).length > 0 ? 
          dryMillGradesArray.filter(g => g.batchNumber === relevantBatchNumber).map(g => 
            `Grade: ${g.grade}, Weight: ${g.weight ? g.weight + ' kg' : 'N/A'}, Split: ${new Date(g.split_at).toISOString().slice(0, 19).replace('T', ' ')}, Bagged: ${g.bagged_at ? new Date(g.bagged_at).toISOString().slice(0, 10) : 'N/A'}, Stored: ${g.is_stored ? 'Yes' : 'No'}`
          ).join('; ') : null,
        isStored,
      };
    });

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching dry mill data:', error);
    res.status(500).json({ error: 'Failed to fetch dry mill data', details: error.message });
  }
});

// POST route for warehouse RFID scan
router.post('/warehouse/scan', async (req, res) => {
  const { rfid, scanned_at } = req.body;

  if (!rfid) {
    return res.status(400).json({ error: 'RFID tag is required.' });
  }

  if (!scanned_at || scanned_at !== 'Warehouse') {
    return res.status(400).json({ error: 'Invalid scanner identifier. Must be "Warehouse".' });
  }

  const trimmedRfid = rfid.trim().toUpperCase();

  try {
    const [batch] = await sequelize.query(`
      SELECT "batchNumber"
      FROM "ReceivingData"
      WHERE "rfid" = :rfid
      AND "currentAssign" = 1
      LIMIT 1;
    `, {
      replacements: { rfid: trimmedRfid },
      type: sequelize.QueryTypes.SELECT,
    });

    if (!batch) {
      return res.status(404).json({ error: 'RFID not associated with any active batch.' });
    }

    const batchNumber = batch.batchNumber;

    await sequelize.query(`
      INSERT INTO "RfidScanned" (rfid, scanned_at, created_at, action)
      VALUES (:rfid, :scanned_at, NOW(), 'Stored');
    `, {
      replacements: { rfid: trimmedRfid, scanned_at },
      type: sequelize.QueryTypes.INSERT,
    });

    await sequelize.query(`
      UPDATE "DryMillGrades"
      SET "is_stored" = TRUE
      WHERE "batchNumber" = :batchNumber;
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.UPDATE,
    });

    await sequelize.query(`
      UPDATE "BagDetails"
      SET is_stored = TRUE
      WHERE grade_id IN (SELECT "subBatchId" FROM "DryMillGrades" WHERE "batchNumber" = :batchNumber);
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.UPDATE,
    });

    await sequelize.query(`
      UPDATE "ReceivingData"
      SET "currentAssign" = 0
      WHERE "batchNumber" = :batchNumber;
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.UPDATE,
    });

    await sequelize.query(`
      UPDATE "PostprocessingData"
      SET "storedDate" = NOW()
      WHERE "batchNumber" = :batchNumber;
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.UPDATE,
    });

    res.status(200).json({
      message: 'Green beans marked as stored, RFID tag available for reuse',
      rfid: trimmedRfid,
      batchNumber,
    });
  } catch (error) {
    console.error('Error processing warehouse RFID scan:', error);
    res.status(500).json({ error: 'Failed to process warehouse RFID scan', details: error.message });
  }
});

// POST route for RFID reuse
router.post('/rfid/reuse', async (req, res) => {
  const { batchNumber } = req.body;

  if (!batchNumber) {
    return res.status(400).json({ error: 'Batch number is required.' });
  }

  try {
    const [batch] = await sequelize.query(`
      SELECT "rfid", "currentAssign"
      FROM "ReceivingData"
      WHERE "batchNumber" = :batchNumber
      LIMIT 1;
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.SELECT,
    });

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found.' });
    }

    if (batch.currentAssign !== 0) {
      return res.status(400).json({ error: 'RFID tag is not ready for reuse.' });
    }

    await sequelize.query(`
      UPDATE "ReceivingData"
      SET "currentAssign" = 1
      WHERE "batchNumber" = :batchNumber;
    `, {
      replacements: { batchNumber },
      type: sequelize.QueryTypes.UPDATE,
    });

    res.status(200).json({ message: 'RFID tag is now ready for reuse', batchNumber });
  } catch (error) {
    console.error('Error reusing RFID tag:', error);
    res.status(500).json({ error: 'Failed to reuse RFID tag', details: error.message });
  }
});

module.exports = router;