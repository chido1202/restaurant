const mongoose = require("mongoose");

const OrderDetailsSchema = new mongoose.Schema({
  orderID: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  productID: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

module.exports = mongoose.model("OrderDetails", OrderDetailsSchema);
