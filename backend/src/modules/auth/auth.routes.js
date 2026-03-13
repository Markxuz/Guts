const express = require("express");
const controller = require("./auth.controller");
const { authenticateToken } = require("../../shared/middleware/auth");
const { validateRequest } = require("../../shared/middleware/validateRequest");
const { loginSchema, registerSchema } = require("./auth.schema");

const router = express.Router();

router.post("/login", validateRequest(loginSchema), controller.login);
router.post("/register", validateRequest(registerSchema), controller.register);
router.get("/me", authenticateToken, controller.me);

module.exports = router;
