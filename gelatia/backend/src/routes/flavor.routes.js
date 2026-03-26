const express = require("express");
const asyncHandler = require("../lib/asyncHandler");
const flavorController = require("../controllers/flavor.controller");
const { authorizeRoles } = require("../middlewares/authorizationMiddleware");
const { ROLES } = require("../lib/roles");

const router = express.Router();

router.get("/", asyncHandler(flavorController.listFlavors));
router.post("/", authorizeRoles(ROLES.OWNER, ROLES.MANAGER), asyncHandler(flavorController.createFlavor));

module.exports = router;
