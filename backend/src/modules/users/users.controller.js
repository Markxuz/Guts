const service = require("./users.service");
const { sendHttpError } = require("../../shared/http/response");
const { recordActivity } = require("../activity-logs/activity-logs.service");

async function list(req, res) {
  try {
    const users = await service.listUsers();
    return res.json(users);
  } catch (error) {
    return sendHttpError(res, error, 500, "Failed to fetch users");
  }
}

async function create(req, res) {
  try {
    const user = await service.createUser(req.body);
    await recordActivity({
      userId: req.user?.id,
      action: `Created user ${user.email} (${user.role})`,
    });
    return res.status(201).json(user);
  } catch (error) {
    return sendHttpError(res, error, 500, "Failed to create user");
  }
}

async function updateRole(req, res) {
  try {
    const user = await service.changeRole(req.params.id, req.body.role, req.user.id);
    await recordActivity({
      userId: req.user?.id,
      action: `Updated role for ${user.email} to ${user.role}`,
    });
    return res.json(user);
  } catch (error) {
    return sendHttpError(res, error, 500, "Failed to update user role");
  }
}

async function remove(req, res) {
  try {
    const users = await service.listUsers();
    const target = users.find((item) => Number(item.id) === Number(req.params.id));

    await service.deleteUser(req.params.id, req.user.id);

    await recordActivity({
      userId: req.user?.id,
      action: `Deleted user ${target?.email || `#${req.params.id}`}`,
    });

    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    return sendHttpError(res, error, 500, "Failed to delete user");
  }
}

module.exports = { list, create, updateRole, remove };
