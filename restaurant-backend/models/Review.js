const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }], // URL hình ảnh đánh giá (tùy chọn)
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});

// Tạo index để tìm kiếm nhanh theo sản phẩm
reviewSchema.index({ product: 1 });

// Tạo index cho người dùng để kiểm tra xem họ đã đánh giá sản phẩm này chưa
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
