const userService = require("../services/user.service");

async function createBusinessUser(req, res) {
  const user = await userService.createBusinessUser(req.auth, req.body);
  return res.status(201).json(user);
}

async function listBusinessUsers(req, res) {
  const users = await userService.listBusinessUsers(req.auth, req.query);
  return res.json(users);
}

async function resetBusinessUserPassword(req, res) {
  const user = await userService.resetBusinessUserPassword(req.auth, req.body);
  return res.json({
    message: "Contrasena reseteada correctamente",
    user,
  });
}

module.exports = {
  createBusinessUser,
  listBusinessUsers,
  resetBusinessUserPassword,
};
