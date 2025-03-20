const { Router } = require("express");
const Category = require("../model/category");
const { Op } = require("sequelize");
const joi = require("joi");
const winston = require("winston");
const { MongoDB } = require("winston-mongodb");


const { json, combine, timestamp } = winston.format;

const logger = winston.createLogger({
  level: "silly",
  format: combine(timestamp(), json()),
  transports: [
    new winston.transports.File({  filename: "loglar" }),
    new winston.transports.Console(),
    new MongoDB({
      collection: "loglars",
      db: "mongodb://localhost:27017/nt"
    }),
  ],
});

const routerLogger = logger.child({module: "categories"})

const route = Router();

/**
 * @swagger
 * /category:
 *   get:
 *     summary: Get all categories
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of categories
 *       404:
 *         description: No categories found
 *       500:
 *         description: Server error
 */
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
    routerLogger.log("info", "category get")
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
    routerLogger.log("error", "error on category get")
  }
});

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get a category by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Category details
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
route.get("/:id", async (req, res) => {
  try {
    let {id} = req.params;
    let category = await Category.findByPk(id);
    if (!category)
      return res.status(404).json({ message: "category not found" });
    res.json(category);
    routerLogger.log("info", "category get by id")
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
    routerLogger.log("error", "error on category get by id")

  }
});

/**
 * @swagger
 * /category:
 *   post:
 *     summary: Create a new category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category created
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
route.post("/", async (req, res) => {
  try {
    let { name, image } = req.body;
    let schema = joi.object({
      name: joi.string().min(2).max(55).required(),
      image: joi.string().min(2).required(),
    });
    let { error } = schema.validate({ name, image });
    if (error) return res.status(400).json({ message: error.details[0].message });
    await Category.create({ name, image });
    res.json({ message: "category created" });
    routerLogger.log("info", "category created")

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
    routerLogger.log("error", "error on category update")

  }
});

/**
 * @swagger
 * /categories/{id}:
 *   patch:
 *     summary: Update a category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
route.patch("/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let category = await Category.findByPk(id);
    if (!category) return res.status(404).json({ message: "category not found" });
    let { name, image } = req.body;
    let schema = joi.object({
      name: joi.string().min(2).max(55),
      image: joi.string().min(2),
    });
    let { error } = schema.validate({ name, image });
    if (error) return res.status(400).json({ message: error.details[0].message });
    await category.update({ name, image });
    res.json({ message: "category updated" });
    routerLogger.log("info", "category updated")

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
    routerLogger.log("error", "error on category patch")

  }
});

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Category deleted
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
route.delete("/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let category = await Category.findByPk(id);
    if (!category) return res.status(404).json({ message: "category not found" });
    await category.destroy();
    res.json({ message: "category deleted" });
    routerLogger.log("info", "category deleted")

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
    routerLogger.log("error", "error on category delete")

  }
});

module.exports = route;