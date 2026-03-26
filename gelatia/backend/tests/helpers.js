const request = require("supertest");
const app = require("../src/app");

async function createBusiness(name = "GelatIA") {
  return request(app).post("/business").send({ name });
}

async function registerOwner({
  businessName = "GelatIA",
  name = "Owner GelatIA",
  email = "owner@gelatia.com",
  password = "secret123",
} = {}) {
  return request(app).post("/auth/register").send({ businessName, name, email, password });
}

async function login({ email = "owner@gelatia.com", password = "secret123" } = {}) {
  return request(app).post("/auth/login").send({ email, password });
}

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

async function createBusinessUser({ token, name = "Caja", email = "cashier@gelatia.com", password = "secret123", role = "CASHIER" }) {
  return request(app).post("/users").set(authHeaders(token)).send({ name, email, password, role });
}

async function createFlavor(name = "Chocolate", token) {
  return request(app).post("/flavor").set(authHeaders(token)).send({ name });
}

async function listFlavors({ token, q, page, limit } = {}) {
  return request(app).get("/flavor").set(authHeaders(token)).query({ q, page, limit });
}

async function createBranch({ name = "Centro", token }) {
  return request(app).post("/branch").set(authHeaders(token)).send({ name });
}

async function listBranches({ token, q, page, limit } = {}) {
  return request(app).get("/branch").set(authHeaders(token)).query({ q, page, limit });
}

async function assignFlavorToBranch({ branchId, flavorId, stockGrams = 5000, token }) {
  return request(app)
    .post(`/branch/${branchId}/flavor`)
    .set(authHeaders(token))
    .send({ flavorId, stockGrams });
}

async function listUsers({ token, q, page, limit } = {}) {
  return request(app).get("/users").set(authHeaders(token)).query({ q, page, limit });
}

async function resetUserPassword({ token, userId, newPassword }) {
  return request(app)
    .patch("/users/reset-password")
    .set(authHeaders(token))
    .send({ userId, newPassword });
}

module.exports = {
  app,
  request,
  authHeaders,
  createBusiness,
  registerOwner,
  login,
  createFlavor,
  listFlavors,
  createBranch,
  listBranches,
  assignFlavorToBranch,
  createBusinessUser,
  listUsers,
  resetUserPassword,
};
