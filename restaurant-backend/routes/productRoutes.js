const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const middlewareController = require("../middlewares/middlewareController");

router.get("/", productController.getAllProducts);
router.get("/category/:categoryId", productController.getProductsByCategory);
router.get("/:id", productController.getProductById);
router.post("/", middlewareController.authenticate, middlewareController.authorizeRoles(["admin"]), productController.createProduct);
router.put("/:id", middlewareController.authenticate, middlewareController.authorizeRoles(["admin"]), productController.updateProduct);
router.delete("/:id", middlewareController.authenticate, middlewareController.authorizeRoles(["admin"]), productController.deleteProduct);

module.exports = router;
