"use strict"

const express = require("express");
const accessController = require("../../controllers/access.controller");
const router = express.Router();
const { asyncHandler } = require("../../helpers/auth.helper");
const { authenticate } = require("../../auth/authUtils");

router.post("/shop/signup", asyncHandler(accessController.signUp));
router.post("/shop/login", asyncHandler(accessController.login));

router.use(authenticate);
router.post("/shop/handlerefreshtoken", asyncHandler(accessController.handleRefreshToken));
router.post("/shop/logout", asyncHandler(accessController.logout));

module.exports = router;
