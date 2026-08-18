const mongoose = require("mongoose");
const moment = require("moment");

const OrderSchema = new mongoose.Schema({
  orderID: {
    type: String,
    default: () => Math.random().toString(36).substring(2, 12).toUpperCase()
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  reservationDate: {
    type: Date
  },
  reservationTime: {
    type: String
  },
  tableNumber: {
    type: String
  },
  guestCount: {
    type: Number
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed", "cancelled"],
    default: "pending"
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    image: {
      type: String
    }
  }],
  totalPrice: {
    type: Number,
    required: true,
    default: 0
  },
  // Thêm thông tin giảm giá
  discount: {
    code: { type: String },
    discountAmount: { type: Number },
    finalPrice: { type: Number }
  },
  specialNotes: {
    type: String
  },
  orderType: {
    type: String,
    enum: ["dine-in", "takeaway", "delivery"],
    default: "dine-in"
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "card", "online", "vnpay"],
    default: "cash"
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },
  // Thêm thông tin thanh toán VNPay
  vnpayInfo: {
    vnpTxnRef: { type: String },
    vnpAmount: { type: Number },
    vnpPayDate: { type: String },
    vnpBankCode: { type: String },
    vnpCardType: { type: String }
  },
  deliveryAddress: {
    street: { type: String },
    city: { type: String },
    district: { type: String },
    ward: { type: String },
    details: { type: String }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);
