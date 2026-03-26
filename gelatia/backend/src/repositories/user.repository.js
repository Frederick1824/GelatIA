const prisma = require("../config/prisma");

function mapUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.passwordHash,
    role: row.role,
    businessId: row.businessId,
    createdAt: row.createdAt,
  };
}

async function findUserByEmail(email) {
  const result = await prisma.pool.query(
    'SELECT "id", "name", "email", "passwordHash", "role", "businessId", "createdAt" FROM "User" WHERE "email" = $1 LIMIT 1',
    [email]
  );

  return mapUser(result.rows[0]);
}

async function findUserById(id) {
  const result = await prisma.pool.query(
    'SELECT "id", "name", "email", "passwordHash", "role", "businessId", "createdAt" FROM "User" WHERE "id" = $1 LIMIT 1',
    [id]
  );

  return mapUser(result.rows[0]);
}

async function createOwnerWithBusiness({ businessName, name, email, passwordHash }) {
  const client = await prisma.pool.connect();

  try {
    await client.query("BEGIN");

    const businessResult = await client.query(
      'INSERT INTO "Business" ("name") VALUES ($1) RETURNING "id", "name", "createdAt"',
      [businessName]
    );

    const business = businessResult.rows[0];

    const userResult = await client.query(
      'INSERT INTO "User" ("name", "email", "passwordHash", "role", "businessId") VALUES ($1, $2, $3, $4, $5) RETURNING "id", "name", "email", "passwordHash", "role", "businessId", "createdAt"',
      [name, email, passwordHash, "OWNER", business.id]
    );

    await client.query("COMMIT");

    return {
      business,
      user: mapUser(userResult.rows[0]),
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function createUserInBusiness({ businessId, name, email, passwordHash, role }) {
  const result = await prisma.pool.query(
    'INSERT INTO "User" ("name", "email", "passwordHash", "role", "businessId") VALUES ($1, $2, $3, $4, $5) RETURNING "id", "name", "email", "passwordHash", "role", "businessId", "createdAt"',
    [name, email, passwordHash, role, businessId]
  );

  return mapUser(result.rows[0]);
}

async function updateUserPassword({ id, passwordHash }) {
  const result = await prisma.pool.query(
    'UPDATE "User" SET "passwordHash" = $2 WHERE "id" = $1 RETURNING "id", "name", "email", "passwordHash", "role", "businessId", "createdAt"',
    [id, passwordHash]
  );

  return mapUser(result.rows[0]);
}

async function listUsersByBusiness(businessId) {
  const result = await prisma.pool.query(
    'SELECT "id", "name", "email", "passwordHash", "role", "businessId", "createdAt" FROM "User" WHERE "businessId" = $1 ORDER BY "id" ASC',
    [businessId]
  );

  return result.rows.map(mapUser);
}

async function searchUsersByBusiness({ businessId, q, skip, limit }) {
  const searchPattern = q ? `%${q}%` : null;
  const whereClause = q
    ? 'WHERE "businessId" = $1 AND ("name" ILIKE $2 OR "email" ILIKE $2)'
    : 'WHERE "businessId" = $1';
  const params = q
    ? [businessId, searchPattern, limit, skip]
    : [businessId, limit, skip];

  const itemsResult = await prisma.pool.query(
    `SELECT "id", "name", "email", "passwordHash", "role", "businessId", "createdAt"
     FROM "User"
     ${whereClause}
     ORDER BY "id" ASC
     LIMIT $${q ? 3 : 2}
     OFFSET $${q ? 4 : 3}`,
    params
  );

  const totalResult = await prisma.pool.query(
    `SELECT COUNT(*)::int AS "total"
     FROM "User"
     ${whereClause}`,
    q ? [businessId, searchPattern] : [businessId]
  );

  return {
    items: itemsResult.rows.map(mapUser),
    total: totalResult.rows[0].total,
  };
}

module.exports = {
  createOwnerWithBusiness,
  createUserInBusiness,
  findUserByEmail,
  findUserById,
  listUsersByBusiness,
  searchUsersByBusiness,
  updateUserPassword,
};
