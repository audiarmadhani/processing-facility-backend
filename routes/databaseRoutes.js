const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

// Route to get a list of all tables
router.get('/tables', async (req, res) => {
  try {
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    res.json(tables.map((table) => table.table_name));
  } catch (err) {
    console.error('Error fetching tables:', err);
    res.status(500).json({ message: 'Failed to fetch tables.' });
  }
});

// Route to get columns and rows for a selected table
router.get('/tables/:tableName', async (req, res) => {
  const { tableName } = req.params;

  try {
    // Get columns
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = ?
    `, { replacements: [tableName] });

    // Map columns into format suitable for DataGrid
    const formattedColumns = columns.map((col) => ({
      field: col.column_name,
      headerName: col.column_name,
      editable: true,
    }));

    // Get rows
    const [rows] = await sequelize.query(`SELECT * FROM "${tableName}"`);

    res.json({
      columns: formattedColumns,
      rows,
    });
  } catch (err) {
    console.error(`Error fetching data for table ${tableName}:`, err);
    res.status(500).json({ message: `Failed to fetch data for table ${tableName}.` });
  }
});

// Route to add a new row to a table
router.post('/tables/:tableName', async (req, res) => {
  const { tableName } = req.params;
  const rowData = req.body;

  try {
    const keys = Object.keys(rowData);
    const values = Object.values(rowData);
    const placeholders = keys.map(() => '?').join(', ');

    const query = `
      INSERT INTO "${tableName}" (${keys.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;
    const [newRow] = await sequelize.query(query, { replacements: values });

    res.status(201).json(newRow[0]);
  } catch (err) {
    console.error(`Error adding row to table ${tableName}:`, err);
    res.status(500).json({ message: `Failed to add row to table ${tableName}.` });
  }
});

// Route to update a row in a table
router.put('/tables/:tableName/:id', async (req, res) => {
  const { tableName, id } = req.params;
  const updatedData = req.body;

  try {
    const updates = Object.keys(updatedData)
      .map((key) => `"${key}" = ?`)
      .join(', ');
    const values = [...Object.values(updatedData), id];

    const query = `
      UPDATE "${tableName}"
      SET ${updates}
      WHERE id = ?
      RETURNING *
    `;
    const [updatedRow] = await sequelize.query(query, { replacements: values });

    if (updatedRow.length === 0) {
      return res.status(404).json({ message: `Row with ID ${id} not found.` });
    }

    res.json(updatedRow[0]);
  } catch (err) {
    console.error(`Error updating row in table ${tableName}:`, err);
    res.status(500).json({ message: `Failed to update row in table ${tableName}.` });
  }
});

// Route to delete a row from a table
router.delete('/tables/:tableName/:id', async (req, res) => {
  const { tableName, id } = req.params;

  try {
    const query = `
      DELETE FROM "${tableName}"
      WHERE id = ?
      RETURNING *
    `;
    const [deletedRow] = await sequelize.query(query, { replacements: [id] });

    if (deletedRow.length === 0) {
      return res.status(404).json({ message: `Row with ID ${id} not found.` });
    }

    res.json(deletedRow[0]);
  } catch (err) {
    console.error(`Error deleting row from table ${tableName}:`, err);
    res.status(500).json({ message: `Failed to delete row from table ${tableName}.` });
  }
});

router.get('/farmersTable', async (req, res) => {
  try {
    const [tables] = await sequelize.query(`
      SELECT *
      FROM "Farmers"
    `);
    res.json(tables.map((table) => table.table_name));
  } catch (err) {
    console.error('Error fetching tables:', err);
    res.status(500).json({ message: 'Failed to fetch tables.' });
  }
});

router.get('/goodsTable', async (req, res) => {
  try {
    const [tables] = await sequelize.query(`
      SELECT *
      FROM "PostprocessingData"
    `);
    res.json(tables.map((table) => table.table_name));
  } catch (err) {
    console.error('Error fetching tables:', err);
    res.status(500).json({ message: 'Failed to fetch tables.' });
  }
});

router.get('/goodsTable', async (req, res) => {
  try {
    const [tables] = await sequelize.query(`
      SELECT *
      FROM "ReceivingData"
    `);
    res.json(tables.map((table) => table.table_name));
  } catch (err) {
    console.error('Error fetching tables:', err);
    res.status(500).json({ message: 'Failed to fetch tables.' });
  }
});

router.get('/priceTable', async (req, res) => {
  try {
    const [tables] = await sequelize.query(`
      SELECT *
      FROM "QCData_v"
    `);
    res.json(tables.map((table) => table.table_name));
  } catch (err) {
    console.error('Error fetching tables:', err);
    res.status(500).json({ message: 'Failed to fetch tables.' });
  }
});

module.exports = router;