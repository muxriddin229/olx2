const { Router } = require("express");
const Comment = require("../model/comment");
const joi = require("joi");
const Product = require("../model/product");
const { Op } = require("sequelize");
const winston = require("winston");
const { MongoDB } = require("winston-mongodb");
const { protect } = require("../middleware/authMiddleware");

const { json, combine, timestamp } = winston.format;

const logger = winston.createLogger({
  level: "silly",
  format: combine(timestamp(), json()),
  transports: [
    new winston.transports.File({ filename: "loglar.log" }),
    new winston.transports.Console(),
    new MongoDB({
      db: "nt",
      options: { useNewUrlParser: true, useUnifiedTopology: true },
      collection: "loglars",
    }),
  ],
});

const routerLogger = logger.child({ module: "comments" });
const route = Router();

route.use((req, res, next) => {
  routerLogger.info(`${req.method} ${req.url}`, {
    body: req.body,
    query: req.query,
  });
  next();
});
/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: API для управления регионами
 */

/**
 * @swagger
 * /comment:
 *   get:
 *     tags: [Comments]
 *     summary: Get all comments
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of comments
 *       500:
 *         description: Server error
 */
route.get("/", async (req, res) => {
  try {
    let limit = parseInt(req.query.limit) || 10;
    let page = parseInt(req.query.page) || 1;
    let offset = (page - 1) * limit;
    let whereCondition = {};
    let { search } = req.query;
    if (search) {
      whereCondition.message = { [Op.like]: `%${search}%` };
    }
    let comments = await Comment.findAll({
      where: whereCondition,
      limit,
      offset,
      include: [{ model: Product, attributes: ["name", "price"] }],
    });
    res.json(comments.length ? comments : []);
  } catch (error) {
    routerLogger.error("error on comment get", { error: error.message });
    res.status(500).json({ message: "server error" });
  }
});

/**
 * @swagger
 * /comment/my-comments:
 *   get:
 *     tags: [Comments]
 *     summary: Get comments of the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of user comments
 *       500:
 *         description: Server error
 */
route.get("/my-comments", protect, async (req, res) => {
  try {
    let userId = req.user.id;
    let limit = parseInt(req.query.limit) || 10;
    let page = parseInt(req.query.page) || 1;
    let offset = (page - 1) * limit;
    let whereCondition = { userId };
    let { search } = req.query;
    if (search) {
      whereCondition.message = { [Op.like]: `%${search}%` };
    }
    let comments = await Comment.findAll({
      where: whereCondition,
      limit,
      offset,
      include: [{ model: Product, attributes: ["name", "price"] }],
    });
    res.json(comments.length ? comments : []);
  } catch (error) {
    routerLogger.error("error on user comment get", { error: error.message });
    res.status(500).json({ message: "server error" });
  }
});

/**
 * @swagger
 * /comment/{id}:
 *   patch:
 *     tags: [Comments]
 *     summary: Update a comment by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
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
 *               star:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 5
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated
 *       400:
 *         description: Validation error
 *       403:
 *         description: Unauthorized to update comment
 *       404:
 *         description: Comment not found
 */
route.patch("/:id", protect, async (req, res) => {
  try {
    let { id } = req.params;
    let comment = await Comment.findByPk(id, {
      include: [{ model: Product, attributes: ["name", "price"] }],
    });
    if (!comment) return res.status(404).json({ message: "comment not found" });
    let userId = req.user.id;
    if (userId !== comment.userId)
      return res
        .status(403)
        .json({ message: "You don't have permission to update this comment" });
    let { productId, star, message } = req.body;
    if (productId !== undefined) {
      let prd = await Product.findByPk(productId);
      if (!prd) return res.status(404).json({ message: "product not found" });
    }
    let schema = joi.object({
      star: joi.number().min(0).max(5).optional(),
      message: joi.string().min(2).max(255).optional(),
    });
    let { error } = schema.validate({ star, message });
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    await comment.update({ productId, star, message });
    res.json({ message: "comment updated" });
  } catch (error) {
    routerLogger.error("error on comment update", { error: error.message });
    res.status(500).json({ message: "server error" });
  }
});

/**
 * @swagger
 * /comment/{id}:
 *   get:
 *     tags: [Comments]
 *     summary: Get a comment by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: The requested comment
 *       404:
 *         description: Comment not found
 */
route.get("/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let comment = await Comment.findByPk(id);
    if (!comment) return res.status(404).json({ message: "comment not found" });
    res.json(comment);
  } catch (error) {
    routerLogger.error("error on comment get by id", { error: error.message });
    res.status(500).json({ message: "server error" });
  }
});
/**
 * @swagger
 * /comment:
 *   post:
 *     tags: [Comments]
 *     summary: Create a new comment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *               star:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 5
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment created
 *       400:
 *         description: Validation error
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */

route.post("/", protect, async (req, res) => {
  try {
    let userId = req.user.id;
    let { productId, star, message } = req.body;
    let prd = await Product.findByPk(productId);
    let schema = joi.object({
      star: joi.number().min(0).max(5).required(),
      message: joi.string().min(2).max(255).required(),
    });
    let { error } = schema.validate({ star, message });
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    if (!prd) return res.status(404).json({ message: "product not found" });
    await Comment.create({ userId, productId, star, message });
    res.json({ message: "comment created" });
  } catch (error) {
    routerLogger.error("error on comment create", { error: error.message });
    res.status(500).json({ message: "server error" });
  }
});

/**
 * @swagger
 * /comment/{id}:
 *   delete:
 *     tags: [Comments]
 *     summary: Delete a comment by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comment deleted
 *       403:
 *         description: Unauthorized to delete comment
 *       404:
 *         description: Comment not found
 */

route.delete("/:id", protect, async (req, res) => {
  try {
    let { id } = req.params;
    let comment = await Comment.findByPk(id);
    if (!comment) return res.status(404).json({ message: "comment not found" });
    let userId = req.user.id;
    if (userId !== comment.userId)
      return res
        .status(403)
        .json({ message: "You don't have permission to delete this comment" });
    await comment.destroy();
    res.json({ message: "comment deleted" });
  } catch (error) {
    routerLogger.error("error on comment delete", { error: error.message });
    res.status(500).json({ message: "server error" });
  }
});

module.exports = route;
