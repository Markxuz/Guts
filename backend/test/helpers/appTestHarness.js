const request = require("supertest");
const { createApp } = require("../../src/app");
const { ensureDefaultUsers } = require("../../src/modules/auth/auth.service");
const { sequelize } = require("../../models");

let cached;

async function getTestClient() {
  if (!cached) {
    await sequelize.sync({ force: false });
    await ensureDefaultUsers();
    cached = request(createApp());
  }

  return cached;
}

async function loginAsAdmin(client) {
  const response = await client.post("/api/auth/login").send({
    email: "admin@guts.local",
    password: "admin123",
  });

  if (response.status !== 200 || !response.body?.token) {
    throw new Error("Failed to authenticate test admin");
  }

  return response.body.token;
}

module.exports = {
  getTestClient,
  loginAsAdmin,
};
