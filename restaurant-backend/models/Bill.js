const mongoose = require("mongoose");

const BillSchema = new mongoose.Schema({
  billNumber: { type: Number, required: true, unique: true },
  orderID: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  issueDate: { type: Date, default: Date.now },
  totalAmount: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ["cash", "card", "online", "vnpay"],
    default: "cash"
  },
  paymentDetails: { type: String },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },
  paymentReference: { type: String },  // Mã tham chiếu thanh toán
  transactionId: { type: String },     // ID giao dịch từ VNPay
});

module.exports = mongoose.model("Bill", BillSchema);
