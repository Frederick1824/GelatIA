const { BadRequestError, ConflictError } = require("../lib/errors");
const { buildSearchResponse, parseSearchParams } = require("../lib/search");
const { parseRequiredString } = require("../lib/validation");
const flavorRepository = require("../repositories/flavor.repository");

async function createFlavor(auth, payload) {
  const name = parseRequiredString(payload?.name);

  if (!auth?.businessId || !name) {
    throw new BadRequestError("name es obligatorio");
  }

  try {
    return await flavorRepository.createFlavorForBusiness({
      name,
      businessId: auth.businessId,
    });
  } catch (error) {
    if (error.code === "23505" || error.code === "P2002") {
      throw new ConflictError("El sabor ya existe");
    }

    throw error;
  }
}

async function listFlavors(auth, query) {
  const search = parseSearchParams(query);
  const result = await flavorRepository.searchFlavors({
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
  createFlavor,
  listFlavors,
};
