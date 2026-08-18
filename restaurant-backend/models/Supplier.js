const mongoose = require("mongoose");

const SupplierSchema = new mongoose.Schema({
  supplierID: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  address: { type: String },
  phone: { type: String },
  productCategories: { type: String },
  ratings: { type: String },
});

module.exports = mongoose.model("Supplier", SupplierSchema);
