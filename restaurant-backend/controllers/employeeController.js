const Employee = require("../models/Employee");

const employeeController = {
  getAllEmployees: async (req, res) => {
    try {
      const employees = await Employee.find();
      res.status(200).json(employees);
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error });
    }
  },

  getEmployeeById: async (req, res) => {
    try {
      const employee = await Employee.findById(req.params.id);
      if (!employee) return res.status(404).json({ message: "Không tìm thấy nhân viên" });
      res.status(200).json(employee);
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error });
    }
  },

  createEmployee: async (req, res) => {
    try {
      const newEmployee = new Employee(req.body);
      await newEmployee.save();
      res.status(201).json(newEmployee);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi tạo nhân viên", error });
    }
  },

  updateEmployee: async (req, res) => {
    try {
      const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedEmployee) return res.status(404).json({ message: "Không tìm thấy nhân viên" });
      res.status(200).json(updatedEmployee);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi cập nhật nhân viên", error });
    }
  },

  deleteEmployee: async (req, res) => {
    try {
      const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
      if (!deletedEmployee) return res.status(404).json({ message: "Không tìm thấy nhân viên" });
      res.status(200).json({ message: "Đã xóa nhân viên" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi xóa nhân viên", error });
    }
  }
};

module.exports = employeeController;
