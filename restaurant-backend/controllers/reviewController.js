const Review = require("../models/Review");
const Product = require("../models/Product");
const User = require("../models/User");
const mongoose = require("mongoose");
const productController = require("./productController");

// Sửa cách import hàm updateProductRating
const { updateProductRating } = productController;

const reviewController = {
  // Lấy tất cả đánh giá (admin)
  getAllReviews: async (req, res) => {
    try {
      const { status, product } = req.query;
      let query = {};

      if (status) query.status = status;
      if (product) query.product = product;

      const reviews = await Review.find(query)
        .populate('user', 'name username avatar')
        .populate('product', 'name imageProduct')
        .sort({ createdAt: -1 });

      res.status(200).json(reviews);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đánh giá:", error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },

  // Lấy đánh giá theo ID
  getReviewById: async (req, res) => {
    try {
      const review = await Review.findById(req.params.id)
        .populate('user', 'name username avatar')
        .populate('product', 'name imageProduct');

      if (!review) {
        return res.status(404).json({ message: "Không tìm thấy đánh giá" });
      }

      res.status(200).json(review);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết đánh giá:", error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },

  // Lấy đánh giá theo sản phẩm
  getReviewsByProduct: async (req, res) => {
    try {
      const productId = req.params.productId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Chỉ lấy các đánh giá đã được phê duyệt
      const reviews = await Review.find({
        product: productId,
        status: "approved"
      })
        .populate('user', 'name username avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Review.countDocuments({
        product: productId,
        status: "approved"
      });

      // Tính rating trung bình
      const avgRating = await Review.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(productId), status: "approved" } },
        { $group: { _id: null, avgRating: { $avg: "$rating" } } }
      ]);

      res.status(200).json({
        reviews,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        },
        avgRating: avgRating.length > 0 ? avgRating[0].avgRating : 0
      });
    } catch (error) {
      console.error("Lỗi khi lấy đánh giá theo sản phẩm:", error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },

  // Tạo đánh giá mới
  createReview: async (req, res) => {
    try {
      // Kiểm tra xem người dùng đã đăng nhập chưa
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: "Bạn cần đăng nhập để đánh giá" });
      }

      const { productId, rating, comment, images } = req.body;

      // Kiểm tra dữ liệu đầu vào
      if (!productId || !rating || !comment) {
        return res.status(400).json({ message: "Thiếu thông tin đánh giá" });
      }

      // Kiểm tra người dùng đã đánh giá sản phẩm này chưa
      const existingReview = await Review.findOne({
        user: req.user.userId,
        product: productId
      });

      if (existingReview) {
        return res.status(400).json({ message: "Bạn đã đánh giá sản phẩm này rồi" });
      }

      // Tạo đánh giá mới
      const newReview = new Review({
        user: req.user.userId,
        product: productId,
        rating: parseInt(rating),
        comment,
        images: images || [],
        status: "pending", // Đánh giá mới sẽ ở trạng thái chờ duyệt
        createdAt: new Date()
      });

      await newReview.save();

      // Cập nhật rating sản phẩm
      await updateProductRating(productId);

      res.status(201).json({
        message: "Cảm ơn bạn đã đánh giá. Đánh giá của bạn đang chờ phê duyệt.",
        review: newReview
      });
    } catch (error) {
      console.error("Lỗi khi tạo đánh giá:", error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },

  // Cập nhật đánh giá
  updateReview: async (req, res) => {
    try {
      const { id } = req.params;
      const { rating, comment, images, status } = req.body;

      const review = await Review.findById(id);
      if (!review) {
        return res.status(404).json({ message: "Không tìm thấy đánh giá" });
      }

      // Chỉ admin hoặc người viết đánh giá mới có quyền cập nhật
      if (req.user.role !== "admin" && review.user.toString() !== req.user.userId) {
        return res.status(403).json({ message: "Bạn không có quyền cập nhật đánh giá này" });
      }

      // Người dùng thường chỉ có thể cập nhật nội dung
      if (req.user.role !== "admin") {
        if (rating) review.rating = parseInt(rating);
        if (comment) review.comment = comment;
        if (images) review.images = images;
        review.status = "pending"; // Reset về trạng thái chờ duyệt khi người dùng cập nhật
      } else {
        // Admin có thể cập nhật tất cả, bao gồm cả trạng thái
        if (rating) review.rating = parseInt(rating);
        if (comment) review.comment = comment;
        if (images) review.images = images;
        if (status) review.status = status;
      }

      review.updatedAt = new Date();
      await review.save();

      // Cập nhật rating sản phẩm
      await updateProductRating(review.product);

      res.status(200).json({
        message: "Cập nhật đánh giá thành công",
        review
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật đánh giá:", error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },

  // Xóa đánh giá
  deleteReview: async (req, res) => {
    try {
      const { id } = req.params;

      const review = await Review.findById(id);
      if (!review) {
        return res.status(404).json({ message: "Không tìm thấy đánh giá" });
      }

      // Chỉ admin hoặc người viết đánh giá mới có quyền xóa
      if (req.user.role !== "admin" && review.user.toString() !== req.user.userId) {
        return res.status(403).json({ message: "Bạn không có quyền xóa đánh giá này" });
      }

      const productId = review.product; // Lưu lại ID sản phẩm trước khi xóa review
      await Review.findByIdAndDelete(id);

      // Cập nhật rating sản phẩm
      await updateProductRating(productId);

      res.status(200).json({
        message: "Xóa đánh giá thành công"
      });
    } catch (error) {
      console.error("Lỗi khi xóa đánh giá:", error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },

  // Lấy đánh giá của người dùng hiện tại
  getUserReviews: async (req, res) => {
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: "Bạn cần đăng nhập để xem đánh giá" });
      }

      const reviews = await Review.find({ user: req.user.userId })
        .populate('product', 'name imageProduct')
        .sort({ createdAt: -1 });

      res.status(200).json(reviews);
    } catch (error) {
      console.error("Lỗi khi lấy đánh giá của người dùng:", error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },

  // Phê duyệt hoặc từ chối đánh giá (chỉ admin)
  moderateReview: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Chỉ admin mới có quyền phê duyệt/từ chối
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Bạn không có quyền thực hiện hành động này" });
      }

      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Trạng thái không hợp lệ" });
      }

      const review = await Review.findById(id);
      if (!review) {
        return res.status(404).json({ message: "Không tìm thấy đánh giá" });
      }

      review.status = status;
      review.updatedAt = new Date();
      await review.save();

      // Cập nhật rating sản phẩm
      await updateProductRating(review.product);

      res.status(200).json({
        message: `Đánh giá đã được ${status === 'approved' ? 'phê duyệt' : 'từ chối'}`,
        review
      });
    } catch (error) {
      console.error("Lỗi khi phê duyệt/từ chối đánh giá:", error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  }
};

module.exports = reviewController;
