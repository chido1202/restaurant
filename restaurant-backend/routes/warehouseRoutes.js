const express = require("express");
const router = express.Router();
const warehouseController = require("../controllers/warehouseController");
const middlewareController = require("../middlewares/middlewareController");

router.get("/", middlewareController.authenticate, warehouseController.getAllWarehouses);
router.get("/:id", middlewareController.authenticate, warehouseController.getWarehouseById);
router.post("/", middlewareController.authenticate, middlewareController.authorizeRoles(["admin"]), warehouseController.createWarehouse);
router.put("/:id", middlewareController.authenticate, middlewareController.authorizeRoles(["admin"]), warehouseController.updateWarehouse);
router.delete("/:id", middlewareController.authenticate, middlewareController.authorizeRoles(["admin"]), warehouseController.deleteWarehouse);

module.exports = router;
