const prisma = require("../config/prisma");
const { BadRequestError, NotFoundError, ConflictError } = require("../lib/errors");
const { buildSearchResponse, parseSearchParams } = require("../lib/search");
const { parsePositiveInt, parseNonNegativeInt, parseRequiredString } = require("../lib/validation");
const branchRepository = require("../repositories/branch.repository");
const flavorRepository = require("../repositories/flavor.repository");

async function createBranch(auth, payload) {
  const name = parseRequiredString(payload?.name);
  const businessId = auth?.businessId;

  if (!name || !businessId) {
    throw new BadRequestError("name es obligatorio");
  }

  return prisma.branch.create({
    data: {
      name,
      businessId,
    },
  });
}

async function assignFlavorToBranch(auth, branchIdParam, payload) {
  const branchId = parsePositiveInt(branchIdParam);
  const flavorId = parsePositiveInt(payload?.flavorId);
  const stockGrams = parseNonNegativeInt(payload?.stockGrams);

  if (!branchId || !flavorId || stockGrams === null) {
    throw new BadRequestError("branchId, flavorId y stockGrams validos son obligatorios");
  }

  const [branch, flavor] = await Promise.all([
    prisma.branch.findUnique({ where: { id: branchId } }),
    flavorRepository.findFlavorById(flavorId),
  ]);

  if (!branch || branch.businessId !== auth?.businessId) {
    throw new NotFoundError("Sucursal no encontrada");
  }

  if (!flavor || flavor.businessId !== auth?.businessId) {
    throw new NotFoundError("Sabor no encontrado");
  }

  try {
    return await prisma.branchFlavor.create({
      data: {
        branchId,
        flavorId,
        stockGrams,
        isActive: stockGrams > 0,
      },
    });
  } catch (error) {
    if (error.code === "P2002") {
      throw new ConflictError("El sabor ya fue asignado a la sucursal");
    }

    throw error;
  }
}

async function listBranchFlavors(auth, branchIdParam) {
  const branchId = parsePositiveInt(branchIdParam);

  if (!branchId) {
    throw new BadRequestError("branchId invalido");
  }

  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
  });

  if (!branch || branch.businessId !== auth?.businessId) {
    throw new NotFoundError("Sucursal no encontrada");
  }

  return flavorRepository.listBranchFlavorsForBusiness({
    branchId,
    businessId: auth.businessId,
  });
}

async function listBranches(auth, query) {
  const search = parseSearchParams(query);
  const result = await branchRepository.searchBranches({
    businessId: auth.businessId,
    q: search.q,
    skip: search.skip,
    limit: search.limit,
  });

  return buildSearchResponse({
    items: result.items,
    page: search.page,
    limit: search.limit,
    total: result.total,
  });
}

module.exports = {
  createBranch,
  assignFlavorToBranch,
  listBranches,
  listBranchFlavors,
};
