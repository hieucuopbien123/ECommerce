"use strict"

const { findCartById } = require("../models/repositories/cart.repo");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const { checkProductByServer } = require("../models/repositories/product.repo");
const { getDiscountAmount } = require("./discount.service");
const { accquireLock, releaseLock } = require("./redis.service");
const { order } = require("../models/order.model");

class CheckoutService {
  /* 
    {
      cartId, userId,
      shop_order_ids: [
        {
          shopId,
          shop_discounts: [
            { shopId, discountId, codeId }
          ],
          item_products: [
            { price, quantity, productId }
          ]
        },
      ]
    }
  */
  static async checkoutReview({ cartId, userId, shop_order_ids }) {
    const foundCart = await findCartById(cartId);
    if(!foundCart) throw new BadRequestError("Cart not exist!");

    const checkout_order = {
      totalPrice: 0,
      feeShip: 0,
      totalDiscount: 0,
      totalCheckout: 0
    }, shop_order_ids_new = [];

    for (let i = 0; i < shop_order_ids.length; i++) {
      const { shopId, shop_discounts = [], item_products = [] } = shop_order_ids[i];

      // Check product available
      const checkProductServer = await checkProductByServer(item_products);
      if(!checkProductServer[0]) throw new BadRequestError("Order wrong!!");
      console.log(checkProductServer);

      // Tổng tiền đơn hàng
      const checkoutPrice = checkProductServer.reduce((acc, product) => {
        return acc + (product.quantity * product.price)
      }, 0);
      checkout_order.totalPrice += checkoutPrice;
      
      const itemCheckout = {
        shopId,
        shop_discounts,
        priceRaw: checkoutPrice, // Tièn trước khi giảm giá
        priceAppliedDiscount: checkoutPrice,
        item_products: checkProductServer
      }

      // Check shop_discounts hợp lệ
      if(shop_discounts.length > 0) {
        const { discountAmount = 0 } = await getDiscountAmount({ codeId: shop_discounts[0].codeId, userId, shopId, products: checkProductServer });
        if(discountAmount > checkoutPrice){
          itemCheckout.priceAppliedDiscount = 0;
          checkout_order.totalDiscount += checkoutPrice;
        } else if (discountAmount > 0) {
          itemCheckout.priceAppliedDiscount = checkoutPrice - discountAmount;
          checkout_order.totalDiscount += discountAmount; 
        }
      }
      checkout_order.totalCheckout += itemCheckout.priceAppliedDiscount;
      shop_order_ids_new.push(itemCheckout);
    }

    return {
      shop_order_ids,
      shop_order_ids_new,
      checkout_order
    }
  }

  static async orderByUser({ shop_order_ids, cartId, userId, user_address = {}, user_payment = {} }) {
    const { shop_order_ids_new, checkout_order } = await checkoutReview({ cartId, userId, shop_order_ids });
    
    // Check lại vượt tồn kho không - Optimisstics locking
    const products = shop_order_ids_new.flatMap(order => order.item_products);
    const accquireProduct = [];
    for (let i = 0; i < products.length; i++) {
      const { productId, quantity } = products[i];
      const keyLock = await accquireLock({ productId, quantity, cartId });
      accquireProduct.push(keyLock ? true : false);
      if(keyLock){
        await releaseLock(keyLock);
      }
    }
    // Check nếu có 1 sp hết hàng trong kho
    if(accquireProduct.includes(false)){
      // Thiếu rollback
      throw new BadRequestError("1 số sp đã được update, vui lòng quay lại giỏ hàng");
    }
    const newOrder = await order.create({
      order_userId: userId,
      order_checkout: checkout_order,
      order_shipping: user_address,
      order_payment: user_payment,
      order_product: shop_order_ids_new
    });

    // Nếu insert thành công thì remove product trong giỏ hàng
    if(newOrder){

    }

    return newOrder;
  }

  static async getOrderByUser() {

  }

  static async getOneOrderById() {

  }

  static async cancelOrderByUser() {

  }

  // Only shop | admin
  static async updateOrderStatusByShop() {

  }
}

module.exports = CheckoutService;