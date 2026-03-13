const { User } = require("../../../models");

async function findAll() {
  return User.findAll({
    attributes: ["id", "name", "email", "role"],
    order: [["id", "ASC"]],
  });
}

async function findByEmail(email) {
  return User.findOne({ where: { email } });
}

async function create({ name, email, password_hash, role }) {
  const user = await User.create({ name, email, password_hash, role });
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

async function updateRole(id, role) {
  const user = await User.findByPk(id);
  if (!user) return null;
  user.role = role;
  await user.save();
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

async function remove(id) {
  const user = await User.findByPk(id);
  if (!user) return null;
  await user.destroy();
  return true;
}

module.exports = { findAll, findByEmail, create, updateRole, remove };
