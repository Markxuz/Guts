const express = require("express");
const {
  loginController,
  registerController,
  meController,
} = require("../controllers/authController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", loginController);
router.post("/register", registerController);
router.get("/me", authenticateToken, meController);

module.exports = router;
