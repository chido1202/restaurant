const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  description: { type: String },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  discountValue: { type: Number, required: true }, // Giá trị giảm giá (% hoặc số tiền cố định)
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  minOrderValue: { type: Number, default: 0 }, // Giá trị đơn hàng tối thiểu
  maxUsage: { type: Number, default: 0 }, // 0 = không giới hạn
  usageCount: { type: Number, default: 0 }, // Số lần sử dụng
  isActive: { type: Boolean, default: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" }, // Liên kết với sự kiện
  createdAt: { type: Date, default: Date.now }
});

const Discount = mongoose.model("Discount", discountSchema);
module.exports = Discount;
