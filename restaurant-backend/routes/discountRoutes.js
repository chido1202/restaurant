const express = require("express");
const router = express.Router();
const discountController = require("../controllers/discountController");
const middlewareController = require("../middlewares/middlewareController");

router.get("/", discountController.getAllDiscounts);
router.get("/:id", discountController.getDiscountById);
router.get("/code/:code", discountController.getDiscountByCode);
router.post("/", middlewareController.authenticate, middlewareController.authorizeRoles(["admin"]), discountController.createDiscount);
router.put("/:id", middlewareController.authenticate, middlewareController.authorizeRoles(["admin"]), discountController.updateDiscount);
router.delete("/:id", middlewareController.authenticate, middlewareController.authorizeRoles(["admin"]), discountController.deleteDiscount);
router.post("/apply", discountController.applyDiscount);
router.post("/increment-usage/:code", middlewareController.authenticate, discountController.incrementUsage);

module.exports = router;
