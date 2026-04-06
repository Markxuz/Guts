const repository = require("./students.repository");
const { sequelize } = require("../../../models");

function normalizeText(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = String(value).trim();
  return trimmed || null;
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
  ];

  return fields.reduce((result, field) => {
    if (Object.prototype.hasOwnProperty.call(profile, field)) {
      if (field === "age") {
        const ageValue = profile.age;
        result.age = ageValue === "" || ageValue === null || ageValue === undefined ? null : Number(ageValue);
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

async function updateEnrollmentStatus(studentId, { enrollmentStatus }) {
  const transaction = await sequelize.transaction();

  try {
    const student = await repository.findStudentById(studentId);
    if (!student) {
      const error = new Error("Student not found");
      error.status = 404;
      throw error;
    }

    await repository.updateEnrollmentStatus(studentId, enrollmentStatus, transaction);
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

module.exports = {
  listStudents,
  getStudent,
  addStudent,
  editStudent,
  removeStudent,
  updateEnrollmentStatus,
};
