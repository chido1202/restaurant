const express = require("express");
const router = express.Router();
const billController = require("../controllers/billController");
const middlewareController = require("../middlewares/middlewareController");

router.get("/", middlewareController.authenticate, billController.getAllBills);
router.get("/user", middlewareController.authenticate, billController.getUserBills);
router.get("/:id", middlewareController.authenticate, billController.getBillById);
router.post("/", middlewareController.authenticate, billController.createBill);
router.put("/:id", middlewareController.authenticate, billController.updateBill);
router.delete("/:id", middlewareController.authenticate, middlewareController.authorizeRoles(["admin"]), billController.deleteBill);

module.exports = router;
