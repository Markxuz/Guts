const service = require("./auth.service");
const { recordActivity } = require("../activity-logs/activity-logs.service");
const { sendHttpError } = require("../../shared/http/response");

async function login(req, res) {
  try {
    const payload = await service.login(req.body);
    await recordActivity({
      userId: payload.user.id,
      action: `${payload.user.name} logged in`,
    });
    return res.status(200).json(payload);
  } catch (error) {
    return sendHttpError(res, error, 401, "Invalid credentials");
  }
}

async function register(req, res) {
  try {
    const payload = await service.register(req.body);
    return res.status(201).json(payload);
  } catch (error) {
    return sendHttpError(res, error, 400, "Registration failed");
  }
}

async function me(req, res) {
  try {
    const payload = await service.getProfile(req.user.id);
    return res.status(200).json(payload);
  } catch (error) {
    return sendHttpError(res, error, 500, "Failed to fetch current user");
  }
}

async function changePassword(req, res) {
  try {
    const payload = await service.changePassword(req.body);

    await recordActivity({
      userId: req.user?.id || null,
      action: `Password changed for ${req.body.email}`,
    });

    return res.status(200).json(payload);
  } catch (error) {
    return sendHttpError(res, error, 400, "Password update failed");
  }
}

module.exports = {
  login,
  register,
  changePassword,
  me,
};
