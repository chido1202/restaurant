const Category = require("../models/Category");

const categoryController = {
  // Lấy tất cả danh mục
  getAllCategories: async (req, res) => {
    try {
      const categories = await Category.find();
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error });
    }
  },

  // Lấy danh mục theo ID
  getCategoryById: async (req, res) => {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) return res.status(404).json({ message: "Không tìm thấy danh mục" });
      res.status(200).json(category);
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error });
    }
  },

  // Tạo mới một danh mục
  createCategory: async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ message: "Tên danh mục là bắt buộc" });

      const newCategory = new Category({ name });
      await newCategory.save();
      res.status(201).json(newCategory);
    } catch (error) {
      res.status(400).json({ message: "Lỗi khi tạo danh mục", error });
    }
  },

  // Cập nhật thông tin danh mục
  updateCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!name) return res.status(400).json({ message: "Tên danh mục là bắt buộc" });

      const updatedCategory = await Category.findByIdAndUpdate(id, { name }, { new: true });
      if (!updatedCategory) return res.status(404).json({ message: "Không tìm thấy danh mục" });

      res.status(200).json(updatedCategory);
    } catch (error) {
      res.status(400).json({ message: "Lỗi khi cập nhật danh mục", error });
    }
  },

  // Xóa một danh mục
  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const deletedCategory = await Category.findByIdAndDelete(id);
      if (!deletedCategory) return res.status(404).json({ message: "Không tìm thấy danh mục" });

      res.status(200).json({ message: "Xóa danh mục thành công" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error });
    }
  }
};

module.exports = categoryController;
