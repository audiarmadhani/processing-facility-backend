const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

router.post('/dry-mill-grades', async (req, res) => {
    const { batchNumber, grades } = req.body; // grades: [{ grade: "Grade 1", weight: 10.5 }, ...]
  
    if (!batchNumber || !Array.isArray(grades) || grades.length === 0) {
      return res.status(400).json({ error: 'batchNumber and grades array are required.' });
    }
  
    try {
      const [dryMillEntry] = await sequelize.query(`
        SELECT "entered_at" FROM "DryMillData" WHERE "batchNumber" = :batchNumber AND "entered_at" IS NOT NULL LIMIT 1;
      `, { replacements: { batchNumber }, type: sequelize.QueryTypes.SELECT });
  
      if (!dryMillEntry) return res.status(400).json({ error: 'Batch must be entered into dry mill first.' });
  
      const results = [];
      for (const { grade, weight } of grades) {
        if (!grade || typeof weight !== 'number' || weight <= 0) {
          return res.status(400).json({ error: 'Each grade must have a valid grade and positive weight.' });
        }
        const subBatchId = `${batchNumber}-${grade.replace(/\s+/g, '')}`; // e.g., "B001-Grade1"
        const [result] = await sequelize.query(`
          INSERT INTO "DryMillGrades" ("batchNumber", "subBatchId", grade, weight, sorted_at)
          VALUES (:batchNumber, :subBatchId, :grade, :weight, NOW())
          ON CONFLICT ("subBatchId") DO UPDATE SET weight = :weight, sorted_at = NOW()
          RETURNING *;
        `, { replacements: { batchNumber, subBatchId, grade, weight }, type: sequelize.QueryTypes.INSERT });
        results.push(result[0]);
      }
  
      res.status(201).json({ message: 'Dry mill grades saved', grades: results });
    } catch (error) {
      console.error('Error saving dry mill grades:', error);
      res.status(500).json({ error: 'Failed to save dry mill grades', details: error.message });
    }
});

router.get('/dry-mill-data', async (req, res) => {
    try {
      const data = await sequelize.query(`
        SELECT dm.rfid, dm."batchNumber", dm.entered_at, dm.exited_at, dm.created_at,
               dg."subBatchId", dg.grade, dg.weight, dg.sorted_at
        FROM "DryMillData" dm
        LEFT JOIN "DryMillGrades" dg ON dm."batchNumber" = dg."batchNumber"
        ORDER BY dm.created_at DESC;
      `, { type: sequelize.QueryTypes.SELECT });
      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching dry mill data:', error);
      res.status(500).json({ error: 'Failed to fetch dry mill data', details: error.message });
    }
});

module.exports = router;