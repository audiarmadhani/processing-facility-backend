const express = require('express');
const router = express.Router();
const { sequelize } = require('../models'); // Import Sequelize instance

// Get the latest batch number
router.get('/latest-batch', async (req, res) => {
  try {
    // Query the latest batch number for today's date
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Execute raw SQL query
    const [results] = await sequelize.query(
      `SELECT "batchNumber" 
       FROM "Batches"
       WHERE "createdAt" BETWEEN :startOfDay AND :endOfDay
       ORDER BY "createdAt" DESC
       LIMIT 1`,
      {
        replacements: {
          startOfDay: startOfDay.toISOString(),
          endOfDay: endOfDay.toISOString(),
        },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Check if a batch was found
    if (!results) {
      return res.json({ latestBatch: null }); // No batches found for today
    }

    res.json({ latestBatch: results.batchNumber }); // Return the latest batch number
  } catch (error) {
    console.error('Error fetching latest batch:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;