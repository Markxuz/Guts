const Joi = require("joi");

const userCreateSchema = Joi.object({
  name: Joi.string().trim().min(2).required(),
  email: Joi.string().trim().email({ tlds: { allow: false } }).required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("admin", "sub_admin", "staff").default("staff"),
});

const userRoleUpdateSchema = Joi.object({
  role: Joi.string().valid("admin", "sub_admin", "staff").required(),
});

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

module.exports = {
  userCreateSchema,
  userRoleUpdateSchema,
  idParamSchema,
};
