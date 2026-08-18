const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const middlewareController = require("../middlewares/middlewareController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get('/profile', middlewareController.authenticate, authController.getUserProfile);


module.exports = router;
