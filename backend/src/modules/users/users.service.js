const bcrypt = require("bcryptjs");
const repository = require("./users.repository");

const VALID_ROLES = ["admin", "sub_admin", "staff"];

async function listUsers() {
  return repository.findAll();
}

async function createUser({ name, email, password, role = "staff" }) {
  if (!name || !email || !password) {
    const err = new Error("name, email, and password are required");
    err.status = 400;
    throw err;
  }
  if (!VALID_ROLES.includes(role)) {
    const err = new Error(`role must be one of: ${VALID_ROLES.join(", ")}`);
    err.status = 400;
    throw err;
  }
  const existing = await repository.findByEmail(email);
  if (existing) {
    const err = new Error("Email already in use");
    err.status = 400;
    throw err;
  }
  const password_hash = await bcrypt.hash(password, 10);
  return repository.create({ name, email, password_hash, role });
}

async function changeRole(id, role, requesterId) {
  if (Number(id) === Number(requesterId)) {
    const err = new Error("Cannot change your own role");
    err.status = 400;
    throw err;
  }
  if (!VALID_ROLES.includes(role)) {
    const err = new Error(`role must be one of: ${VALID_ROLES.join(", ")}`);
    err.status = 400;
    throw err;
  }
  const updated = await repository.updateRole(id, role);
  if (!updated) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
  return updated;
}

async function deleteUser(id, requesterId) {
  if (Number(id) === Number(requesterId)) {
    const err = new Error("Cannot delete your own account");
    err.status = 400;
    throw err;
  }
  const result = await repository.remove(id);
  if (!result) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
}

module.exports = { listUsers, createUser, changeRole, deleteUser };
