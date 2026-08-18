const Supplier = require("../models/Supplier");

const supplierController = {
  getAllSuppliers: async (req, res) => {
    try {
      const suppliers = await Supplier.find();
      res.status(200).json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error });
    }
  },

  getSupplierById: async (req, res) => {
    try {
      const supplier = await Supplier.findById(req.params.id);
      if (!supplier) return res.status(404).json({ message: "Không tìm thấy nhà cung cấp" });
      res.status(200).json(supplier);
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error });
    }
  },

  createSupplier: async (req, res) => {
    try {
      const newSupplier = new Supplier(req.body);
      await newSupplier.save();
      res.status(201).json(newSupplier);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi tạo nhà cung cấp", error });
    }
  },

  updateSupplier: async (req, res) => {
    try {
      const updatedSupplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedSupplier) return res.status(404).json({ message: "Không tìm thấy nhà cung cấp" });
      res.status(200).json(updatedSupplier);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi cập nhật nhà cung cấp", error });
    }
  },

  deleteSupplier: async (req, res) => {
    try {
      const deletedSupplier = await Supplier.findByIdAndDelete(req.params.id);
      if (!deletedSupplier) return res.status(404).json({ message: "Không tìm thấy nhà cung cấp" });
      res.status(200).json({ message: "Đã xóa nhà cung cấp" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi xóa nhà cung cấp", error });
    }
  }
};

module.exports = supplierController;
