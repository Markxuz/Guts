const Joi = require("joi");

const scheduleCreateSchema = Joi.object({
  course_id: Joi.number().integer().required(),
  instructor_id: Joi.number().integer().required(),
  vehicle_id: Joi.number().integer().required(),
  schedule_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  slot: Joi.string().valid("morning", "afternoon").required(),
  remarks: Joi.string().trim().allow("", null),
});

const scheduleDayQuerySchema = Joi.object({
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
});

const scheduleMonthStatusQuerySchema = Joi.object({
  year: Joi.number().integer().min(2000).max(2100).required(),
  month: Joi.number().integer().min(1).max(12).required(),
});

module.exports = {
  scheduleCreateSchema,
  scheduleDayQuerySchema,
  scheduleMonthStatusQuerySchema,
};
