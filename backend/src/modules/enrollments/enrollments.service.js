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
    birthplace: normalizeText(profile.birthplace),
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
    driving_school_tdc: normalizeText(extras.driving_school_tdc),
    year_completed_tdc: normalizeText(extras.year_completed_tdc),
  };
}

function normalizeEnrollmentPayload(enrollment = {}, extras = {}, studentId, dlCodeId) {
  const normalizedPdcType = normalizePdcType(enrollment.pdc_type, enrollment.pdc_category);
  const channel = normalizeText(enrollment.enrollment_channel) || "walk_in";
  const startMode = normalizeText(enrollment.pdc_start_mode) || "later";

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
    enrollment_channel: channel,
    external_application_ref: normalizeText(enrollment.external_application_ref),
    pdc_start_mode: startMode,
    enrollment_state: "active",
    status: enrollment.status || "pending",
    created_at: enrollment.created_at || new Date(),
  };
}

function addDays(dateInput, days) {
  const base = new Date(dateInput || Date.now());
  base.setDate(base.getDate() + days);
  return base;
}

function toDateOnly(dateInput) {
  const date = new Date(dateInput || Date.now());
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function initializePromoLifecycle({ payload, enrollment, student, transaction }) {
  const now = new Date();
  const pdcType = normalizePdcType(payload.enrollment?.pdc_type, payload.enrollment?.pdc_category) === "experience"
    ? "experience"
    : "beginner";

  const tdcDeadline = toDateOnly(addDays(now, 30));
  const pdcValidUntil = toDateOnly(addDays(now, 365));
  const schedulePdcNow = Boolean(payload.promo_schedule?.pdc?.enabled);
  const pdcStartMode = schedulePdcNow ? "now" : "later";

  const promoPackage = await repository.createPromoPackage(
    {
      student_id: student.id,
      enrollment_id: enrollment.id,
      status: "active",
      purchase_date: toDateOnly(now),
      tdc_deadline: tdcDeadline,
      pdc_valid_until: pdcValidUntil,
      allow_extension: false,
      extension_count: 0,
      notes: null,
    },
    transaction
  );

  await repository.createPromoEntitlement(
    {
      promo_package_id: promoPackage.id,
      module_type: "tdc",
      status: "not_started",
      required_sessions: 2,
      completed_sessions: 0,
      started_at: null,
      completed_at: null,
      expires_at: null,
    },
    transaction
  );

  await repository.createPromoEntitlement(
    {
      promo_package_id: promoPackage.id,
      module_type: "pdc",
      status: "not_started",
      required_sessions: pdcType === "experience" ? 1 : 2,
      completed_sessions: 0,
      started_at: null,
      completed_at: null,
      expires_at: pdcValidUntil,
    },
    transaction
  );

  await repository.updateEnrollment(
    enrollment,
    {
      promo_package_id: promoPackage.id,
      tdc_completion_deadline: tdcDeadline,
      pdc_eligibility_date: null,
      pdc_valid_until: pdcValidUntil,
      pdc_start_mode: pdcStartMode,
      enrollment_state: pdcStartMode === "later" ? "pdc_pending_schedule" : "active",
    },
    transaction
  );
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

function normalizeSchedulePayload(schedule = {}, payload = {}, enrollment = null, forcedCourseType = null) {
  const courseType = forcedCourseType || scheduleCourseTypeFromEnrollmentPayload(payload);
  const fallbackSchedule = payload?.schedule || {};

  const instructorId = toPositiveIntegerOrNull(schedule.instructor_id)
    || toPositiveIntegerOrNull(fallbackSchedule.instructor_id);
  const careOfInstructorId = toPositiveIntegerOrNull(schedule.care_of_instructor_id)
    || toPositiveIntegerOrNull(fallbackSchedule.care_of_instructor_id);
  const vehicleId = courseType === "tdc"
    ? null
    : toPositiveIntegerOrNull(schedule.vehicle_id)
      || toPositiveIntegerOrNull(fallbackSchedule.vehicle_id);
  const scheduleDate = normalizeText(schedule.schedule_date) || normalizeText(fallbackSchedule.schedule_date);
  const slot = normalizeText(schedule.slot) || normalizeText(fallbackSchedule.slot);

  return {
    enrollment_id: enrollment?.id || null,
    course_type: courseType,
    instructor_id: instructorId,
    care_of_instructor_id: careOfInstructorId,
    vehicle_id: vehicleId,
    schedule_date: scheduleDate,
    slot,
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

    const promoPdcEnabled = Boolean(payload.promo_schedule?.pdc?.enabled);
    if (payload.enrollment_type === "PROMO" && promoPdcEnabled && !hasPdcSelection) {
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

    if (payload.enrollment_type === "PROMO") {
      await initializePromoLifecycle({ payload, enrollment, student, transaction });
    }

    let schedule = null;
    let promoSchedule = null;

    if (payload.enrollment_type === "PROMO" && payload.promo_schedule?.enabled) {
      enrollment.Student = student;
      enrollment.DLCode = dlCode;

      const shouldSchedulePromoPdc = Boolean(payload.promo_schedule?.pdc?.enabled);

      const promoTdc = await schedulesService.addSchedule(
        normalizeSchedulePayload(payload.promo_schedule?.tdc, payload, enrollment, "tdc"),
        {
          transaction,
          selectedEnrollment: enrollment,
          allowPendingEnrollment: true,
        }
      );

      let promoPdc = null;
      let promoPdcCourseType = null;
      if (shouldSchedulePromoPdc) {
        promoPdcCourseType = normalizePdcType(payload.enrollment?.pdc_type, payload.enrollment?.pdc_category) === "experience"
          ? "pdc_experience"
          : "pdc_beginner";

        promoPdc = await schedulesService.addSchedule(
          normalizeSchedulePayload(payload.promo_schedule?.pdc, payload, enrollment, promoPdcCourseType),
          {
            transaction,
            selectedEnrollment: enrollment,
            allowPendingEnrollment: true,
          }
        );
      }

      promoSchedule = {
        tdc: {
          item: promoTdc.item,
          createdItems: promoTdc.createdItems,
          reservedDates: promoTdc.reservedDates,
          slot: promoTdc.slot,
          courseType: promoTdc.courseType,
        },
        pdc: promoPdc
          ? {
              item: promoPdc.item,
              createdItems: promoPdc.createdItems,
              reservedDates: promoPdc.reservedDates,
              slot: promoPdc.slot,
              courseType: promoPdc.courseType,
            }
          : {
              item: null,
              createdItems: [],
              reservedDates: [],
              slot: null,
              courseType: promoPdcCourseType || null,
            },
      };

      schedule = promoPdc || promoTdc;
    } else if (payload.schedule?.enabled) {
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
    if (!schedule && !promoSchedule) {
      return savedEnrollment;
    }

    return {
      ...(savedEnrollment?.toJSON ? savedEnrollment.toJSON() : savedEnrollment),
      schedule: schedule
        ? {
            item: schedule.item,
            createdItems: schedule.createdItems,
            reservedDates: schedule.reservedDates,
            slot: schedule.slot,
            courseType: schedule.courseType,
          }
        : null,
      promo_schedule: promoSchedule,
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

function isDatePassed(dateOnly) {
  if (!dateOnly) return false;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(`${dateOnly}T00:00:00`);
  return target < today;
}

function countCompletedSessions(attendanceRows, moduleType) {
  return attendanceRows.filter(
    (item) => String(item.module_type || "").toLowerCase() === moduleType
      && ["present", "rescheduled"].includes(String(item.attendance_status || "").toLowerCase())
  ).length;
}

async function recomputeEnrollmentLifecycleState(enrollmentId, options = {}) {
  const transaction = options.transaction;
  const enrollment = await repository.findEnrollmentById(enrollmentId);

  if (!enrollment) {
    const error = new Error("Enrollment not found");
    error.status = 404;
    throw error;
  }

  const attendanceRows = await repository.findSessionAttendanceByEnrollmentId(enrollment.id, transaction);
  const tdcCompletedSessions = countCompletedSessions(attendanceRows, "tdc");
  const pdcCompletedSessions = countCompletedSessions(attendanceRows, "pdc");
  const hasAnyTdcAttendance = tdcCompletedSessions > 0;
  const hasAnyPdcAttendance = pdcCompletedSessions > 0;

  let enrollmentState = "active";
  const updates = {};

  const promoPackage = enrollment.promoPackage || null;
  if (promoPackage) {
    const entitlements = Array.isArray(promoPackage.entitlements) && promoPackage.entitlements.length
      ? promoPackage.entitlements
      : await repository.findPromoEntitlementsByPackageId(promoPackage.id, transaction);

    const tdcEntitlement = entitlements.find((item) => String(item.module_type || "").toLowerCase() === "tdc");
    const pdcEntitlement = entitlements.find((item) => String(item.module_type || "").toLowerCase() === "pdc");

    if (tdcEntitlement) {
      const required = Number(tdcEntitlement.required_sessions || 0);
      const done = tdcCompletedSessions;
      const tdcStatus = done <= 0 ? "not_started" : done >= required ? "completed" : "in_progress";
      await repository.updatePromoEntitlement(
        tdcEntitlement,
        {
          completed_sessions: done,
          status: tdcStatus,
          started_at: done > 0 ? (tdcEntitlement.started_at || new Date()) : null,
          completed_at: tdcStatus === "completed" ? (tdcEntitlement.completed_at || new Date()) : null,
        },
        transaction
      );
    }

    if (pdcEntitlement) {
      const required = Number(pdcEntitlement.required_sessions || 0);
      const done = pdcCompletedSessions;
      const pdcStatus = done <= 0 ? "not_started" : done >= required ? "completed" : "in_progress";
      await repository.updatePromoEntitlement(
        pdcEntitlement,
        {
          completed_sessions: done,
          status: pdcStatus,
          started_at: done > 0 ? (pdcEntitlement.started_at || new Date()) : null,
          completed_at: pdcStatus === "completed" ? (pdcEntitlement.completed_at || new Date()) : null,
        },
        transaction
      );
    }

    const tdcRequired = Number(tdcEntitlement?.required_sessions || 2);
    const pdcRequired = Number(pdcEntitlement?.required_sessions || 1);
    const tdcCompleted = tdcCompletedSessions >= tdcRequired;
    const pdcCompleted = pdcCompletedSessions >= pdcRequired;
    const expired = isDatePassed(enrollment.pdc_valid_until || promoPackage.pdc_valid_until);

    if (tdcCompleted && !enrollment.pdc_eligibility_date) {
      updates.pdc_eligibility_date = toDateOnly(new Date());
    }

    if (expired && !pdcCompleted) {
      enrollmentState = "expired";
      await repository.updatePromoPackage(promoPackage, { status: "expired" }, transaction);
    } else if (tdcCompleted && pdcCompleted) {
      enrollmentState = "completed";
      await repository.updatePromoPackage(promoPackage, { status: "completed" }, transaction);
    } else if (tdcCompleted) {
      enrollmentState = hasAnyPdcAttendance ? "pdc_in_progress" : "pdc_pending_schedule";
    } else if (hasAnyTdcAttendance) {
      enrollmentState = "tdc_in_progress";
    } else {
      enrollmentState = "active";
    }
  } else {
    if (hasAnyPdcAttendance) {
      enrollmentState = "pdc_in_progress";
    } else if (hasAnyTdcAttendance) {
      enrollmentState = "tdc_in_progress";
    } else {
      enrollmentState = "active";
    }
  }

  updates.enrollment_state = enrollmentState;
  await repository.updateEnrollment(enrollment, updates, transaction);

  return repository.findEnrollmentById(enrollment.id);
}

module.exports = {
  listEnrollments,
  getEnrollment,
  addEnrollment,
  editEnrollment,
  removeEnrollment,
  recomputeEnrollmentLifecycleState,
};
