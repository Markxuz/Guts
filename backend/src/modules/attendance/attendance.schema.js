const Joi = require("joi");

const attendancePayloadSchema = Joi.object({
  enrollment_id: Joi.number().integer().positive().required(),
  schedule_id: Joi.number().integer().positive().allow(null),
  module_type: Joi.string().valid("tdc", "pdc").required(),
  session_no: Joi.number().integer().positive().allow(null),
  remarks: Joi.string().trim().allow("", null),
});

const attendanceCheckOutSchema = Joi.object({
  enrollment_id: Joi.number().integer().positive().required(),
  schedule_id: Joi.number().integer().positive().allow(null),
  module_type: Joi.string().valid("tdc", "pdc").allow(null),
  session_no: Joi.number().integer().positive().allow(null),
});

const attendanceRecomputeParamSchema = Joi.object({
  enrollmentId: Joi.number().integer().positive().required(),
});

module.exports = {
  attendancePayloadSchema,
  attendanceCheckOutSchema,
  attendanceRecomputeParamSchema,
};
