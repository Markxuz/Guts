const test = require("node:test");
const assert = require("node:assert/strict");
const { Course, Instructor, Vehicle, Schedule, Enrollment } = require("../../models");
const { getTestClient, loginAsAdmin } = require("../helpers/appTestHarness");

function uniqueLabel(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

test.describe("Schedules API contract", () => {
  let client;
  let token;
  const cleanup = {
    scheduleIds: [],
    courseIds: [],
    instructorIds: [],
    vehicleIds: [],
  };

  test.before(async () => {
    client = await getTestClient();
    token = await loginAsAdmin(client);
  });

  test.afterEach(async () => {
    if (cleanup.scheduleIds.length) {
      await Enrollment.update(
        { schedule_id: null },
        { where: { schedule_id: cleanup.scheduleIds } }
      );
      await Schedule.destroy({ where: { id: cleanup.scheduleIds } });
      cleanup.scheduleIds = [];
    }

    if (cleanup.courseIds.length) {
      await Course.destroy({ where: { id: cleanup.courseIds } });
      cleanup.courseIds = [];
    }

    if (cleanup.instructorIds.length) {
      await Instructor.destroy({ where: { id: cleanup.instructorIds } });
      cleanup.instructorIds = [];
    }

    if (cleanup.vehicleIds.length) {
      await Vehicle.destroy({ where: { id: cleanup.vehicleIds } });
      cleanup.vehicleIds = [];
    }
  });

  async function createScheduleDependencies() {
    const course = await Course.create({
      course_name: uniqueLabel("Course"),
      description: "Schedule contract test",
    });
    const instructor = await Instructor.create({
      name: uniqueLabel("Instructor"),
      license_number: uniqueLabel("LIC"),
      specialization: "PDC Certified",
      status: "Active",
      phone: "09170000000",
    });
    const vehicle = await Vehicle.create({
      vehicle_name: uniqueLabel("Vehicle"),
      plate_number: uniqueLabel("PLATE"),
      vehicle_type: "Sedan",
    });

    cleanup.courseIds.push(course.id);
    cleanup.instructorIds.push(instructor.id);
    cleanup.vehicleIds.push(vehicle.id);

    return { course, instructor, vehicle };
  }

  test("POST /api/schedules returns wrapped success payload with mapped item", async () => {
    const { course, instructor, vehicle } = await createScheduleDependencies();

    const response = await client
      .post("/api/schedules")
      .set("Authorization", `Bearer ${token}`)
      .send({
        course_id: course.id,
        instructor_id: instructor.id,
        vehicle_id: vehicle.id,
        schedule_date: "2026-03-18",
        slot: "morning",
        remarks: "Morning session",
      });

    assert.equal(response.status, 201);
    assert.equal(response.body.meta?.type, "schedule-create");
    assert.equal(response.body.meta?.date, "2026-03-18");
    assert.equal(response.body.meta?.slot, "morning");
    assert.ok(response.body.data?.item);
    assert.equal(response.body.data.item.scheduleDate, "2026-03-18");
    assert.equal(response.body.data.item.slot, "morning");
    assert.equal(response.body.data.item.course, course.course_name);
    assert.equal(response.body.data.item.instructor, instructor.name);
    assert.match(response.body.data.item.vehicleType, /Sedan|Vehicle/i);

    cleanup.scheduleIds.push(response.body.data.item.id);
  });

  test("POST /api/schedules accepts course_type and returns canonical course label", async () => {
    const { instructor, vehicle } = await createScheduleDependencies();

    const response = await client
      .post("/api/schedules")
      .set("Authorization", `Bearer ${token}`)
      .send({
        course_type: "tdc",
        instructor_id: instructor.id,
        vehicle_id: vehicle.id,
        schedule_date: "2026-03-22",
        slot: "morning",
        remarks: "Type-based schedule",
      });

    assert.equal(response.status, 201);
    assert.equal(response.body.meta?.type, "schedule-create");
    assert.equal(response.body.data?.item?.course, "TDC");

    cleanup.scheduleIds.push(response.body.data.item.id);
  });

  test("GET /api/schedules/day returns wrapped day payload", async () => {
    const { course, instructor, vehicle } = await createScheduleDependencies();

    const created = await client
      .post("/api/schedules")
      .set("Authorization", `Bearer ${token}`)
      .send({
        course_id: course.id,
        instructor_id: instructor.id,
        vehicle_id: vehicle.id,
        schedule_date: "2026-03-19",
        slot: "afternoon",
        remarks: "Afternoon session",
      });

    cleanup.scheduleIds.push(created.body.data.item.id);

    const response = await client
      .get("/api/schedules/day?date=2026-03-19")
      .set("Authorization", `Bearer ${token}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.meta?.type, "schedule-day");
    assert.equal(response.body.meta?.date, "2026-03-19");
    assert.equal(response.body.data?.date, "2026-03-19");
    assert.equal(Array.isArray(response.body.data?.slots), true);
    assert.equal(Array.isArray(response.body.data?.items), true);
    assert.ok(response.body.data.items.some((item) => item.id === created.body.data.item.id));
  });

  test("GET /api/schedules/month-status returns wrapped month payload", async () => {
    const response = await client
      .get("/api/schedules/month-status?year=2026&month=3")
      .set("Authorization", `Bearer ${token}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.meta?.type, "schedule-month-status");
    assert.equal(response.body.data?.year, 2026);
    assert.equal(response.body.data?.month, 3);
    assert.equal(Array.isArray(response.body.data?.items), true);
  });

  test("POST /api/schedules rejects invalid slot with validation error details", async () => {
    const { course, instructor, vehicle } = await createScheduleDependencies();

    const response = await client
      .post("/api/schedules")
      .set("Authorization", `Bearer ${token}`)
      .send({
        course_id: course.id,
        instructor_id: instructor.id,
        vehicle_id: vehicle.id,
        schedule_date: "2026-03-20",
        slot: "evening",
      });

    assert.equal(response.status, 400);
    assert.equal(response.body.message, "Validation error");
    assert.equal(Array.isArray(response.body.details), true);
  });
});
