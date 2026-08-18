const express = require("express");
const router = express.Router();
const reviewController = require("../../controllers/reviewController");
const { authenticate } = require("../../middlewares/middlewareController");

// Routes công khai (public)
router.get("/product/:productId", reviewController.getReviewsByProduct);
router.get("/:id", reviewController.getReviewById);

// Routes yêu cầu đăng nhập (protected)
router.post("/", authenticate, reviewController.createReview);
router.put("/:id", authenticate, reviewController.updateReview);
router.delete("/:id", authenticate, reviewController.deleteReview);
router.get("/user/me", authenticate, reviewController.getUserReviews);

// Routes chỉ dành cho admin
router.get("/", authenticate, reviewController.getAllReviews); // Admin sẽ lấy tất cả đánh giá
router.put("/moderate/:id", authenticate, reviewController.moderateReview);

module.exports = router;
