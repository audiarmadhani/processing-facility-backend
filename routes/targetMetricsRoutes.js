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
    if (!type || !processingType || !quality || !metric || !timeFrame || !targetValue || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Save the target metrics data
    const [TargetMetrics] = await sequelize.query(
      `INSERT INTO TargetMetrics 
        (type, processingType, quality, metric, timeFrame, targetValue, startDate, endDate, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
       RETURNING *`,
      {
        replacements: [
          type, 
          processingType, 
          quality, 
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
    const [allRows] = await sequelize.query('SELECT * FROM TargetMetrics');
    res.json(allRows);
  } catch (err) {
    console.error('Error fetching target metrics data:', err);
    res.status(500).json({ message: 'Failed to fetch target metrics data.' });
  }
});

// Route to get target metrics data by this week date
router.get('/targets/this-week', async (req, res) => {
  const today = new Date();

  // Calculate the start of the week (Monday)
  const startOfWeek = new Date(today);
  const day = today.getDay() || 7; // Treat Sunday (0) as 7
  startOfWeek.setDate(today.getDate() - day + 1);
  startOfWeek.setHours(0, 0, 0, 0);

  // Calculate the end of the week (Saturday)
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (6 - today.getDay())); // Go forward to the end of the week
  endOfWeek.setHours(23, 59, 59, 999); // End of the day

  try {
    const [rows] = await sequelize.query(
      `WITH metric AS (
        SELECT 
          type || " " || processingType || " " || quality || " " || metric AS id, 
          type, 
          processingType, 
          quality, 
          metric, 
          CASE 
            WHEN metric = "Average Cherry Cost" THEN AVG(targetValue) 
            ELSE SUM(targetValue) 
          END AS targetValue 
        FROM TargetMetrics 
        WHERE (startDate <= ? AND endDate >= ?) 
        GROUP BY 
          type || " " || processingType || " " || quality || " " || metric, 
          type, 
          processingType, 
          quality, 
          metric
      ), 
      ttw AS (
        SELECT 
          type, 
          processingType, 
          quality, 
          "Total Weight Produced" AS metric, 
          COALESCE(SUM(weight), 0) AS achievement 
        FROM PostprocessingData 
        WHERE storedDate BETWEEN ? AND ? 
        GROUP BY type, processingType, quality, "Total Weight Produced"
      ) 
      SELECT 
        a.id, 
        a.type, 
        a.processingType, 
        a.quality, 
        a.metric, 
        a.targetValue, 
        b.achievement 
      FROM metric a 
      LEFT JOIN ttw b on LOWER(a.type) = LOWER(b.type) AND LOWER(a.processingType) = LOWER(b.processingType) AND LOWER(a.quality) = LOWER(b.quality) AND LOWER(a.metric) = LOWER(b.metric)`,
      { replacements: [endOfWeek, startOfWeek, startOfWeek, endOfWeek] }
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No target metrics data found for this week.' });
    }

    res.json(rows); // Return the found records
  } catch (err) {
    console.error('Error fetching target metrics data for this week:', err);
    res.status(500).json({ message: 'Failed to fetch target metrics data for this week.' });
  }
});

// Route to get target metrics data for this month
router.get('/targets/this-month', async (req, res) => {
  const today = new Date();

  // Calculate the start of the month
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0); // Start of the day

  // Calculate the end of the month
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999); // End of the day

  try {
    const [rows] = await sequelize.query(
      `WITH metric AS (
        SELECT 
          type || " " || processingType || " " || quality || " " || metric AS id, 
          type, 
          processingType, 
          quality, 
          metric, 
          SUM(targetValue) AS targetValue 
        FROM TargetMetrics 
        WHERE (startDate <= ? AND endDate >= ?)
        GROUP BY 
          type || " " || processingType || " " || quality || " " || metric, 
          type, 
          processingType, 
          quality, 
          metric
      ), 
      ttw AS (
        SELECT 
          type, 
          processingType, 
          quality, 
          "Total Weight Produced" AS metric, 
          COALESCE(SUM(weight), 0) AS achievement 
        FROM PostprocessingData 
        WHERE storedDate BETWEEN ? AND ? 
        GROUP BY type, processingType, quality, "Total Weight Produced"
      ) 
      SELECT 
        a.id, 
        a.type, 
        a.processingType, 
        a.quality, 
        a.metric, 
        a.targetValue, 
        b.achievement 
      FROM metric a 
      LEFT JOIN ttw b on LOWER(a.type) = LOWER(b.type) AND LOWER(a.processingType) = LOWER(b.processingType) AND LOWER(a.quality) = LOWER(b.quality) AND LOWER(a.metric) = LOWER(b.metric)`,
      { replacements: [endOfMonth, startOfMonth, startOfMonth, endOfMonth] }
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No target metrics data found for this month.' });
    }

    res.json(rows); // Return the found records
  } catch (err) {
    console.error('Error fetching target metrics data for this month:', err);
    res.status(500).json({ message: 'Failed to fetch target metrics data for this month.' });
  }
});

