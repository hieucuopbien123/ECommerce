"use strict"

const express = require("express");
const productController = require("../../controllers/product.controller");
const router = express.Router();
const { asyncHandler } = require("../../helpers/auth.helper");
const { authenticate } = require("../../auth/authUtils");

router.get("/search/:keySearch", asyncHandler(productController.getListSearchProduct));
router.get("", asyncHandler(productController.findAllProducts));
router.get("/:product_id", asyncHandler(productController.findProduct));

router.use(authenticate);

router.post("", asyncHandler(productController.createProduct));
router.patch("/:product_id", asyncHandler(productController.updateProduct));
router.post("/publish/:id", asyncHandler(productController.publishProductByShop));
router.post("/unpublish/:id", asyncHandler(productController.unpublishProductByShop));

// QUERY //
router.get("/drafts/all", asyncHandler(productController.getAllDraftsForShop));
router.get("/published/all", asyncHandler(productController.getAllPublishedForShop));

module.exports = router;
