const {
  Enrollment,
  Student,
  StudentProfile,
  DLCode,
  Payment,
  PromoPackage,
  PromoEntitlement,
  SessionAttendance,
} = require("../../../models");

const enrollmentIncludes = [
  {
    model: Student,
    include: [{ model: StudentProfile }],
  },
  {
    model: DLCode,
    attributes: ["id", "code", "description"],
  },
  {
    model: PromoPackage,
    as: "promoPackage",
    required: false,
    include: [
      {
        model: PromoEntitlement,
        as: "entitlements",
        required: false,
      },
    ],
  },
  {
    model: SessionAttendance,
    as: "sessionAttendance",
    required: false,
  },
  {
    model: Payment,
    as: "payments",
    required: false,
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

async function createPromoPackage(payload, transaction) {
  return PromoPackage.create(payload, { transaction });
}

async function createPromoEntitlement(payload, transaction) {
  return PromoEntitlement.create(payload, { transaction });
}

async function updatePromoPackage(promoPackage, payload, transaction) {
  return promoPackage.update(payload, { transaction });
}

async function updatePromoEntitlement(entitlement, payload, transaction) {
  return entitlement.update(payload, { transaction });
}

async function findPromoEntitlementsByPackageId(promoPackageId, transaction) {
  return PromoEntitlement.findAll({
    where: { promo_package_id: promoPackageId },
    transaction,
    order: [["id", "ASC"]],
  });
}

async function createSessionAttendance(payload, transaction) {
  return SessionAttendance.create(payload, { transaction });
}

async function findSessionAttendanceByEnrollmentId(enrollmentId, transaction) {
  return SessionAttendance.findAll({
    where: { enrollment_id: enrollmentId },
    transaction,
    order: [["id", "ASC"]],
  });
}

async function findLatestOpenSessionAttendance(filter = {}, transaction) {
  const where = {
    enrollment_id: filter.enrollment_id,
    attendance_status: "present",
    check_out_at: null,
  };

  if (filter.schedule_id) where.schedule_id = filter.schedule_id;
  if (filter.module_type) where.module_type = filter.module_type;
  if (filter.session_no) where.session_no = filter.session_no;

  return SessionAttendance.findOne({
    where,
    transaction,
    order: [["id", "DESC"]],
  });
}

async function findSessionAttendanceByUniqueKey(filter = {}, transaction) {
  const where = {
    enrollment_id: filter.enrollment_id,
    module_type: filter.module_type,
    session_no: filter.session_no || null,
  };

  if (filter.schedule_id) {
    where.schedule_id = filter.schedule_id;
  }

  return SessionAttendance.findOne({ where, transaction });
}

async function updateSessionAttendance(attendance, payload, transaction) {
  return attendance.update(payload, { transaction });
}

async function updateEnrollment(enrollment, payload, transaction) {
  return enrollment.update(payload, transaction ? { transaction } : undefined);
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
  createPromoPackage,
  createPromoEntitlement,
  updatePromoPackage,
  updatePromoEntitlement,
  findPromoEntitlementsByPackageId,
  createSessionAttendance,
  findSessionAttendanceByEnrollmentId,
  findLatestOpenSessionAttendance,
  findSessionAttendanceByUniqueKey,
  updateSessionAttendance,
  updateEnrollment,
  deleteEnrollment,
};
