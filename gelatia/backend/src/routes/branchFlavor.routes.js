const express = require("express");
const asyncHandler = require("../lib/asyncHandler");
const branchFlavorController = require("../controllers/branchFlavor.controller");
const { authorizeRoles } = require("../middlewares/authorizationMiddleware");
const { ROLES } = require("../lib/roles");

const router = express.Router();

router.patch("/", authorizeRoles(ROLES.OWNER, ROLES.MANAGER, ROLES.CASHIER), asyncHandler(branchFlavorController.updateBranchFlavor));

module.exports = router;
