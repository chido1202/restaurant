const express = require("express");
const router = express.Router();
const tableController = require("../controllers/tableController");
const middlewareController = require("../middlewares/middlewareController");

// Route lấy bàn trống theo thời gian - không yêu cầu đăng nhập
router.get("/available", tableController.getAvailableTables);

// Routes căn bản - không cần xác thực
router.get("/", tableController.getAllTables);
router.get("/:id", tableController.getTableById);

// Routes yêu cầu quyền admin
router.post("/",
  middlewareController.authenticate,
  middlewareController.authorizeRoles(["admin"]),
  tableController.createTable
);

router.put("/:id",
  middlewareController.authenticate,
  middlewareController.authorizeRoles(["admin"]),
  tableController.updateTable
);

router.delete("/:id",
  middlewareController.authenticate,
  middlewareController.authorizeRoles(["admin"]),
  tableController.deleteTable
);

// API cập nhật trạng thái bàn theo thời gian thực (cho cronjob)
router.post("/update-status-by-time",
  middlewareController.authenticate,
  middlewareController.authorizeRoles(["admin"]),
  tableController.updateTableStatus
);

module.exports = router;