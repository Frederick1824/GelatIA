const branchFlavorService = require("../services/branchFlavor.service");

async function updateBranchFlavor(req, res) {
  const updatedBranchFlavor = await branchFlavorService.updateBranchFlavor(req.auth, req.body);
  return res.json(updatedBranchFlavor);
}

module.exports = {
  updateBranchFlavor,
};
