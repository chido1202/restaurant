const Order = require("../models/Order");
const User = require("../models/User");
const Table = require("../models/Table"); // Thêm import model Table
const tableController = require("./tableController");
const emailService = require('../utils/emailService');

const orderController = {
  getAllOrders: async (req, res) => {
    try {
      let query = {};

      // Nếu không phải admin, chỉ hiển thị đơn hàng của người dùng đó
      if (req.user && req.user.role !== "admin") {
        query.customerId = req.user.userId;
      }

      const orders = await Order.find(query).sort({ createdAt: -1 });
      res.status(200).json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },

  getOrderById: async (req, res) => {
    try {
      const order = await Order.findById(req.params.id)
        .populate("customerId", "name email phone");

      if (!order) {
        return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      }

      // Kiểm tra quyền truy cập - chỉ admin hoặc chủ đơn hàng mới xem được
      // if (req.user.role !== "admin" && order.customerId &&
      //   order.customerId.toString() !== req.user.userId) {
      //   return res.status(403).json({ message: "Bạn không có quyền xem đơn hàng này" });
      // }

      res.status(200).json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },

  createOrder: async (req, res) => {
    try {
      const orderData = req.body;

      // Kiểm tra và xử lý dữ liệu đầu vào
      if (!orderData.name || !orderData.phone) {
        return res.status(400).json({
          message: "Thiếu thông tin khách hàng cần thiết"
        });
      }

      // Kiểm tra định dạng email nếu có
      if (orderData.email && !orderData.email.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)) {
        return res.status(400).json({
          message: "Định dạng email không hợp lệ"
        });
      }

      // Tạo đơn hàng mới với thông tin đầy đủ, bao gồm cả thông tin giảm giá nếu có
      const newOrder = new Order(orderData);

      // Lưu đơn hàng vào database
      await newOrder.save();

      // Nếu là đặt bàn (dine-in), cập nhật trạng thái bàn
      if (orderData.orderType === 'dine-in' && orderData.tableNumber) {
        await Table.findOneAndUpdate(
          { tableID: orderData.tableNumber },
          { status: 'reserved' }
        );
      }

      // Gửi email xác nhận đặt bàn/đặt món
      if (orderData.email) {
        try {
          emailService.sendOrderConfirmation(newOrder);
        } catch (emailError) {
          console.error("Lỗi gửi email xác nhận đặt bàn:", emailError);
          // Không trả về lỗi cho client vì quá trình đặt bàn vẫn thành công
        }
      }

      res.status(201).json({
        message: "Đặt hàng thành công",
        order: newOrder
      });
    } catch (error) {
      console.error('Lỗi khi tạo đơn hàng:', error);
      res.status(500).json({
        message: "Lỗi khi tạo đơn hàng",
        error: error.message
      });
    }
  },

  updateOrder: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, paymentStatus } = req.body;

      // Tìm và cập nhật đơn hàng
      const updatedOrder = await Order.findByIdAndUpdate(
        id,
        {
          status,
          paymentStatus,
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      );

      if (!updatedOrder) {
        return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      }

      // Nếu đơn hàng thuộc loại đặt bàn (dine-in), cập nhật trạng thái bàn
      if (updatedOrder.orderType === "dine-in" && updatedOrder.tableNumber) {
        const tableResult = await tableController.updateTableStatus(id, status);
        if (!tableResult.success) {
          console.warn("Cảnh báo: Không thể cập nhật trạng thái bàn:", tableResult.message);
        }
      }

      res.status(200).json({
        message: "Cập nhật đơn hàng thành công",
        order: updatedOrder
      });
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(400).json({ message: "Lỗi khi cập nhật đơn hàng", error: error.message });
    }
  },

  deleteOrder: async (req, res) => {
    try {
      const { id } = req.params;

      // Chỉ admin mới có quyền xóa đơn hàng
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Bạn không có quyền xóa đơn hàng" });
      }

      const deletedOrder = await Order.findByIdAndDelete(id);

      if (!deletedOrder) {
        return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      }

      // Xóa tham chiếu trong User nếu cần
      if (deletedOrder.customerId) {
        await User.findByIdAndUpdate(deletedOrder.customerId, {
          $pull: { orderHistory: deletedOrder._id }
        });
      }

      res.status(200).json({
        message: "Xóa đơn hàng thành công",
        orderId: deletedOrder._id
      });
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },

  // API lấy đơn hàng của người dùng hiện tại
  getUserOrders: async (req, res) => {
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: "Bạn cần đăng nhập để xem đơn hàng" });
      }

      const orders = await Order.find({ customerId: req.user.userId })
        .sort({ createdAt: -1 });

      res.status(200).json(orders);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },

  // API hủy đơn hàng
  cancelOrder: async (req, res) => {
    try {
      const { id } = req.params;
      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      }

      // Kiểm tra quyền hủy đơn hàng
      if (req.user.role !== "admin" && order.customerId.toString() !== req.user.userId) {
        return res.status(403).json({ message: "Bạn không có quyền hủy đơn hàng này" });
      }

      // Kiểm tra trạng thái đơn hàng
      if (order.status === "completed") {
        return res.status(400).json({ message: "Không thể hủy đơn hàng đã hoàn thành" });
      }

      order.status = "cancelled";
      order.updatedAt = new Date();
      await order.save();

      // Nếu đơn hàng thuộc loại đặt bàn (dine-in), cập nhật trạng thái bàn
      if (order.orderType === "dine-in" && order.tableNumber) {
        await tableController.updateTableStatus(id, "cancelled");
      }

      res.status(200).json({
        message: "Hủy đơn hàng thành công",
        order
      });
    } catch (error) {
      console.error("Error cancelling order:", error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  }
};

module.exports = orderController;