// Route to get target metrics data for the next week
router.get('/targets/next-week', async (req, res) => {
  const today = new Date();

  // Find the current day of the week (0 = Sunday, 6 = Saturday)
  const currentDay = today.getDay();

  // Calculate the number of days to the next Monday
  const daysToNextMonday = (currentDay === 0 ? 1 : 8 - currentDay);

  // Start of next week (next Monday at midnight)
  const startNextWeek = new Date(today);
  startNextWeek.setDate(today.getDate() + daysToNextMonday);
  startNextWeek.setHours(0, 0, 0, 0);

  // End of next week (Sunday at 23:59:59)
  const endNextWeek = new Date(startNextWeek);
  endNextWeek.setDate(startNextWeek.getDate() + 6);
  endNextWeek.setHours(23, 59, 59, 999);

  try {
    const [rows] = await sequelize.query(
      `WITH metric AS (
        SELECT 
          type || " " || processingType || " " || quality || " " || metric AS id, 
          type, 
          processingType, 
          quality, 
          metric, 
          CASE 
            WHEN metric = "Average Cherry Cost" THEN AVG(targetValue) 
            ELSE SUM(targetValue) 
          END AS targetValue 
        FROM TargetMetrics 
        WHERE (startDate <= ? AND endDate >= ?) 
        GROUP BY 
          type || " " || processingType || " " || quality || " " || metric, 
          type, 
          processingType, 
          quality, 
          metric
      ), 
      ttw AS (
        SELECT 
          type, 
          processingType, 
          quality, 
          "Total Weight Produced" AS metric, 
          COALESCE(SUM(weight), 0) AS achievement 
        FROM PostprocessingData 
        WHERE storedDate BETWEEN ? AND ? 
        GROUP BY type, processingType, quality, "Total Weight Produced"
      ) 
      SELECT 
        a.id, 
        a.type, 
        a.processingType, 
        a.quality, 
        a.metric, 
        a.targetValue, 
        b.achievement 
      FROM metric a 
      LEFT JOIN ttw b on LOWER(a.type) = LOWER(b.type) AND LOWER(a.processingType) = LOWER(b.processingType) AND LOWER(a.quality) = LOWER(b.quality) AND LOWER(a.metric) = LOWER(b.metric)`,
      { replacements: [endNextWeek, startNextWeek, startNextWeek, endNextWeek] }
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No target metrics data found for next week.' });
    }

    res.json(rows); // Return the found records
  } catch (err) {
    console.error('Error fetching target metrics data for next week:', err);
    res.status(500).json({ message: 'Failed to fetch target metrics data for next week.' });
  }
});

// Route to get target metrics data for the next month
router.get('/targets/next-month', async (req, res) => {
  const today = new Date();

  // Calculate the start of the next month
  const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  startOfNextMonth.setHours(0, 0, 0, 0); // Start of the day

  // Calculate the end of the next month
  const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);
  endOfNextMonth.setHours(23, 59, 59, 999); // End of the day

  try {
    const [rows] = await sequelize.query(
      `WITH metric AS (
        SELECT 
          type || " " || processingType || " " || quality || " " || metric AS id, 
          type, 
          processingType, 
          quality, 
          metric, 
          CASE 
            WHEN metric = "Average Cherry Cost" THEN AVG(targetValue) 
            ELSE SUM(targetValue) 
          END AS targetValue 
        FROM TargetMetrics 
        WHERE (startDate <= ? AND endDate >= ?) 
        GROUP BY 
          type || " " || processingType || " " || quality || " " || metric, 
          type, 
          processingType, 
          quality, 
          metric
      ), 
      ttw AS (
        SELECT 
          type, 
          processingType, 
          quality, 
          "Total Weight Produced" AS metric, 
          COALESCE(SUM(weight), 0) AS achievement 
        FROM PostprocessingData 
        WHERE storedDate BETWEEN ? AND ? 
        GROUP BY type, processingType, quality, "Total Weight Produced"
      ) 
      SELECT 
        a.id, 
        a.type, 
        a.processingType, 
        a.quality, 
        a.metric, 
        a.targetValue, 
        b.achievement 
      FROM metric a 
      LEFT JOIN ttw b on LOWER(a.type) = LOWER(b.type) AND LOWER(a.processingType) = LOWER(b.processingType) AND LOWER(a.quality) = LOWER(b.quality) AND LOWER(a.metric) = LOWER(b.metric)`,
      { replacements: [endOfNextMonth, startOfNextMonth, startOfNextMonth, endOfNextMonth] }
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No target metrics data found for next month.' });
    }

    res.json(rows); // Return the found records
  } catch (err) {
    console.error('Error fetching target metrics data for next month:', err);
    res.status(500).json({ message: 'Failed to fetch target metrics data for next month.' });
  }
});

