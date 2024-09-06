"use strict"

const DiscountService = require("../services/discount.service");
const { Ok, Created, SuccessResponse } = require("../core/success.response");

class DiscountController {
  createDiscountCode = async (req, res, next) => {
    new SuccessResponse({
      message: "Create discount successfully",
      metadata: await DiscountService.createDiscountCode({
        ...req.body,
        shopId: req.user.userId
      })
    }).send(res);
  }
  getAllDiscountCode = async (req, res, next) => {
    new SuccessResponse({
      message: "Get all discount successfully",
      metadata: await DiscountService.getAllDiscountCodesByShop({
        ...req.query
      })
    }).send(res);
  }
  getSpecificDiscountCodesWithProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Get specific discount successfully",
      metadata: await DiscountService.getSpecificDiscountCodesWithProduct({
        ...req.query
      })
    }).send(res);
  }
  getDiscountAmount = async (req, res, next) => {
    new SuccessResponse({
      message: "Get discount amount successfully",
      metadata: await DiscountService.getDiscountAmount({
        ...req.body
      })
    }).send(res);
  }
  deleteDiscountCode = async (req, res, next) => {
    new SuccessResponse({
      message: "Delete discount code successfully",
      metadata: await DiscountService.deleteDiscountCode({
        shopId: req.user.userId,
        codeId: req.params.codeId
      })
    }).send(res);
  }
}

module.exports = new DiscountController();