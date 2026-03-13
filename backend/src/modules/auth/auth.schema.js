const Joi = require("joi");

const emailRule = Joi.string().email({ tlds: { allow: false } }).required();

const loginSchema = Joi.object({
  email: emailRule,
  password: Joi.string().min(6).required(),
});

const registerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: emailRule,
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("admin", "sub_admin", "staff").default("staff"),
});

module.exports = {
  loginSchema,
  registerSchema,
};
