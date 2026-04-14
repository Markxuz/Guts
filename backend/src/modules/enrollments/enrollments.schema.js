const Joi = require("joi");

const optionalText = Joi.string().trim().allow("", null);
const optionalNumber = Joi.number().integer().allow(null);
const targetVehicleSchema = optionalText;
const transmissionSchema = optionalText;
const educationalAttainmentSchema = Joi.string().valid(
  "High School",
  "College",
  "Elementary",
  "Post Graduate",
  "Vocational",
  "Informal Schooling",
  "Other"
).allow("", null);
const tdcTrainingMethodSchema = optionalText;
const pdcTrainingMethodSchema = optionalText;
const scheduleSlotSchema = Joi.string().valid("morning", "afternoon");

const schedulePayloadSchema = Joi.object({
  enabled: Joi.boolean().default(false),
  schedule_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).allow("", null),
  slot: scheduleSlotSchema.allow("", null),
  instructor_id: Joi.number().integer().positive().allow(null),
  care_of_instructor_id: Joi.number().integer().positive().allow(null),
  vehicle_id: Joi.number().integer().positive().allow(null),
});

const enrollmentCreateSchema = Joi.object({
  enrollment_type: Joi.string().valid("TDC", "PDC", "PROMO").required(),
  student: Joi.object({
    id: Joi.number().integer(),
    first_name: Joi.string().trim().required(),
    middle_name: optionalText,
    last_name: Joi.string().trim().required(),
    email: Joi.string().trim().email({ tlds: { allow: false } }).allow("", null),
    phone: optionalText,
  }).required(),
  profile: Joi.object({
    birthdate: Joi.date().iso().allow(null, ""),
    birthplace: optionalText,
    age: optionalNumber,
    gender: optionalText,
    civil_status: optionalText,
    nationality: optionalText,
    fb_link: optionalText,
    gmail_account: optionalText,
    house_number: optionalText,
    street: optionalText,
    barangay: optionalText,
    city: optionalText,
    province: optionalText,
    zip_code: optionalText,
  }).default({}),
  extras: Joi.object({
    region: optionalText,
    enrolling_for: optionalText,
    score: optionalText,
    educational_attainment: educationalAttainmentSchema,
    emergency_contact_person: optionalText,
    emergency_contact_number: optionalText,
    lto_portal_account: optionalText,
    driving_school_tdc: optionalText,
    year_completed_tdc: optionalText,
    tdc_training_method: tdcTrainingMethodSchema,
    pdc_training_method: pdcTrainingMethodSchema,
  }).default({}),
  enrollment: Joi.object({
    schedule_id: Joi.number().integer().allow(null),
    package_id: Joi.number().integer().allow(null),
    client_type: optionalText,
    enrollment_channel: Joi.string().valid("walk_in", "saferoads", "otdc", "partner").allow("", null),
    external_application_ref: optionalText,
    is_already_driver: Joi.boolean().allow(null),
    target_vehicle: targetVehicleSchema,
    transmission_type: transmissionSchema,
    motorcycle_type: transmissionSchema,
    training_method: optionalText,
    pdc_start_mode: Joi.string().valid("now", "later").allow("", null),
    pdc_type: Joi.string().valid("beginner", "experience").allow(null, ""),
    pdc_category: Joi.string().valid("Beginner", "Experience").allow(null, ""),
    enrolling_for: optionalText,
    score: optionalText,
    status: Joi.string().valid("pending", "confirmed", "completed").default("pending"),
  }).default({}),
  schedule: schedulePayloadSchema.default({ enabled: false }),
  promo_schedule: Joi.object({
    enabled: Joi.boolean().default(false),
    tdc: schedulePayloadSchema.default({ enabled: false }),
    pdc: schedulePayloadSchema.default({ enabled: false }),
  }).allow(null),
}).custom((value, helpers) => {
  const normalize = (input) => String(input || "").trim().toLowerCase();
  const isMotorcycleTarget = (input) => {
    const normalized = normalize(input);
    return normalized === "motorcycle";
  };

  const hasPdcSelection = Boolean(value.enrollment?.pdc_category || value.enrollment?.pdc_type);
  const scheduleEnabled = Boolean(value.schedule?.enabled);

  if (value.enrollment_type === "PDC" && !hasPdcSelection) {
    return helpers.error("any.custom", {
      message: "pdc_category is required for PDC enrollments",
    });
  }

  if (value.enrollment_type === "TDC" && value.enrollment?.is_already_driver) {
    if (!value.enrollment?.target_vehicle) {
      return helpers.error("any.custom", {
        message: "target_vehicle is required for TDC students who already know how to drive",
      });
    }

    if (!value.enrollment?.transmission_type) {
      return helpers.error("any.custom", {
        message: "transmission_type is required for TDC students who already know how to drive",
      });
    }

    if (value.enrollment?.target_vehicle === "Motorcycle" && !value.enrollment?.motorcycle_type) {
      return helpers.error("any.custom", {
        message: "motorcycle_type is required when Motorcycle is selected",
      });
    }
  }

  if (value.enrollment_type === "PROMO" && value.enrollment?.is_already_driver && !value.enrollment?.target_vehicle) {
    return helpers.error("any.custom", {
      message: "target_vehicle is required for PROMO enrollments",
    });
  }

  if (value.enrollment_type === "PROMO" && value.enrollment?.is_already_driver && !value.enrollment?.transmission_type) {
    return helpers.error("any.custom", {
      message: "transmission_type is required for PROMO enrollments when already driving",
    });
  }

  if (
    value.enrollment_type === "PROMO" &&
    value.enrollment?.is_already_driver &&
    isMotorcycleTarget(value.enrollment?.target_vehicle) &&
    !value.enrollment?.motorcycle_type
  ) {
    return helpers.error("any.custom", {
      message: "motorcycle_type is required when Motorcycle is selected",
    });
  }

  const promoPdcEnabled = Boolean(value.promo_schedule?.pdc?.enabled);

  if (value.enrollment_type === "PROMO" && promoPdcEnabled && !hasPdcSelection) {
    return helpers.error("any.custom", {
      message: "pdc_category is required for PROMO enrollments",
    });
  }

  const promoScheduleEnabled = Boolean(value.promo_schedule?.enabled);
  if (value.enrollment_type === "PROMO" && promoScheduleEnabled) {
    const promoTdc = value.promo_schedule?.tdc || {};
    const promoPdc = value.promo_schedule?.pdc || {};
    const promoPdcEnabled = Boolean(promoPdc.enabled);

    if (!promoTdc.schedule_date || !promoTdc.slot || !promoTdc.instructor_id) {
      return helpers.error("any.custom", {
        message: "promo_schedule.tdc requires schedule_date, slot, and instructor_id",
      });
    }

    if (promoPdcEnabled && (!promoPdc.schedule_date || !promoPdc.slot || !promoPdc.instructor_id || !promoPdc.vehicle_id)) {
      return helpers.error("any.custom", {
        message: "promo_schedule.pdc requires schedule_date, slot, instructor_id, and vehicle_id",
      });
    }
  }

  if (scheduleEnabled) {
    if (!value.schedule?.schedule_date) {
      return helpers.error("any.custom", {
        message: "schedule.schedule_date is required when scheduling during enrollment",
      });
    }

    if (!value.schedule?.slot) {
      return helpers.error("any.custom", {
        message: "schedule.slot is required when scheduling during enrollment",
      });
    }

    if (!value.schedule?.instructor_id) {
      return helpers.error("any.custom", {
        message: "schedule.instructor_id is required when scheduling during enrollment",
      });
    }

    const requiresVehicle = value.enrollment_type !== "TDC";
    if (requiresVehicle && !value.schedule?.vehicle_id) {
      return helpers.error("any.custom", {
        message: "schedule.vehicle_id is required for PDC scheduling during enrollment",
      });
    }
  }

  return value;
}, "PDC type requirement");

