const test = require("node:test");
const assert = require("node:assert/strict");
const { Course, Enrollment, Instructor, ReportSchedule, Schedule, Student, StudentProfile, Vehicle } = require("../../models");
const { getTestClient, loginAsAdmin } = require("../helpers/appTestHarness");

function uniqueEmail() {
  return `reports.${Date.now()}.${Math.floor(Math.random() * 100000)}@example.com`;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

test.describe("Reports API contract", () => {
  let client;
  let token;
  const cleanup = {
    enrollmentIds: [],
    studentIds: [],
    courseIds: [],
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

    if (cleanup.courseIds.length) {
      await Course.destroy({ where: { id: cleanup.courseIds } });
      cleanup.courseIds = [];
    }
  });

  async function createScheduleRow({ courseName, scheduleDate, startTime, endTime, instructorName, vehicleName, vehicleType, transmissionType }) {
    const course = await Course.create({
      course_name: courseName,
      description: `${courseName} schedule test`,
    });
    const instructor = await Instructor.create({
      name: instructorName,
      license_number: uniqueEmail(),
      specialization: String(courseName).includes("TDC") ? "TDC Certified" : "PDC Certified",
      status: "Active",
      tdc_certified: String(courseName).includes("TDC"),
      pdc_beginner_certified: String(courseName).includes("PDC"),
      pdc_experience_certified: String(courseName).includes("Experience"),
      phone: "09170000013",
    });
    const vehicle = await Vehicle.create({
      vehicle_name: vehicleName,
      plate_number: uniqueEmail().slice(0, 12).toUpperCase(),
      vehicle_type: vehicleType,
      transmission_type: transmissionType,
      status: "Available",
    });
    const schedule = await Schedule.create({
      course_id: course.id,
      instructor_id: instructor.id,
      vehicle_id: vehicle.id,
      schedule_date: scheduleDate,
      start_time: startTime,
      end_time: endTime,
      remarks: `${courseName} schedule row`,
    });

    cleanup.courseIds.push(course.id);
    cleanup.instructorIds.push(instructor.id);
    cleanup.vehicleIds.push(vehicle.id);
    cleanup.scheduleIds.push(schedule.id);

    return schedule;
  }

  async function createTdcEnrollment() {
    const response = await client
      .post("/api/enrollments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        enrollment_type: "TDC",
        student: {
          first_name: "Report",
          last_name: "Tdc",
          email: uniqueEmail(),
          phone: "09170000011",
        },
        profile: {},
        extras: {
          region: "NCR",
          driving_school_tdc: "GUTS Driving School",
          year_completed_tdc: "2026",
        },
        enrollment: {
          client_type: "new",
          status: "pending",
        },
      });

    assert.equal(response.status, 201, JSON.stringify(response.body));
    cleanup.enrollmentIds.push(response.body.id);
    cleanup.studentIds.push(response.body.Student.id);
  }

  async function createPdcEnrollment() {
    const response = await client
      .post("/api/enrollments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        enrollment_type: "PDC",
        student: {
          first_name: "Report",
          last_name: "Pdc",
          email: uniqueEmail(),
          phone: "09170000012",
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
          target_vehicle: "DL Codes B - Car/Sedan (4 wheels - 8 seaters below)",
          transmission_type: "AUTOMATIC TRANSMISSION (A/T) not allowed to drive M/T",
          status: "pending",
        },
      });

    assert.equal(response.status, 201, JSON.stringify(response.body));
    cleanup.enrollmentIds.push(response.body.id);
    cleanup.studentIds.push(response.body.Student.id);
  }

  test("GET /api/reports/daily filters rows by course=tdc", async () => {
    await createTdcEnrollment();
    await createPdcEnrollment();

    const date = todayIso();
    const response = await client
      .get(`/api/reports/daily?date=${date}&course=tdc`)
      .set("Authorization", `Bearer ${token}`);

    assert.equal(response.status, 200, JSON.stringify(response.body));
    assert.equal(Array.isArray(response.body.items), true);
    response.body.items.forEach((item) => {
      assert.equal(item.courseType, "tdc");
    });
  });

  test("GET /api/reports/daily filters rows by course=pdc", async () => {
    await createTdcEnrollment();
    await createPdcEnrollment();

    const date = todayIso();
    const response = await client
      .get(`/api/reports/daily?date=${date}&course=pdc`)
      .set("Authorization", `Bearer ${token}`);

    assert.equal(response.status, 200, JSON.stringify(response.body));
    assert.equal(Array.isArray(response.body.items), true);
    response.body.items.forEach((item) => {
      const normalized = String(item.courseType || "").toLowerCase();
      if (normalized === "schedule") {
        const scheduleCourse = String(item.course || "").toLowerCase();
        assert.equal(scheduleCourse.includes("pdc"), true);
        return;
      }

      assert.equal(normalized === "pdc_beginner" || normalized === "pdc_experience", true);
    });
  });

  test("GET /api/reports/daily keeps TDC schedule rows when course=tdc", async () => {
    const date = todayIso();
    await createScheduleRow({
      courseName: "TDC",
      scheduleDate: date,
      startTime: "08:00:00",
      endTime: "12:00:00",
      instructorName: "Report TDC Instructor",
      vehicleName: "Report TDC Vehicle",
      vehicleType: "Sedan",
      transmissionType: "Automatic",
    });

    const response = await client
      .get(`/api/reports/daily?date=${date}&course=tdc`)
      .set("Authorization", `Bearer ${token}`);

    assert.equal(response.status, 200, JSON.stringify(response.body));
    const scheduleRows = (response.body.items || []).filter((item) => item.courseType === "schedule");
    assert.ok(scheduleRows.length > 0, "Expected at least one schedule row in daily reports");
    assert.ok(scheduleRows.some((item) => String(item.course || "").toUpperCase().includes("TDC")));
  });

  test("GET /api/reports/daily keeps PDC schedule rows when course=pdc", async () => {
    const date = todayIso();
    await createScheduleRow({
      courseName: "PDC Beginner",
      scheduleDate: date,
      startTime: "01:00:00",
      endTime: "05:00:00",
      instructorName: "Report PDC Instructor",
      vehicleName: "Report PDC Vehicle",
      vehicleType: "Sedan",
      transmissionType: "Manual",
    });

    const response = await client
      .get(`/api/reports/daily?date=${date}&course=pdc`)
      .set("Authorization", `Bearer ${token}`);

    assert.equal(response.status, 200, JSON.stringify(response.body));
    const scheduleRows = (response.body.items || []).filter((item) => item.courseType === "schedule");
    assert.ok(scheduleRows.length > 0, "Expected at least one schedule row in daily reports");
    assert.ok(scheduleRows.some((item) => String(item.course || "").toUpperCase().includes("PDC")));
  });

  test("POST /api/reports/schedule-email creates an email schedule", async () => {
    const response = await client
      .post("/api/reports/schedule-email")
      .set("Authorization", `Bearer ${token}`)
      .send({
        recipients: ["owner@example.com", "staff@example.com"],
        frequency: "weekly",
        fileFormat: "pdf",
        course: "overall",
      });

    assert.equal(response.status, 201, JSON.stringify(response.body));
    assert.equal(response.body.message, "Email report schedule saved");
    assert.equal(response.body.schedule.frequency, "weekly");
    assert.equal(response.body.schedule.fileFormat, "pdf");
    assert.equal(Array.isArray(response.body.schedule.recipients), true);
    assert.equal(response.body.schedule.recipients.length, 2);

    const persisted = await ReportSchedule.findByPk(response.body.schedule.id);
    assert.ok(persisted, "Expected report schedule to persist in the database");
    assert.deepEqual(persisted.recipients, ["owner@example.com", "staff@example.com"]);
    assert.equal(persisted.frequency, "weekly");
    assert.equal(persisted.file_format, "pdf");

    await ReportSchedule.destroy({ where: { id: persisted.id } });
  });

  test("POST /api/reports/test-email sends a report preview to the requested recipients", async () => {
    const response = await client
      .post("/api/reports/test-email")
      .set("Authorization", `Bearer ${token}`)
      .send({
        recipients: ["worst.gen00@gmail.com", "joefreysacay28@gmail.com"],
        frequency: "weekly",
        fileFormat: "pdf",
        course: "overall",
      });

    assert.equal(response.status, 200, JSON.stringify(response.body));
    assert.equal(response.body.message, "Test report email sent");
    assert.deepEqual(response.body.recipients, ["worst.gen00@gmail.com", "joefreysacay28@gmail.com"]);
    assert.equal(response.body.fileFormat, "pdf");
    assert.equal(response.body.transportMode === "smtp" || response.body.transportMode === "json-preview", true);
  });

  test("POST /api/reports/send-email sends a real report email payload to recipients", async () => {
    const response = await client
      .post("/api/reports/send-email")
      .set("Authorization", `Bearer ${token}`)
      .send({
        recipients: ["owner@example.com"],
        frequency: "weekly",
        fileFormat: "pdf",
        course: "overall",
      });

    assert.equal(response.status, 200, JSON.stringify(response.body));
    assert.equal(response.body.message, "Report email sent");
    assert.deepEqual(response.body.recipients, ["owner@example.com"]);
    assert.equal(response.body.fileFormat, "pdf");
    assert.equal(response.body.transportMode === "smtp" || response.body.transportMode === "json-preview", true);
  });
});
