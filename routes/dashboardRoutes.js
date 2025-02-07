const express = require('express');
const router = express.Router();
const sequelize = require('../config/database'); // Assuming this is your Sequelize instance

// Helper function to calculate date ranges based on the selected timeframe
const getDateRange = (timeframe) => {
  const now = new Date();
  switch (timeframe) {
    case 'this_week':
      // Calculate Monday of the current week
      const startOfWeek = new Date(now.setDate(now.getDate() - ((now.getDay() + 6) % 7)));
      return [startOfWeek, new Date()];
    case 'previous_week':
      // Calculate Monday of the previous week
      const startOfPreviousWeek = new Date(now.setDate(now.getDate() - ((now.getDay() + 6) % 7) - 7));
      const endOfPreviousWeek = new Date(startOfPreviousWeek.setDate(startOfPreviousWeek.getDate() + 6));
      return [startOfPreviousWeek, endOfPreviousWeek];
    case 'this_month':
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return [startOfMonth, new Date()];
    case 'previous_month':
      const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      return [startOfPreviousMonth, endOfPreviousMonth];
    case 'this_year':
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return [startOfYear, new Date()];
    case 'previous_year':
      const startOfPreviousYear = new Date(now.getFullYear() - 1, 0, 1);
      const endOfPreviousYear = new Date(now.getFullYear() - 1, 11, 31);
      return [startOfPreviousYear, endOfPreviousYear];
    default:
      throw new Error('Invalid timeframe');
  }
};

router.get('/dashboard-metrics', async (req, res) => {
    try {
        // Extract query parameters, defaulting to "this_month" if not provided
        const { timeframe = 'this_month' } = req.query;

        let startDate, endDate;
        try {
        [startDate, endDate] = getDateRange(timeframe);
        } catch (error) {
        return res.status(400).json({ message: error.message });
        }

        // Format dates for SQL queries
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];

        // Define dynamic SQL queries based on the timeframe
        const totalBatchesQuery = `
        SELECT COUNT(*) AS count 
        FROM "ReceivingData" 
        WHERE "receivingDate" BETWEEN '${formattedStartDate}' AND '${formattedEndDate}'
        `;
        const totalArabicaWeightQuery = `
        SELECT COALESCE(SUM(weight), 0) AS sum 
        FROM "ReceivingData" 
        WHERE "receivingDate" BETWEEN '${formattedStartDate}' AND '${formattedEndDate}' 
            AND type = 'Arabica'
        `;
        const totalRobustaWeightQuery = `
        SELECT COALESCE(SUM(weight), 0) AS sum 
        FROM "ReceivingData" 
        WHERE "receivingDate" BETWEEN '${formattedStartDate}' AND '${formattedEndDate}' 
            AND type = 'Robusta'
        `;
        const totalArabicaCostQuery = `
        SELECT COALESCE(SUM(price * weight), 0) AS sum 
        FROM "ReceivingData" 
        WHERE "receivingDate" BETWEEN '${formattedStartDate}' AND '${formattedEndDate}' 
            AND type = 'Arabica'
        `;
        const totalRobustaCostQuery = `
        SELECT COALESCE(SUM(price * weight), 0) AS sum 
        FROM "ReceivingData" 
        WHERE "receivingDate" BETWEEN '${formattedStartDate}' AND '${formattedEndDate}' 
            AND type = 'Robusta'
        `;
        const avgArabicaCostQuery = `
        SELECT COALESCE(ROUND(AVG(price)::numeric, 1), 0) AS avg 
        FROM "ReceivingData" 
        WHERE "receivingDate" BETWEEN '${formattedStartDate}' AND '${formattedEndDate}' 
            AND type = 'Arabica'
        `;
        const avgRobustaCostQuery = `
        SELECT COALESCE(ROUND(AVG(price)::numeric, 1), 0) AS avg 
        FROM "ReceivingData" 
        WHERE "receivingDate" BETWEEN '${formattedStartDate}' AND '${formattedEndDate}' 
            AND type = 'Robusta'
        `;

        // Execute queries
        const [totalBatchesResult] = await sequelize.query(totalBatchesQuery);
        const [totalArabicaWeightResult] = await sequelize.query(totalArabicaWeightQuery);
        const [totalRobustaWeightResult] = await sequelize.query(totalRobustaWeightQuery);
        const [totalArabicaCostResult] = await sequelize.query(totalArabicaCostQuery);
        const [totalRobustaCostResult] = await sequelize.query(totalRobustaCostQuery);
        const [avgArabicaCostResult] = await sequelize.query(avgArabicaCostQuery);
        const [avgRobustaCostResult] = await sequelize.query(avgRobustaCostQuery);

        // Extract results
        const totalBatches = totalBatchesResult[0].count || 0;
        const totalArabicaWeight = totalArabicaWeightResult[0].sum || 0;
        const totalRobustaWeight = totalRobustaWeightResult[0].sum || 0;
        const totalArabicaCost = totalArabicaCostResult[0].sum || 0;
        const totalRobustaCost = totalRobustaCostResult[0].sum || 0;
        const avgArabicaCost = avgArabicaCostResult[0].avg || 0;
        const avgRobustaCost = avgRobustaCostResult[0].avg || 0;

        // Return the metrics
        res.json({
        totalBatches,
        totalArabicaWeight,
        totalRobustaWeight,
        totalArabicaCost,
        totalRobustaCost,
        avgArabicaCost,
        avgRobustaCost,
        });
    } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
        res.status(500).json({ message: 'Failed to fetch dashboard metrics.' });
    }
});

module.exports = router;