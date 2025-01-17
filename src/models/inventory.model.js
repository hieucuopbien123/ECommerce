"use strict"

const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "Inventory";
const COLLECTION_NAME = "Inventories";

const inventorySchema = new Schema({
  inven_productId: { type: Schema.Types.ObjectId, ref: "Product" },
  inven_location: { type: String, default: "unKnown" },
  inven_stock: { type: Number, required: true },
  inven_shopId: { type: Schema.Types.ObjectId, ref: "Shop" },
  inven_reservations: { type: Array, default: [] }, // Lưu thông tin khi người dùng đặt hàng 
}, {
  timestamp: true,
  collection: COLLECTION_NAME
});

module.exports = model(DOCUMENT_NAME, inventorySchema);
