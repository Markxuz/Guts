const Joi = require("joi");

const scheduleCreateSchema = Joi.object({
  course_id: Joi.number().integer(),
  course_type: Joi.string().valid("tdc", "pdc_beginner", "pdc_experience"),
  instructor_id: Joi.number().integer().required(),
  care_of_instructor_id: Joi.number().integer().positive().allow(null),
  vehicle_id: Joi.number().integer().allow(null),
  enrollment_id: Joi.number().integer().positive().allow(null),
  student_id: Joi.number().integer().positive().allow(null),
  schedule_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  slot: Joi.string().valid("morning", "afternoon").required(),
  remarks: Joi.string().trim().allow("", null),
}).or("course_id", "course_type", "enrollment_id");

const scheduleDayQuerySchema = Joi.object({
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  course_type: Joi.string().valid("tdc", "pdc_beginner", "pdc_experience").optional(),
  instructor_id: Joi.number().integer().positive().optional(),
  vehicle_id: Joi.number().integer().positive().optional(),
});

const scheduleCancelParamsSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const scheduleCancelQuerySchema = Joi.object({
  scope: Joi.string().valid("single", "both").default("single"),
});

const scheduleUpdateSchema = Joi.object({
  schedule_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  slot: Joi.string().valid("morning", "afternoon").required(),
});

const scheduleRemarksUpdateSchema = Joi.object({
  remarks: Joi.string().trim().allow("", null),
  student_remarks: Joi.string().trim().allow("", null),
  instructor_remarks: Joi.string().trim().allow("", null),
});

const scheduleMonthStatusQuerySchema = Joi.object({
  year: Joi.number().integer().min(2000).max(2100).required(),
  month: Joi.number().integer().min(1).max(12).required(),
});

module.exports = {
  scheduleCreateSchema,
  scheduleDayQuerySchema,
  scheduleMonthStatusQuerySchema,
  scheduleCancelParamsSchema,
  scheduleCancelQuerySchema,
  scheduleUpdateSchema,
  scheduleRemarksUpdateSchema,
};
