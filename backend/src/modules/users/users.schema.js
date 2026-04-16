const Joi = require("joi");
const { PASSWORD_POLICY_REGEX, PASSWORD_POLICY_MESSAGE } = require("../../shared/security/passwordPolicy");

const userCreateSchema = Joi.object({
  name: Joi.string().trim().min(2).required(),
  email: Joi.string().trim().email({ tlds: { allow: false } }).required(),
  password: Joi.string().pattern(PASSWORD_POLICY_REGEX).required().messages({
    "string.pattern.base": PASSWORD_POLICY_MESSAGE,
  }),
  role: Joi.string().valid("admin", "sub_admin", "staff").default("staff"),
});

const userRoleUpdateSchema = Joi.object({
  role: Joi.string().valid("admin", "sub_admin", "staff").required(),
});

const userUpdateSchema = Joi.object({
  name: Joi.string().trim().min(2),
  email: Joi.string().trim().email({ tlds: { allow: false } }),
  role: Joi.string().valid("admin", "sub_admin", "staff"),
  newPassword: Joi.string().allow("").pattern(PASSWORD_POLICY_REGEX).messages({
    "string.pattern.base": PASSWORD_POLICY_MESSAGE,
  }),
  mustChangePassword: Joi.boolean(),
}).min(1);

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

module.exports = {
  userCreateSchema,
  userRoleUpdateSchema,
  userUpdateSchema,
  idParamSchema,
};
