const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

// Route for creating target metrics data
router.post('/targets', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { 
      referenceNumber, 
      metric, 
      timeFrame, 
      targetValue, 
      startDate, 
      endDate 
    } = req.body;

    // Validate required fields
    if (!referenceNumber || !metric || !timeFrame || !targetValue || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Save the target metrics data
    const [TargetMetrics] = await sequelize.query(
      `INSERT INTO "TargetMetrics" 
       ("referenceNumber", metric, "timeFrame", "targetValue", "startDate", "endDate", "createdAt", "updatedAt") 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
       RETURNING *`,
      {
        replacements: [
          referenceNumber, 
          metric, 
          timeFrame, 
          targetValue, 
          startDate, 
          endDate, 
          new Date(), 
          new Date()
        ],
        transaction: t,
      }
    );

    // Commit the transaction
    await t.commit();

    // Respond with success
    res.status(201).json({
      message: 'Target metrics created successfully',
    });
  } catch (err) {
    // Rollback transaction on error
    await t.rollback();
    console.error('Error creating target metrics data:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Route for fetching all target metrics data
router.get('/targets', async (req, res) => {
  try {
    // Fetch all records for filtering purposes
    const [allRows] = await sequelize.query('SELECT a.*, "productLine", "processingType", producer, quality, type FROM "TargetMetrics" a LEFT JOIN "ReferenceMappings_duplicate" b on a."referenceNumber" = b."referenceNumber"');
    res.json(allRows);
  } catch (err) {
    console.error('Error fetching target metrics data:', err);
    res.status(500).json({ message: 'Failed to fetch target metrics data.' });
  }
});

// Route for fetching all target metrics data
router.get('/referenceMappings', async (req, res) => {
  try {
    // Fetch all records for filtering purposes
    const [allRows] = await sequelize.query('SELECT * FROM "ReferenceMappings_duplicate"');
    res.json(allRows);
  } catch (err) {
    console.error('Error fetching reference mappings data:', err);
    res.status(500).json({ message: 'Failed to fetch reference mappings data.' });
  }
});

const calculateDateRanges = (type) => {
  const today = new Date();
  let start, end;

  if (type === 'this_week') {
    const dayOfWeek = today.getDay() || 7; // Convert Sunday (0) to 7 for ISO week
    start = new Date(today);
    start.setDate(today.getDate() - dayOfWeek + 1); // Start of this week (Monday)
    start.setHours(0, 0, 0, 0);
    end = new Date(start);
    end.setDate(start.getDate() + 6); // End of this week (Sunday)
    end.setHours(23, 59, 59, 999);

  } else if (type === 'this_month') {
    start = new Date(today.getFullYear(), today.getMonth(), 1); // Start of the month
    end = new Date(today.getFullYear(), today.getMonth() + 1, 0); // End of the month

  } else if (type === 'next_week') {
    const dayOfWeek = today.getDay() || 7;
    start = new Date(today);
    start.setDate(today.getDate() - dayOfWeek + 8); // Start of next week (Monday)
    start.setHours(0, 0, 0, 0);
    end = new Date(start);
    end.setDate(start.getDate() + 6); // End of next week (Sunday)
    end.setHours(23, 59, 59, 999);

  } else if (type === 'next_month') {
    start = new Date(today.getFullYear(), today.getMonth() + 1, 1); // Start of next month
    end = new Date(today.getFullYear(), today.getMonth() + 2, 0); // End of next month

  } else if (type === 'previous_week') {
    const dayOfWeek = today.getDay() || 7;
    start = new Date(today);
    start.setDate(today.getDate() - dayOfWeek - 6); // Start of previous week (Monday)
    start.setHours(0, 0, 0, 0);
    end = new Date(start);
    end.setDate(start.getDate() + 6); // End of previous week (Sunday)
    end.setHours(23, 59, 59, 999);

  } else if (type === 'previous_month') {
    start = new Date(today.getFullYear(), today.getMonth() - 1, 1); // Start of previous month
    end = new Date(today.getFullYear(), today.getMonth(), 0); // End of previous month
  }

  return { start, end };
};

// Generic route for fetching target metrics data within a specific range
router.get('/targets/:range', async (req, res) => {
  const range = req.params.range;
  const { start, end } = calculateDateRanges(range);

  if (!start || !end) {
    return res.status(400).json({ message: 'Invalid range parameter.' });
  }

  try {
    const query = `
    WITH metric AS (
      SELECT id, "referenceNumber", metric, SUM("targetValue") END AS "targetValue" 
      FROM "TargetMetrics" 
      WHERE "startDate" <= ? AND "endDate" >= ? 
      GROUP BY id, "referenceNumber"
    ), 

    ttw AS (
      SELECT "referenceNumber", 'Total Weight Produced' AS metric, COALESCE(SUM(weight), 0) AS achievement 
      FROM "PostprocessingData" 
      WHERE "storedDate" BETWEEN ? AND ? 
      GROUP BY "referenceNumber"
    ) 

    SELECT 
      a.id, 
      a."referenceNumber", 
      a.metric, 
      a."targetValue", 
      COALESCE(b.achievement, 0) as achievement 
    FROM metric a 
    LEFT JOIN ttw b ON LOWER(a."referenceNumber") = LOWER(b."referenceNumber");
    `;

    const values = [end, start, start, end];
    const result = await sequelize.query(query, {
      replacements: values,
      type: sequelize.QueryTypes.SELECT,
    });

    if (result.length === 0) {
      return res.status(404).json({ message: 'No data found for the specified range.' });
    }

    res.json(result);
  } catch (err) {
    console.error('Error fetching target metrics:', err);
    res.status(500).json({ message: 'Failed to fetch data.' });
  }
});

// Route for updating the column name of a target metric
router.put('/targets/:id', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { 
      targetValue, 
      startDate, 
      endDate,
      id
    } = req.body;

    // Validate required fields
    if (!targetValue || !startDate || !endDate || !id) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Save the target metrics data
    const [TargetMetrics] = await sequelize.query(
      `UPDATE "TargetMetrics" 
       SET "targetValue" = ?, "startDate" = ?, "endDate" = ?, "updatedAt" = ? WHERE id = ?`,
      {
        replacements: [
          targetValue, 
          startDate, 
          endDate, 
          new Date(), 
          id,
        ],
        transaction: t,
      }
    );

    // Commit the transaction
    await t.commit();

    // Respond with success
    res.status(201).json({
      message: 'Target metrics updated successfully',
    });
  } catch (err) {
    // Rollback transaction on error
    await t.rollback();
    console.error('Error updating target metrics data:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Route for deleting a calendar event
router.delete('/targets/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await sequelize.query('DELETE FROM "TargetMetrics" WHERE id = ?', {
      replacements: [id],
    });

    res.status(200).json({ message: 'Target deleted successfully' });
  } catch (err) {
    console.error('Error deleting target:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;