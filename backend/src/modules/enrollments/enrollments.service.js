const { sequelize } = require("../../../models");
const repository = require("./enrollments.repository");
const schedulesService = require("../schedules/schedules.service");

const ENROLLMENT_TYPE_MAP = {
  TDC: {
    code: "TDC",
    description: "Theoretical Driving Course",
  },
  PDC: {
    code: "PDC",
    description: "Practical Driving Course",
  },
  PROMO: {
    code: "TDC + PDC PROMO",
    description: "Combined TDC and PDC promo enrollment",
  },
};

function normalizeText(value) {
  if (typeof value !== "string") {
    return value ?? null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizePdcType(rawType, rawCategory) {
  const normalizedType = normalizeText(rawType);
  if (normalizedType) {
    return normalizedType.toLowerCase();
  }

  const normalizedCategory = normalizeText(rawCategory);
  if (!normalizedCategory) {
    return null;
  }

  return normalizedCategory.toLowerCase() === "experience" ? "experience" : "beginner";
}

function normalizeStudentPayload(student = {}) {
  return {
    first_name: normalizeText(student.first_name),
    middle_name: normalizeText(student.middle_name),
    last_name: normalizeText(student.last_name),
    email: normalizeText(student.email),
    phone: normalizeText(student.phone),
  };
}

function normalizeProfilePayload(studentId, profile = {}, extras = {}) {
  return {
    student_id: studentId,
    birthdate: normalizeText(profile.birthdate),
    age: profile.age ?? null,
    gender: normalizeText(profile.gender),
    civil_status: normalizeText(profile.civil_status),
    nationality: normalizeText(profile.nationality),
    fb_link: normalizeText(profile.fb_link),
    gmail_account: normalizeText(profile.gmail_account),
    house_number: normalizeText(profile.house_number),
    street: normalizeText(profile.street),
    barangay: normalizeText(profile.barangay),
    city: normalizeText(profile.city),
    province: normalizeText(profile.province),
    zip_code: normalizeText(profile.zip_code),
    region: normalizeText(extras.region),
    educational_attainment: normalizeText(extras.educational_attainment),
    emergency_contact_person: normalizeText(extras.emergency_contact_person),
    emergency_contact_number: normalizeText(extras.emergency_contact_number),
    lto_portal_account: normalizeText(extras.lto_portal_account),
  };
}

function normalizeEnrollmentPayload(enrollment = {}, extras = {}, studentId, dlCodeId) {
  const normalizedPdcType = normalizePdcType(enrollment.pdc_type, enrollment.pdc_category);

  return {
    student_id: studentId,
    schedule_id: enrollment.schedule_id ?? null,
    package_id: enrollment.package_id ?? null,
    dl_code_id: dlCodeId,
    client_type: normalizeText(enrollment.client_type),
    is_already_driver: Boolean(enrollment.is_already_driver),
    target_vehicle: normalizeText(enrollment.target_vehicle),
    transmission_type: normalizeText(enrollment.transmission_type),
    motorcycle_type: normalizeText(enrollment.motorcycle_type),
    training_method: normalizeText(enrollment.training_method),
    pdc_type: normalizedPdcType,
    enrolling_for: normalizeText(extras.enrolling_for),
    score: normalizeText(extras.score),
    status: enrollment.status || "pending",
    created_at: enrollment.created_at || new Date(),
  };
}

function toPositiveIntegerOrNull(value) {
  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric <= 0) {
    return null;
  }

  return numeric;
}

function scheduleCourseTypeFromEnrollmentPayload(payload) {
  if (payload.enrollment_type === "TDC") {
    return "tdc";
  }

  const pdcType = normalizePdcType(payload.enrollment?.pdc_type, payload.enrollment?.pdc_category);
  return pdcType === "experience" ? "pdc_experience" : "pdc_beginner";
}

function normalizeSchedulePayload(schedule = {}, payload = {}, enrollment = null) {
  const courseType = scheduleCourseTypeFromEnrollmentPayload(payload);

  return {
    enrollment_id: enrollment?.id || null,
    course_type: courseType,
    instructor_id: toPositiveIntegerOrNull(schedule.instructor_id),
    care_of_instructor_id: toPositiveIntegerOrNull(schedule.care_of_instructor_id),
    vehicle_id: courseType === "tdc" ? null : toPositiveIntegerOrNull(schedule.vehicle_id),
    schedule_date: normalizeText(schedule.schedule_date),
    slot: normalizeText(schedule.slot),
    remarks: null,
  };
}

async function resolveStudent(studentPayload, transaction) {
  if (studentPayload.id) {
    const existingStudent = await repository.findStudentById(studentPayload.id, transaction);
    if (!existingStudent) {
      const error = new Error("Student not found");
      error.status = 404;
      throw error;
    }

    return repository.updateStudent(existingStudent, normalizeStudentPayload(studentPayload), transaction);
  }

  const normalizedStudent = normalizeStudentPayload(studentPayload);
  const matchedByEmail = await repository.findStudentByEmail(normalizedStudent.email, transaction);
  if (matchedByEmail) {
    return repository.updateStudent(matchedByEmail, normalizedStudent, transaction);
  }

  return repository.createStudent(normalizedStudent, transaction);
}

async function upsertStudentProfile(studentId, profilePayload, extrasPayload, transaction) {
  const normalizedProfile = normalizeProfilePayload(studentId, profilePayload, extrasPayload);
  const existingProfile = await repository.findStudentProfileByStudentId(studentId, transaction);

  if (existingProfile) {
    return repository.updateStudentProfile(existingProfile, normalizedProfile, transaction);
  }

  return repository.createStudentProfile(normalizedProfile, transaction);
}

async function resolveDlCode(enrollmentType, transaction) {
  const mapped = ENROLLMENT_TYPE_MAP[enrollmentType];
  if (!mapped) {
    const error = new Error("Invalid enrollment type");
    error.status = 400;
    throw error;
  }

  const existing = await repository.findDlCodeByCode(mapped.code, transaction);
  if (existing) {
    return existing;
  }

  return repository.createDlCode(mapped, transaction);
}

async function listEnrollments() {
  return repository.findAllEnrollments();
}

async function getEnrollment(id) {
  const enrollment = await repository.findEnrollmentById(id);
  if (!enrollment) {
    const error = new Error("Enrollment not found");
    error.status = 404;
    throw error;
  }
  return enrollment;
}

async function addEnrollment(payload) {
  const transaction = await sequelize.transaction();

  try {
    const hasPdcSelection = Boolean(payload.enrollment?.pdc_category || payload.enrollment?.pdc_type);

    if (payload.enrollment_type === "PDC" && !hasPdcSelection) {
      const error = new Error("pdc_category is required for PDC enrollments");
      error.status = 400;
      throw error;
    }

    if (payload.enrollment_type === "PROMO" && !hasPdcSelection) {
      const error = new Error("pdc_category is required for PROMO enrollments");
      error.status = 400;
      throw error;
    }

    const student = await resolveStudent(payload.student, transaction);
    await upsertStudentProfile(student.id, payload.profile, payload.extras, transaction);
    const dlCode = await resolveDlCode(payload.enrollment_type, transaction);
    const enrollment = await repository.createEnrollment(
      normalizeEnrollmentPayload(payload.enrollment, payload.extras, student.id, dlCode.id),
      transaction
    );

    let schedule = null;
    if (payload.schedule?.enabled) {
      enrollment.Student = student;
      enrollment.DLCode = dlCode;

      schedule = await schedulesService.addSchedule(
        normalizeSchedulePayload(payload.schedule, payload, enrollment),
        {
          transaction,
          selectedEnrollment: enrollment,
          allowPendingEnrollment: true,
        }
      );
    }

    await transaction.commit();
    const savedEnrollment = await repository.findEnrollmentById(enrollment.id);
    if (!schedule) {
      return savedEnrollment;
    }

    return {
      ...(savedEnrollment?.toJSON ? savedEnrollment.toJSON() : savedEnrollment),
      schedule: {
        item: schedule.item,
        createdItems: schedule.createdItems,
        reservedDates: schedule.reservedDates,
        slot: schedule.slot,
        courseType: schedule.courseType,
      },
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function editEnrollment(id, payload) {
  const enrollment = await getEnrollment(id);
  return repository.updateEnrollment(enrollment, payload);
}

async function removeEnrollment(id) {
  const enrollment = await getEnrollment(id);
  await repository.deleteEnrollment(enrollment);
}

module.exports = {
  listEnrollments,
  getEnrollment,
  addEnrollment,
  editEnrollment,
  removeEnrollment,
};
