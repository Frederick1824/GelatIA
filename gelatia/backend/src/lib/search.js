const { BadRequestError } = require("./errors");
const { parseRequiredString } = require("./validation");

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

function parsePositiveInteger(value, fieldName, fallback) {
  if (value === undefined) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new BadRequestError(`${fieldName} invalido`);
  }

  return parsed;
}

function parseSearchParams(query = {}) {
  const q = parseRequiredString(query.q);
  const page = parsePositiveInteger(query.page, "page", DEFAULT_PAGE);
  const requestedLimit = parsePositiveInteger(query.limit, "limit", DEFAULT_LIMIT);
  const limit = Math.min(requestedLimit, MAX_LIMIT);

  return {
    q: q || undefined,
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

function buildSearchResponse({ items, page, limit, total }) {
  return {
    items,
    page,
    limit,
    total,
  };
}

module.exports = {
  buildSearchResponse,
  parseSearchParams,
};
