const mongoose = require("mongoose");

const warehouseProductSchema = new mongoose.Schema({
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 0 }, // Số lượng hàng trong kho
  lastUpdated: { type: Date, default: Date.now }, // Ngày cập nhật gần nhất
});

const WarehouseProduct = mongoose.model("WarehouseProduct", warehouseProductSchema);
module.exports = WarehouseProduct;
