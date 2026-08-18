const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const middlewareController = require("../middlewares/middlewareController");

// Routes chỉ cho admin
router.get("/", middlewareController.authenticate, middlewareController.authorizeRoles(["admin"]), userController.getAllUsers);
router.post("/", middlewareController.authenticate, middlewareController.authorizeRoles(["admin"]), userController.createUser);
router.get("/:id", middlewareController.authenticate, middlewareController.authorizeRoles(["admin"]), userController.getUserByIdAdmin);
router.put("/:id", middlewareController.authenticate, middlewareController.authorizeRoles(["admin"]), userController.updateUser);
router.delete("/:id", middlewareController.authenticate, middlewareController.authorizeRoles(["admin"]), userController.deleteUser);

// Route cho người dùng đang đăng nhập
router.get("/me", middlewareController.authenticate, userController.getUserById);
router.put("/me", middlewareController.authenticate, userController.updateUserSelf);

module.exports = router;
