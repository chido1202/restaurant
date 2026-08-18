const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  endDate: { type: Date }, // Ngày kết thúc sự kiện
  location: { type: String, required: true },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Danh sách người tham dự
  createdAt: { type: Date, default: Date.now },
  image: { type: String }, // URL hình ảnh cho sự kiện
  discountCode: { type: mongoose.Schema.Types.ObjectId, ref: "Discount" }, // Liên kết với mã giảm giá
  isActive: { type: Boolean, default: true } // Trạng thái kích hoạt của sự kiện
});

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
