const express = require("express");
const controller = require("./auth.controller");
const { authenticateToken } = require("../../shared/middleware/auth");
const { validateRequest } = require("../../shared/middleware/validateRequest");
const { loginSchema, registerSchema, changePasswordSchema } = require("./auth.schema");
const { loginRateLimit } = require("../../shared/middleware/loginRateLimit");

const router = express.Router();

router.post("/login", loginRateLimit, validateRequest(loginSchema), controller.login);
router.post("/register", validateRequest(registerSchema), controller.register);
router.post("/change-password", validateRequest(changePasswordSchema), controller.changePassword);
router.get("/me", authenticateToken, controller.me);

module.exports = router;
