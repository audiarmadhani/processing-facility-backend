const express = require('express');
const router = express.Router();
const db = require('../db');

// Function to format date to 'YYYY-MM-DD HH:MM:SS'
const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().slice(0, 19).replace('T', ' '); // Format: YYYY-MM-DD HH:MM:SS
};

// Route to create Preprocessing data
router.post('/preprocessing', async (req, res) => {
    try {
        const { batchNumber, bagsProcessed, processingDate } = req.body;

        // Validate input data
        if (!batchNumber || bagsProcessed === undefined) {
            return res.status(400).json({ 
                error: 'Batch number and bags processed are required.' 
            });
        }

        // Get current date
        const now = new Date();
        const formattedProcessingDate = processingDate ? formatDate(processingDate) : formatDate(now);
        const formattedNow = formatDate(now);

        // Prepare SQL query
        const sql = `
            INSERT INTO PreprocessingData (batchNumber, bagsProcessed, processingDate, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?)
        `;

        // Execute SQL query
        await db.run(sql, [batchNumber, bagsProcessed, formattedProcessingDate, formattedNow, formattedNow]);

        res.status(201).json({ message: 'Preprocessing data created successfully.' });
    } catch (err) {
        console.error('Error creating preprocessing data:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

// Route to get all Preprocessing data
router.get('/preprocessing', (req, res) => {
    const filterQuery = 'SELECT * FROM PreprocessingData';
    db.all(filterQuery, [], (err, allRows) => {
        if (err) {
            console.error('Error fetching preprocessing data:', err);
            return res.status(500).json({ message: 'Failed to fetch preprocessing data.' });
        }

        const latestQuery = `
            SELECT * FROM PreprocessingData
            ORDER BY processingDate ASC
        `;

        db.all(latestQuery, [], (err, latestRows) => {
            if (err) {
                console.error('Error fetching latest preprocessing data:', err);
                return res.status(500).json({ message: 'Failed to fetch latest preprocessing data.' });
            }

            res.json({ latestRows, allRows });
        });
    });
});

// Route to get preprocessing data by batch number
router.get('/preprocessing/:batchNumber', (req, res) => {
    const { batchNumber } = req.params;

    if (!batchNumber) {
        return res.status(400).json({ error: 'Batch number is required.' });
    }

    const query = `
        SELECT SUM(bagsProcessed) AS totalBagsProcessed
        FROM PreprocessingData
        WHERE LOWER(batchNumber) = ?
    `;

    db.get(query, [batchNumber.toLowerCase()], (err, row) => {
        if (err) {
            console.error('Error fetching preprocessing data by batch number:', err);
            return res.status(500).json({ message: 'Failed to fetch preprocessing data by batch number.' });
        }

        if (!row || row.totalBagsProcessed === null) {
            return res.json({ totalBagsProcessed: 0 });
        }

        res.json(row);
    });
});

module.exports = router;