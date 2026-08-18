const mongoose = require("mongoose");

const VNPayTransactionSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },
  vnpTxnRef: {
    type: String,
    required: true,
    unique: true
  },
  vnpAmount: {
    type: Number,
    required: true
  },
  vnpPayDate: {
    type: String
  },
  vnpOrderInfo: {
    type: String
  },
  vnpResponseCode: {
    type: String
  },
  vnpTransactionStatus: {
    type: String
  },
  vnpBankCode: {
    type: String
  },
  vnpBankTranNo: {
    type: String
  },
  vnpCardType: {
    type: String
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending"
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

module.exports = mongoose.model("VNPayTransaction", VNPayTransactionSchema);
