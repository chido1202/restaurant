const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const middlewareController = require("../middlewares/middlewareController");

// Lấy tất cả đơn hàng (admin) hoặc đơn hàng của user hiện tại
router.get("/", middlewareController.authenticate, orderController.getAllOrders);

// Lấy đơn hàng của người dùng hiện tại
router.get("/user", middlewareController.authenticate, orderController.getUserOrders);

// Lấy chi tiết đơn hàng theo ID
router.get("/:id", middlewareController.authenticate, orderController.getOrderById);

// Tạo đơn hàng mới
router.post("/", orderController.createOrder);

// Hủy đơn hàng
router.put("/:id/cancel", middlewareController.authenticate, orderController.cancelOrder);

// Cập nhật đơn hàng
router.put("/:id", middlewareController.authenticate, orderController.updateOrder);

// Xóa đơn hàng (chỉ admin)
router.delete("/:id", middlewareController.authenticate, middlewareController.authorizeRoles(["admin"]), orderController.deleteOrder);

module.exports = router;
