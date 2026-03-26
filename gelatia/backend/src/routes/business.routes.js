const express = require("express");
const asyncHandler = require("../lib/asyncHandler");
const businessController = require("../controllers/business.controller");

const router = express.Router();

router.post("/", asyncHandler(businessController.createBusiness));

module.exports = router;
