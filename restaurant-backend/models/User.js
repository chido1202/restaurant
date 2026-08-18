const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true }, 
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, match: /^[0-9]{10,15}$/ }, // Chỉ chấp nhận số điện thoại hợp lệ (10-15 số)
    address: { type: String, trim: true },
    customerType: { type: String, enum: ["regular", "vip", "premium"], default: "regular" }, // Hạn chế giá trị không hợp lệ
    orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }], // Nếu lưu lịch sử đơn hàng
    loyaltyPoints: { type: Number, default: 0, min: 0 }, // Điểm không thể âm
    role: { type: String, enum: ["customer", "admin", "staff"], default: "customer" }, // Hạn chế quyền không hợp lệ
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
