const Joi = require("joi");

const scheduleChangeRequestCreateSchema = Joi.object({
  schedule_id: Joi.number().integer().positive().required(),
  requested_schedule_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  requested_slot: Joi.string().valid("morning", "afternoon").required(),
  reason: Joi.string().trim().min(5).required(),
});

const scheduleChangeRequestIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const scheduleChangeRequestRejectSchema = Joi.object({
  reviewer_note: Joi.string().trim().allow("", null),
});

module.exports = {
  scheduleChangeRequestCreateSchema,
  scheduleChangeRequestIdParamSchema,
  scheduleChangeRequestRejectSchema,
};