import { apiRequest } from "./api";

export function listUsersService({ token, q, page, limit }) {
  return apiRequest("/users", {
    token,
    query: { q, page, limit },
  });
}

export function createUserService({ token, name, email, password, role }) {
  return apiRequest("/users", {
    method: "POST",
    token,
    body: { name, email, password, role },
  });
}

export function resetUserPasswordService({ token, userId, newPassword }) {
  return apiRequest("/users/reset-password", {
    method: "PATCH",
    token,
    body: { userId, newPassword },
  });
}
