const express = require("express");
const asyncHandler = require("../lib/asyncHandler");
const authController = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", asyncHandler(authController.registerOwner));
router.post("/login", asyncHandler(authController.login));

module.exports = router;
