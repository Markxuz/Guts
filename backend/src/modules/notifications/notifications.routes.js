const express = require("express");
const controller = require("./notifications.controller");
const { authenticateToken, authorizeRoles } = require("../../shared/middleware/auth");

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles("admin", "sub_admin"));

router.get("/", controller.list);
router.patch("/read-all", controller.markAllRead);
router.patch("/:id/read", controller.markRead);

module.exports = router;
