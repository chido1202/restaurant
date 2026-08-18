const Customer = require("../models/Customer");

// Lấy danh sách tất cả khách hàng
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy thông tin khách hàng theo ID
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    }
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Thêm khách hàng mới
exports.createCustomer = async (req, res) => {
  try {
    const newCustomer = new Customer(req.body);
    await newCustomer.save();
    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cập nhật thông tin khách hàng
exports.updateCustomer = async (req, res) => {
  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCustomer) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    }
    res.status(200).json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Xóa khách hàng
exports.deleteCustomer = async (req, res) => {
  try {
    const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);
    if (!deletedCustomer) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    }
    res.status(200).json({ message: "Xóa khách hàng thành công" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
