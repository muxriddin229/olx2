const Joi = require("joi");

const userValidation = Joi.object({
  fullName: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(9).max(15).required(),
  role: Joi.string().valid("USER", "ADMIN", "SUPER_ADMIN", "SHOP"),
  image: Joi.string().optional(),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear()),
  regionID: Joi.number().integer().required(),
});

module.exports = { userValidation };
