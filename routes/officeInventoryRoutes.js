const express = require('express');
const router = express.Router();
const { sequelize } = require('../models');

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 500;

function parseLimit(raw) {
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return DEFAULT_LIMIT;
  return Math.min(n, MAX_LIMIT);
}

function parseOffset(raw) {
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function parseDateOnly(value) {
  if (!value || typeof value !== 'string') return null;
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, y, mo, d] = match;
  const parsed = new Date(Number(y), Number(mo) - 1, Number(d));
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== Number(y) ||
    parsed.getMonth() !== Number(mo) - 1 ||
    parsed.getDate() !== Number(d)
  ) {
    return null;
  }
  return value.trim();
}

function isFutureDate(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d > today;
}

function normalizeQuantity(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

async function findOrCreateItem(t, { itemId, name, category, unit }) {
  if (itemId) {
    const [existing] = await sequelize.query(
      `SELECT id, name, category, unit, "currentStock"
       FROM "OfficeInventoryItems" WHERE id = :itemId`,
      { replacements: { itemId }, type: sequelize.QueryTypes.SELECT, transaction: t }
    );
    if (!existing) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }
    return existing;
  }

  const trimmedName = String(name || '').trim();
  const trimmedCategory = String(category || '').trim();
  const trimmedUnit = String(unit || '').trim();
  if (!trimmedName || !trimmedCategory || !trimmedUnit) {
    const err = new Error('name, category, and unit are required for new items');
    err.status = 400;
    throw err;
  }

  const [found] = await sequelize.query(
    `SELECT id, name, category, unit, "currentStock"
     FROM "OfficeInventoryItems"
     WHERE lower(trim(name)) = lower(trim(:name))
       AND lower(trim(category)) = lower(trim(:category))
       AND lower(trim(unit)) = lower(trim(:unit))`,
    {
      replacements: { name: trimmedName, category: trimmedCategory, unit: trimmedUnit },
      type: sequelize.QueryTypes.SELECT,
      transaction: t,
    }
  );
  if (found) return found;

  const [inserted] = await sequelize.query(
    `INSERT INTO "OfficeInventoryItems" (name, category, unit, "currentStock", "createdAt", "updatedAt")
     VALUES (:name, :category, :unit, 0, NOW(), NOW())
     RETURNING id, name, category, unit, "currentStock"`,
    {
      replacements: { name: trimmedName, category: trimmedCategory, unit: trimmedUnit },
      type: sequelize.QueryTypes.INSERT,
      transaction: t,
    }
  );
  return inserted;
}

function computeStockAfterRows(movementsOnDay, openingByItemId) {
  const runningByItem = { ...openingByItemId };
  return movementsOnDay.map((row) => {
    const itemId = row.itemId;
    const qty = Number(row.quantity) || 0;
    const delta = row.movementType === 'IN' ? qty : -qty;
    runningByItem[itemId] = (runningByItem[itemId] ?? 0) + delta;
    return {
      ...row,
      quantityIn: row.movementType === 'IN' ? qty : null,
      quantityOut: row.movementType === 'OUT' ? qty : null,
      stockAfter: runningByItem[itemId],
    };
  });
}

/**
 * GET /office-inventory/items
 */
