const test = require("node:test");
const assert = require("node:assert/strict");
const { User } = require("../../models");
const { getTestClient, loginAsAdmin } = require("../helpers/appTestHarness");

function uniqueEmail(prefix = "admin-tools") {
  return `${prefix}.${Date.now()}.${Math.floor(Math.random() * 100000)}@example.com`;
}

test.describe("Admin tools API contract", () => {
  let client;
  let token;
  const cleanup = {
    userIds: [],
  };

  test.before(async () => {
    client = await getTestClient();
    token = await loginAsAdmin(client);
  });

  test.afterEach(async () => {
    if (cleanup.userIds.length) {
      await User.destroy({ where: { id: cleanup.userIds } });
      cleanup.userIds = [];
    }
  });

  test("PATCH /api/users/:id updates editable user fields", async () => {
    const createResponse = await client
      .post("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Contract User",
        email: uniqueEmail("create"),
        password: "ChangeMe!User123",
        role: "staff",
      });

    assert.equal(createResponse.status, 201);
    cleanup.userIds.push(createResponse.body.id);

    const patchResponse = await client
      .patch(`/api/users/${createResponse.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Contract User Updated",
        email: uniqueEmail("update"),
        role: "sub_admin",
        mustChangePassword: true,
      });

    assert.equal(patchResponse.status, 200);
    assert.equal(patchResponse.body.id, createResponse.body.id);
    assert.equal(patchResponse.body.name, "Contract User Updated");
    assert.equal(patchResponse.body.role, "sub_admin");
    assert.equal(patchResponse.body.must_change_password, true);
    assert.match(patchResponse.body.email, /^update\./);
  });

  test("GET /api/backups/status returns backup metadata", async () => {
    const response = await client
      .get("/api/backups/status")
      .set("Authorization", `Bearer ${token}`);

    assert.equal(response.status, 200);
    assert.equal(typeof response.body.backupDir, "string");
    assert.ok(Object.prototype.hasOwnProperty.call(response.body, "status"));
    assert.ok(Object.prototype.hasOwnProperty.call(response.body, "latestBackup"));
  });

  test("POST /api/backups/run executes manual backup", async () => {
    const response = await client
      .post("/api/backups/run")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    assert.equal(response.status, 201);
    assert.equal(response.body.message, "Backup completed successfully");
    assert.equal(response.body.status, "success");
    assert.equal(response.body.mode, "manual");
    assert.equal(typeof response.body.backupFileName, "string");
  });
});
