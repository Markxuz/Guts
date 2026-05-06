const repository = require("./students.repository");
const { sequelize } = require("../../../models");
const schedulesService = require("../schedules/schedules.service");

function normalizeText(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = String(value).trim();
  return trimmed || null;
}

function csvEscape(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function htmlEscape(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toPlainStudent(student) {
  if (!student) return {};
  if (typeof student.toJSON === "function") {
    return student.toJSON();
  }
  return student;
}

function buildStudentExportRows(students = []) {
  const headers = [
    "student_id",
    "first_name",
    "middle_name",
    "last_name",
    "email",
    "phone",
    "birthdate",
    "birthplace",
    "age",
    "gender",
    "civil_status",
    "nationality",
    "fb_link",
    "gmail_account",
    "house_number",
    "street",
    "barangay",
    "city",
    "province",
    "zip_code",
    "region",
    "educational_attainment",
    "emergency_contact_person",
    "emergency_contact_number",
    "lto_portal_account",
    "driving_school_tdc",
    "year_completed_tdc",
    "student_permit_number",
    "student_permit_date",
    "student_permit_status",
    "medical_certificate_provider",
    "medical_certificate_date",
    "profile_client_type",
    "profile_promo_offer_id",
    "profile_enrolling_for",
    "profile_pdc_category",
    "profile_tdc_source",
    "profile_training_method",
    "profile_is_already_driver",
    "profile_target_vehicle",
    "profile_transmission_type",
    "profile_motorcycle_type",
    "enrollment_id",
    "enrollment_type",
    "enrollment_status",
    "enrollment_state",
    "dl_code",
    "promo_offer_name",
    "enrollment_client_type",
    "enrollment_pdc_category",
    "enrollment_tdc_source",
    "enrollment_training_method",
    "enrollment_is_already_driver",
    "enrollment_target_vehicle",
    "enrollment_transmission_type",
    "enrollment_motorcycle_type",
    "enrolling_for",
    "score",
    "fee_amount",
    "discount_amount",
    "total_payments",
    "payment_status",
    "balance_due",
    "latest_schedule_date",
    "latest_schedule_remarks",
    "latest_schedule_student_remarks",
    "latest_schedule_instructor_remarks",
    "created_at",
    "updated_at",
  ];

  const rows = [headers];

  for (const rawStudent of students) {
    const student = toPlainStudent(rawStudent);
    const profile = student.StudentProfile || {};
    const latestEnrollment = Array.isArray(student.Enrollments) ? student.Enrollments[0] || {} : {};
    const payments = Array.isArray(latestEnrollment.payments) ? latestEnrollment.payments : [];
    const totalPayments = payments.reduce((sum, payment) => sum + Number(payment?.amount || 0), 0);
    const feeAmount = Number(latestEnrollment.fee_amount || 0);
    const discountAmount = Number(latestEnrollment.discount_amount || 0);
    const netDue = Math.max(feeAmount - discountAmount, 0);
    const balanceDue = Math.max(netDue - totalPayments, 0);
    const latestSchedule = Array.isArray(latestEnrollment.scheduledSessions)
      ? latestEnrollment.scheduledSessions[0] || {}
      : latestEnrollment.Schedule || {};

    rows.push([
      student.id,
      student.first_name,
      student.middle_name,
      student.last_name,
      student.email,
      student.phone,
      profile.birthdate,
      profile.birthplace,
      profile.age,
      profile.gender,
      profile.civil_status,
      profile.nationality,
      profile.fb_link,
      profile.gmail_account,
      profile.house_number,
      profile.street,
      profile.barangay,
      profile.city,
      profile.province,
      profile.zip_code,
      profile.region,
      profile.educational_attainment,
      profile.emergency_contact_person,
      profile.emergency_contact_number,
      profile.lto_portal_account,
      profile.driving_school_tdc,
      profile.year_completed_tdc,
      profile.student_permit_number,
      profile.student_permit_date,
      profile.student_permit_status,
      profile.medical_certificate_provider,
      profile.medical_certificate_date,
      profile.client_type,
      profile.promo_offer_id,
      profile.enrolling_for,
      profile.pdc_category,
      profile.tdc_source,
      profile.training_method,
      profile.is_already_driver,
      profile.target_vehicle,
      profile.transmission_type,
      profile.motorcycle_type,
      latestEnrollment.id,
      latestEnrollment.enrollment_type,
      latestEnrollment.status,
      latestEnrollment.enrollment_state,
      latestEnrollment.DLCode?.code,
      latestEnrollment.promoOffer?.name,
      latestEnrollment.client_type,
      latestEnrollment.pdc_category,
      latestEnrollment.tdc_source,
      latestEnrollment.training_method,
      latestEnrollment.is_already_driver,
      latestEnrollment.target_vehicle,
      latestEnrollment.transmission_type,
      latestEnrollment.motorcycle_type,
      latestEnrollment.enrolling_for,
      latestEnrollment.score,
      latestEnrollment.fee_amount,
      latestEnrollment.discount_amount,
      totalPayments,
      balanceDue <= 0 ? "paid" : "with_balance",
      balanceDue,
      latestSchedule.schedule_date,
      latestSchedule.remarks,
      latestSchedule.student_remarks,
      latestSchedule.instructor_remarks,
      student.createdAt,
      student.updatedAt,
    ]);
  }

  return rows;
}

function buildStudentsCsvContent(rows = []) {
  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

function buildStudentsExcelContent(rows = []) {
  const [header = [], ...bodyRows] = rows;
  const headCells = header.map((cell) => `<th>${htmlEscape(cell)}</th>`).join("");
  const body = bodyRows
    .map((row) => `<tr>${row.map((cell) => `<td>${htmlEscape(cell)}</td>`).join("")}</tr>`)
    .join("");

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; color: #0f172a; padding: 16px; }
          h1 { margin: 0 0 12px; color: #800000; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #d1d5db; padding: 6px 8px; font-size: 12px; text-align: left; }
          th { background: #f3f4f6; font-weight: 700; }
        </style>
      </head>
      <body>
        <h1>Student Export</h1>
        <table>
          <thead><tr>${headCells}</tr></thead>
          <tbody>${body}</tbody>
        </table>
      </body>
    </html>
  `;
}

function buildStudentUpdatePayload(payload = {}) {
  const source = payload.student || payload;
  const fields = ["first_name", "middle_name", "last_name", "email", "phone"];

  return fields.reduce((result, field) => {
    if (Object.prototype.hasOwnProperty.call(source, field)) {
      result[field] = normalizeText(source[field]);
    }
    return result;
  }, {});
}

function buildProfileUpdatePayload(payload = {}) {
  const profile = payload.profile || {};
  const fields = [
    "birthdate",
    "birthplace",
    "age",
    "gender",
    "civil_status",
    "nationality",
    "fb_link",
    "gmail_account",
    "house_number",
    "street",
    "barangay",
    "city",
    "province",
    "zip_code",
    "region",
    "educational_attainment",
    "emergency_contact_person",
    "emergency_contact_number",
    "lto_portal_account",
    "driving_school_tdc",
    "year_completed_tdc",
    "student_permit_number",
    "student_permit_date",
    "student_permit_status",
    "medical_certificate_provider",
    "medical_certificate_date",
    // Enrollment-specific fields
    "client_type",
    "promo_offer_id",
    "enrolling_for",
    "pdc_category",
    "tdc_source",
    "training_method",
    "is_already_driver",
    "target_vehicle",
    "transmission_type",
    "motorcycle_type",
  ];

  return fields.reduce((result, field) => {
    if (Object.prototype.hasOwnProperty.call(profile, field)) {
      if (field === "age") {
        const ageValue = profile.age;
        result.age = ageValue === "" || ageValue === null || ageValue === undefined ? null : Number(ageValue);
      } else if (field === "promo_offer_id") {
        const idValue = profile[field];
        result[field] = idValue === "" || idValue === null || idValue === undefined ? null : Number(idValue);
      } else if (field === "is_already_driver") {
        result[field] = profile[field] === true || profile[field] === "true" || profile[field] === 1 ? true : false;
      } else {
        result[field] = normalizeText(profile[field]);
      }
    }
    return result;
  }, {});
}

async function listStudents() {
  return repository.findAllStudents();
}

async function getStudent(id) {
  const student = await repository.findStudentById(id);
  if (!student) {
    const error = new Error("Student not found");
    error.status = 404;
    throw error;
  }
  return student;
}

async function addStudent(payload) {
  const { first_name, last_name, email, phone } = payload;

  if (!first_name || !last_name) {
    const error = new Error("first_name and last_name are required");
    error.status = 400;
    throw error;
  }

  return repository.createStudent({ first_name, last_name, email, phone });
}

async function editStudent(id, payload) {
  const transaction = await sequelize.transaction();

  try {
    const student = await repository.findStudentById(id);
    if (!student) {
      const error = new Error("Student not found");
      error.status = 404;
      throw error;
    }

    const studentUpdate = buildStudentUpdatePayload(payload);
    const profileUpdate = buildProfileUpdatePayload(payload);

    if (!Object.keys(studentUpdate).length && !Object.keys(profileUpdate).length) {
      const error = new Error("No editable fields provided");
      error.status = 400;
      throw error;
    }

    if (Object.keys(studentUpdate).length) {
      await repository.updateStudent(student, studentUpdate, transaction);
    }

    if (Object.keys(profileUpdate).length) {
      const existingProfile = await repository.findStudentProfileByStudentId(id, transaction);
      if (existingProfile) {
        await repository.updateStudentProfile(existingProfile, profileUpdate, transaction);
      } else {
        await repository.createStudentProfile(
          {
            student_id: id,
            ...profileUpdate,
          },
          transaction
        );
      }
    }

    await transaction.commit();
    return getStudent(id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function removeStudent(id) {
  const transaction = await sequelize.transaction();

  try {
    const student = await repository.findStudentById(id);
    if (!student) {
      const error = new Error("Student not found");
      error.status = 404;
      throw error;
    }

    const enrollments = await repository.findEnrollmentsByStudentId(id, transaction);
    const scheduleIds = [...new Set(enrollments.map((enrollment) => Number(enrollment.schedule_id)).filter((scheduleId) => Number.isInteger(scheduleId) && scheduleId > 0))];

    for (const scheduleId of scheduleIds) {
      await schedulesService.cancelSchedule(scheduleId, "both", { transaction });
    }

    const profile = await repository.findStudentProfileByStudentId(id, transaction);
    await repository.detachEnrollmentsFromStudent(id, transaction);

    if (profile) {
      await repository.deleteStudentProfile(profile, transaction);
    }

    await repository.deleteStudent(student, transaction);
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function updateEnrollmentStatus(studentId, payload) {
  const transaction = await sequelize.transaction();

  try {
    const student = await repository.findStudentById(studentId);
    if (!student) {
      const error = new Error("Student not found");
      error.status = 404;
      throw error;
    }

    const updatedEnrollment = await repository.updateEnrollmentStatus(studentId, payload, transaction);

    if (
      String(payload?.enrollmentStatus || "").toLowerCase() === "cancelled"
      && Number(updatedEnrollment?.schedule_id) > 0
    ) {
      await schedulesService.cancelSchedule(Number(updatedEnrollment.schedule_id), "both", { transaction });
    }

    await transaction.commit();
    return getStudent(studentId);
  } catch (error) {
    await transaction.rollback();

    if (error.name === "SequelizeValidationError" || error.name === "SequelizeDatabaseError") {
      error.status = 400;
      if (!error.message || error.message.toLowerCase().includes("validation")) {
        error.message = "Invalid enrollmentStatus value";
      }
    }

    throw error;
  }
}

async function exportStudentsCsv(options = {}) {
  const students = await repository.findAllStudents(options);
  const rows = buildStudentExportRows(students);
  return buildStudentsCsvContent(rows);
}

async function exportStudentsExcel(options = {}) {
  const students = await repository.findAllStudents(options);
  const rows = buildStudentExportRows(students);
  return buildStudentsExcelContent(rows);
}

module.exports = {
  listStudents,
  getStudent,
  addStudent,
  editStudent,
  removeStudent,
  updateEnrollmentStatus,
  exportStudentsCsv,
  exportStudentsExcel,
};
