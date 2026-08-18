const Product = require("../models/Product");
const WarehouseProduct = require("../models/WarehouseProduct");
const Category = require("../models/Category");
const mongoose = require("mongoose"); // Thêm import mongoose

// Thêm hàm cập nhật rating cho sản phẩm
const updateProductRating = async (productId) => {
  try {
    const Review = require('../models/Review');

    // Tính rating trung bình
    const aggregateResult = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId), status: "approved" } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 }
        }
      }
    ]);

    if (aggregateResult.length > 0) {
      const { avgRating, count } = aggregateResult[0];
      await Product.findByIdAndUpdate(productId, {
        rating: avgRating,
        numberOfReviews: count
      });
    } else {
      // Không có đánh giá, reset về 0
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        numberOfReviews: 0
      });
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật rating sản phẩm:', error);
  }
};

const productController = {
  getAllProducts: async (req, res) => {
    try {
      const query = {};
      // Lọc theo danh mục nếu có
      if (req.query.category) {
        query.category = req.query.category;
      }

      const products = await Product.find(query).populate('category', 'name');
      const data = products.map(product => {
        return {
          _id: product._id,
          productID: product.productID,
          name: product.name,
          price: product.price,
          description: product.description,
          stockQuantity: product.stockQuantity,
          type: product.type,
          imageProduct: product.imageProduct,
          mainIngredients: product.mainIngredients,
          category: product.category ? product.category.name : null,
        };
      });
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error });
    }
  },

  getProductById: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id).populate('category', 'name');
      if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

      // Lấy thông tin kho hàng của sản phẩm
      const warehouseProducts = await WarehouseProduct.find({ product: req.params.id })
        .populate('warehouse');

      // Lấy thông tin danh mục (nếu có)
      let category = null;
      if (product.category) {
        category = await Category.findById(product.category);
      }

      res.status(200).json({
        product,
        warehouseProducts,
        category
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error });
    }
  },

  createProduct: async (req, res) => {
    try {
      const newProduct = new Product(req.body);
      await newProduct.save();
      res.status(201).json(newProduct);
    } catch (error) {
      res.status(400).json({ message: "Lỗi khi tạo sản phẩm", error });
    }
  },

  updateProduct: async (req, res) => {
    try {
      if (req.body.category) {
        if (!mongoose.Types.ObjectId.isValid(req.body.category)) {
          delete req.body.category;
        }
      }
      const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedProduct) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
      res.status(200).json(updatedProduct);
    } catch (error) {
      res.status(400).json({ message: "Lỗi khi cập nhật sản phẩm", error });
    }
  },

  deleteProduct: async (req, res) => {
    try {
      const deletedProduct = await Product.findByIdAndDelete(req.params.id);
      if (!deletedProduct) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
      res.status(200).json({ message: "Xóa sản phẩm thành công" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error });
    }
  },

  // Lấy sản phẩm theo danh mục
  getProductsByCategory: async (req, res) => {
    try {
      const { categoryId } = req.params;
      const products = await Product.find({ category: categoryId });
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error });
    }
  },

  // Thêm hàm updateProductRating vào controller để export
  updateProductRating: updateProductRating
};

module.exports = productController;
