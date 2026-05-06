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

function normalizeUpperText(value) {
  if (typeof value !== "string") return value ?? null;
  const trimmed = value.trim();
  return trimmed ? trimmed.toUpperCase() : null;
}

function normalizeAmount(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function toCurrencyNumber(value) {
  const numeric = normalizeAmount(value);
  return numeric === null ? 0 : numeric;
}

function attachPaymentSummary(enrollment) {
  if (!enrollment) {
    return enrollment;
  }

  const plain = enrollment.toJSON ? enrollment.toJSON() : enrollment;
  const payments = Array.isArray(plain.payments) ? plain.payments : [];
  const totalPaid = payments.reduce((sum, payment) => sum + toCurrencyNumber(payment.amount), 0);
  const discountAmount = toCurrencyNumber(plain.discount_amount);
  const grossFee = toCurrencyNumber(plain.fee_amount);
  const totalDue = Math.max(grossFee - discountAmount, 0);
  const remainingBalance = Math.max(totalDue - totalPaid, 0);

  return {
    ...plain,
    payment_summary: {
      total_due: Number(totalDue.toFixed(2)),
      total_paid: Number(totalPaid.toFixed(2)),
      remaining_balance: Number(remainingBalance.toFixed(2)),
      is_paid: remainingBalance <= 0,
    },
  };
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
    // Store names in uppercase for encoder/staff consistency
    first_name: normalizeUpperText(student.first_name),
    middle_name: normalizeUpperText(student.middle_name),
    last_name: normalizeUpperText(student.last_name),
    email: normalizeText(student.email),
    phone: normalizeText(student.phone),
  };
}

function normalizeProfilePayload(studentId, profile = {}, extras = {}, enrollment = {}) {
  return {
    student_id: studentId,
    // Personal Information
    birthdate: normalizeText(profile.birthdate),
    birthplace: normalizeText(profile.birthplace),
    age: profile.age ?? null,
    gender: normalizeText(profile.gender),
    civil_status: normalizeText(profile.civil_status),
    nationality: normalizeText(profile.nationality),
    fb_link: normalizeText(profile.fb_link),
    gmail_account: normalizeText(profile.gmail_account),
    // Address Information
    // Store address parts uppercase for consistency
    house_number: normalizeUpperText(profile.house_number),
    street: normalizeUpperText(profile.street),
    barangay: normalizeUpperText(profile.barangay),
    city: normalizeUpperText(profile.city),
    province: normalizeUpperText(profile.province),
    zip_code: normalizeText(profile.zip_code),
    region: normalizeText(extras.region),
    // Emergency and Education
    educational_attainment: normalizeText(extras.educational_attainment),
    emergency_contact_person: normalizeText(extras.emergency_contact_person),
    emergency_contact_number: normalizeText(extras.emergency_contact_number),
    // LTO and Training
    lto_portal_account: normalizeText(extras.lto_portal_account),
    driving_school_tdc: normalizeText(extras.driving_school_tdc),
    year_completed_tdc: normalizeText(extras.year_completed_tdc),
    // Enrollment-specific fields (persist to StudentProfile)
    client_type: normalizeText(profile.client_type || enrollment.client_type || extras.client_type),
    promo_offer_id: profile.promo_offer_id ? Number(profile.promo_offer_id) : (enrollment.promo_offer_id ? Number(enrollment.promo_offer_id) : (extras.promo_offer_id ? Number(extras.promo_offer_id) : null)),
    enrolling_for: normalizeText(profile.enrolling_for || enrollment.enrolling_for || extras.enrolling_for),
    pdc_category: normalizeText(profile.pdc_category || enrollment.pdc_category || extras.pdc_category),
    tdc_source: normalizeText(profile.tdc_source || enrollment.tdc_source || extras.tdc_source),
    training_method: normalizeText(profile.training_method || enrollment.training_method || extras.training_method),
    is_already_driver: Boolean(profile.is_already_driver ?? enrollment.is_already_driver ?? extras.is_already_driver),
    target_vehicle: normalizeText(profile.target_vehicle || enrollment.target_vehicle || extras.target_vehicle),
    transmission_type: normalizeText(profile.transmission_type || enrollment.transmission_type || extras.transmission_type),
    motorcycle_type: normalizeText(profile.motorcycle_type || enrollment.motorcycle_type || extras.motorcycle_type),
  };
}

