const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

// --- NEW ROUTE: Get the most recently scanned RFID ---
router.get('/get-rfid', async (req, res) => {
  try {
    // Fetch the most recently scanned RFID tag
    const [results] = await sequelize.query(`
        SELECT rfid
        FROM "RfidScanned"
        ORDER BY created_at DESC
        LIMIT 1;
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    // Robust check for RFID data:
    if (Array.isArray(results) && results.length > 0) {
        // Handle the case where results is an array (as expected)
        res.status(200).json({ rfid: results[0].rfid });
    } else if (results && results.rfid) {
        // Handle the case where results is a single object
        res.status(200).json({ rfid: results.rfid });
    }
    else {
        res.status(200).json({ rfid: '' }); // Return empty string if no RFID
    }

  } catch (error) {
    console.error('Error fetching RFID tag:', error);
    res.status(500).json({ error: 'Failed to fetch RFID tag', details: error.message });
  }
});

// --- NEW ROUTE: Check if RFID is already assigned ---
router.get('/get-rfid/:scanned_at', async (req, res) => {
  const { scanned_at } = req.params; // Get RFID from route parameter

  if (!scanned_at) {
    return res.status(400).json({ error: 'Scanned at is required.' });
  }

  try {
    // Use a raw SQL query to check if the RFID exists in ReceivingData
    const [results] = await sequelize.query(`
        SELECT rfid
        FROM "RfidScanned"
				WHERE "scanned_at" = :scanned_at
        ORDER BY created_at DESC
        LIMIT 1;
    `, {
      replacements: { scanned_at: scanned_at }, //  <-- Use the trimmed and upper-cased RFID
      type: sequelize.QueryTypes.SELECT
    });

    // Robust check for RFID data:
    if (Array.isArray(results) && results.length > 0) {
			// Handle the case where results is an array (as expected)
			res.status(200).json({ rfid: results[0].rfid });
	} else if (results && results.rfid) {
			// Handle the case where results is a single object
			res.status(200).json({ rfid: results.rfid });
	}
	else {
			res.status(200).json({ rfid: '' }); // Return empty string if no RFID
	}

} catch (error) {
	console.error('Error fetching RFID tag:', error);
	res.status(500).json({ error: 'Failed to fetch RFID tag', details: error.message });
}
});

// --- NEW ROUTE: Clear the scanned RFID ---
router.delete('/clear-rfid/:scanned_at', async (req, res) => {
	const { scanned_at } = req.params; // Get RFID from route parameter

	if (!scanned_at) {
    return res.status(400).json({ error: 'Scanned at is required.' });
  }

  try {
    // Use raw SQL to delete *all* entries (we only expect one, but this is safer)
    await sequelize.query(`DELETE FROM "RfidScanned" WHERE "scanned_at" = :scanned_at;`
        , {
            replacements: { scanned_at: scanned_at }, //  <-- Use the trimmed and upper-cased RFID
            type: sequelize.QueryTypes.SELECT
          });
    res.status(204).send(); // 204 No Content for successful deletion
  } catch (error) {
    console.error('Error clearing RFID data:', error);
    res.status(500).json({ error: 'Failed to clear RFID data', details: error.message });
  }
});

// POST route to receive RFID tag scans from ESP32
router.post('/scan-rfid', async (req, res) => {

  const { rfid, scanned_at } = req.body;

  if (!rfid) {
    return res.status(400).json({ error: 'RFID tag is required.' });
  }

  const trimmedRfid = rfid.trim();

  try {
    // Insert/Update RfidScanned table (using raw SQL)
      const [result, metadata] = await sequelize.query(`
          INSERT INTO "RfidScanned" (rfid, created_at, scanned_at)
          VALUES (:rfid, NOW(), :scanned_at)
          RETURNING *;
      `, {
        replacements: { rfid: trimmedRfid, scanned_at: scanned_at },
        type: sequelize.QueryTypes.INSERT, // Important for RETURNING
      });
        // Respond with success
      res.status(201).json({ message: 'RFID tag scanned', rfid: trimmedRfid });


    } catch (error) {
        console.error('Error storing RFID tag:', error);
        res.status(500).json({ error: 'Failed to store RFID tag', details: error.message });
    }
});


// --- NEW ROUTE: Check if RFID is already assigned ---
router.get('/check-rfid/:rfid', async (req, res) => {
  const { rfid } = req.params; // Get RFID from route parameter

  if (!rfid) {
    return res.status(400).json({ error: 'RFID tag is required.' });
  }

    const trimmedRfid = rfid.trim().toUpperCase(); //  <-- ALWAYS trim and uppercase

  try {
    // Use a raw SQL query to check if the RFID exists in ReceivingData
    const [results] = await sequelize.query(`
        SELECT *
        FROM "ReceivingData"
        WHERE "rfid" = :rfid
        AND "currentAssign" = 1
    `, {
      replacements: { rfid: trimmedRfid }, //  <-- Use the trimmed and upper-cased RFID
      type: sequelize.QueryTypes.SELECT
    });

        // Correctly check if results is an array and has length, OR if it's an object
        const isAssigned = Array.isArray(results) ? results.length > 0 : results !== undefined && results !== null;


    res.status(200).json({ isAssigned }); // Return { isAssigned: true/false }

  } catch (error) {
    console.error('Error checking RFID tag:', error);
    res.status(500).json({ error: 'Failed to check RFID tag', details: error.message });
  }
});


module.exports = router;