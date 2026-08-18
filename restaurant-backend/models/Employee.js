const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  employeeID: { type: String, required: true, unique: true },
  position: { type: String, required: true },
  salary: { type: Number, required: true },
  workShift: { type: String },
  hireDate: { type: Date, default: Date.now },
  performanceMetrics: { type: String },
  ordersServed: { type: Number, default: 0 },
});

module.exports = mongoose.model("Employee", EmployeeSchema);
