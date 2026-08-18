const Warehouse = require("../models/Warehouse");

// Lấy danh sách kho hàng
exports.getAllWarehouses = async (req, res) => {
    try {
        const warehouses = await Warehouse.find();
        res.status(200).json(warehouses);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

// Lấy kho hàng theo ID
exports.getWarehouseById = async (req, res) => {
    try {
        const warehouse = await Warehouse.findById(req.params.id);
        if (!warehouse) return res.status(404).json({ message: "Không tìm thấy kho hàng" });
        res.status(200).json(warehouse);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

// Tạo kho hàng mới
exports.createWarehouse = async (req, res) => {
    try {
        const newWarehouse = new Warehouse(req.body);
        await newWarehouse.save();
        res.status(201).json(newWarehouse);
    } catch (error) {
        res.status(400).json({ message: "Lỗi khi tạo kho hàng", error });
    }
};

// Cập nhật kho hàng
exports.updateWarehouse = async (req, res) => {
    try {
        const updatedWarehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedWarehouse) return res.status(404).json({ message: "Không tìm thấy kho hàng" });
        res.status(200).json(updatedWarehouse);
    } catch (error) {
        res.status(400).json({ message: "Lỗi khi cập nhật kho hàng", error });
    }
};

// Xóa kho hàng
exports.deleteWarehouse = async (req, res) => {
    try {
        const deletedWarehouse = await Warehouse.findByIdAndDelete(req.params.id);
        if (!deletedWarehouse) return res.status(404).json({ message: "Không tìm thấy kho hàng" });
        res.status(200).json({ message: "Xóa kho hàng thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};
