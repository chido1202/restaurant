const Order = require("../models/Order");
const Customer = require("../models/Customer");
const Employee = require("../models/Employee");
const Bill = require("../models/Bill");

const DashboardController = {
  // Lấy số liệu thống kê tổng quan
  async getStats(req, res) {
    try {
      const customersCount = await Customer.countDocuments();
      const employeesCount = await Employee.countDocuments();
      const ordersCount = await Order.countDocuments();
      const totalRevenue = await Bill.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      res.json({
        customers: customersCount,
        employees: employeesCount,
        orders: ordersCount,
        revenue: totalRevenue[0]?.total || 0,
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy thống kê", error });
    }
  },

  // Lấy doanh thu theo tháng
  async getMonthlyRevenue(req, res) {
    try {
      const monthlyRevenue = await Bill.aggregate([
        {
          $group: {
            _id: { $month: "$createdAt" },
            revenue: { $sum: "$amount" },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const formattedData = monthlyRevenue.map((data) => ({
        month: `Tháng ${data._id}`,
        revenue: data.revenue,
      }));

      res.json(formattedData);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy doanh thu", error });
    }
  },
};

module.exports = DashboardController;
