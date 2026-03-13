const Joi = require("joi");

const activityLogsQuerySchema = Joi.object({
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

module.exports = {
  activityLogsQuerySchema,
};
