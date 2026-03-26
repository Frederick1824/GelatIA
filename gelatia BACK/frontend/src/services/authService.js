import { apiRequest } from "./api";

export function loginService(credentials) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: credentials,
  });
}

export function registerBusinessService(payload) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: payload,
  });
}
