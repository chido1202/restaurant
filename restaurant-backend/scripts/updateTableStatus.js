/**
 * Script cập nhật trạng thái bàn tự động
 * Chạy script này bằng cron job để tự động cập nhật trạng thái bàn theo thời gian đặt
 */

const mongoose = require('mongoose');
const Table = require('../models/Table');
const Order = require('../models/Order');
require('dotenv').config();

// Kết nối database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Đã kết nối MongoDB'))
  .catch(err => {
    console.error('Lỗi kết nối MongoDB:', err);
    process.exit(1);
  });

async function updateTablesStatus() {
  try {
    const now = new Date();
    console.log(`Cập nhật trạng thái bàn vào lúc: ${now.toISOString()}`);

    // 1. Tìm tất cả bàn đã đặt trước có thời gian đặt trước hiện tại
    const reservedTables = await Table.find({
      status: "reserved",
      reservationTime: { $lte: now }
    });

    console.log(`Tìm thấy ${reservedTables.length} bàn cần cập nhật trạng thái sang "đang sử dụng"`);

    // 2. Cập nhật trạng thái bàn sang "đang sử dụng"
    for (const table of reservedTables) {
      table.status = "occupied";
      await table.save();
      console.log(`Đã cập nhật Bàn ${table.tableID} từ "đã đặt" sang "đang sử dụng"`);
    }

    // 3. Kiểm tra các đơn hàng đã hoàn thành để giải phóng bàn
    const completedOrders = await Order.find({
      status: "completed",
      orderType: "dine-in",
      updatedAt: { $gte: new Date(now - 30 * 60000) } // Đơn hàng hoàn thành trong 30 phút qua
    });

    console.log(`Tìm thấy ${completedOrders.length} đơn hàng hoàn thành cần kiểm tra để giải phóng bàn`);

    for (const order of completedOrders) {
      const table = await Table.findOne({
        tableID: order.tableNumber,
        status: "occupied"
      });

      if (table) {
        table.status = "available";
        table.currentOrderId = null;
        table.reservationTime = null;
        await table.save();
        console.log(`Đã giải phóng Bàn ${table.tableID} từ "đang sử dụng" sang "trống"`);
      }
    }

    console.log('Cập nhật trạng thái bàn hoàn tất');
    mongoose.disconnect();
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái bàn:', error);
    mongoose.disconnect();
    process.exit(1);
  }
}

// Thực thi hàm cập nhật
updateTablesStatus();
