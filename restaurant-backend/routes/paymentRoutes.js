const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const middlewareController = require("../middlewares/middlewareController");

// Tạo URL thanh toán VNPay
router.post("/vnpay/create", paymentController.createVNPayUrl);

// Xử lý callback từ VNPay - Có thể bỏ đi vì sẽ xử lý từ frontend
// router.get("/vnpay/callback", paymentController.vnpayCallback);

// Cập nhật trạng thái thanh toán từ frontend
router.post("/update-status", paymentController.updatePaymentStatus);

// Kiểm tra trạng thái thanh toán
router.get("/status/:orderId", middlewareController.authenticate, paymentController.checkPaymentStatus);

module.exports = router;
