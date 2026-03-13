const test = require("node:test");
const assert = require("node:assert/strict");
const { Enrollment, Student, StudentProfile } = require("../../models");
const { getTestClient, loginAsAdmin } = require("../helpers/appTestHarness");

function uniqueEmail() {
  return `student.${Date.now()}.${Math.floor(Math.random() * 100000)}@example.com`;
}

test.describe("Enrollments API contract", () => {
  let client;
  let token;
  const cleanup = {
    enrollmentIds: [],
    studentIds: [],
  };

  test.before(async () => {
    client = await getTestClient();
    token = await loginAsAdmin(client);
  });

  test.afterEach(async () => {
    if (cleanup.enrollmentIds.length) {
      await Enrollment.destroy({ where: { id: cleanup.enrollmentIds } });
      cleanup.enrollmentIds = [];
    }

    if (cleanup.studentIds.length) {
      await StudentProfile.destroy({ where: { student_id: cleanup.studentIds } });
      await Student.destroy({ where: { id: cleanup.studentIds } });
      cleanup.studentIds = [];
    }
  });

  test("POST /api/enrollments creates a valid enrollment resource", async () => {
    const email = uniqueEmail();

    const response = await client
      .post("/api/enrollments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        enrollment_type: "TDC",
        student: {
          first_name: "Contract",
          last_name: "Student",
          email,
          phone: "09170000001",
        },
        profile: {},
        extras: {
          region: "NCR",
        },
        enrollment: {
          client_type: "new",
          status: "pending",
        },
      });

    assert.equal(response.status, 201);
    assert.ok(response.body.id);
    assert.equal(response.body.status, "pending");
    assert.ok(response.body.Student);
    assert.equal(response.body.Student.email, email);
    assert.ok(response.body.DLCode);
    assert.equal(response.body.DLCode.code, "TDC");

    cleanup.enrollmentIds.push(response.body.id);
    cleanup.studentIds.push(response.body.Student.id);
  });

  test("POST /api/enrollments rejects invalid enum payload with validation details", async () => {
    const response = await client
      .post("/api/enrollments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        enrollment_type: "TDC",
        student: {
          first_name: "Bad",
          last_name: "Payload",
        },
        profile: {},
        extras: {},
        enrollment: {
          status: "archived",
        },
      });

    assert.equal(response.status, 400);
    assert.equal(response.body.message, "Validation error");
    assert.equal(Array.isArray(response.body.details), true);
  });

  test("POST /api/enrollments rejects unauthenticated requests", async () => {
    const response = await client.post("/api/enrollments").send({
      enrollment_type: "TDC",
      student: {
        first_name: "No",
        last_name: "Auth",
      },
      profile: {},
      extras: {},
      enrollment: {},
    });

    assert.equal(response.status, 401);
    assert.equal(response.body.message, "Unauthorized");
  });

  test("GET /api/enrollments/:id returns the enrollment resource shape", async () => {
    const email = uniqueEmail();

    const created = await client
      .post("/api/enrollments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        enrollment_type: "TDC",
        student: {
          first_name: "Lookup",
          last_name: "Student",
          email,
        },
        profile: {},
        extras: {},
        enrollment: {
          status: "confirmed",
        },
      });

    cleanup.enrollmentIds.push(created.body.id);
    cleanup.studentIds.push(created.body.Student.id);

    const response = await client
      .get(`/api/enrollments/${created.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.id, created.body.id);
    assert.equal(response.body.status, "confirmed");
    assert.ok(response.body.Student);
    assert.ok(response.body.DLCode);
  });
});
