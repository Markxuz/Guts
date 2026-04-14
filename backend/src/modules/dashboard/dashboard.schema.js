const Joi = require("joi");

const dashboardLogsQuerySchema = Joi.object({
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
});

const dashboardOperationsQuerySchema = Joi.object({
  daysAhead: Joi.number().integer().min(1).max(60).default(7),
  limit: Joi.number().integer().min(1).max(200).default(50),
});

module.exports = {
  dashboardLogsQuerySchema,
  dashboardOperationsQuerySchema,
};
