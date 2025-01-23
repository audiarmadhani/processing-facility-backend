const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Batches = require('../models/Batches'); // Import the Batches model

// Get the latest batch number
router.get('/latest-batch', async (req, res) => {
  try {
    // Query the latest batch number for today's date
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const latestBatch = await Batches.findOne({
      where: {
        createdAt: {
          [Op.between]: [startOfDay, endOfDay], // Filter by today's date
        },
      },
      order: [['createdAt', 'DESC']], // Sort by creation date in descending order
    });

    if (!latestBatch) {
      return res.json({ latestBatch: null }); // No batches found for today
    }

    res.json({ latestBatch: latestBatch.batchNumber });
  } catch (error) {
    console.error('Error fetching latest batch:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
