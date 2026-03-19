const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const repository = require("./auth.repository");
const { assertStrongPassword } = require("../../shared/security/passwordPolicy");

const ALLOWED_ROLES = ["admin", "sub_admin", "staff"];

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function buildToken(user) {
  const secret = process.env.JWT_SECRET || "dev-secret-change-me";
  return jwt.sign({ id: user.id, role: user.role, email: user.email, name: user.name }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "8h",
  });
}

function toSafeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    must_change_password: Boolean(user.must_change_password),
  };
}

async function register({ name, email, password, role = "staff", must_change_password = false }) {
  if (!name || !email || !password) {
    const error = new Error("name, email, and password are required");
    error.status = 400;
    throw error;
  }

  if (!ALLOWED_ROLES.includes(role)) {
    const error = new Error("role must be admin, sub_admin, or staff");
    error.status = 400;
    throw error;
  }

  assertStrongPassword(password);

  const normalizedEmail = normalizeEmail(email);
  const existing = await repository.findUserByEmail(normalizedEmail);
  if (existing) {
    const error = new Error("Email already exists");
    error.status = 400;
    throw error;
  }

  const password_hash = await bcrypt.hash(password, 10);
  const user = await repository.createUser({
    name,
    email: normalizedEmail,
    password_hash,
    role,
    must_change_password: Boolean(must_change_password),
  });
  const token = buildToken(user);

  return { token, user: toSafeUser(user) };
}

async function login({ email, password }) {
  if (!email || !password) {
    const error = new Error("email and password are required");
    error.status = 400;
    throw error;
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await repository.findUserByEmail(normalizedEmail);
  if (!user) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  if (user.must_change_password) {
    const error = new Error("Password change required. Please reset your password before continuing.");
    error.status = 403;
    throw error;
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  if (!ALLOWED_ROLES.includes(user.role)) {
    const error = new Error("Access restricted to admin and staff");
    error.status = 403;
    throw error;
  }

  const token = buildToken(user);
  return { token, user: toSafeUser(user) };
}

async function changePassword({ email, currentPassword, newPassword }) {
  if (!email || !currentPassword || !newPassword) {
    const error = new Error("email, currentPassword, and newPassword are required");
    error.status = 400;
    throw error;
  }

  assertStrongPassword(newPassword);

  const normalizedEmail = normalizeEmail(email);
  const user = await repository.findUserByEmail(normalizedEmail);
  if (!user) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isCurrentPasswordValid) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  const isSamePassword = await bcrypt.compare(newPassword, user.password_hash);
  if (isSamePassword) {
    const error = new Error("New password must be different from current password");
    error.status = 400;
    throw error;
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  await repository.updatePassword(user.id, newPasswordHash);

  return { message: "Password updated successfully" };
}

async function getProfile(userId) {
  const user = await repository.findUserById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  return { user: toSafeUser(user) };
}

async function ensureDefaultUsers() {
  const shouldSeedDefaultUsers =
    (process.env.SEED_DEFAULT_USERS || (process.env.NODE_ENV === "production" ? "false" : "true")) === "true";

  if (!shouldSeedDefaultUsers) {
    return;
  }

  const seedAdminEmail = normalizeEmail(process.env.SEED_ADMIN_EMAIL || "admin@guts.local");
  const seedAdminPass = process.env.SEED_ADMIN_PASSWORD || "ChangeMe!Admin123";
  const seedStaffEmail = normalizeEmail(process.env.SEED_STAFF_EMAIL || "staff@guts.local");
  const seedStaffPass = process.env.SEED_STAFF_PASSWORD || "ChangeMe!Staff123";

  const isUsingFallbackCredentials = !process.env.SEED_ADMIN_PASSWORD || !process.env.SEED_STAFF_PASSWORD;
  if (isUsingFallbackCredentials) {
    console.warn("[security] Using fallback seed passwords. Override SEED_* values in .env before sharing outside local setup.");
  }

  const admin = await repository.findUserByEmail(seedAdminEmail);
  if (!admin) {
    await register({
      name: "System Admin",
      email: seedAdminEmail,
      password: seedAdminPass,
      role: "admin",
      must_change_password: true,
    });
  } else if (!admin.must_change_password) {
    await repository.updateMustChangePassword(admin.id, true);
  }

  const staff = await repository.findUserByEmail(seedStaffEmail);
  if (!staff) {
    await register({
      name: "System Staff",
      email: seedStaffEmail,
      password: seedStaffPass,
      role: "staff",
      must_change_password: true,
    });
  } else if (!staff.must_change_password) {
    await repository.updateMustChangePassword(staff.id, true);
  }
}

module.exports = {
  login,
  register,
  changePassword,
  getProfile,
  ensureDefaultUsers,
};
