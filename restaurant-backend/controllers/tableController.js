const Table = require("../models/Table");
const Order = require("../models/Order");

const tableController = {
  getAllTables: async (req, res) => {
    try {
      const tables = await Table.find().sort({ tableID: 1 });
      res.status(200).json(tables);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bàn:", error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },

  getTableById: async (req, res) => {
    try {
      const table = await Table.findById(req.params.id);
      if (!table) {
        return res.status(404).json({ message: "Không tìm thấy bàn" });
      }
      res.status(200).json(table);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin bàn:", error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },

  createTable: async (req, res) => {
    try {
      const newTable = new Table(req.body);
      await newTable.save();
      res.status(201).json(newTable);
    } catch (error) {
      console.error("Lỗi khi tạo bàn mới:", error);
      res.status(400).json({ message: "Lỗi khi tạo bàn", error: error.message });
    }
  },

  updateTable: async (req, res) => {
    try {
      const updatedTable = await Table.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updatedTable) {
        return res.status(404).json({ message: "Không tìm thấy bàn" });
      }
      res.status(200).json(updatedTable);
    } catch (error) {
      console.error("Lỗi khi cập nhật bàn:", error);
      res.status(400).json({ message: "Lỗi khi cập nhật bàn", error: error.message });
    }
  },

  deleteTable: async (req, res) => {
    try {
      const deletedTable = await Table.findByIdAndDelete(req.params.id);
      if (!deletedTable) {
        return res.status(404).json({ message: "Không tìm thấy bàn" });
      }
      res.status(200).json({ message: "Xóa bàn thành công", id: req.params.id });
    } catch (error) {
      console.error("Lỗi khi xóa bàn:", error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },

  // Lấy danh sách bàn trống theo thời gian
  getAvailableTables: async (req, res) => {
    try {
      const { date, time } = req.query;

      if (!date || !time) {
        return res.status(400).json({ message: "Thiếu thông tin ngày và giờ" });
      }

      // Tìm các đơn hàng đã đặt trong khung giờ này
      const bookedTables = await Order.find({
        orderDate: date,
        orderTime: time,
        orderType: "dine-in",
        status: { $nin: ["cancelled", "completed"] }
      }).distinct("tableNumber");

      // Tìm tất cả bàn còn trống
      const availableTables = await Table.find({
        tableID: { $nin: bookedTables },
        status: "available",
        isActive: true
      }).sort({ tableID: 1 });

      res.status(200).json(availableTables);
    } catch (error) {
      console.error("Lỗi khi tìm bàn trống:", error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },

  // Cập nhật trạng thái bàn theo đơn hàng
  updateTableStatus: async (orderId, orderStatus) => {
    try {
      const order = await Order.findById(orderId);

      if (!order || order.orderType !== "dine-in" || !order.tableNumber) {
        return { success: false, message: "Không phải đơn đặt bàn" };
      }

      let tableStatus = "available";

      switch (orderStatus) {
        case "confirmed":
          tableStatus = "reserved";
          break;
        case "completed":
        case "cancelled":
          tableStatus = "available";
          break;
        default:
          tableStatus = "reserved";
      }

      await Table.findOneAndUpdate(
        { tableID: order.tableNumber },
        { status: tableStatus }
      );

      return { success: true };
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái bàn:", error);
      return { success: false, message: error.message };
    }
  }
};

module.exports = tableController;