router.get('/targets/previous-week', async (req, res) => {
  const today = new Date();

  // Calculate the start of the previous week (Monday)
  const startOfPreviousWeek = new Date(today);
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const daysToLastMonday = currentDay === 0 ? 6 : currentDay - 1; // If today is Sunday (0), go back 6 days
  startOfPreviousWeek.setDate(today.getDate() - daysToLastMonday - 7); // Go back to last Monday
  startOfPreviousWeek.setHours(0, 0, 0, 0); // Start of the day

  // Calculate the end of the previous week (Sunday)
  const endOfPreviousWeek = new Date(startOfPreviousWeek);
  endOfPreviousWeek.setDate(startOfPreviousWeek.getDate() + 6); // Add 6 days to get to Sunday
  endOfPreviousWeek.setHours(23, 59, 59, 999); // End of the day

  try {
    const [rows] = await sequelize.query(
      `WITH metric AS (
        SELECT 
          type || " " || processingType || " " || quality || " " || metric AS id, 
          type, 
          processingType, 
          quality, 
          metric, 
          CASE 
            WHEN metric = "Average Cherry Cost" THEN AVG(targetValue) 
            ELSE SUM(targetValue) 
          END AS targetValue 
        FROM TargetMetrics 
        WHERE (startDate <= ? AND endDate >= ?) 
        GROUP BY 
          type || " " || processingType || " " || quality || " " || metric, 
          type, 
          processingType, 
          quality, 
          metric
      ), 
      ttw AS (
        SELECT 
          type, 
          processingType, 
          quality, 
          "Total Weight Produced" AS metric, 
          COALESCE(SUM(weight), 0) AS achievement 
        FROM PostprocessingData 
        WHERE storedDate BETWEEN ? AND ? 
        GROUP BY type, processingType, quality, "Total Weight Produced"
      ) 
      SELECT 
        a.id, 
        a.type, 
        a.processingType, 
        a.quality, 
        a.metric, 
        a.targetValue, 
        b.achievement 
      FROM metric a 
      LEFT JOIN ttw b on LOWER(a.type) = LOWER(b.type) AND LOWER(a.processingType) = LOWER(b.processingType) AND LOWER(a.quality) = LOWER(b.quality) AND LOWER(a.metric) = LOWER(b.metric)`,
      {
        replacements: [
          endOfPreviousWeek, // TargetMetrics endDate
          startOfPreviousWeek, // TargetMetrics startDate
          startOfPreviousWeek, // PostprocessingData startDate
          endOfPreviousWeek, // PostprocessingData endDate
        ],
      }
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No target metrics data found for the previous week.' });
    }

    res.json(rows); // Return the found records
  } catch (err) {
    console.error('Error fetching target metrics data for the previous week:', err);
    res.status(500).json({ message: 'Failed to fetch target metrics data for the previous week.' });
  }
});

router.get('/targets/previous-month', async (req, res) => {
  const today = new Date();

  // Calculate the start of the previous month
  const startOfPreviousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  startOfPreviousMonth.setHours(0, 0, 0, 0); // Start of the day

  // Calculate the end of the previous month
  const endOfPreviousMonth = new Date(today.getFullYear(), today.getMonth(), 0); // Last day of the previous month
  endOfPreviousMonth.setHours(23, 59, 59, 999); // End of the day

  try {
    const [rows] = await sequelize.query(
      `WITH metric AS (
        SELECT 
          type || " " || processingType || " " || quality || " " || metric AS id, 
          type, 
          processingType, 
          quality, 
          metric, 
          CASE 
            WHEN metric = "Average Cherry Cost" THEN AVG(targetValue) 
            ELSE SUM(targetValue) 
          END AS targetValue 
        FROM TargetMetrics 
        WHERE (startDate <= ? AND endDate >= ?) 
        GROUP BY 
          type || " " || processingType || " " || quality || " " || metric, 
          type, 
          processingType, 
          quality, 
          metric
      ), 
      ttw AS (
        SELECT 
          type, 
          processingType, 
          quality, 
          "Total Weight Produced" AS metric, 
          COALESCE(SUM(weight), 0) AS achievement 
        FROM PostprocessingData 
        WHERE storedDate BETWEEN ? AND ? 
        GROUP BY type, processingType, quality, "Total Weight Produced"
      ) 
      SELECT 
        a.id, 
        a.type, 
        a.processingType, 
        a.quality, 
        a.metric, 
        a.targetValue, 
        b.achievement 
      FROM metric a 
      LEFT JOIN ttw b on LOWER(a.type) = LOWER(b.type) AND LOWER(a.processingType) = LOWER(b.processingType) AND LOWER(a.quality) = LOWER(b.quality) AND LOWER(a.metric) = LOWER(b.metric)`,
      {
        replacements: [
          endOfPreviousMonth, // TargetMetrics endDate
          startOfPreviousMonth, // TargetMetrics startDate
          startOfPreviousMonth, // PostprocessingData startDate
          endOfPreviousMonth, // PostprocessingData endDate
        ],
      }
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No target metrics data found for the previous month.' });
    }

    res.json(rows); // Return the found records
  } catch (err) {
    console.error('Error fetching target metrics data for the previous month:', err);
    res.status(500).json({ message: 'Failed to fetch target metrics data for the previous month.' });
  }
});

module.exports = router;