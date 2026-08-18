const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  productID: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  stockQuantity: { type: Number, default: 0 },
  type: { type: String },
  imageProduct: { type: String },
  mainIngredients: { type: String },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  rating: {
    type: Number,
    default: 0
  },
  numberOfReviews: {
    type: Number,
    default: 0
  },
});

module.exports = mongoose.model("Product", ProductSchema);
