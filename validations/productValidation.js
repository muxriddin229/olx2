const joi = require("joi");

const productSchema = joi.object({
    name: joi.string().min(2).max(255).required(),
    price: joi.number().min(0).required(),
    categoryId: joi.number().required(),
    image: joi.string().uri().required(),
    description: joi.string().optional(),
});

const productPatchSchema = joi.object({
    name: joi.string().min(2).max(255),
    price: joi.number().min(0),
    categoryId: joi.number(),
    image: joi.string().uri(),
    description: joi.string(),
});

module.exports = { productSchema, productPatchSchema };
