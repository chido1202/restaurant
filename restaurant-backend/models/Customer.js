const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
  customerID: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  address: { type: String },
  phone: { type: String },
  email: { type: String, unique: true },
  customerType: { type: String, enum: ["regular", "vip"], default: "regular" },
  orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  loyaltyPoints: { type: Number, default: 0 },
  membershipTiers: { type: String, enum: ["Bronze", "Silver", "Gold"], default: "Bronze" },
});

module.exports = mongoose.model("Customer", CustomerSchema);
