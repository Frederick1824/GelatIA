const express = require("express");
const asyncHandler = require("../lib/asyncHandler");
const branchController = require("../controllers/branch.controller");
const { authorizeRoles } = require("../middlewares/authorizationMiddleware");
const { ROLES } = require("../lib/roles");

const router = express.Router();

router.get("/", asyncHandler(branchController.listBranches));
router.post("/", authorizeRoles(ROLES.OWNER), asyncHandler(branchController.createBranch));
router.post("/:id/flavor", authorizeRoles(ROLES.OWNER, ROLES.MANAGER), asyncHandler(branchController.assignFlavorToBranch));
router.get("/:branchId/flavors", asyncHandler(branchController.listBranchFlavors));

module.exports = router;
