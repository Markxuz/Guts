const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const ALLOWED_ROLES = ["admin", "staff"];

function buildToken(user) {
  const secret = process.env.JWT_SECRET || "dev-secret-change-me";
  return jwt.sign({ id: user.id, role: user.role, email: user.email }, secret, {
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
    throw new Error("name, email, and password are required");
  }

  if (!ALLOWED_ROLES.includes(role)) {
    throw new Error("role must be admin or staff");
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw new Error("Email already exists");
  }

  const password_hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password_hash, role });
  const token = buildToken(user);

  return { token, user: toSafeUser(user) };
}

async function login({ email, password }) {
  if (!email || !password) {
    throw new Error("email and password are required");
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  if (!ALLOWED_ROLES.includes(user.role)) {
    throw new Error("Access restricted to admin and staff");
  }

  const token = buildToken(user);
  return { token, user: toSafeUser(user) };
}

async function ensureDefaultUsers() {
  const seedAdminEmail = process.env.SEED_ADMIN_EMAIL || "admin@guts.local";
  const seedAdminPass = process.env.SEED_ADMIN_PASSWORD || "admin123";
  const seedStaffEmail = process.env.SEED_STAFF_EMAIL || "staff@guts.local";
  const seedStaffPass = process.env.SEED_STAFF_PASSWORD || "staff123";

  const admin = await User.findOne({ where: { email: seedAdminEmail } });
  if (!admin) {
    await register({
      name: "System Admin",
      email: seedAdminEmail,
      password: seedAdminPass,
      role: "admin",
    });
  }

  const staff = await User.findOne({ where: { email: seedStaffEmail } });
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
  toSafeUser,
  ensureDefaultUsers,
};
