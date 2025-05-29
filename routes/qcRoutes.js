const express = require('express');
const router = express.Router();
const { sequelize } = require('../models');

// Route to create QC data
router.post('/qc', async (req, res) => {
    try {
        const {
            batchNumber, ripeness, color, foreignMatter, overallQuality, qcNotes,
            unripePercentage, semiripePercentage, ripePercentage, overripePercentage,
            paymentMethod, price, createdBy, updatedBy
        } = req.body;

        // Check if the batch number exists in ReceivingData
        const [receivingCheck] = await sequelize.query(
            `SELECT 1 FROM "ReceivingData" WHERE "batchNumber" = :batchNumber LIMIT 1`,
            {
                replacements: { batchNumber: batchNumber.trim() },
                type: sequelize.QueryTypes.SELECT
            }
        );

        if (!receivingCheck) {
            return res.status(404).json({ error: 'Batch number does not exist in receiving data.' });
        }

        // Insert QC data
        const [result] = await sequelize.query(`
            INSERT INTO "QCData" (
                "batchNumber",
                "ripeness",
                "color",
                "foreignMatter",
                "overallQuality",
                "qcNotes",
                "unripePercentage",
                "semiripePercentage",
                "ripePercentage",
                "overripePercentage",
                "paymentMethod",
                "price",
                "createdAt",
                "createdBy",
                "updatedAt",
                "updatedBy"
            ) VALUES (
                :batchNumber,
                :ripeness,
                :color,
                :foreignMatter,
                :overallQuality,
                :qcNotes,
                :unripePercentage,
                :semiripePercentage,
                :ripePercentage,
                :overripePercentage,
                :paymentMethod,
                :price,
                NOW(),
                :createdBy,
                NOW(),
                :updatedBy
            )
            RETURNING *;
        `, {
            replacements: {
                batchNumber: batchNumber.trim(),
                ripeness,
                color,
                foreignMatter,
                overallQuality,
                qcNotes: qcNotes || null,
                unripePercentage: unripePercentage || null,
                semiripePercentage: semiripePercentage || null,
                ripePercentage: ripePercentage || null,
                overripePercentage: overripePercentage || null,
                paymentMethod,
                price: price || null,
                createdBy,
                updatedBy,
            },
            type: sequelize.QueryTypes.INSERT
        });

        res.status(201).json(result[0]);
    } catch (err) {
        console.error('Error creating QC data:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

// Route for fetching all QC data
router.get('/qc', async (req, res) => {
    try {
        const [allRows] = await sequelize.query(
            `SELECT * FROM "QCData_v";`
        );

        const [latestRows] = await sequelize.query(
            `SELECT * FROM "QCData_v" WHERE DATE("qcDate") = DATE(NOW())`
        );

        res.json({ latestRows, allRows });
    } catch (err) {
        console.error('Error fetching QC data:', err);
        res.status(500).json({ message: 'Failed to fetch QC data.' });
    }
});

// Route for updating QC Data
router.put('/qc/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            ripeness, color, foreignMatter, overallQuality, qcNotes,
            unripePercentage, semiripePercentage, ripePercentage, overripePercentage,
            paymentMethod
        } = req.body;

        const [updatedRows] = await sequelize.query(`
            UPDATE "QCData"
            SET
                "ripeness" = :ripeness,
                "color" = :color,
                "foreignMatter" = :foreignMatter,
                "overallQuality" = :overallQuality,
                "qcNotes" = :qcNotes,
                "unripePercentage" = :unripePercentage,
                "semiripePercentage" = :semiripePercentage,
                "ripePercentage" = :ripePercentage,
                "overripePercentage" = :overripePercentage,
                "paymentMethod" = :paymentMethod,
                "updatedAt" = NOW()
            WHERE "id" = :id
            RETURNING *;
        `, {
            replacements: {
                id,
                ripeness,
                color,
                foreignMatter,
                overallQuality,
                qcNotes: qcNotes || null,
                unripePercentage: unripePercentage || null,
                semiripePercentage: semiripePercentage || null,
                ripePercentage: ripePercentage || null,
                overripePercentage: overripePercentage || null,
                paymentMethod
            },
            type: sequelize.QueryTypes.UPDATE
        });

        if (updatedRows.length === 0) {
            return res.status(404).json({ error: 'QCData record not found.' });
        }

        res.status(200).json(updatedRows[0]);
    } catch (err) {
        console.error('Error updating QC data:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

// Route for deleting QC Data
router.delete('/qc/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [deletedRows] = await sequelize.query(`
            DELETE FROM "QCData"
            WHERE "id" = :id
            RETURNING *;
        `, {
            replacements: { id },
            type: sequelize.QueryTypes.DELETE
        });

        if (deletedRows.length === 0) {
            return res.status(404).json({ error: 'QCData record not found.' });
        }

        res.status(204).send();
    } catch (err) {
        console.error('Error deleting QC data:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

module.exports = router;