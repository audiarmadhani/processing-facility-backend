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


// Route for fetching all calendar events
router.get('/events', async (req, res) => {
    try {
      const [events] = await sequelize.query('SELECT * FROM "CalendarEvent"');
      res.json(events);
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      res.status(500).json({ message: 'Failed to fetch calendar events.' });
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

module.exports = router;