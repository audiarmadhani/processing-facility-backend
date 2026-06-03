const SHARED_TANKS = ['Biomaster', 'Carrybrew', 'Washing Track', 'Bag'];
const NON_BLOCKING_TANKS = ['Carrybrew', 'Biomaster', 'Bag'];

function buildAllTankCodes() {
  const allBlueBarrelCodes = Array.from({ length: 50 }, (_, i) =>
    `BB-HQ-${String(i + 1).padStart(4, '0')}`
  );
  const allBucketCodes = Array.from({ length: 50 }, (_, i) =>
    `BUC-HQ-${String(i + 1).padStart(4, '0')}`
  );
  return [
    'Biomaster',
    'Carrybrew',
    'Washing Track',
    ...allBlueBarrelCodes,
    ...allBucketCodes,
    'Bag',
  ];
}

const ALL_TANK_CODES = buildAllTankCodes();
const ALL_TANK_SET = new Set(ALL_TANK_CODES);

function isBarrelOrBucket(code) {
  return code?.startsWith('BB-') || code?.startsWith('BUC-');
}

function normalizeTanksInput(body) {
  if (Array.isArray(body.tanks) && body.tanks.length) {
    return [...new Set(body.tanks.map((t) => String(t).trim()).filter(Boolean))];
  }
  if (body.tank != null && String(body.tank).trim() !== '') {
    const raw = String(body.tank).trim();
    if (raw.includes(',')) {
      return [...new Set(raw.split(',').map((t) => t.trim()).filter(Boolean))];
    }
    return [raw];
  }
  return [];
}

function validateTanks(tanks) {
  if (!tanks.length) {
    return 'At least one fermentation tank is required';
  }

  const shared = tanks.filter((t) => SHARED_TANKS.includes(t));
  const barrels = tanks.filter(isBarrelOrBucket);

  if (shared.length && barrels.length) {
    return 'Cannot combine shared vessels with blue barrels or buckets on the same order sheet';
  }
  if (shared.length > 1) {
    return 'Only one shared vessel can be selected';
  }
  if (barrels.length === 0 && shared.length === 0) {
    return 'Invalid tank selection';
  }

  for (const t of tanks) {
    if (!ALL_TANK_SET.has(t)) {
      return `Unknown tank: ${t}`;
    }
  }

  return null;
}

function tanksToDenormalized(tanks) {
  return tanks.join(', ');
}

function deriveTankAmount(tanks, existingAmount) {
  const barrels = tanks.filter(isBarrelOrBucket);
  if (barrels.length > 0) {
    return barrels.length;
  }
  return existingAmount;
}

async function assertTanksAvailable(sequelize, tanks, excludeFermentationId = null) {
  const blocking = tanks.filter((t) => !NON_BLOCKING_TANKS.includes(t));
  if (!blocking.length) return;

  const inUse = await sequelize.query(
    `SELECT ft.tank, f.id AS "fermentationId"
     FROM "FermentationTanks" ft
     INNER JOIN "FermentationData" f ON f.id = ft."fermentationId"
     WHERE f.status = 'In Progress'
     AND ft.tank IN (:tanks)
     AND (:excludeId IS NULL OR f.id != :excludeId)`,
    {
      replacements: {
        tanks: blocking,
        excludeId: excludeFermentationId ?? null,
      },
      type: sequelize.QueryTypes.SELECT,
    }
  );

  if (inUse.length) {
    const err = new Error(
      `Tank(s) already in use: ${inUse.map((r) => r.tank).join(', ')}`
    );
    err.statusCode = 400;
    throw err;
  }
}

async function replaceFermentationTanks(sequelize, fermentationId, tanks, transaction = null) {
  const opts = transaction ? { transaction } : {};
  const barrelCount = tanks.filter(isBarrelOrBucket).length;
  const tankAmount = barrelCount > 0 ? barrelCount : null;

  await sequelize.query(
    `DELETE FROM "FermentationTanks" WHERE "fermentationId" = :fermentationId`,
    { replacements: { fermentationId }, ...opts }
  );

  for (const tank of tanks) {
    await sequelize.query(
      `INSERT INTO "FermentationTanks" ("fermentationId", tank) VALUES (:fermentationId, :tank)`,
      { replacements: { fermentationId, tank }, ...opts }
    );
  }

  const denorm = tanksToDenormalized(tanks);
  await sequelize.query(
    `UPDATE "FermentationData"
     SET tank = :tank,
         "tankAmount" = COALESCE(:tankAmount, "tankAmount"),
         "updatedAt" = NOW()
     WHERE id = :fermentationId`,
    {
      replacements: {
        fermentationId,
        tank: denorm || null,
        tankAmount,
      },
      ...opts,
    }
  );
}

async function applyTanksPatchUpdate(sequelize, { fermentationId, status, body }) {
  const wantsTankUpdate =
    body.tanks !== undefined ||
    (body.tank !== undefined && body.tank !== null && String(body.tank).trim() !== '');

  if (!wantsTankUpdate) {
    return { updated: false };
  }

  if (status === 'In Progress') {
    const err = new Error('Tank assignment cannot be changed while fermentation is in progress');
    err.statusCode = 400;
    throw err;
  }

  const tanksList = normalizeTanksInput(body);
  const tanksError = validateTanks(tanksList);
  if (tanksError) {
    const err = new Error(tanksError);
    err.statusCode = 400;
    throw err;
  }

  await assertTanksAvailable(sequelize, tanksList, fermentationId);
  await replaceFermentationTanks(sequelize, fermentationId, tanksList);

  return { updated: true, tanks: tanksList };
}

async function fetchTanksByFermentationIds(sequelize, ids) {
  if (!ids.length) return new Map();

  const rows = await sequelize.query(
    `SELECT "fermentationId", tank
     FROM "FermentationTanks"
     WHERE "fermentationId" IN (:ids)
     ORDER BY id ASC`,
    {
      replacements: { ids },
      type: sequelize.QueryTypes.SELECT,
    }
  );

  const map = new Map();
  for (const row of rows) {
    if (!map.has(row.fermentationId)) map.set(row.fermentationId, []);
    map.get(row.fermentationId).push(row.tank);
  }
  return map;
}

async function attachTanksToRows(sequelize, rows) {
  if (!rows?.length) return rows || [];
  const ids = rows.map((r) => r.id).filter(Boolean);
  const tankMap = await fetchTanksByFermentationIds(sequelize, ids);

  return rows.map((row) => {
    const fromJunction = tankMap.get(row.id);
    const tanks = fromJunction?.length
      ? fromJunction
      : normalizeTanksInput({ tank: row.tank });
    return {
      ...row,
      tanks,
      tank: tanks.length ? tanksToDenormalized(tanks) : row.tank,
    };
  });
}

module.exports = {
  SHARED_TANKS,
  NON_BLOCKING_TANKS,
  ALL_TANK_CODES,
  isBarrelOrBucket,
  normalizeTanksInput,
  validateTanks,
  tanksToDenormalized,
  deriveTankAmount,
  assertTanksAvailable,
  replaceFermentationTanks,
  attachTanksToRows,
  applyTanksPatchUpdate,
};
