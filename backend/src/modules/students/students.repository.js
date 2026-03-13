const { Student, StudentProfile, Enrollment, DLCode } = require("../../../models");

const latestEnrollmentInclude = {
  model: Enrollment,
  separate: true,
  limit: 1,
  order: [["created_at", "DESC"], ["id", "DESC"]],
  include: [
    {
      model: DLCode,
      attributes: ["id", "code", "description"],
    },
  ],
};

const fullEnrollmentInclude = {
  model: Enrollment,
  separate: true,
  order: [["created_at", "DESC"], ["id", "DESC"]],
  include: [
    {
      model: DLCode,
      attributes: ["id", "code", "description"],
    },
  ],
};

async function findAllStudents() {
  return Student.findAll({
    include: [
      {
        model: StudentProfile,
      },
      latestEnrollmentInclude,
    ],
    order: [["id", "DESC"]],
  });
}

async function findStudentById(id) {
  return Student.findByPk(id, {
    include: [
      {
        model: StudentProfile,
      },
      fullEnrollmentInclude,
    ],
  });
}

async function createStudent(payload) {
  return Student.create(payload);
}

async function findStudentProfileByStudentId(studentId, transaction) {
  return StudentProfile.findOne({
    where: { student_id: studentId },
    transaction,
  });
}

async function updateStudent(student, payload, transaction) {
  return student.update(payload, { transaction });
}

async function createStudentProfile(payload, transaction) {
  return StudentProfile.create(payload, { transaction });
}

async function updateStudentProfile(profile, payload, transaction) {
  return profile.update(payload, { transaction });
}

async function detachEnrollmentsFromStudent(studentId, transaction) {
  return Enrollment.update(
    { student_id: null },
    {
      where: { student_id: studentId },
      transaction,
    }
  );
}

async function deleteStudentProfile(profile, transaction) {
  return profile.destroy({ transaction });
}

async function deleteStudent(student, transaction) {
  return student.destroy({ transaction });
}

async function updateEnrollmentStatus(studentId, enrollmentStatus, transaction) {
  const enrollment = await Enrollment.findOne({
    where: { student_id: studentId },
    order: [["id", "DESC"]],
    transaction,
  });

  if (!enrollment) {
    const error = new Error("No enrollment found for this student");
    error.status = 404;
    throw error;
  }

  if (enrollmentStatus) {
    await enrollment.update({ status: enrollmentStatus }, { transaction });
  }

  return enrollment;
}

module.exports = {
  findAllStudents,
  findStudentById,
  createStudent,
  findStudentProfileByStudentId,
  updateStudent,
  createStudentProfile,
  updateStudentProfile,
  detachEnrollmentsFromStudent,
  deleteStudentProfile,
  deleteStudent,
  updateEnrollmentStatus,
};
