const prisma = require("../config/prisma");

function mapFlavor(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    businessId: row.businessId,
    createdAt: row.createdAt,
  };
}

async function createFlavorForBusiness({ name, businessId }) {
  const result = await prisma.pool.query(
    'INSERT INTO "Flavor" ("name", "businessId") VALUES ($1, $2) RETURNING "id", "name", "businessId", "createdAt"',
    [name, businessId]
  );

  return mapFlavor(result.rows[0]);
}

async function findFlavorById(id) {
  const result = await prisma.pool.query(
    'SELECT "id", "name", "businessId", "createdAt" FROM "Flavor" WHERE "id" = $1 LIMIT 1',
    [id]
  );

  return mapFlavor(result.rows[0]);
}

async function listBranchFlavorsForBusiness({ branchId, businessId }) {
  const result = await prisma.pool.query(
    `SELECT
        bf."id",
        bf."branchId",
        bf."flavorId",
        bf."stockGrams",
        bf."isActive",
        f."id" AS "flavor_id",
        f."name" AS "flavor_name",
        f."businessId" AS "flavor_business_id",
        f."createdAt" AS "flavor_created_at"
      FROM "BranchFlavor" bf
      INNER JOIN "Flavor" f ON f."id" = bf."flavorId"
      WHERE bf."branchId" = $1 AND f."businessId" = $2
      ORDER BY bf."id" ASC`,
    [branchId, businessId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    branchId: row.branchId,
    flavorId: row.flavorId,
    stockGrams: row.stockGrams,
    isActive: row.isActive,
    flavor: {
      id: row.flavor_id,
      name: row.flavor_name,
      businessId: row.flavor_business_id,
      createdAt: row.flavor_created_at,
    },
  }));
}

async function searchFlavors({ businessId, q, skip, limit }) {
  const where = {
    businessId,
    ...(q
      ? {
          name: {
            contains: q,
            mode: "insensitive",
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.flavor.findMany({
      where,
      orderBy: { id: "asc" },
      skip,
      take: limit,
    }),
    prisma.flavor.count({ where }),
  ]);

  return { items, total };
}

module.exports = {
  createFlavorForBusiness,
  findFlavorById,
  listBranchFlavorsForBusiness,
  searchFlavors,
};
