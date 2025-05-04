const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

// Log database connection details for debugging
console.log('Database connection:', {
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  port: process.env.DB_PORT,
});

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

// POST route for manual green bean splitting, weighing, and bagging
router.post('/dry-mill/:batchNumber/split', async (req, res) => {
  const { batchNumber } = req.params;
  const { grades } = req.body;

  if (!batchNumber || !grades || !Array.isArray(grades) || grades.length === 0) {
    return res.status(400).json({ error: 'Batch number and valid grades are required.' });
  }

  // Filter out grades with no bags
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

    // Delete existing data for this batch
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

      // Fetch the sequence number for this grade
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

      // Increment sequence number
      await sequelize.query(
        `UPDATE "LotNumberSequences" 
         SET sequence = :sequence 
         WHERE producer = :producer AND productLine = :productLine 
         AND processingType = :processingType AND year = :year AND grade = :grade`,
        { 
          replacements: { 
            sequence: sequenceNumber + 1, 
            producer: parentBatch.producer, 
            productLine: parentBatch.productLine, 
            processingType: parentBatch.processingType, 
            year: currentYear, 
            grade 
          }, 
          transaction: t 
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

// POST route to remove a bag and adjust sequence
router.post('/dry-mill/:batchNumber/remove-bag', async (req, res) => {
  const { batchNumber } = req.params;
  const { grade, bagIndex } = req.body;

  if (!batchNumber || !grade || bagIndex === undefined) {
    return res.status(400).json({ error: 'Batch number, grade, and bag index are required.' });
  }

  let t;
  try {
    t = await sequelize.transaction();

    // Find the subBatchId and verify the bag for the given batchNumber (parent or sub-batch)
    const [gradeEntry] = await sequelize.query(`
      SELECT "subBatchId", weight, bagged_at
      FROM "DryMillGrades" dg
      WHERE dg."batchNumber" = :batchNumber AND dg.grade = :grade
      LIMIT 1;
    `, { replacements: { batchNumber, grade }, transaction: t, type: sequelize.QueryTypes.SELECT });

    if (!gradeEntry) {
      // Check if this is a sub-batch by joining with PostprocessingData
      const [subBatchGrade] = await sequelize.query(`
        SELECT dg."subBatchId", dg.weight, dg.bagged_at
        FROM "PostprocessingData" ppd
        JOIN "DryMillGrades" dg ON ppd."batchNumber" = :batchNumber AND dg.grade = ppd.quality
        LIMIT 1;
      `, { replacements: { batchNumber }, transaction: t, type: sequelize.QueryTypes.SELECT });

      if (!subBatchGrade) {
        await t.rollback();
        return res.status(404).json({ error: 'Grade not found for this batch.' });
      }
      gradeEntry = subBatchGrade;
    }

    const subBatchId = gradeEntry.subBatchId;
    const [bag] = await sequelize.query(`
      SELECT weight, bag_number
      FROM "BagDetails"
      WHERE grade_id = :subBatchId
      ORDER BY bag_number
      LIMIT 1 OFFSET :bagIndex;
    `, { replacements: { subBatchId, bagIndex }, transaction: t, type: sequelize.QueryTypes.SELECT });

    if (!bag) {
      await t.rollback();
      return res.status(404).json({ error: 'Bag not found.' });
    }

    // Fetch batch metadata to get producer, productLine, processingType
    const [batchMeta] = await sequelize.query(`
      SELECT pp."processingType", pp."productLine", pp."producer"
      FROM "PreprocessingData" pp
      WHERE pp."batchNumber" = :batchNumber
      LIMIT 1;
    `, { replacements: { batchNumber }, transaction: t, type: sequelize.QueryTypes.SELECT });

    if (!batchMeta) {
      await t.rollback();
      return res.status(400).json({ error: 'Batch metadata not found.' });
    }

    const { producer, productLine, processingType } = batchMeta;
    const currentYear = new Date().getFullYear().toString().slice(-2);

    // Decrement the sequence for this grade
    const [sequenceResult] = await sequelize.query(
      `SELECT sequence FROM "LotNumberSequences" 
       WHERE producer = :producer AND productLine = :productLine 
       AND processingType = :processingType AND year = :year AND grade = :grade 
       FOR UPDATE`,
      { 
        replacements: { producer, productLine, processingType, year: currentYear, grade }, 
        transaction: t 
      }
    );

    if (sequenceResult.length > 0 && sequenceResult[0].sequence > 0) {
      const newSequence = sequenceResult[0].sequence - 1;
      await sequelize.query(
        `UPDATE "LotNumberSequences" 
         SET sequence = :sequence 
         WHERE producer = :producer AND productLine = :productLine 
         AND processingType = :processingType AND year = :year AND grade = :grade`,
        { 
          replacements: { sequence: newSequence, producer, productLine, processingType, year: currentYear, grade }, 
          transaction: t 
        }
      );
    }

    // Delete the bag
    await sequelize.query(`
      DELETE FROM "BagDetails"
      WHERE grade_id = :subBatchId AND bag_number = :bagNumber;
    `, { replacements: { subBatchId, bagNumber: bag.bag_number }, transaction: t });

    // Update DryMillGrades weight
    const remainingBags = await sequelize.query(`
      SELECT COALESCE(SUM(weight), 0) AS total_weight
      FROM "BagDetails"
      WHERE grade_id = :subBatchId;
    `, { replacements: { subBatchId }, transaction: t, type: sequelize.QueryTypes.SELECT });
    const newTotalWeight = remainingBags[0].total_weight;

    await sequelize.query(`
      UPDATE "DryMillGrades"
      SET weight = :weight
      WHERE "subBatchId" = :subBatchId;
    `, { replacements: { weight: newTotalWeight, subBatchId }, transaction: t });

    // Check if this was the last bag for this grade
    const [bagCount] = await sequelize.query(`
      SELECT COUNT(*) AS count
      FROM "BagDetails"
      WHERE grade_id = :subBatchId;
    `, { replacements: { subBatchId }, transaction: t, type: sequelize.QueryTypes.SELECT });

    if (bagCount[0].count === 0) {
      await sequelize.query(`
        DELETE FROM "DryMillGrades"
        WHERE "subBatchId" = :subBatchId;
      `, { replacements: { subBatchId }, transaction: t });

      await sequelize.query(`
        DELETE FROM "PostprocessingData"
        WHERE "batchNumber" = :batchNumber AND quality = :grade;
      `, { replacements: { batchNumber, grade }, transaction: t });
    }

    await t.commit();

    res.status(200).json({ message: 'Bag removed successfully', newTotalWeight });
  } catch (error) {
    if (t) await t.rollback();
    console.error('Error removing bag:', error);
    res.status(500).json({ error: 'Failed to remove bag', details: error.message });
  }
});

// POST route to complete a batch
router.post('/dry-mill/:batchNumber/complete', async (req, res) => {
  const { batchNumber } = req.params;

  if (!batchNumber) {
    return res.status(400).json({ error: 'Batch number is required.' });
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

    // Fetch splits data with debugging
    const [splits] = await sequelize.query(`
      SELECT COUNT(*) AS total, SUM(CASE WHEN weight IS NOT NULL AND bagged_at IS NOT NULL THEN 1 ELSE 0 END) AS completed
      FROM "DryMillGrades" 
      WHERE "batchNumber" = :batchNumber;
    `, { replacements: { batchNumber }, transaction: t, type: sequelize.QueryTypes.SELECT });

    console.log('Query result for splits:', splits); // Debug log

    // Handle case where no rows are returned
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

    await t.commit();

    res.status(200).json({ message: 'Batch marked as processed successfully, RFID tag available for reuse', exited_at: result[0].exited_at });
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

      // Fetch all grades for the parent batch
      const allGrades = dryMillGradesArray.filter(grade => grade.batchNumber === relevantBatchNumber) || [];
      const allBags = bagDetailsArray.filter(bag => allGrades.some(g => g.subBatchId === bag.grade_id)) || [];
      const receiving = receivingDataArray.find(r => r.batchNumber === (batch.parentBatchNumber || batch.batchNumber)) || {};

      let isStored;
      if (batch.parentBatchNumber) {
        // For sub-batches, only consider the grade matching the sub-batch's quality
        const subBatchGrade = allGrades.find(g => g.grade === batch.quality);
        const subBatchBags = subBatchGrade ? allBags.filter(b => b.grade_id === subBatchGrade.subBatchId) : [];
        const hasSplits = !!subBatchGrade;
        const gradeStored = subBatchGrade ? subBatchGrade.is_stored : false;
        const bagsStored = subBatchBags.length > 0 ? subBatchBags.every(b => b.is_stored) : true;
        // Sub-batch is stored if its grade and bags are stored, currentAssign is 0, and storedDate is set
        isStored = receiving.currentAssign === 0 && (!hasSplits || (gradeStored && bagsStored)) && !!batch.storeddatetrunc;
      } else {
        // For parent batches, consider all splits
        const hasSplits = allGrades.length > 0;
        const allSplitsStored = hasSplits ? allGrades.every(g => g.is_stored && allBags.filter(b => b.grade_id === g.subBatchId).every(b => b.is_stored)) : false;
        isStored = receiving.currentAssign === 0 && (!hasSplits || allSplitsStored);
      }

      return {
        ...batch,
        status,
        dryMillEntered: latestEntry?.entered_at ? new Date(latestEntry.entered_at).toISOString().slice(0, 10) : 'N/A',
        dryMillExited: latestEntry?.exited_at ? new Date(latestEntry.exited_at).toISOString().slice(0, 10) : 'N/A',
        rfid: receiving.rfid || 'N/A',
        bagWeights: allBags.map(b => b.weight),
        green_bean_splits: allGrades.length > 0 ? 
          allGrades.map(g => 
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

    res.status(200).json({
      message: 'RFID tag reused successfully',
      batchNumber,
    });
  } catch (error) {
    console.error('Error reusing RFID tag:', error);
    res.status(500).json({ error: 'Failed to reuse RFID tag', details: error.message });
  }
});

// GET route for dry mill grades
router.get('/dry-mill-grades/:batchNumber', async (req, res) => {
  const { batchNumber } = req.params;

  // Validate batchNumber
  if (!batchNumber || typeof batchNumber !== 'string' || batchNumber.trim() === '') {
    console.error('Invalid batch number provided:', batchNumber);
    return res.status(400).json({ error: 'Invalid batch number provided' });
  }

  const trimmedBatchNumber = batchNumber.trim();
  console.log(`Fetching grades for batchNumber: ${trimmedBatchNumber}`);

  try {
    let gradesResult = [];
    let parentBatchNumber = trimmedBatchNumber;

    // Check if this is a sub-batch by looking in PostprocessingData
    const subBatchResult = await sequelize.query(`
      SELECT quality, "parentBatchNumber"
      FROM "PostprocessingData"
      WHERE "batchNumber" = :batchNumber
      LIMIT 1;
    `, {
      replacements: { batchNumber: trimmedBatchNumber },
      type: sequelize.QueryTypes.SELECT,
    });

    const subBatch = subBatchResult.length > 0 ? subBatchResult[0] : null;
    console.log(`Sub-batch query result for ${trimmedBatchNumber}:`, subBatch);

    // Check if batchNumber matches the sub-batch format (e.g., ends with -S, -G1, etc.)
    const subBatchRegex = /-(S|G[1-4])$/;
    const isSubBatchFormat = subBatchRegex.test(trimmedBatchNumber);

    if (subBatch && isSubBatchFormat) {
      console.log(`Identified as sub-batch: ${trimmedBatchNumber}, parentBatchNumber: ${subBatch.parentBatchNumber}, quality: ${subBatch.quality}`);
      parentBatchNumber = subBatch.parentBatchNumber;

      // For sub-batches, fetch the specific grade and its bags
      gradesResult = await sequelize.query(`
        SELECT dg."subBatchId", dg.grade, dg.weight, dg.bagged_at, dg.is_stored,
               COALESCE(ARRAY_AGG(bd.weight ORDER BY bd.bag_number), ARRAY[]::FLOAT[]) AS bag_weights
        FROM "DryMillGrades" dg
        LEFT JOIN "BagDetails" bd ON dg."subBatchId" = bd.grade_id
        WHERE dg."batchNumber" = :parentBatchNumber
        AND dg.grade = :quality
        GROUP BY dg."subBatchId", dg.grade, dg.weight, dg.bagged_at, dg.is_stored
      `, {
        replacements: { parentBatchNumber, quality: subBatch.quality },
        type: sequelize.QueryTypes.SELECT,
      });

      if (gradesResult.length === 0) {
        console.warn(`No grades found for sub-batch ${trimmedBatchNumber} with quality ${subBatch.quality}`);
      }
    } else {
      console.log(`Identified as parent batch or no sub-batch found: ${trimmedBatchNumber}`);

      // Check if the batch exists in DryMillData to confirm it's a valid parent batch
      const [parentBatch] = await sequelize.query(`
        SELECT "batchNumber"
        FROM "DryMillData"
        WHERE "batchNumber" = :batchNumber
        LIMIT 1;
      `, {
        replacements: { batchNumber: trimmedBatchNumber },
        type: sequelize.QueryTypes.SELECT,
      });

      if (!parentBatch && !subBatch) {
        console.error(`Batch ${trimmedBatchNumber} not found in DryMillData or PostprocessingData`);
        return res.status(404).json({ error: `Batch ${trimmedBatchNumber} not found` });
      }

      // For parent batches (or if sub-batch lookup fails), fetch all grades
      gradesResult = await sequelize.query(`
        SELECT dg."subBatchId", dg.grade, dg.weight, dg.bagged_at, dg.is_stored,
               COALESCE(ARRAY_AGG(bd.weight ORDER BY bd.bag_number), ARRAY[]::FLOAT[]) AS bag_weights
        FROM "DryMillGrades" dg
        LEFT JOIN "BagDetails" bd ON dg."subBatchId" = bd.grade_id
        WHERE dg."batchNumber" = :batchNumber
        GROUP BY dg."subBatchId", dg.grade, dg.weight, dg.bagged_at, dg.is_stored
        ORDER BY dg.grade;
      `, {
        replacements: { batchNumber: parentBatchNumber },
        type: sequelize.QueryTypes.SELECT,
      });

      if (gradesResult.length === 0) {
        console.warn(`No grades found for batch ${parentBatchNumber}`);
      }
    }

    const grades = Array.isArray(gradesResult) ? gradesResult : [];
    console.log(`Found ${grades.length} grades for batch ${trimmedBatchNumber}`);

    const formattedGrades = grades.map(grade => ({
      grade: grade.grade,
      weight: grade.weight ? grade.weight.toString() : '',
      bagWeights: grade.bag_weights || [],
      bagged_at: grade.bagged_at ? new Date(grade.bagged_at).toISOString().slice(0, 10) : '',
    }));

    // If no grades are found, return default grades to maintain consistent response format
    if (formattedGrades.length === 0) {
      console.log(`Returning default grades for batch ${trimmedBatchNumber}`);
      return res.status(200).json([
        { grade: 'Specialty Grade', weight: '', bagWeights: [], bagged_at: new Date().toISOString().slice(0, 10) },
        { grade: 'Grade 1', weight: '', bagWeights: [], bagged_at: new Date().toISOString().slice(0, 10) },
        { grade: 'Grade 2', weight: '', bagWeights: [], bagged_at: new Date().toISOString().slice(0, 10) },
        { grade: 'Grade 3', weight: '', bagWeights: [], bagged_at: new Date().toISOString().slice(0, 10) },
        { grade: 'Grade 4', weight: '', bagWeights: [], bagged_at: new Date().toISOString().slice(0, 10) },
      ]);
    }

    res.status(200).json(formattedGrades);
  } catch (error) {
    console.error(`Error fetching dry mill grades for batch ${trimmedBatchNumber}:`, error);
    res.status(500).json({ error: 'Failed to fetch existing grades', details: error.message });
  }
});

// POST route for lot number sequence management
router.post('/lot-number-sequence', async (req, res) => {
  const { producer, productLine, processingType, year, grade, action } = req.body;

  if (!producer || !productLine || !processingType || !year || !grade) {
    return res.status(400).json({ error: 'Missing required fields: producer, productLine, processingType, year, grade' });
  }

  let t;
  try {
    t = await sequelize.transaction();

    const [sequenceResult] = await sequelize.query(
      `SELECT sequence FROM "LotNumberSequences" 
       WHERE producer = :producer AND productLine = :productLine 
       AND processingType = :processingType AND year = :year AND grade = :grade 
       FOR UPDATE`,
      { 
        replacements: { producer, productLine, processingType, year, grade }, 
        transaction: t 
      }
    );

    let sequence;
    if (sequenceResult.length === 0) {
      await sequelize.query(
        `INSERT INTO "LotNumberSequences" (producer, productLine, processingType, year, grade, sequence)
         VALUES (:producer, :productLine, :processingType, :year, :grade, 0)`,
        { 
          replacements: { producer, productLine, processingType, year, grade }, 
          transaction: t 
        }
      );
      sequence = 0;
    } else {
      sequence = sequenceResult[0].sequence;
    }

    if (action === 'increment') {
      sequence += 1;
      await sequelize.query(
        `UPDATE "LotNumberSequences" 
         SET sequence = :sequence 
         WHERE producer = :producer AND productLine = :productLine 
         AND processingType = :processingType AND year = :year AND grade = :grade`,
        { 
          replacements: { sequence, producer, productLine, processingType, year, grade }, 
          transaction: t 
        }
      );
    } else if (action === 'decrement' && sequence > 0) {
      sequence -= 1;
      await sequelize.query(
        `UPDATE "LotNumberSequences" 
         SET sequence = :sequence 
         WHERE producer = :producer AND productLine = :productLine 
         AND processingType = :processingType AND year = :year AND grade = :grade`,
        { 
          replacements: { sequence, producer, productLine, processingType, year, grade }, 
          transaction: t 
        }
      );
    }

    await t.commit();

    const formattedSequence = String(sequence).padStart(4, '0');
    res.json({ sequence: formattedSequence });
  } catch (error) {
    if (t) await t.rollback();
    console.error('Error managing lot number sequence:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;