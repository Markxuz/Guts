const service = require("./users.service");

async function list(req, res) {
  try {
    const users = await service.listUsers();
    return res.json(users);
  } catch {
    return res.status(500).json({ message: "Failed to fetch users" });
  }
}

async function create(req, res) {
  try {
    const user = await service.createUser(req.body);
    return res.status(201).json(user);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
}

async function updateRole(req, res) {
  try {
    const user = await service.changeRole(req.params.id, req.body.role, req.user.id);
    return res.json(user);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
}

async function remove(req, res) {
  try {
    await service.deleteUser(req.params.id, req.user.id);
    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
}

module.exports = { list, create, updateRole, remove };