function normalizeEnrollmentPayload(enrollment = {}, extras = {}, studentId, dlCodeId, qrCodeId = null) {
  const normalizedPdcType = normalizePdcType(enrollment.pdc_type, enrollment.pdc_category);
  const channel = normalizeText(enrollment.enrollment_channel) || "walk_in";
  const startMode = normalizeText(enrollment.pdc_start_mode) || "later";
  const tdcSource = normalizeText(enrollment.tdc_source);

  return {
    student_id: studentId,
    schedule_id: enrollment.schedule_id ?? null,
    package_id: enrollment.package_id ?? null,
    promo_offer_id: enrollment.promo_offer_id ?? null,
    dl_code_id: dlCodeId,
    qrCodeId,
    client_type: normalizeText(enrollment.client_type),
    is_already_driver: Boolean(enrollment.is_already_driver),
    target_vehicle: normalizeText(enrollment.target_vehicle),
    transmission_type: normalizeText(enrollment.transmission_type),
    motorcycle_type: normalizeText(enrollment.motorcycle_type),
    training_method: normalizeText(enrollment.training_method),
    pdc_type: normalizedPdcType,
    fee_amount: normalizeAmount(enrollment.fee_amount),
    discount_amount: normalizeAmount(enrollment.discount_amount),
    payment_terms: normalizeText(enrollment.payment_terms),
    payment_reference_number: normalizeText(enrollment.payment_reference_number),
    payment_notes: normalizeText(enrollment.payment_notes),
    tdc_source: normalizedPdcType ? (tdcSource || "guts") : null,
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

async function upsertStudentProfile(studentId, profilePayload, extrasPayload, enrollmentPayload, transaction) {
  const normalizedProfile = normalizeProfilePayload(studentId, profilePayload, extrasPayload, enrollmentPayload);
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
  const rows = await repository.findAllEnrollments();
  return rows.map((row) => attachPaymentSummary(row));
}

async function getEnrollment(id) {
  const enrollment = await repository.findEnrollmentById(id);
  if (!enrollment) {
    const error = new Error("Enrollment not found");
    error.status = 404;
    throw error;
  }
  return attachPaymentSummary(enrollment);
}

async function addEnrollment(payload) {
  const transaction = await sequelize.transaction();

  try {
    const hasPdcSelection = Boolean(payload.enrollment?.pdc_category || payload.enrollment?.pdc_type);
    const isPublicQrEnrollment = payload.enrollment?.enrollment_channel === "qr_public";

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
    await upsertStudentProfile(student.id, payload.profile, payload.extras, payload.enrollment, transaction);
    const dlCode = await resolveDlCode(payload.enrollment_type, transaction);
    const enrollment = await repository.createEnrollment(
      normalizeEnrollmentPayload(payload.enrollment, payload.extras, student.id, dlCode.id, payload.qrCodeId ?? payload.qr_code_id ?? null),
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
          allowPendingAssignment: isPublicQrEnrollment,
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
            allowPendingAssignment: isPublicQrEnrollment,
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
  const enrollment = await repository.findEnrollmentById(id);
  if (!enrollment) {
    const error = new Error("Enrollment not found");
    error.status = 404;
    throw error;
  }

  // Extract nested fields that require separate model updates
  const { student: studentPayload, profile: profilePayload, promo_schedule_tdc, promo_schedule_pdc, ...enrollmentPayload } = payload;

  // Update student if provided
  if (studentPayload && enrollment.student_id) {
    const student = await repository.findStudentById(enrollment.student_id);
    if (student && (studentPayload.first_name || studentPayload.last_name || studentPayload.phone)) {
      const studentUpdates = {};
      if (studentPayload.first_name) studentUpdates.first_name = studentPayload.first_name;
      if (studentPayload.last_name) studentUpdates.last_name = studentPayload.last_name;
      if (studentPayload.phone !== undefined) studentUpdates.phone = studentPayload.phone;
      
      if (Object.keys(studentUpdates).length > 0) {
        await repository.updateStudent(student, studentUpdates);
      }
    }
  }

  // Update student profile if provided
  if (profilePayload && enrollment.student_id) {
    const profile = await repository.findStudentProfileByStudentId(enrollment.student_id);
    if (profile) {
      const profileUpdates = {};
      
      // Update all provided profile fields
      const updateFields = [
        'gmail_account', 'house_number', 'street', 'barangay', 'city', 'province',
        'zip_code', 'birthdate', 'birthplace', 'age', 'gender', 'civil_status',
        'nationality', 'fb_link', 'region', 'educational_attainment',
        'emergency_contact_person', 'emergency_contact_number', 'lto_portal_account',
        'driving_school_tdc', 'year_completed_tdc', 'client_type', 'enrolling_for',
        'pdc_category', 'tdc_source', 'training_method', 'is_already_driver',
        'target_vehicle', 'transmission_type', 'motorcycle_type', 'promo_offer_id'
      ];
      
      updateFields.forEach(field => {
        if (field in profilePayload) {
          const value = profilePayload[field];
          // Apply uppercase normalization for address fields
          if (['house_number', 'street', 'barangay', 'city', 'province', 'first_name', 'last_name', 'middle_name'].includes(field)) {
            profileUpdates[field] = normalizeUpperText(value);
          } else {
            profileUpdates[field] = value;
          }
        }
      });
      
      if (Object.keys(profileUpdates).length > 0) {
        await repository.updateStudentProfile(profile, profileUpdates);
      }
    }
  }

  // Map promo schedule dates to enrollment date fields
  if (promo_schedule_tdc?.schedule_date) {
    enrollmentPayload.tdc_completion_deadline = promo_schedule_tdc.schedule_date;
  }
  if (promo_schedule_pdc?.schedule_date) {
    enrollmentPayload.pdc_eligibility_date = promo_schedule_pdc.schedule_date;
  }

  // Update enrollment with mapped fields
  return repository.updateEnrollment(enrollment, enrollmentPayload);
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
