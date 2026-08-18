const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");

// Lấy danh sách tất cả khách hàng
router.get("/", customerController.getAllCustomers);

// Lấy thông tin khách hàng theo ID
router.get("/:id", customerController.getCustomerById);

// Thêm khách hàng mới
router.post("/", customerController.createCustomer);

// Cập nhật khách hàng
router.put("/:id", customerController.updateCustomer);

// Xóa khách hàng
router.delete("/:id", customerController.deleteCustomer);

module.exports = router;
