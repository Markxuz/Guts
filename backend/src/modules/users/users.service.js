const bcrypt = require("bcryptjs");
const repository = require("./users.repository");
const { assertStrongPassword } = require("../../shared/security/passwordPolicy");

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
  assertStrongPassword(password);

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await repository.findByEmail(normalizedEmail);
  if (existing) {
    const err = new Error("Email already in use");
    err.status = 400;
    throw err;
  }
  const password_hash = await bcrypt.hash(password, 10);
  return repository.create({ name, email: normalizedEmail, password_hash, role });
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

async function updateUser(id, payload, requesterId) {
  const userId = Number(id);
  const target = await repository.findById(userId);
  if (!target) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  const fieldsToUpdate = {};

  if (typeof payload.name === "string") {
    const name = payload.name.trim();
    if (!name) {
      const err = new Error("Name cannot be empty");
      err.status = 400;
      throw err;
    }
    fieldsToUpdate.name = name;
  }

  if (typeof payload.email === "string") {
    const normalizedEmail = payload.email.trim().toLowerCase();
    if (!normalizedEmail) {
      const err = new Error("Email cannot be empty");
      err.status = 400;
      throw err;
    }

    const existing = await repository.findByEmail(normalizedEmail);
    if (existing && Number(existing.id) !== userId) {
      const err = new Error("Email already in use");
      err.status = 400;
      throw err;
    }

    fieldsToUpdate.email = normalizedEmail;
  }

  if (typeof payload.role === "string") {
    if (!VALID_ROLES.includes(payload.role)) {
      const err = new Error(`role must be one of: ${VALID_ROLES.join(", ")}`);
      err.status = 400;
      throw err;
    }

    if (Number(requesterId) === userId && payload.role !== target.role) {
      const err = new Error("Cannot change your own role");
      err.status = 400;
      throw err;
    }

    fieldsToUpdate.role = payload.role;
  }

  if (typeof payload.newPassword === "string" && payload.newPassword.length > 0) {
    assertStrongPassword(payload.newPassword);

    const isSamePassword = await bcrypt.compare(payload.newPassword, target.password_hash);
    if (isSamePassword) {
      const err = new Error("New password must be different from current password");
      err.status = 400;
      throw err;
    }

    fieldsToUpdate.password_hash = await bcrypt.hash(payload.newPassword, 10);
    fieldsToUpdate.must_change_password =
      typeof payload.mustChangePassword === "boolean" ? payload.mustChangePassword : true;
  } else if (typeof payload.mustChangePassword === "boolean") {
    fieldsToUpdate.must_change_password = payload.mustChangePassword;
  }

  if (Object.keys(fieldsToUpdate).length === 0) {
    const err = new Error("No update fields provided");
    err.status = 400;
    throw err;
  }

  return repository.updateUser(userId, fieldsToUpdate);
}

module.exports = { listUsers, createUser, changeRole, updateUser, deleteUser };
