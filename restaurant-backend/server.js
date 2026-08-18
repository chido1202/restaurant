const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((error) => console.error("MongoDB Connection Error:", error));

// Import các route
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const userRoutes = require("./routes/userRoutes");
const customerRoutes = require("./routes/customerRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const billRoutes = require("./routes/billRoutes");
const tableRoutes = require("./routes/tableRoutes");
const warehouseRoutes = require("./routes/warehouseRoutes");
const eventRoutes = require("./routes/eventRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reviewRoutes = require('./routes/api/reviewRoutes');
const paymentRoutes = require("./routes/paymentRoutes"); // Thêm routes thanh toán

// Middleware logger
const INFO = "\x1b[34m";
const RESET = "\x1b[0m";
const DEBUG = "\x1b[35m";
app.use((req, res, next) => {
  const time = new Date().toLocaleTimeString();
  console.log(
    `${INFO} [${time}] ${req.method} ${req.url
    }${RESET} ${DEBUG}${JSON.stringify(req.body)}${RESET}`
  );
  next();
});

// Đăng ký các routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/warehouse", warehouseRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/discounts", require("./routes/discountRoutes"));
app.use('/api/reviews', reviewRoutes);
app.use('/api/payment', paymentRoutes); // Thêm routes thanh toán

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
