const authService = require("../services/auth.service");

async function registerOwner(req, res) {
  const result = await authService.registerOwner(req.body);
  return res.status(201).json(result);
}

async function login(req, res) {
  const result = await authService.login(req.body);
  return res.json(result);
}

module.exports = {
  login,
  registerOwner,
};
