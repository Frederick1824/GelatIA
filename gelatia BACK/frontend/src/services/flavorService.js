import { apiRequest } from "./api";

export function listFlavorsService({ token, q, page, limit }) {
  return apiRequest("/flavor", {
    token,
    query: { q, page, limit },
  });
}

export function createFlavorService({ token, name }) {
  return apiRequest("/flavor", {
    method: "POST",
    token,
    body: { name },
  });
}
