const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

// Route for creating target metrics data
router.post('/targets', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { 
      type, 
      processingType, 
      quality, 
      metric, 
      timeFrame, 
      targetValue, 
      startDate, 
      endDate 
    } = req.body;

    // Validate required fields
    if (!type || !"processingType" || !quality || !metric || !timeFrame || !"targetValue" || !"startDate" || !"endDate") {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Save the target metrics data
    const [TargetMetrics] = await sequelize.query(
      `INSERT INTO "TargetMetrics" 
        (type, "processingType", quality, metric, "timeFrame", "targetValue", "startDate", "endDate", "createdAt", "updatedAt") 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
       RETURNING *`,
      {
        replacements: [
          type, 
          "processingType", 
          quality, 
          metric, 
          timeFrame, 
          "targetValue", 
          "startDate", 
          "endDate", 
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
    const [allRows] = await sequelize.query('SELECT * FROM "TargetMetrics"');
    res.json(allRows);
  } catch (err) {
    console.error('Error fetching target metrics data:', err);
    res.status(500).json({ message: 'Failed to fetch target metrics data.' });
  }
});

const calculateDateRanges = (type) => {
  const today = new Date();
  let start, end;

  if (type === 'this-week') {
    const day = today.getDay() || 7;
    start = DATE_TRUNC('week', current_date) + interval '1 day';
    end = DATE_TRUNC('week', current_date) + interval '7 days';
  } else if (type === 'this-month') {
    start = DATE_TRUNC('month', CURRENT_DATE);
    end = DATE_TRUNC('month', CURRENT_DATE) + interval '1 month - 1 day';
  } else if (type === 'next-week') {
    start = DATE_TRUNC('week', CURRENT_DATE) + interval '1 week';
    end = DATE_TRUNC('week', CURRENT_DATE) + interval '2 weeks' - interval '1 day';
  } else if (type === 'next-month') {
    start = DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month');
    end = (DATE_TRUNC('month', CURRENT_DATE + INTERVAL '2 month') - INTERVAL '1 day');
  } else if (type === 'previous-week') {
    start = DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '1 week';
    end = DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '1 day';
  } else if (type === 'previous-month') {
    start = DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month';
    end = DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day';
  }

  return { start, end };
};

// Route to get target metrics data by this week date
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
          SELECT 
              CONCAT(type, ' ', "processingType", ' ', quality, ' ', metric) AS id,
              type, 
              "processingType", 
              quality, 
              metric, 
              CASE 
                  WHEN metric = 'Average Cherry Cost' THEN AVG("targetValue") 
                  ELSE SUM("targetValue") 
              END AS "targetValue"
          FROM "TargetMetrics"
          WHERE "startDate" <= $1 AND "endDate" >= $2
          GROUP BY type, "processingType", quality, metric
      ), 
      ttw AS (
          SELECT 
              type, 
              "processingType", 
              quality, 
              'Total Weight Produced' AS metric,
              COALESCE(SUM(weight), 0) AS achievement
          FROM "PostprocessingData"
          WHERE "storedDate" BETWEEN $3 AND $4
          GROUP BY type, "processingType", quality
      )
      SELECT 
          a.id, 
          a.type, 
          a."processingType", 
          a.quality, 
          a.metric, 
          a."targetValue", 
          b.achievement
      FROM metric a
      LEFT JOIN ttw b 
          ON LOWER(a.type) = LOWER(b.type) 
          AND LOWER(a."processingType") = LOWER(b."processingType") 
          AND LOWER(a.quality) = LOWER(b.quality) 
          AND LOWER(a.metric) = LOWER(b.metric);
    `;

    const values = [end, start, start, end];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No data found for the specified range.' });
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching target metrics:', err);
    res.status(500).json({ message: 'Failed to fetch data.' });
  }
});

module.exports = router;