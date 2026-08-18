const mongoose = require("mongoose");

const warehouseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Người quản lý kho
  createdAt: { type: Date, default: Date.now },
});

const Warehouse = mongoose.model("Warehouse", warehouseSchema);
module.exports = Warehouse;
