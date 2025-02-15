const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

// Route for creating a calendar event
router.post('/events', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      eventName,
      startDate,
      endDate,
      eventDescription,
      allDay,
      location,
      category,
    } = req.body;

    // Validate required fields (adjust as needed)
    if (!eventName || !eventDescription || !allDay || !location || !startDate || !endDate || !category) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const [CalendarEvent] = await sequelize.query(
      `INSERT INTO "CalendarEvent" ("eventName", "startDate", "endDate", "eventDescription", "allDay", location, category, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING *`,
      {
        replacements: [
          eventName,
          startDate,
          endDate,
          eventDescription,
          allDay,
          location,
          category,
          new Date(),
        ],
        transaction: t,
      }
    );

    await t.commit();

    res.status(201).json({
      message: 'Calendar event created successfully',
      event: CalendarEvent, // Optionally return the created event
    });
  } catch (err) {
    await t.rollback();
    console.error('Error creating calendar event:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

router.post('/price', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      type,
      minPrice,
      maxPrice,
      validAt,
      validUntil,
      createdBy,
      createdAt,
      updatedAt,
    } = req.body;

    // Validate required fields (adjust as needed)
    if (!type || !minPrice || !maxPrice || !validAt || !validUntil || !createdBy) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const [CalendarEvent] = await sequelize.query(
      `INSERT INTO "PriceMetrics" ("type", "minPrice", "maxPrice", "validAt", "validUntil", "createdBy", "createdAt", "updatedAt")
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING *`,
      {
        replacements: [
          type,
          minPrice,
          maxPrice,
          validAt,
          validUntil,
          createdBy,
          new Date(),
          new Date(),
        ],
        transaction: t,
      }
    );

    await t.commit();

    res.status(201).json({
      message: 'Price metrics created successfully',
      event: CalendarEvent, // Optionally return the created event
    });
  } catch (err) {
    await t.rollback();
    console.error('Error creating price metrics:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});


// Route for fetching all events
router.get('/events', async (req, res) => {
    try {
      const [events] = await sequelize.query('SELECT * FROM "CalendarEvent"');
      res.json(events);
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      res.status(500).json({ message: 'Failed to fetch calendar events.' });
    }
  });

// Route for fetching all price metrics
router.get('/price', async (req, res) => {
  try {
    const [events] = await sequelize.query('SELECT * FROM "PriceMetrics"');
    res.json(events);
  } catch (err) {
    console.error('Error fetching price metrics:', err);
    res.status(500).json({ message: 'Failed to fetch price metrics.' });
  }
});

// Route for fetching all price metrics with batch number
router.get('/price/:batchNumber', async (req, res) => {
  const { batchNumber } = req.params;

  try {
    const query = `
    SELECT
      a."batchNumber",
      a.type,
      b."minPrice",
      b."maxPrice",
      b."validAt",
      b."validUntil"
    FROM "ReceivingData" a
    LEFT JOIN (SELECT * FROM "PriceMetrics" WHERE "validAt" <= NOW() AND "validUntil" >= NOW()) b on a.type = b.type
    `;
    const values = [batchNumber]; // Important: end first, then start!
    const [events] = await sequelize.query(query, {
      replacements: values,
      type: sequelize.QueryTypes.SELECT,
    });

    res.json(events);
  } catch (err) {
    console.error('Error fetching price metrics by batch number:', err);
    res.status(500).json({ message: 'Failed to fetch price metrics by batch number.' });
  }
});

// Route for fetching calendar events within a specific range
router.get('/events/:start/:end', async (req, res) => {
  const { start, end } = req.params;

  try {
    const query = `SELECT * FROM "CalendarEvent" WHERE startDate <= ? AND endDate >= ?`;
    const values = [end, start]; // Important: end first, then start!
    const [events] = await sequelize.query(query, {
      replacements: values,
      type: sequelize.QueryTypes.SELECT,
    });

    res.json(events);
  } catch (err) {
    console.error('Error fetching calendar events by range:', err);
    res.status(500).json({ message: 'Failed to fetch calendar events.' });
  }
});

//Router for fetching price metrics within a specific range
router.get('/price/:validAt/:validUntil', async (req, res) => {
  const { start, end } = req.params;

  try {
    const query = `SELECT * FROM "PriceMetrics" WHERE validAt <= ? AND validUntil >= ?`;
    const values = [end, start]; // Important: end first, then start!
    const [events] = await sequelize.query(query, {
      replacements: values,
      type: sequelize.QueryTypes.SELECT,
    });

    res.json(events);
  } catch (err) {
    console.error('Error fetching price metrics by range:', err);
    res.status(500).json({ message: 'Failed to fetch price metrics.' });
  }
});



// Route for updating a calendar event
router.put('/events/:id', async (req, res) => {
  const { id } = req.params;
  const {
    eventName,
    startDate,
    endDate,
    eventDescription,
    allDay,
    location,
    category,
  } = req.body;

  try {
    await sequelize.query(
      `UPDATE "CalendarEvent" SET 
        "eventName" = ?, 
        "startDate" = ?, 
        "endDate" = ?, 
        "eventDescription" = ?, 
        "allDay" = ?, 
        location = ?, 
        category = ?, 
        updated_at = ?
       WHERE id = ?`,
      {
        replacements: [
					eventName,
					startDate,
					endDate,
					eventDescription,
					allDay,
					location,
					category,
          new Date(), // Updated at
          id,
        ],
      }
    );

    res.status(200).json({ message: 'Calendar event updated successfully' });
  } catch (err) {
    console.error('Error updating calendar event:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Route for updating a price metrics
router.put('/events/:id', async (req, res) => {
  const { id } = req.params;
  const {
    type,
    minPrice,
    maxPrice,
    validAt,
    validUntil,
    updatedAt,
  } = req.body;

  try {
    await sequelize.query(
      `UPDATE "PriceMetrics" SET 
        "type" = ?, 
        "minPrice" = ?, 
        "maxPrice" = ?, 
        "validAt" = ?, 
        "validUntil" = ?, 
        "updatedAt" = ?
       WHERE id = ?`,
      {
        replacements: [
					type,
					minPrice,
					maxPrice,
					validAt,
					validUntil,
          new Date(), // Updated at
          id,
        ],
      }
    );

    res.status(200).json({ message: 'Price metrics updated successfully' });
  } catch (err) {
    console.error('Error updating price metrics:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Route for deleting a calendar event
router.delete('/events/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await sequelize.query('DELETE FROM "CalendarEvent" WHERE id = ?', {
      replacements: [id],
    });

    res.status(200).json({ message: 'Calendar event deleted successfully' });
  } catch (err) {
    console.error('Error deleting calendar event:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Route for deleting a price metrics
router.delete('/price/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await sequelize.query('DELETE FROM "PriceMetrics" WHERE id = ?', {
      replacements: [id],
    });

    res.status(200).json({ message: 'Price metrics deleted successfully' });
  } catch (err) {
    console.error('Error deleting price metrics:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;