const Joi = require("joi");

const notificationIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

module.exports = {
  notificationIdParamSchema,
};
