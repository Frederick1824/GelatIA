const prisma = require("../config/prisma");

async function searchBranches({ businessId, q, skip, limit }) {
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
    prisma.branch.findMany({
      where,
      orderBy: { id: "asc" },
      skip,
      take: limit,
    }),
    prisma.branch.count({ where }),
  ]);

  return { items, total };
}

module.exports = {
  searchBranches,
};
