const express = require("express");
const controller = require("./users.controller");
const { authenticateToken, authorizeRoles } = require("../../shared/middleware/auth");
const { validateRequest } = require("../../shared/middleware/validateRequest");
const { userCreateSchema, userRoleUpdateSchema, userUpdateSchema, idParamSchema } = require("./users.schema");

const router = express.Router();

// All user management endpoints are admin-only
router.use(authenticateToken);
router.use(authorizeRoles("admin"));

router.get("/", controller.list);
router.post("/", validateRequest(userCreateSchema), controller.create);
router.patch("/:id/role", validateRequest(idParamSchema, "params"), validateRequest(userRoleUpdateSchema), controller.updateRole);
router.patch("/:id", validateRequest(idParamSchema, "params"), validateRequest(userUpdateSchema), controller.update);
router.delete("/:id", validateRequest(idParamSchema, "params"), controller.remove);

module.exports = router;
