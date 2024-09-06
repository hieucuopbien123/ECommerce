"use strict"

const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "Discount";
const COLLECTION_NAME = "Discounts";

const discountSchema = new Schema({
  discount_name: { type: String, required: true },
  discount_description: { type: String, required: true },
  discount_type: { type: String, default: "fixed_amount" }, // percentage
  discount_value: { type: Number, required: true }, // tùy type là 10_000 VNĐ, 100%
  discount_code: { type: String, required: true }, 
  discount_start_date: { type: Date, required: true },
  discount_end_date: { type: Date, required: true },
  discount_max_uses: { type: Number, required: true }, // Số lượng phát hành ra
  discount_uses_count: { type: Number, default: 0 }, // Số lượng đã dùng
  discount_users_used: { type: Array, default: [] }, // Những người đã dùng discount này với số lượng bnh
  discount_max_uses_per_user: { type: Number, required: true }, // 1 người được quyền sử dụng với số lượng bnh
  discount_min_order_value: { type: Number, required: true }, // Giá nhỏ nhất của giỏ hàng để áp dụng được discount
  discount_shopId: { type: Schema.Types.ObjectId, ref: "Shop" },

  discount_is_active: { type: Boolean, default: true },
  discount_applies_to: { type: String, required: true, enum: ["all", "specific"] },
  discount_product_ids: { type: Array, default: [] } // Nếu discount_applies_to == "specific"
  
  // Còn nhiều logic khác: Các danh mục sản phẩm được áp dụng discount_product_category; Các khu vực áp dụng HN, HCM; Voucher mix hay chỉ được 1 voucher 1 lúc; Giảm giá theo cấp, giá càng lớn, giảm càng mạnh; Hệ thống theo dõi lịch sử của từng lần giảm giá, thống kê cho shop; 1 số voucher ẩn đặc biệt, 1 số voucher là public
}, {
  timestamp: true,
  collection: COLLECTION_NAME
});

module.exports = model(DOCUMENT_NAME, discountSchema);
