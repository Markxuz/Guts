const Joi = require("joi");

const dailyReportsQuerySchema = Joi.object({
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
  startDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
  courseType: Joi.string().valid("tdc", "pdc_beginner", "pdc_experience").optional(),
  instructorId: Joi.number().integer().positive().optional(),
  vehicleId: Joi.number().integer().positive().optional(),
}).custom((value, helpers) => {
  if (value.date) {
    return value;
  }

  if (value.startDate && value.endDate) {
    return value;
  }

  return helpers.error("any.custom", {
    message: "Provide either date or both startDate and endDate",
  });
});

const overviewReportsQuerySchema = Joi.object({
  startDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  endDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  course: Joi.string().valid("overall", "tdc", "pdc", "pdc_beginner", "pdc_experience").default("overall"),
});

module.exports = {
  dailyReportsQuerySchema,
  overviewReportsQuerySchema,
};
