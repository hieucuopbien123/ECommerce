"use strict"

const { Schema, model } = require("mongoose");
const slugify = require("slugify");

const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "Products";

const ProductSchema = new Schema({
  product_name: { type: String, required: true }, // dien thoai
  product_slug: String, // dien-thoai 
  product_thumb: { type: String, required: true },
  product_description: String,
  product_price: { type: Number, required: true },
  product_quantity: { type: Number, required: true }, 
  product_type: { type: String, required: true, enum: ["Electronics", "Clothing", "Furniture"]},
  product_shop: { type: Schema.Types.ObjectId, ref: "Shop" },
  product_attribute: { type: Schema.Types.Mixed, required: true },
  product_ratingAverage: {
    type: Number,
    default: 4.5, 
    min: [1, "Rating must be greater than 1"],
    max: [5, "Rating must be smaller than 5"],
    set: (val) => Math.round(val*10) / 10, // Cách làm tròn: 4.345666 => 4.3
  }, 
  product_variations: {
    type: Array,
    default: []
  },
  // Trường nào gắn với đối tượng thì để tiền tố kiểu product_<>, còn các trường không có tiền tố thường để phục vụ hàm utility và k lấy select ra
  isDraft: { type: Boolean, default: true, index: true, select: false },
  isPublished: { type: Boolean, default: false, index: true, select: false },
}, {
  collection: COLLECTION_NAME,
  timestamps: true
});

// Đánh index
ProductSchema.index({ product_name: "text", product_description: "text" });

// Middleware chạy trước khi save
ProductSchema.pre("save", function(next) {
  // Lỗi k được dùng arrow function làm sai biến this ở đây
  // slug là 1 trường kiểu chuỗi, biến đổi từ văn bản thành dạng phù hợp với url bằng cách thêm separator. Thư viện slugify giúp làm điều này
  this.product_slug = slugify(this.product_name, { lower: true });
  next();
});

const clothingSchema = new Schema({
  brand: { type: String, required: true },
  size: String,
  material: String,
  product_shop: { type: Schema.Types.ObjectId, ref: "Shop" }
}, {
  collection: "Clothes",
  timestamps: true
});

const electronicSchema = new Schema({
  manufacturer: { type: String, required: true },
  model: String,
  color: String,
  product_shop: { type: Schema.Types.ObjectId, ref: "Shop" }
}, {
  collection: "Electronics",
  timestamps: true
});

const furnitureSchema = new Schema({
  manufacturer: { type: String, required: true },
  model: String,
  color: String,
  product_shop: { type: Schema.Types.ObjectId, ref: "Shop" }
}, {
  collection: "Furniture",
  timestamps: true
});

module.exports = {
  product: model(DOCUMENT_NAME, ProductSchema),
  electronic: model("Electronics", electronicSchema),
  clothing: model("Clothing", clothingSchema),
  furniture: model("Furniture", furnitureSchema),
}