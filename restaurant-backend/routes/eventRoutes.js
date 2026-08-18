const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const middlewareController = require("../middlewares/middlewareController");

router.get("/", eventController.getAllEvents);
router.get("/active", eventController.getActiveEvents);
router.get("/:id", eventController.getEventById);
router.post("/", middlewareController.authenticate, middlewareController.authorizeRoles(["admin"]), eventController.createEvent);
router.put("/:id", middlewareController.authenticate, middlewareController.authorizeRoles(["admin"]), eventController.updateEvent);
router.delete("/:id", middlewareController.authenticate, middlewareController.authorizeRoles(["admin"]), eventController.deleteEvent);

module.exports = router;
