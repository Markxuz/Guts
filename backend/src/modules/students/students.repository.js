const { Student, StudentProfile, Enrollment, DLCode, PromoOffer, Payment, Schedule, sequelize } = require("../../../models");

let cachedStudentProfileAttributes = null;

async function getSafeStudentProfileAttributes() {
  if (cachedStudentProfileAttributes) {
    return cachedStudentProfileAttributes;
  }

  const fallback = [
    "id",
    "student_id",
    "birthdate",
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
    "student_permit_number",
    "student_permit_date",
    "student_permit_status",
    "medical_certificate_provider",
    "medical_certificate_date",
  ];

  try {
    const definition = await sequelize.getQueryInterface().describeTable("student_profiles");
    const existing = Object.keys(definition || {});
    const modelColumns = Object.keys(StudentProfile.rawAttributes || {});
    cachedStudentProfileAttributes = modelColumns.filter((column) => existing.includes(column));
    if (!cachedStudentProfileAttributes.length) {
      cachedStudentProfileAttributes = fallback;
    }
  } catch {
    cachedStudentProfileAttributes = fallback;
  }

  return cachedStudentProfileAttributes;
}

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
    {
      model: PromoOffer,
      as: "promoOffer",
      attributes: ["id", "name", "fixed_price", "discounted_price"],
      required: false,
    },
    {
      model: Payment,
      as: "payments",
      attributes: ["id", "amount", "payment_method", "payment_status", "reference_number", "account_number", "created_at"],
      required: false,
    },
    {
      model: Schedule,
      attributes: ["id", "remarks", "student_remarks", "instructor_remarks"],
      required: false,
    },
    {
      model: Schedule,
      as: "scheduledSessions",
      attributes: ["id", "remarks", "student_remarks", "instructor_remarks", "schedule_date"],
      separate: true,
      limit: 1,
      order: [["schedule_date", "DESC"], ["id", "DESC"]],
      required: false,
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
    {
      model: PromoOffer,
      as: "promoOffer",
      attributes: ["id", "name", "fixed_price", "discounted_price"],
      required: false,
    },
    {
      model: Payment,
      as: "payments",
      attributes: ["id", "amount", "payment_method", "payment_status", "reference_number", "account_number", "created_at"],
      required: false,
    },
    {
      model: Schedule,
      attributes: ["id", "remarks", "student_remarks", "instructor_remarks"],
      required: false,
    },
    {
      model: Schedule,
      as: "scheduledSessions",
      attributes: ["id", "remarks", "student_remarks", "instructor_remarks", "schedule_date"],
      separate: true,
      limit: 1,
      order: [["schedule_date", "DESC"], ["id", "DESC"]],
      required: false,
    },
  ],
};

async function findAllStudents() {
  const profileAttributes = await getSafeStudentProfileAttributes();

  const students = await Student.findAll({
    include: [
      {
        model: StudentProfile,
        attributes: profileAttributes,
      },
      latestEnrollmentInclude,
    ],
    order: [["id", "DESC"]],
  });

  // Filter out students who only have unpaid QR enrollments (pending with qrCodeId)
  // Only include students who have at least one "confirmed" or "completed" enrollment
  return students.filter((student) => {
    const enrollments = student.Enrollments || [];
    
    // If no enrollments, don't show in list
    if (enrollments.length === 0) {
      return false;
    }

    // Check if student has at least one paid (confirmed or completed) enrollment
    const hasPaidEnrollment = enrollments.some(
      (enrollment) => enrollment.status === "confirmed" || enrollment.status === "completed"
    );

    return hasPaidEnrollment;
  });
}

async function findStudentById(id) {
  const profileAttributes = await getSafeStudentProfileAttributes();

  return Student.findByPk(id, {
    include: [
      {
        model: StudentProfile,
        attributes: profileAttributes,
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

async function findEnrollmentsByStudentId(studentId, transaction) {
  return Enrollment.findAll({
    where: { student_id: studentId },
    attributes: ["id", "schedule_id"],
    transaction,
    order: [["id", "DESC"]],
  });
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

async function updateEnrollmentStatus(studentId, payload, transaction) {
  const enrollmentStatus = payload?.enrollmentStatus;
  const score = payload?.score;

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

  if (enrollmentStatus || score !== undefined) {
    const nextPayload = {};
    if (enrollmentStatus) {
      if (enrollmentStatus === "cancelled") {
        nextPayload.enrollment_state = "cancelled";
      } else {
        nextPayload.status = enrollmentStatus;
        nextPayload.enrollment_state = enrollmentStatus === "completed" ? "completed" : "active";
      }
    }
    if (score !== undefined) {
      nextPayload.score = score || null;
    }

    await enrollment.update(nextPayload, { transaction });
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
  findEnrollmentsByStudentId,
  detachEnrollmentsFromStudent,
  deleteStudentProfile,
  deleteStudent,
  updateEnrollmentStatus,
};
