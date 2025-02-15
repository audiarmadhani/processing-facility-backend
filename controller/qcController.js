const { QCData, ReceivingData, sequelize } = require('../models'); 

// Function to create QC data
exports.createQCData = async (req, res) => {
    try {
        const { batchNumber, ripeness, color, foreignMatter, overallQuality, qcNotes, unripePercentage, semiripePercentage, ripePercentage, overripePercentage, price, paymentMethod } = req.body;

        // Check if the batch number exists in ReceivingData before creating QCData
        const receivingData = await ReceivingData.findOne({ where: { batchNumber: batchNumber.trim() } });
        if (!receivingData) {
            return res.status(404).json({ error: 'Batch number does not exist in receiving data.' });
        }

        // Create a new QC data entry
        const qcData = await QCData.create({
            batchNumber,
            ripeness,
            color,
            foreignMatter,
            overallQuality,
            qcNotes,
            unripePercentage,
            semiripePercentage,
            ripePercentage,
            overripePercentage,
            price,
            paymentMethod,
        });

        res.status(201).json(qcData);
    } catch (err) {
        console.error('Error creating QC data:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};
