const { login, register, toSafeUser } = require("../services/authService");
const { User } = require("../models");

async function loginController(req, res) {
  try {
    const payload = await login(req.body);
    return res.status(200).json(payload);
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
}

async function registerController(req, res) {
  try {
    const payload = await register(req.body);
    return res.status(201).json(payload);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function meController(req, res) {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user: toSafeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch profile", error: error.message });
  }
}

module.exports = {
  loginController,
  registerController,
  meController,
};
