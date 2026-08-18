const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");
const middlewareController = require("../middlewares/middlewareController");

router.get("/", middlewareController.authenticate, middlewareController.authorizeRoles(["admin"]), employeeController.getAllEmployees);
router.get("/:id", middlewareController.authenticate, middlewareController.authorizeRoles(["admin"]), employeeController.getEmployeeById);
router.post("/", middlewareController.authenticate, middlewareController.authorizeRoles(["admin"]), employeeController.createEmployee);
router.put("/:id", middlewareController.authenticate, middlewareController.authorizeRoles(["admin"]), employeeController.updateEmployee);
router.delete("/:id", middlewareController.authenticate, middlewareController.authorizeRoles(["admin"]), employeeController.deleteEmployee);

module.exports = router;
