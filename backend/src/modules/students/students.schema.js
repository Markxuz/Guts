const Joi = require("joi");

const studentCreateSchema = Joi.object({
  first_name: Joi.string().trim().required(),
  last_name: Joi.string().trim().required(),
  middle_name: Joi.string().trim().allow(null, ""),
  email: Joi.string().email().allow(null, ""),
  phone: Joi.string().allow(null, ""),
});

const studentUpdateSchema = Joi.object({
  first_name: Joi.string().trim().allow(null, ""),
  middle_name: Joi.string().trim().allow(null, ""),
  last_name: Joi.string().trim().allow(null, ""),
  email: Joi.string().email().allow(null, ""),
  phone: Joi.string().allow(null, ""),
  student: Joi.object({
    first_name: Joi.string().trim().allow(null, ""),
    middle_name: Joi.string().trim().allow(null, ""),
    last_name: Joi.string().trim().allow(null, ""),
    email: Joi.string().email().allow(null, ""),
    phone: Joi.string().allow(null, ""),
  }),
  profile: Joi.object({
    birthdate: Joi.date().iso().allow(null, ""),
    birthplace: Joi.string().trim().allow(null, ""),
    age: Joi.number().integer().allow(null, ""),
    gender: Joi.string().trim().allow(null, ""),
    civil_status: Joi.string().trim().allow(null, ""),
    nationality: Joi.string().trim().allow(null, ""),
    fb_link: Joi.string().trim().allow(null, ""),
    gmail_account: Joi.string().trim().allow(null, ""),
    house_number: Joi.string().trim().allow(null, ""),
    street: Joi.string().trim().allow(null, ""),
    barangay: Joi.string().trim().allow(null, ""),
    city: Joi.string().trim().allow(null, ""),
    province: Joi.string().trim().allow(null, ""),
    zip_code: Joi.string().trim().allow(null, ""),
    region: Joi.string().trim().allow(null, ""),
    educational_attainment: Joi.string().trim().allow(null, ""),
    emergency_contact_person: Joi.string().trim().allow(null, ""),
    emergency_contact_number: Joi.string().trim().allow(null, ""),
    lto_portal_account: Joi.string().trim().allow(null, ""),
    driving_school_tdc: Joi.string().trim().allow(null, ""),
    year_completed_tdc: Joi.string().trim().allow(null, ""),
  }),
}).min(1);

const enrollmentStatusUpdateSchema = Joi.object({
  enrollmentStatus: Joi.string().valid("pending", "confirmed", "completed").required(),
  courseOutcome: Joi.string().trim().allow(null, ""),
  promoCategory: Joi.string().trim().valid("TDC", "PDC").allow(null, ""),
  score: Joi.string().trim().allow(null, ""),
});

module.exports = {
  studentCreateSchema,
  studentUpdateSchema,
  enrollmentStatusUpdateSchema,
};
