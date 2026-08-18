const crypto = require('crypto');
const moment = require('moment');
const querystring = require('qs');
const Order = require("../models/Order");
const VNPayTransaction = require("../models/VNPayTransaction");
const emailService = require('../utils/emailService');
const billController = require("./billController");

// Cấu hình VNPay
const vnpayConfig = {
  vnp_TmnCode: process.env.VNP_TMN_CODE || "HCFMH9FA",
  vnp_HashSecret: process.env.VNP_HASH_SECRET || "PZPV5H9NQQ76WPYG8GHUWYANINMO3315",
  vnp_Url: process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  vnp_ReturnUrl: process.env.VNP_RETURN_URL || "http://localhost:3000/payment-result"
};

// Hàm sắp xếp object theo key
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

const paymentController = {
  // Tạo URL thanh toán VNPay
  createVNPayUrl: async (req, res) => {
    try {
      const { orderId, amount, orderInfo, bankCode } = req.body;

      if (!orderId || !amount) {
        return res.status(400).json({ success: false, message: "Thiếu thông tin thanh toán" });
      }

      // Kiểm tra đơn hàng tồn tại
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
      }

      // Đảm bảo múi giờ đúng
      process.env.TZ = 'Asia/Ho_Chi_Minh';

      // Lấy địa chỉ IP của client
      const ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket?.remoteAddress

      // Tạo mã giao dịch, cần đảm bảo duy nhất
      const date = new Date();
      const createDate = moment(date).format('YYYYMMDDHHmmss');
      const transactionId = moment(date).format('DDHHmmss');
      const vnpTxnRef = `${order.orderID}-${transactionId}`;

      // Lưu thông tin giao dịch
      const newTransaction = new VNPayTransaction({
        orderId: orderId,
        vnpTxnRef: vnpTxnRef,
        vnpAmount: amount,
        vnpOrderInfo: orderInfo || `Thanh toán đơn hàng ${order.orderID}`,
        status: 'pending'
      });
      await newTransaction.save();

      // Cập nhật phương thức thanh toán đơn hàng
      order.paymentMethod = "vnpay";
      await order.save();
      const tmnCode = vnpayConfig.vnp_TmnCode;
      const secretKey = vnpayConfig.vnp_HashSecret;
      let vnpUrl = vnpayConfig.vnp_Url;
      const returnUrl = vnpayConfig.vnp_ReturnUrl;
      const orderId2 = transactionId;
      const locale = 'vn';
      const currCode = 'VND';
      // Tạo các tham số thanh toán
      let vnp_Params = {};
      vnp_Params['vnp_Version'] = '2.1.0';
      vnp_Params['vnp_Command'] = 'pay';
      vnp_Params['vnp_TmnCode'] = tmnCode;
      vnp_Params['vnp_Locale'] = locale;
      vnp_Params['vnp_CurrCode'] = currCode;
      vnp_Params['vnp_TxnRef'] = vnpTxnRef;
      vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
      vnp_Params['vnp_OrderType'] = 'other';
      vnp_Params['vnp_Amount'] = amount * 100;
      vnp_Params['vnp_ReturnUrl'] = returnUrl;
      vnp_Params['vnp_IpAddr'] = ipAddr;
      vnp_Params['vnp_CreateDate'] = createDate;
      if (bankCode !== null && bankCode !== '') {
        vnp_Params['vnp_BankCode'] = bankCode;
      }

      // Sắp xếp tham số theo thứ tự a-z
      vnp_Params = sortObject(vnp_Params);

      // Tạo chữ ký
      const signData = querystring.stringify(vnp_Params, { encode: false });
      const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
      const signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest('hex');

      // Thêm chữ ký vào params
      vnp_Params['vnp_SecureHash'] = signed;
      vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

      res.status(200).json({ success: true, vnpUrl, vnpTxnRef });
    } catch (error) {
      console.error('Lỗi khi tạo URL thanh toán VNPay:', error);
      res.status(500).json({ success: false, message: "Lỗi khi tạo URL thanh toán", error: error.message });
    }
  },

  // Cập nhật trạng thái thanh toán từ frontend
  updatePaymentStatus: async (req, res) => {
    try {
      const {
        orderId,
        vnpTxnRef,
        vnpResponseCode,
        vnpAmount,
        vnpBankCode,
        vnpCardType,
        vnpPayDate,
        status
      } = req.body;

      if (!orderId || !vnpTxnRef) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin cập nhật thanh toán"
        });
      }

      // Kiểm tra xem đơn hàng có tồn tại không
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đơn hàng"
        });
      }

      // Tìm giao dịch trong database
      const transaction = await VNPayTransaction.findOne({
        orderId: orderId,
        vnpTxnRef: vnpTxnRef
      });

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy giao dịch'
        });
      }

      // Cập nhật thông tin giao dịch
      transaction.vnpPayDate = vnpPayDate || transaction.vnpPayDate;
      transaction.vnpResponseCode = vnpResponseCode || transaction.vnpResponseCode;
      transaction.vnpBankCode = vnpBankCode || transaction.vnpBankCode;
      transaction.vnpCardType = vnpCardType || transaction.vnpCardType;

      // Kiểm tra giao dịch thành công
      if (vnpResponseCode === '00') {
        transaction.status = 'completed';

        // Cập nhật đơn hàng
        order.paymentStatus = 'paid';
        order.status = 'confirmed';
        order.vnpayInfo = {
          vnpTxnRef,
          vnpAmount: vnpAmount || transaction.vnpAmount,
          vnpPayDate: vnpPayDate || transaction.vnpPayDate,
          vnpBankCode: vnpBankCode || transaction.vnpBankCode,
          vnpCardType: vnpCardType || transaction.vnpCardType
        };
        await order.save();

        // Tạo hóa đơn tự động
        const billResult = await billController.createVNPayBill(order._id);
        if (!billResult.success) {
          console.warn("Không thể tạo hóa đơn tự động:", billResult.message);
        }

        // Gửi email xác nhận thanh toán
        if (order.email) {
          try {
            await emailService.sendPaymentConfirmation(order);
          } catch (emailError) {
            console.error("Lỗi gửi email xác nhận thanh toán:", emailError);
          }
        }
      } else if (status === 'failed' || vnpResponseCode !== '00') {
        transaction.status = 'failed';
      }

      await transaction.save();

      return res.status(200).json({
        success: true,
        message: "Cập nhật trạng thái thanh toán thành công",
        order: order
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái thanh toán:', error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi cập nhật trạng thái thanh toán",
        error: error.message
      });
    }
  },

  // Kiểm tra trạng thái thanh toán
  checkPaymentStatus: async (req, res) => {
    try {
      const { orderId } = req.params;

      // Kiểm tra đơn hàng
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
      }

      // Kiểm tra giao dịch VNPay
      const transaction = await VNPayTransaction.findOne({ orderId });

      // Trả về trạng thái thanh toán
      return res.status(200).json({
        success: true,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        transactionStatus: transaction ? transaction.status : null,
        vnpayInfo: order.vnpayInfo
      });
    } catch (error) {
      console.error('Lỗi khi kiểm tra trạng thái thanh toán:', error);
      res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
  }
};

module.exports = paymentController;
