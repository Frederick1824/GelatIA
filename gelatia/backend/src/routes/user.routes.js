const express = require("express");
const asyncHandler = require("../lib/asyncHandler");
const userController = require("../controllers/user.controller");
const { authorizeRoles } = require("../middlewares/authorizationMiddleware");
const { ROLES } = require("../lib/roles");

const router = express.Router();

router.post("/", asyncHandler(userController.createBusinessUser));
router.get("/", asyncHandler(userController.listBusinessUsers));
router.patch(
  "/reset-password",
  authorizeRoles(ROLES.OWNER),
  asyncHandler(userController.resetBusinessUserPassword)
);

module.exports = router;
