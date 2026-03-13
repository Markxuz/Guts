const service = require("./auth.service");
const { recordActivity } = require("../activity-logs/activity-logs.service");

async function login(req, res) {
  try {
    const payload = await service.login(req.body);
    await recordActivity({
      userId: payload.user.id,
      action: `${payload.user.name} logged in`,
    });
    return res.status(200).json(payload);
  } catch (error) {
    const status = error.status || 401;
    return res.status(status).json({ message: error.message });
  }
}

async function register(req, res) {
  try {
    const payload = await service.register(req.body);
    return res.status(201).json(payload);
  } catch (error) {
    const status = error.status || 400;
    return res.status(status).json({ message: error.message });
  }
}

async function me(req, res) {
  try {
    const payload = await service.getProfile(req.user.id);
    return res.status(200).json(payload);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ message: error.message });
  }
}

module.exports = {
  login,
  register,
  me,
};
