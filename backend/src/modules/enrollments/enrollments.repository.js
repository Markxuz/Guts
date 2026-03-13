const { Enrollment, Student, StudentProfile, DLCode } = require("../../../models");

const enrollmentIncludes = [
  {
    model: Student,
    include: [{ model: StudentProfile }],
  },
  {
    model: DLCode,
    attributes: ["id", "code", "description"],
  },
];

async function findAllEnrollments() {
  return Enrollment.findAll({
    include: enrollmentIncludes,
    order: [["created_at", "DESC"], ["id", "DESC"]],
  });
}

async function findEnrollmentById(id) {
  return Enrollment.findByPk(id, { include: enrollmentIncludes });
}

async function findStudentById(id, transaction) {
  return Student.findByPk(id, { transaction });
}

async function findStudentByEmail(email, transaction) {
  if (!email) {
    return null;
  }

  return Student.findOne({
    where: { email },
    transaction,
  });
}

async function createStudent(payload, transaction) {
  return Student.create(payload, { transaction });
}

async function updateStudent(student, payload, transaction) {
  return student.update(payload, { transaction });
}

async function findStudentProfileByStudentId(studentId, transaction) {
  return StudentProfile.findOne({
    where: { student_id: studentId },
    transaction,
  });
}

async function createStudentProfile(payload, transaction) {
  return StudentProfile.create(payload, { transaction });
}

async function updateStudentProfile(profile, payload, transaction) {
  return profile.update(payload, { transaction });
}

async function findDlCodeByCode(code, transaction) {
  return DLCode.findOne({
    where: { code },
    transaction,
  });
}

async function createDlCode(payload, transaction) {
  return DLCode.create(payload, { transaction });
}

async function createEnrollment(payload, transaction) {
  return Enrollment.create(payload, { transaction });
}

async function updateEnrollment(enrollment, payload) {
  return enrollment.update(payload);
}

async function deleteEnrollment(enrollment) {
  return enrollment.destroy();
}

module.exports = {
  findAllEnrollments,
  findEnrollmentById,
  findStudentById,
  findStudentByEmail,
  createStudent,
  updateStudent,
  findStudentProfileByStudentId,
  createStudentProfile,
  updateStudentProfile,
  findDlCodeByCode,
  createDlCode,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
};
