"use strict"

const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "Order";
const COLLECTION_NAME = "Orders";

const orderSchema = new Schema({
  order_userId: { type: Number, required: true },
  order_checkout: { type: Object, default: {} },
  /*
    order_checkout: { totalPrice, totalApplieddiscount, feeShip }
  */
  order_shipping: { type: Object, default: {} },
  /*
    street, city, state, country
  */
  order_payment: { type: Object, default: {} },
  order_products: { type: Array, required: true },
  order_trackingNumber: { type: String, default: "#0000118082024"},
  order_status: { type: String, enum: ["pending", "confirmed", "shipped", "canceled", "delivered"], default: "pending" },
}, {
  collection: COLLECTION_NAME,
  timestamp: {
    createdAt: "createdOn",
    updatedAt: "modifiedOn"
  }
});

module.exports = {
  order: model(DOCUMENT_NAME, orderSchema)
}

