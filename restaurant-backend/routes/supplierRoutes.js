const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplierController");
const middlewareController = require("../middlewares/middlewareController");

router.get("/", supplierController.getAllSuppliers);
router.get("/:id", supplierController.getSupplierById);
router.post("/", middlewareController.authenticate, middlewareController.authorizeRoles(["admin"]), supplierController.createSupplier);
router.put("/:id", middlewareController.authenticate, middlewareController.authorizeRoles(["admin"]), supplierController.updateSupplier);
router.delete("/:id", middlewareController.authenticate, middlewareController.authorizeRoles(["admin"]), supplierController.deleteSupplier);

module.exports = router;
