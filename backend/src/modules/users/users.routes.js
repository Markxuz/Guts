const express = require("express");
const controller = require("./users.controller");
const { authenticateToken, authorizeRoles } = require("../../shared/middleware/auth");

const router = express.Router();

// All user management endpoints are admin-only
router.use(authenticateToken);
router.use(authorizeRoles("admin"));

router.get("/", controller.list);
router.post("/", controller.create);
router.patch("/:id/role", controller.updateRole);
router.delete("/:id", controller.remove);

module.exports = router;
