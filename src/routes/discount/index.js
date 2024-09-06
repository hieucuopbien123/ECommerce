"use strict"

const express = require("express");
const discountController = require("../../controllers/discount.controller");
const router = express.Router();
const { asyncHandler } = require("../../helpers/auth.helper");
const { authenticate } = require("../../auth/authUtils");

// get amount discount - User
router.post("/amount", asyncHandler(discountController.getDiscountAmount));

// Lấy chi tiết discount - User
router.get("/list_product_code", asyncHandler(discountController.getSpecificDiscountCodesWithProduct));

// Lấy mọi mã giảm giá - User
router.get("", asyncHandler(discountController.getAllDiscountCode));

router.use(authenticate);

// Tạo discount mới - Admin
router.post("", asyncHandler(discountController.createDiscountCode));

router.delete("/:codeId", asyncHandler(discountController.deleteDiscountCode));

// Còn rất nhiều api khác như thêm sản phẩm vào discount specific, update discount, xóa discount

module.exports = router;
