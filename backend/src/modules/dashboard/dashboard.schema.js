const Joi = require("joi");

const dashboardLogsQuerySchema = Joi.object({
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
});

module.exports = {
  dashboardLogsQuerySchema,
};
