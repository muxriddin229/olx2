const { Router } = require("express");
const Category = require("../model/category");
const { Op } = require("sequelize");
const joi = require("joi");

const route = Router();

route.get("/", async (req, res) => {
  try {
    let limit = parseInt(req.query.limit) || 10;
    let page = parseInt(req.query.page) || 1;
    let offset = (page - 1) * limit;
    let name = req.query.name;
    let where = {};
    if (name) {
      where.name = { [Op.startsWith]: name };
    }
    let categories = await Category.findAll({ where, limit, offset });
    if (!categories.length)
      return res.status(404).json({ message: "no categories found" });
    res.json(categories);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
  }
});

let schema = joi.object({
  name: joi.string().min(2).max(55).required(),
  image: joi.string().min(2).required(),
});

route.post("/", async (req, res) => {
  try {
    let { name, image } = req.body;
    let { error } = schema.validate({ name, image });
    if (error) return res.status(400).json({ message: error.details[0].message });
    await Category.create({ name, image});
    res.json({ message: "category created" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
  }
});

let patchschema = joi.object({
  name: joi.string().min(2).max(55),
  image: joi.string().min(2),
});

route.patch("/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let category = await Category.findByPk(id);
    if (!category) return res.status(404).json({ message: "category not found" });
    let { name, image } = req.body;
    let { error } = patchschema.validate({ name, image });
    if (error) return res.status(400).json({ message: error.details[0].message });
    category.update({ name, image });
    res.json({ message: "category updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
  }
});

route.delete("/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let category = await Category.findByPk(id);
    if (!category) return res.status(404).json({ message: "category not found" });
    category.destroy();
    res.json({ message: "category deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
  }
});

module.exports = route;
