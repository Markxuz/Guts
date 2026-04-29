const test = require("node:test");
const assert = require("node:assert/strict");
const { Enrollment, Student, StudentProfile, Instructor, Vehicle, Schedule } = require("../../models");
const { getTestClient, loginAsAdmin } = require("../helpers/appTestHarness");

function uniqueEmail() {
  return `student.${Date.now()}.${Math.floor(Math.random() * 100000)}@example.com`;
}

function uniqueLabel(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function nextWeekdayIso(weekday, weeksAhead = 4) {
  const base = new Date();
  base.setDate(base.getDate() + weeksAhead * 7);
  const diff = (weekday - base.getDay() + 7) % 7;
  base.setDate(base.getDate() + diff);
  return toIsoDate(base);
}

function addDaysIso(dateIso, daysToAdd) {
  const date = new Date(`${dateIso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + daysToAdd);
  return toIsoDate(date);
}

test.describe("Enrollments API contract", () => {
  let client;
  let token;
  const cleanup = {
    enrollmentIds: [],
    studentIds: [],
    instructorIds: [],
    vehicleIds: [],
    scheduleIds: [],
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

    if (cleanup.enrollmentIds.length) {
      await Enrollment.destroy({ where: { id: cleanup.enrollmentIds } });
      cleanup.enrollmentIds = [];
    }

    if (cleanup.studentIds.length) {
      await StudentProfile.destroy({ where: { student_id: cleanup.studentIds } });
      await Student.destroy({ where: { id: cleanup.studentIds } });
      cleanup.studentIds = [];
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

  async function createPdcScheduleDependencies() {
    const instructor = await Instructor.create({
      name: uniqueLabel("Instructor"),
      license_number: uniqueLabel("LIC"),
      specialization: "PDC Certified",
      status: "Active",
      pdc_beginner_certified: true,
      phone: "09170000000",
    });
    const vehicle = await Vehicle.create({
      vehicle_name: uniqueLabel("Vehicle"),
      plate_number: uniqueLabel("PLATE"),
      vehicle_type: "Sedan",
    });

    cleanup.instructorIds.push(instructor.id);
    cleanup.vehicleIds.push(vehicle.id);

    return { instructor, vehicle };
  }

  async function findAvailableBeginnerStartDate(instructorId, vehicleId) {
    for (let weeksAhead = 6; weeksAhead <= 28; weeksAhead += 1) {
      const dayOne = nextWeekdayIso(1, weeksAhead);
      const dayTwo = addDaysIso(dayOne, 1);

      const [dayOneResponse, dayTwoResponse] = await Promise.all([
        client
          .get(`/api/schedules/day?date=${dayOne}&course_type=pdc_beginner&instructor_id=${instructorId}&vehicle_id=${vehicleId}`)
          .set("Authorization", `Bearer ${token}`),
        client
          .get(`/api/schedules/day?date=${dayTwo}&course_type=pdc_beginner&instructor_id=${instructorId}&vehicle_id=${vehicleId}`)
          .set("Authorization", `Bearer ${token}`),
      ]);

      if (dayOneResponse.status !== 200 || dayTwoResponse.status !== 200) {
        continue;
      }

      const dayOneMorning = (dayOneResponse.body?.data?.slots || []).find((slot) => slot.slot === "morning");
      const dayTwoMorning = (dayTwoResponse.body?.data?.slots || []).find((slot) => slot.slot === "morning");
      if (!dayOneMorning || !dayTwoMorning || dayOneMorning.full || dayTwoMorning.full) {
        continue;
      }

      return dayOne;
    }

    return nextWeekdayIso(1, 6);
  }

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

  test("POST /api/enrollments can create beginner schedule entries in the same transaction", async () => {
    const email = uniqueEmail();
    const { instructor, vehicle } = await createPdcScheduleDependencies();
    const scheduleDate = await findAvailableBeginnerStartDate(instructor.id, vehicle.id);

    const response = await client
      .post("/api/enrollments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        enrollment_type: "PDC",
        student: {
          first_name: "Integrated",
          last_name: "Schedule",
          email,
          phone: "09170000009",
        },
        profile: {},
        extras: {
          region: "NCR",
          driving_school_tdc: "GUTS Driving School",
          year_completed_tdc: "2026",
        },
        enrollment: {
          client_type: "new",
          pdc_category: "Beginner",
          status: "pending",
        },
        schedule: {
          enabled: true,
          schedule_date: scheduleDate,
          slot: "morning",
          instructor_id: instructor.id,
          vehicle_id: vehicle.id,
        },
      });

    assert.equal(response.status, 201, JSON.stringify(response.body));
    assert.ok(response.body.id);
    assert.ok(response.body.schedule);
    assert.equal(response.body.schedule.courseType, "pdc_beginner");
    assert.equal(Array.isArray(response.body.schedule.createdItems), true);
    assert.equal(response.body.schedule.createdItems.length, 2);

    cleanup.enrollmentIds.push(response.body.id);
    cleanup.studentIds.push(response.body.Student.id);
    cleanup.scheduleIds.push(...response.body.schedule.createdItems.map((item) => item.id));
  });
});
