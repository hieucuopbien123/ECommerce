"use strict"

const ProductService = require("../services/product.service");
const { Ok, Created, SuccessResponse } = require("../core/success.response");

class ProductController {
  createProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Create product successfully",
      metadata: await ProductService.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId
      })
    }).send(res);
  }

  // UPDATE
  publishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Publish product successfully",
      metadata: await ProductService.publishProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId
      })
    }).send(res);
  }
  unpublishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Unpublish product successfully",
      metadata: await ProductService.unpublishProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId
      })
    }).send(res);
  }
  updateProduct = async(req, res, next) => {
    new SuccessResponse({
      message: "Update product success",
      metadata: await ProductService.updateProduct(req.body.product_type, req.params.product_id, req.user.userId, {
        ...req.body
      })
    }).send(res)
  }

  // QUERY //
  /**
   * @desc Get all draft for shop
   * @param {Number} limit 
   * @param {Number} skip 
   * @param {String} query 
   * @return {JSON}
   */
  getAllDraftsForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get all drafts for shop successfully",
      metadata: await ProductService.findAllDraftsForShop({
        product_shop: req.user.userId
      })
    }).send(res);
  }

  getAllPublishedForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get all published product for shop successfully",
      metadata: await ProductService.findAllPublishForShop({
        product_shop: req.user.userId
      })
    }).send(res);
  }

  getListSearchProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list search product successfully",
      metadata: await ProductService.searchProducts(req.params)
    }).send(res);
  }

  findAllProducts = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list findAllProducts successfully",
      metadata: await ProductService.findAllProducts(req.query)
    }).send(res);
  }

  findProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list findProduct successfully",
      metadata: await ProductService.findProduct({
        product_id: req.params.product_id
      })
    }).send(res);
  }
}

module.exports = new ProductController();