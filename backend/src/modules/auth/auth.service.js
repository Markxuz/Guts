const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const repository = require("./auth.repository");

const ALLOWED_ROLES = ["admin", "sub_admin", "staff"];

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
  };
}

async function register({ name, email, password, role = "staff" }) {
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

  const existing = await repository.findUserByEmail(email);
  if (existing) {
    const error = new Error("Email already exists");
    error.status = 400;
    throw error;
  }

  const password_hash = await bcrypt.hash(password, 10);
  const user = await repository.createUser({ name, email, password_hash, role });
  const token = buildToken(user);

  return { token, user: toSafeUser(user) };
}

async function login({ email, password }) {
  if (!email || !password) {
    const error = new Error("email and password are required");
    error.status = 400;
    throw error;
  }

  const user = await repository.findUserByEmail(email);
  if (!user) {
    const error = new Error("Invalid credentials");
    error.status = 401;
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
  const seedAdminEmail = process.env.SEED_ADMIN_EMAIL || "admin@guts.local";
  const seedAdminPass = process.env.SEED_ADMIN_PASSWORD || "admin123";
  const seedStaffEmail = process.env.SEED_STAFF_EMAIL || "staff@guts.local";
  const seedStaffPass = process.env.SEED_STAFF_PASSWORD || "staff123";

  const admin = await repository.findUserByEmail(seedAdminEmail);
  if (!admin) {
    await register({
      name: "System Admin",
      email: seedAdminEmail,
      password: seedAdminPass,
      role: "admin",
    });
  }

  const staff = await repository.findUserByEmail(seedStaffEmail);
  if (!staff) {
    await register({
      name: "System Staff",
      email: seedStaffEmail,
      password: seedStaffPass,
      role: "staff",
    });
  }
}

module.exports = {
  login,
  register,
  getProfile,
  ensureDefaultUsers,
};