router.get('/office-inventory/items', async (req, res) => {
  const { search } = req.query;
  try {
    let sql = `
      SELECT id, name, category, unit, "itemType", "currentStock", "createdAt", "updatedAt"
      FROM "OfficeInventoryItems"
    `;
    const replacements = {};
    if (search && String(search).trim()) {
      sql += ` WHERE lower(name) LIKE lower(:search)`;
      replacements.search = `%${String(search).trim()}%`;
    }
    sql += ` ORDER BY lower(name), lower(category), lower(unit)`;

    const rows = await sequelize.query(sql, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching office inventory items:', error);
    res.status(500).json({ error: 'Failed to fetch office inventory items', details: error.message });
  }
});

/**
 * GET /office-inventory/movements
 */
router.get('/office-inventory/movements', async (req, res) => {
  const limit = parseLimit(req.query.limit);
  const offset = parseOffset(req.query.offset);
  const { from, to, itemId } = req.query;

  const where = [];
  const replacements = { limit, offset };

  if (from) {
    const parsedFrom = parseDateOnly(from);
    if (!parsedFrom) return res.status(400).json({ error: 'Invalid from date' });
    where.push(`m."transactionDate" >= :from`);
    replacements.from = parsedFrom;
  }
  if (to) {
    const parsedTo = parseDateOnly(to);
    if (!parsedTo) return res.status(400).json({ error: 'Invalid to date' });
    where.push(`m."transactionDate" <= :to`);
    replacements.to = parsedTo;
  }
  if (itemId) {
    const id = parseInt(itemId, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid itemId' });
    where.push(`m."itemId" = :itemId`);
    replacements.itemId = id;
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  try {
    const [countRow] = await sequelize.query(
      `SELECT COUNT(*)::int AS total FROM "OfficeInventoryMovements" m ${whereClause}`,
      { replacements, type: sequelize.QueryTypes.SELECT }
    );

    const rows = await sequelize.query(
      `SELECT
         m.id,
         m."itemId",
         i.name,
         i.category,
         i.unit,
         m."movementType",
         m.quantity,
         m.remarks,
         m.pic,
         m.location,
         m.project,
         m."transactionDate",
         m."itemType",
         m."invoiceReference",
         m."requestDate",
         m."paidDate",
         m."unitPrice",
         m."totalPrice",
         m.notes,
         m."createdAt"
       FROM "OfficeInventoryMovements" m
       JOIN "OfficeInventoryItems" i ON i.id = m."itemId"
       ${whereClause}
       ORDER BY m."transactionDate" DESC, m."createdAt" DESC, m.id DESC
       LIMIT :limit OFFSET :offset`,
      { replacements, type: sequelize.QueryTypes.SELECT }
    );

    res.status(200).json({ rows, total: countRow?.total ?? 0 });
  } catch (error) {
    console.error('Error fetching office inventory movements:', error);
    res.status(500).json({ error: 'Failed to fetch office inventory movements', details: error.message });
  }
});

/**
 * POST /office-inventory/movements
 */
router.post('/office-inventory/movements', async (req, res) => {
  const {
    itemId,
    name,
    category,
    unit,
    movementType,
    quantity,
    remarks,
    pic,
    location,
    project,
    transactionDate,
    itemType,
    invoiceReference,
    requestDate,
    paidDate,
    unitPrice,
    totalPrice,
    notes,
  } = req.body;

  if (movementType !== 'IN' && movementType !== 'OUT') {
    return res.status(400).json({ error: 'movementType must be IN or OUT' });
  }

  const qty = normalizeQuantity(quantity);
  if (qty == null) {
    return res.status(400).json({ error: 'quantity must be a positive number' });
  }

  const parsedDate = parseDateOnly(transactionDate);
  if (!parsedDate) {
    return res.status(400).json({ error: 'Invalid transactionDate; use YYYY-MM-DD' });
  }
  if (isFutureDate(parsedDate)) {
    return res.status(400).json({ error: 'transactionDate cannot be in the future' });
  }

  const t = await sequelize.transaction();
  try {
    const item = await findOrCreateItem(t, { itemId, name, category, unit });

    const delta = movementType === 'IN' ? qty : -qty;
    const newStock = Number(item.currentStock) + delta;

    const parsedRequestDate = requestDate ? parseDateOnly(requestDate) : null;
    const parsedPaidDate = paidDate ? parseDateOnly(paidDate) : null;
    if (requestDate && !parsedRequestDate) {
      const err = new Error('Invalid requestDate; use YYYY-MM-DD');
      err.status = 400;
      throw err;
    }
    if (paidDate && !parsedPaidDate) {
      const err = new Error('Invalid paidDate; use YYYY-MM-DD');
      err.status = 400;
      throw err;
    }

    const [movement] = await sequelize.query(
      `INSERT INTO "OfficeInventoryMovements"
         ("itemId", "movementType", quantity, remarks, pic, location, project, "transactionDate",
          "itemType", "invoiceReference", "requestDate", "paidDate", "unitPrice", "totalPrice", notes, "createdAt")
       VALUES
         (:itemId, :movementType, :quantity, :remarks, :pic, :location, :project, :transactionDate,
          :itemType, :invoiceReference, :requestDate, :paidDate, :unitPrice, :totalPrice, :notes, NOW())
       RETURNING id, "itemId", "movementType", quantity, remarks, pic, location, project, "transactionDate",
         "itemType", "invoiceReference", "requestDate", "paidDate", "unitPrice", "totalPrice", notes, "createdAt"`,
      {
        replacements: {
          itemId: item.id,
          movementType,
          quantity: qty,
          remarks: remarks ? String(remarks).trim() : null,
          pic: pic ? String(pic).trim() : null,
          location: location ? String(location).trim() : null,
          project: project ? String(project).trim() : null,
          transactionDate: parsedDate,
          itemType: itemType ? String(itemType).trim() : null,
          invoiceReference: invoiceReference ? String(invoiceReference).trim() : null,
          requestDate: parsedRequestDate,
          paidDate: parsedPaidDate,
          unitPrice: unitPrice != null && Number.isFinite(Number(unitPrice)) ? Number(unitPrice) : null,
          totalPrice: totalPrice != null && Number.isFinite(Number(totalPrice)) ? Number(totalPrice) : null,
          notes: notes ? String(notes).trim() : null,
        },
        type: sequelize.QueryTypes.INSERT,
        transaction: t,
      }
    );

    const [updatedItem] = await sequelize.query(
      `UPDATE "OfficeInventoryItems"
       SET "currentStock" = :newStock,
           "itemType" = COALESCE(:itemType, "itemType"),
           "updatedAt" = NOW()
       WHERE id = :itemId
       RETURNING id, name, category, unit, "itemType", "currentStock"`,
      {
        replacements: {
          newStock,
          itemId: item.id,
          itemType: itemType ? String(itemType).trim() : null,
        },
        type: sequelize.QueryTypes.UPDATE,
        transaction: t,
      }
    );

    await t.commit();
    res.status(201).json({
      message: 'Movement recorded',
      movement: {
        ...movement,
        name: updatedItem.name,
        category: updatedItem.category,
        unit: updatedItem.unit,
      },
      item: updatedItem,
    });
  } catch (error) {
    await t.rollback();
    const status = error.status || 500;
    if (status >= 500) console.error('Error recording office inventory movement:', error);
    res.status(status).json({
      error: error.message || 'Failed to record office inventory movement',
      details: error.message,
    });
  }
});

/**
 * GET /office-inventory/daily-report?date=YYYY-MM-DD
 */
router.get('/office-inventory/daily-report', async (req, res) => {
  const parsedDate = parseDateOnly(req.query.date);
  if (!parsedDate) {
    return res.status(400).json({ error: 'date query parameter required (YYYY-MM-DD)' });
  }
  if (isFutureDate(parsedDate)) {
    return res.status(400).json({ error: 'date cannot be in the future' });
  }

  try {
    const movementsOnDay = await sequelize.query(
      `SELECT
         m.id,
         m."itemId",
         i.name,
         i.category,
         i.unit,
         m."movementType",
         m.quantity,
         m.remarks,
         m.pic,
         m.location,
         m.project,
         m."transactionDate",
         m."createdAt"
       FROM "OfficeInventoryMovements" m
       JOIN "OfficeInventoryItems" i ON i.id = m."itemId"
       WHERE m."transactionDate" = :date
       ORDER BY m."createdAt" ASC, m.id ASC`,
      { replacements: { date: parsedDate }, type: sequelize.QueryTypes.SELECT }
    );

    if (movementsOnDay.length === 0) {
      return res.status(200).json({ date: parsedDate, rows: [] });
    }

    const itemIds = [...new Set(movementsOnDay.map((m) => m.itemId))];
    const openingRows = await sequelize.query(
      `SELECT
         m."itemId",
         COALESCE(SUM(CASE WHEN m."movementType" = 'IN' THEN m.quantity ELSE -m.quantity END), 0) AS opening
       FROM "OfficeInventoryMovements" m
       WHERE m."itemId" IN (:itemIds)
         AND m."transactionDate" < :date
       GROUP BY m."itemId"`,
      {
        replacements: { itemIds, date: parsedDate },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const openingByItemId = {};
    for (const row of openingRows) {
      openingByItemId[row.itemId] = Number(row.opening) || 0;
    }
    for (const id of itemIds) {
      if (openingByItemId[id] == null) openingByItemId[id] = 0;
    }

    const rows = computeStockAfterRows(movementsOnDay, openingByItemId);
    res.status(200).json({ date: parsedDate, rows });
  } catch (error) {
    console.error('Error generating office inventory daily report:', error);
    res.status(500).json({ error: 'Failed to generate daily report', details: error.message });
  }
});

module.exports = router;
