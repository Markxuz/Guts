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

async function findById(id) {
  return User.findByPk(id);
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

async function updateUser(id, fields) {
  const user = await User.findByPk(id);
  if (!user) return null;

  if (typeof fields.name === "string") {
    user.name = fields.name;
  }
  if (typeof fields.email === "string") {
    user.email = fields.email;
  }
  if (typeof fields.role === "string") {
    user.role = fields.role;
  }
  if (typeof fields.password_hash === "string") {
    user.password_hash = fields.password_hash;
  }
  if (typeof fields.must_change_password === "boolean") {
    user.must_change_password = fields.must_change_password;
  }

  await user.save();

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    must_change_password: Boolean(user.must_change_password),
  };
}

async function remove(id) {
  const user = await User.findByPk(id);
  if (!user) return null;
  await user.destroy();
  return true;
}

module.exports = { findAll, findByEmail, findById, create, updateRole, updateUser, remove };
