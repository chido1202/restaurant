const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const middlewareController = require("../middlewares/middlewareController");

router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);
router.post("/", middlewareController.authenticate, middlewareController.authorizeRoles(["admin"]), categoryController.createCategory);
router.put("/:id", middlewareController.authenticate, middlewareController.authorizeRoles(["admin"]), categoryController.updateCategory);
router.delete("/:id", middlewareController.authenticate, middlewareController.authorizeRoles(["admin"]), categoryController.deleteCategory);

module.exports = router;
