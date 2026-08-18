const Bill = require("../models/Bill");
const Order = require("../models/Order");
const VNPayTransaction = require("../models/VNPayTransaction");

const billController = {
  // Lấy tất cả hóa đơn
  getAllBills: async (req, res) => {
    try {
      const bills = await Bill.find().populate("orderID").sort({ issueDate: -1 });
      res.status(200).json(bills);
    } catch (error) {
      console.error("Error fetching bills:", error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },

  // Lấy chi tiết hóa đơn theo ID
  getBillById: async (req, res) => {
    try {
      const bill = await Bill.findById(req.params.id).populate("orderID");
      if (!bill) {
        return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
      }
      res.status(200).json(bill);
    } catch (error) {
      console.error("Error fetching bill:", error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },

  // Tạo hóa đơn mới
  createBill: async (req, res) => {
    try {
      // Kiểm tra nếu đơn hàng đã có hóa đơn
      const existingBill = await Bill.findOne({ orderID: req.body.orderID });
      if (existingBill) {
        return res.status(400).json({ message: "Đơn hàng này đã có hóa đơn" });
      }

      // Tạo số hóa đơn mới
      const billCount = await Bill.countDocuments();
      const billNumber = billCount + 1000; // Bắt đầu từ 1000

      // Lấy thông tin từ đơn hàng
      const order = await Order.findById(req.body.orderID);
      if (!order) {
        return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      }

      // Nếu là thanh toán VNPay, kiểm tra giao dịch
      let paymentDetails = "";
      let paymentReference = "";
      let transactionId = "";

      if (order.paymentMethod === "vnpay" && order.vnpayInfo) {
        const vnpayTransaction = await VNPayTransaction.findOne({
          vnpTxnRef: order.vnpayInfo.vnpTxnRef
        });

        if (vnpayTransaction) {
          paymentDetails = `Thanh toán qua VNPay - Ngân hàng: ${order.vnpayInfo.vnpBankCode || 'Không xác định'}`;
          paymentReference = order.vnpayInfo.vnpTxnRef;
          transactionId = vnpayTransaction._id.toString();
        }
      }

      // Tạo hóa đơn mới
      const newBill = new Bill({
        billNumber,
        orderID: req.body.orderID,
        totalAmount: order.discount?.finalPrice || order.totalPrice,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        paymentDetails,
        paymentReference,
        transactionId
      });

      const savedBill = await newBill.save();

      // Cập nhật trạng thái đơn hàng nếu cần
      if (req.body.updateOrderStatus && order.status === "pending") {
        order.status = "confirmed";
        await order.save();
      }

      res.status(201).json({
        message: "Tạo hóa đơn thành công",
        bill: savedBill
      });
    } catch (error) {
      console.error("Error creating bill:", error);
      res.status(500).json({ message: "Lỗi khi tạo hóa đơn", error: error.message });
    }
  },

  // Cập nhật hóa đơn
  updateBill: async (req, res) => {
    try {
      const updatedBill = await Bill.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!updatedBill) {
        return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
      }
      res.status(200).json({
        message: "Cập nhật hóa đơn thành công",
        bill: updatedBill
      });
    } catch (error) {
      console.error("Error updating bill:", error);
      res.status(400).json({ message: "Lỗi khi cập nhật hóa đơn", error: error.message });
    }
  },

  // Xóa hóa đơn
  deleteBill: async (req, res) => {
    try {
      const deletedBill = await Bill.findByIdAndDelete(req.params.id);
      if (!deletedBill) {
        return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
      }
      res.status(200).json({
        message: "Xóa hóa đơn thành công",
        billId: deletedBill._id
      });
    } catch (error) {
      console.error("Error deleting bill:", error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },

  // Tạo hóa đơn tự động khi thanh toán VNPay thành công
  createVNPayBill: async (orderId) => {
    try {
      // Kiểm tra nếu đã có hóa đơn
      const existingBill = await Bill.findOne({ orderID: orderId });
      if (existingBill) {
        return { success: false, message: "Đơn hàng này đã có hóa đơn" };
      }

      // Lấy thông tin từ đơn hàng
      const order = await Order.findById(orderId);
      if (!order) {
        return { success: false, message: "Không tìm thấy đơn hàng" };
      }

      if (order.paymentMethod !== "vnpay" || !order.vnpayInfo) {
        return { success: false, message: "Đơn hàng không phải thanh toán VNPay" };
      }

      // Tạo số hóa đơn mới
      const billCount = Math.floor(Math.random() * 10000); // Giả lập số hóa đơn
      const billNumber = billCount + Math.floor(Math.random() * 1000); // Bắt đầu từ 1000

      // Lấy thông tin giao dịch VNPay
      const vnpayTransaction = await VNPayTransaction.findOne({
        vnpTxnRef: order.vnpayInfo.vnpTxnRef
      });

      if (!vnpayTransaction) {
        return { success: false, message: "Không tìm thấy giao dịch VNPay" };
      }

      // Tạo hóa đơn mới
      const newBill = new Bill({
        billNumber,
        orderID: orderId,
        totalAmount: order.discount?.finalPrice || order.totalPrice,
        paymentMethod: "vnpay",
        paymentStatus: order.paymentStatus,
        paymentDetails: `Thanh toán qua VNPay - Ngân hàng: ${order.vnpayInfo.vnpBankCode || 'Không xác định'}`,
        paymentReference: order.vnpayInfo.vnpTxnRef,
        transactionId: vnpayTransaction._id.toString()
      });

      const savedBill = await newBill.save();
      return { success: true, bill: savedBill };
    } catch (error) {
      console.error("Error creating VNPay bill:", error);
      return { success: false, message: error.message };
    }
  },

  // Lấy hóa đơn của người dùng hiện tại
  getUserBills: async (req, res) => {
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: "Bạn cần đăng nhập để xem hóa đơn" });
      }

      // Đầu tiên lấy các đơn hàng của người dùng
      const userOrders = await Order.find({ customerId: req.user.userId });

      if (!userOrders || userOrders.length === 0) {
        return res.status(200).json([]);
      }

      // Lấy các ID của đơn hàng
      const orderIds = userOrders.map(order => order._id);

      // Tìm tất cả hóa đơn có orderID nằm trong danh sách đơn hàng của người dùng
      const bills = await Bill.find({ orderID: { $in: orderIds } })
        .populate("orderID")
        .sort({ issueDate: -1 });

      res.status(200).json(bills);
    } catch (error) {
      console.error("Error fetching user bills:", error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },
};

module.exports = billController;
