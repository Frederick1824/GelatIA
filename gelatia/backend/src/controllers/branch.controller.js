const branchService = require("../services/branch.service");

async function createBranch(req, res) {
  const branch = await branchService.createBranch(req.auth, req.body);
  return res.status(201).json(branch);
}

async function listBranches(req, res) {
  const result = await branchService.listBranches(req.auth, req.query);
  return res.json(result);
}

async function assignFlavorToBranch(req, res) {
  const branchFlavor = await branchService.assignFlavorToBranch(req.auth, req.params.id, req.body);
  return res.status(201).json(branchFlavor);
}

async function listBranchFlavors(req, res) {
  const flavors = await branchService.listBranchFlavors(req.auth, req.params.branchId);
  return res.json(flavors);
}

module.exports = {
  createBranch,
  assignFlavorToBranch,
  listBranches,
  listBranchFlavors,
};
