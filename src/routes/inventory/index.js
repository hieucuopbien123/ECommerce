"use strict"

const express = require("express");
const inventoryController = require("../../controllers/inventory.controller");
const router = express.Router();
const { asyncHandler } = require("../../helpers/auth.helper");
const { authenticate } = require("../../auth/authUtils");

router.use(authenticate);
router.post("", asyncHandler(inventoryController.addStock));

module.exports = router;
