import { apiRequest } from "./api";

export function listBranchesService({ token, q, page, limit }) {
  return apiRequest("/branch", {
    token,
    query: { q, page, limit },
  });
}

export function createBranchService({ token, name }) {
  return apiRequest("/branch", {
    method: "POST",
    token,
    body: { name },
  });
}

export function listBranchFlavorsService({ token, branchId }) {
  return apiRequest(`/branch/${branchId}/flavors`, {
    token,
  });
}

export function assignFlavorToBranchService({ token, branchId, flavorId, stockGrams = 0 }) {
  return apiRequest(`/branch/${branchId}/flavor`, {
    method: "POST",
    token,
    body: {
      flavorId,
      stockGrams,
    },
  });
}

export function updateBranchFlavorService({ token, id, stockGrams }) {
  return apiRequest("/branch-flavor", {
    method: "PATCH",
    token,
    body: {
      id,
      stockGrams,
    },
  });
}
