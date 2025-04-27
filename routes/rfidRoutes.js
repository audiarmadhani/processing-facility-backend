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

  // Define valid scanners
  const validScanners = [
    "Receiving",
    "QC",
    "Wet_Mill_Entrance",
    "Wet_Mill_Exit",
    "Drying_Area_1",
    "Drying_Area_2",
    "Drying_Area_3",
    "Drying_Area_4",
    "Drying_Area_5",
    "DryMill",
    "Drying_Room",
    "Warehouse_Entrance",
    "Warehouse_Exit",
  ];

  if (!scanned_at || !validScanners.includes(scanned_at)) {
    return res.status(400).json({ 
      error: `Invalid scanner identifier. Valid options are: ${validScanners.join(', ')}.` 
    });
  }

  const trimmedRfid = rfid.trim().toUpperCase();

  try {
    // Step 1: Handle Receiving separately (no batchNumber check)
    if (scanned_at === 'Receiving') {
      // Log scan to RfidScanned, no deletion (frontend handles it)
      await sequelize.query(`
        INSERT INTO "RfidScanned" (rfid, scanned_at, created_at)
        VALUES (:rfid, :scanned_at, NOW());
      `, {
        replacements: { rfid: trimmedRfid, scanned_at },
        type: sequelize.QueryTypes.INSERT,
      });

      res.status(201).json({
        message: 'RFID tag scanned, logged to RfidScanned',
        rfid: trimmedRfid,
      });
      return; // Exit early, no further processing needed
    }

    // Step 2: Check if RFID is assigned to a batch in ReceivingData for all other scanners
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

    // Step 3: Log raw scan in RfidScanned for all other scanners
    await sequelize.query(`
      INSERT INTO "RfidScanned" (rfid, scanned_at, created_at)
      VALUES (:rfid, :scanned_at, NOW());
    `, {
      replacements: { rfid: trimmedRfid, scanned_at },
      type: sequelize.QueryTypes.INSERT,
    });

    // Step 4: Handle scanner-specific logic for non-Receiving scanners
    if (scanned_at === 'QC') {
      // Log to RfidScanned, no deletion (frontend handles it)
      res.status(201).json({
        message: 'RFID tag scanned at QC, logged to RfidScanned',
        rfid: trimmedRfid,
        batchNumber,
      });
    } else if (scanned_at === 'Wet Mill Entrance') {
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

      await sequelize.query(`
        DELETE FROM "RfidScanned"
        WHERE "scanned_at" = :scanned_at;
      `, {
        replacements: { scanned_at },
        type: sequelize.QueryTypes.DELETE,
      });

      res.status(201).json({
        message: 'RFID tag scanned at wet mill entrance, scanner logs cleared',
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

      await sequelize.query(`
        DELETE FROM "RfidScanned"
        WHERE "scanned_at" = :scanned_at;
      `, {
        replacements: { scanned_at },
        type: sequelize.QueryTypes.DELETE,
      });

      res.status(200).json({
        message: 'RFID tag scanned at wet mill exit, scanner logs cleared',
        rfid: trimmedRfid,
        batchNumber,
        exited_at: result[0].exited_at,
      });
    } else if (scanned_at.startsWith('Drying Area')) {
      // Check if batch has exited wet mill
      const [wetMillEntry] = await sequelize.query(`
        SELECT "exited_at"
        FROM "WetMillData"
        WHERE "rfid" = :rfid
        AND "batchNumber" = :batchNumber
        AND "exited_at" IS NOT NULL
        ORDER BY "exited_at" DESC
        LIMIT 1;
      `, {
        replacements: { rfid: trimmedRfid, batchNumber },
        type: sequelize.QueryTypes.SELECT,
      });

      if (!wetMillEntry) {
        return res.status(400).json({ error: 'Batch must exit wet mill before entering drying area.' });
      }

      // Check for active drying entry
      const [existingDryingEntry] = await sequelize.query(`
        SELECT id, entered_at, exited_at
        FROM "DryingData"
        WHERE "rfid" = :rfid
        AND "batchNumber" = :batchNumber
        AND "dryingArea" = :dryingArea
        AND "entered_at" IS NOT NULL
        AND "exited_at" IS NULL
        LIMIT 1;
      `, {
        replacements: { rfid: trimmedRfid, batchNumber, dryingArea: scanned_at },
        type: sequelize.QueryTypes.SELECT,
      });

      if (existingDryingEntry) {
        // If already entered, this scan is an exit
        const [result] = await sequelize.query(`
          UPDATE "DryingData"
          SET exited_at = NOW()
          WHERE id = :id
          RETURNING *;
        `, {
          replacements: { id: existingDryingEntry.id },
          type: sequelize.QueryTypes.UPDATE,
        });

        await sequelize.query(`
          DELETE FROM "RfidScanned"
          WHERE "scanned_at" = :scanned_at;
        `, {
          replacements: { scanned_at },
          type: sequelize.QueryTypes.DELETE,
        });

        res.status(200).json({
          message: `RFID tag scanned at ${scanned_at} exit, scanner logs cleared`,
          rfid: trimmedRfid,
          batchNumber,
          dryingArea: scanned_at,
          exited_at: result[0].exited_at,
        });
      } else {
        // Check if batch is already in another drying area
        const [otherDryingEntry] = await sequelize.query(`
          SELECT "dryingArea"
          FROM "DryingData"
          WHERE "rfid" = :rfid
          AND "batchNumber" = :batchNumber
          AND "entered_at" IS NOT NULL
          AND "exited_at" IS NULL
          LIMIT 1;
        `, {
          replacements: { rfid: trimmedRfid, batchNumber },
          type: sequelize.QueryTypes.SELECT,
        });

        if (otherDryingEntry) {
          return res.status(400).json({ error: `Batch is already in ${otherDryingEntry.dryingArea}. Exit it first.` });
        }

        // New entry for drying area
        const [result] = await sequelize.query(`
          INSERT INTO "DryingData" (rfid, "batchNumber", "dryingArea", entered_at, created_at)
          VALUES (:rfid, :batchNumber, :dryingArea, NOW(), NOW())
          RETURNING *;
        `, {
          replacements: { rfid: trimmedRfid, batchNumber, dryingArea: scanned_at },
          type: sequelize.QueryTypes.INSERT,
        });

        await sequelize.query(`
          DELETE FROM "RfidScanned"
          WHERE "scanned_at" = :scanned_at;
        `, {
          replacements: { scanned_at },
          type: sequelize.QueryTypes.DELETE,
        });

        res.status(201).json({
          message: `RFID tag scanned at ${scanned_at} entrance, scanner logs cleared`,
          rfid: trimmedRfid,
          batchNumber,
          dryingArea: scanned_at,
          entered_at: result[0].entered_at,
        });
      }
    } else if (scanned_at === 'Dry Mill') {
      // Check if batch has exited drying area
      const [dryingEntry] = await sequelize.query(`
        SELECT "exited_at"
        FROM "DryingData"
        WHERE "rfid" = :rfid
        AND "batchNumber" = :batchNumber
        AND "exited_at" IS NOT NULL
        ORDER BY "exited_at" DESC
        LIMIT 1;
      `, {
        replacements: { rfid: trimmedRfid, batchNumber },
        type: sequelize.QueryTypes.SELECT,
      });

      if (!dryingEntry) {
        return res.status(400).json({ error: 'Batch must exit drying area before entering dry mill.' });
      }

      // Check for active dry mill entry
      const [existingDryMillEntry] = await sequelize.query(`
        SELECT id, entered_at, exited_at
        FROM "DryMillData"
        WHERE "rfid" = :rfid
        AND "batchNumber" = :batchNumber
        AND "entered_at" IS NOT NULL
        AND "exited_at" IS NULL
        LIMIT 1;
      `, {
        replacements: { rfid: trimmedRfid, batchNumber },
        type: sequelize.QueryTypes.SELECT,
      });

      if (existingDryMillEntry) {
        // If already entered, this scan is an exit
        const [result] = await sequelize.query(`
          UPDATE "DryMillData"
          SET exited_at = NOW()
          WHERE id = :id
          RETURNING *;
        `, {
          replacements: { id: existingDryMillEntry.id },
          type: sequelize.QueryTypes.UPDATE,
        });

        await sequelize.query(`
          DELETE FROM "RfidScanned"
          WHERE "scanned_at" = :scanned_at;
        `, {
          replacements: { scanned_at },
          type: sequelize.QueryTypes.DELETE,
        });

        res.status(200).json({
          message: 'RFID tag scanned at dry mill exit, scanner logs cleared',
          rfid: trimmedRfid,
          batchNumber,
          exited_at: result[0].exited_at,
        });
      } else {
        // New entry for dry mill
        const [result] = await sequelize.query(`
          INSERT INTO "DryMillData" (rfid, "batchNumber", entered_at, created_at)
          VALUES (:rfid, :batchNumber, NOW(), NOW())
          RETURNING *;
        `, {
          replacements: { rfid: trimmedRfid, batchNumber },
          type: sequelize.QueryTypes.INSERT,
        });

        await sequelize.query(`
          DELETE FROM "RfidScanned"
          WHERE "scanned_at" = :scanned_at;
        `, {
          replacements: { scanned_at },
          type: sequelize.QueryTypes.DELETE,
        });

        res.status(201).json({
          message: 'RFID tag scanned at dry mill entrance, scanner logs cleared',
          rfid: trimmedRfid,
          batchNumber,
          entered_at: result[0].entered_at,
        });
      }
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


module.exports = router;