const enrollmentUpdateSchema = Joi.object({
  schedule_id: Joi.number().integer(),
  package_id: Joi.number().integer(),
  dl_code_id: Joi.number().integer(),
  client_type: optionalText,
  enrollment_channel: Joi.string().valid("walk_in", "saferoads", "otdc", "partner").allow("", null),
  external_application_ref: optionalText,
  promo_package_id: Joi.number().integer().allow(null),
  tdc_completion_deadline: Joi.date().iso().allow(null, ""),
  pdc_eligibility_date: Joi.date().iso().allow(null, ""),
  pdc_valid_until: Joi.date().iso().allow(null, ""),
  pdc_start_mode: Joi.string().valid("now", "later").allow("", null),
  enrollment_state: Joi.string()
    .valid(
      "draft",
      "active",
      "tdc_in_progress",
      "tdc_completed",
      "pdc_pending_schedule",
      "pdc_in_progress",
      "completed",
      "expired",
      "cancelled"
    )
    .allow("", null),
  is_already_driver: Joi.boolean(),
  target_vehicle: targetVehicleSchema,
  transmission_type: transmissionSchema,
  motorcycle_type: transmissionSchema,
  training_method: optionalText,
  pdc_type: Joi.string().valid("beginner", "experience").allow(null, ""),
  pdc_category: Joi.string().valid("Beginner", "Experience").allow(null, ""),
  enrolling_for: optionalText,
  score: optionalText,
  status: Joi.string().valid("pending", "confirmed", "completed"),
}).min(1);

module.exports = {
  enrollmentCreateSchema,
  enrollmentUpdateSchema,
};
