const express = require("express");
const controller = require("./notifications.controller");
const { authenticateToken, authorizeRoles } = require("../../shared/middleware/auth");
const { validateRequest } = require("../../shared/middleware/validateRequest");
const { notificationIdParamSchema } = require("./notifications.schema");

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles("admin", "sub_admin"));

router.get("/", controller.list);
router.patch("/read-all", controller.markAllRead);
router.patch("/:id/read", validateRequest(notificationIdParamSchema, "params"), controller.markRead);

module.exports = router;
