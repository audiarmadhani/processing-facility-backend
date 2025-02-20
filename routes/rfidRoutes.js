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

  if (!scanned_at || !["Wet Mill Entrance", "Wet Mill Exit"].includes(scanned_at)) {
    return res.status(400).json({ error: 'Invalid scanner identifier. Use "Wet Mill Entrance" or "Wet Mill Exit".' });
  }

  const trimmedRfid = rfid.trim().toUpperCase();

  try {
    // Step 1: Check if RFID is assigned to a batch in ReceivingData
    const [batch] = await sequelize.query(`
      SELECT "batchNumber"
      FROM "ReceivingData"
      WHERE "rfid" = :rfid
      AND "currentAssign" = 1
      LIMIT 1;
    `, {
      replacements: { rfid: trimmedRfid },
      type: sequelize.QueryTypes.SELECT,
    });

    if (!batch) {
      return res.status(404).json({ error: 'RFID not associated with any active batch.' });
    }

    const batchNumber = batch.batchNumber;

    // Step 2: Log raw scan in RfidScanned
    await sequelize.query(`
      INSERT INTO "RfidScanned" (rfid, scanned_at, created_at)
      VALUES (:rfid, :scanned_at, NOW());
    `, {
      replacements: { rfid: trimmedRfid, scanned_at },
      type: sequelize.QueryTypes.INSERT,
    });

    // Step 3: Handle wet mill data in WetMillData and clear RfidScanned
    if (scanned_at === 'Wet Mill Entrance') {
      const [existingEntry] = await sequelize.query(`
        SELECT id
        FROM "WetMillData"
        WHERE "rfid" = :rfid
        AND "batchNumber" = :batchNumber
        AND "entered_at" IS NOT NULL
        AND "exited_at" IS NULL
        LIMIT 1;
      `, {
        replacements: { rfid: trimmedRfid, batchNumber },
        type: sequelize.QueryTypes.SELECT,
      });

      if (existingEntry) {
        return res.status(400).json({ error: 'Batch already entered wet mill and not yet exited.' });
      }

      const [result] = await sequelize.query(`
        INSERT INTO "WetMillData" (rfid, "batchNumber", entered_at, created_at)
        VALUES (:rfid, :batchNumber, NOW(), NOW())
        RETURNING *;
      `, {
        replacements: { rfid: trimmedRfid, batchNumber },
        type: sequelize.QueryTypes.INSERT,
      });

      // Clear RfidScanned for this scanner
      await sequelize.query(`
        DELETE FROM "RfidScanned"
        WHERE "scanned_at" = :scanned_at;
      `, {
        replacements: { scanned_at },
        type: sequelize.QueryTypes.DELETE,
      });

      res.status(201).json({
        message: 'RFID tag scanned at entrance, scanner logs cleared',
        rfid: trimmedRfid,
        batchNumber,
        entered_at: result[0].entered_at,
      });
    } else if (scanned_at === 'Wet Mill Exit') {
      const [entry] = await sequelize.query(`
        SELECT id
        FROM "WetMillData"
        WHERE "rfid" = :rfid
        AND "batchNumber" = :batchNumber
        AND "entered_at" IS NOT NULL
        AND "exited_at" IS NULL
        ORDER BY "entered_at" DESC
        LIMIT 1;
      `, {
        replacements: { rfid: trimmedRfid, batchNumber },
        type: sequelize.QueryTypes.SELECT,
      });

      if (!entry) {
        return res.status(400).json({ error: 'No active wet mill entry found for this batch.' });
      }

      const [result] = await sequelize.query(`
        UPDATE "WetMillData"
        SET exited_at = NOW()
        WHERE id = :id
        RETURNING *;
      `, {
        replacements: { id: entry.id },
        type: sequelize.QueryTypes.UPDATE,
      });

      // Clear RfidScanned for this scanner
      await sequelize.query(`
        DELETE FROM "RfidScanned"
        WHERE "scanned_at" = :scanned_at;
      `, {
        replacements: { scanned_at },
        type: sequelize.QueryTypes.DELETE,
      });

      res.status(200).json({
        message: 'RFID tag scanned at exit, scanner logs cleared',
        rfid: trimmedRfid,
        batchNumber,
        exited_at: result[0].exited_at,
      });
    }
  } catch (error) {
    console.error('Error storing RFID tag or clearing logs:', error);
    res.status(500).json({ error: 'Failed to process RFID tag scan', details: error.message });
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

router.get('/wetmill-data', async (req, res) => {
  try {
    const data = await sequelize.query(`
      SELECT rfid, "batchNumber", entered_at, exited_at, created_at
      FROM "WetMillData"
      ORDER BY created_at DESC;
    `, {
      type: sequelize.QueryTypes.SELECT,
    });
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching wet mill data:', error);
    res.status(500).json({ error: 'Failed to fetch wet mill data', details: error.message });
  }
});


module.exports = router;