const Joi = require("joi");
const { PASSWORD_POLICY_REGEX, PASSWORD_POLICY_MESSAGE } = require("../../shared/security/passwordPolicy");

const emailRule = Joi.string().email({ tlds: { allow: false } }).required();
const passwordRule = Joi.string().pattern(PASSWORD_POLICY_REGEX).required().messages({
  "string.pattern.base": PASSWORD_POLICY_MESSAGE,
});

const loginSchema = Joi.object({
  email: emailRule,
  password: Joi.string().required(),
});

const registerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: emailRule,
  password: passwordRule,
  role: Joi.string().valid("admin", "sub_admin", "staff").default("staff"),
});

const changePasswordSchema = Joi.object({
  email: emailRule,
  currentPassword: Joi.string().required(),
  newPassword: passwordRule,
});

module.exports = {
  loginSchema,
  registerSchema,
  changePasswordSchema,
};
