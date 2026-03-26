const flavorService = require("../services/flavor.service");

async function createFlavor(req, res) {
  const flavor = await flavorService.createFlavor(req.auth, req.body);
  return res.status(201).json(flavor);
}

async function listFlavors(req, res) {
  const result = await flavorService.listFlavors(req.auth, req.query);
  return res.json(result);
}

module.exports = {
  createFlavor,
  listFlavors,
};
