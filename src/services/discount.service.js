"use strict"

const { BadRequestError, NotFoundError } = require("../core/error.response");
const discountModel = require("../models/discount.model");
const { findAllDiscountCodesUnselect, checkDiscountExists } = require("../models/repositories/discount.repo");
const { convertToObjectIdMongoDb } = require("../utils");
const { findAllProducts } = require("./product.service");

class DiscountService {
  static async createDiscountCode(payload) {
    const {
      name, description, type, value, code, start_date, end_date, max_uses, 
      max_uses_per_user, min_order_value, shopId, isActive, applies_to, product_ids
    } = payload;
    // Nên apply builder pattern thay vì làm như này
    if(new Date() > new Date(end_date)){
      throw new BadRequestError("Discount code has expired");
    }
    if(new Date(start_date) >= new Date(end_date)){
      throw new BadRequestError("Start date must be smaller than end date");
    }
    const foundDiscount = await discountModel.findOne({
      discount_code: code,
      discount_shopId: convertToObjectIdMongoDb(shopId),
    }).lean();
    if(foundDiscount && foundDiscount.discount_is_active){
      throw new BadRequestError("Discount exist!");
    }
    const newDiscount = await discountModel.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_value: value,
      discount_code: code,
      discount_start_date: new Date(start_date),
      discount_end_date: new Date(end_date),
      discount_max_uses: max_uses,
      discount_max_uses_per_user: max_uses_per_user,
      discount_min_order_value: min_order_value || 0,
      discount_shopId: shopId,

      discount_is_active: isActive,
      discount_applies_to: applies_to,
      discount_product_ids: applies_to == "all" ? [] : product_ids
    });
    return newDiscount;
  }

  static async updateDiscountCode() { 
    // TODO:
  }

  static async getAllDiscountCodesByShop({
    limit, page, shopId
  }) {
    const discount = await findAllDiscountCodesUnselect({
      limit: +limit,
      page: +page,
      filter: {
        discount_shopId: convertToObjectIdMongoDb(shopId),
        discount_is_active: true
      },
      unselect: ["__v", "discount_shopId"],
      model: discountModel
    })
    return discount;
  }

  static async getSpecificDiscountCodesWithProduct({
    code, shopId, limit, page
  }) {
    const foundDiscount = await discountModel.findOne({
      discount_code: code,
      discount_shopId: convertToObjectIdMongoDb(shopId),
    }).lean();
    if(!foundDiscount || !foundDiscount.discount_is_active) {
      throw new NotFoundError("Discount not exist");
    }

    const { discount_applies_to, discount_product_ids } = foundDiscount;
    let products;
    if(discount_applies_to == "all"){
      products = await findAllProducts({
        filter: {
          product_shop: convertToObjectIdMongoDb(shopId),
          isPublished: true
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"]
      })
    }
    if(discount_applies_to == "specific") {
      products = await findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          isPublished: true
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"]
      })
    }
    return products;
  }

  static async getDiscountAmount({
    codeId, shopId, products, userId
  }) {
    const foundDiscount = await checkDiscountExists({
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectIdMongoDb(shopId)
      }
    });
    if(!foundDiscount) throw new NotFoundError("Discount does not exist");
    const {
      discount_is_active,
      discount_max_uses,
      discount_min_order_value,
      discount_users_used,
      discount_end_date,
      discount_type,
      discount_value
    } = foundDiscount;
    if(!discount_is_active) throw new NotFoundError("Discount expired");
    if(!discount_max_uses) throw new NotFoundError("Discount are out");
    if(new Date() > new Date(discount_end_date)) throw new BadRequestError("Discount has expired");

    let originalPrice = products.reduce((acc, product) => {
      return acc + (product.quantity * product.price)
    }, 0);

    // Tính phụ thuộc vào giá truyền từ frontend nên k đáng tin, thực tế khi thanh toán phải lấy lại giá từ db và tính
    if(discount_min_order_value > 0) {
      if(originalPrice < discount_min_order_value) throw new NotFoundError(`Discount requires a minimum order value of ${discount_min_order_value}`);
    }
    if(foundDiscount.discount_max_uses_per_user > 0) {
      const userUsedDiscount = discount_users_used.find(user => user.userId === userId);
      if(userUsedDiscount && userUsedDiscount.usedAmount >= foundDiscount.discount_max_uses_per_user){
        throw new BadRequestError(`You reach maximum number of voucher can use`);
      }
    }
    const amount = discount_type === "fixed_amount" ? discount_value : originalPrice * (discount_value / 100);
    return {
      originalPrice,
      discountAmount: amount,
      totalPrice: originalPrice - amount
    }
  }

  static async deleteDiscountCode({
    shopId, codeId
  }) {
    // TODO: Check đang có người dùng rồi thì k cho xóa
    const deleted = await discountModel.findOneAndDelete({
      discount_code: codeId,
      discount_shopId: convertToObjectIdMongoDb(shopId)
    })
    return deleted;
  }

  // Cancel tức là user đã sử dụng voucher nhưng lại thành chưa sử dụng
  static async cancelDiscountCode({ codeId, shopId, userId }) {
    const foundDiscount = await checkDiscountExists({
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectIdMongoDb(shopId)
      }
    })
    if(!foundDiscount) throw NotFoundError("Discount does not exist");
    const result = await discountModel.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        // Xóa 1 phần tử từ mảng discount_users_used
        discount_users_used: userId,
      },
      $inc: {
        discount_uses_count: -1
      }
    })
    return result;
  }
}

module.exports = DiscountService;