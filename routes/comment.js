const { Router } = require("express");
const Comment = require("../model/comment");
const joi = require("joi");
const User = require("../model/user");
const Product = require("../model/product");
const { Op } = require("sequelize");

const route = Router();


/**
 * @swagger
 * /comments/my-comments:
 *   get:
 *     summary: Get all comments of the authenticated user
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
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments
 *       404:
 *         description: No comments found
 *       500:
 *         description: Server error
 */
route.get("/my-comments", async (req, res) => {
  try {
    let userId = req.user.id;
    let limit = parseInt(req.query.limit) || 10;
    let page = parseInt(req.query.page) || 1;
    let offset = (page - 1) * limit;
    let whereCondition = { userId };
    let { search } = req.query;
    if (search) {
      whereCondition.message = {
        [Op.like]: `%${search}%`,
      };
    }
    let comments = await Comment.findAll({
      where: whereCondition,
      limit,
      offset,
      include: [
        {
          model: Product,
          attributes: ["name", "price"],
        },
      ],
    });
    if (!comments.length) return res.status(404).json("no comments found");
    res.json(comments);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
  }
});

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a new comment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *               productId:
 *                 type: integer
 *               star:
 *                 type: number
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
 *         description: User or product not found
 *       500:
 *         description: Server error
 */
route.post("/", async (req, res) => {
  try {
    let { userId, productId, star, message } = req.body;
    let user = await User.findByPk(userId);
    let prd = await Product.findByPk(productId);
    let schema = joi.object({
      star: joi.number().min(0).max(5).required(),
      message: joi.string().min(2).max(255).required(),
    });
    let { error } = schema.validate({ star, message });
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    if (!user) return res.status(404).json({ message: "user not found" });
    if (!prd) return res.status(404).json({ message: "product not found" });
    await Comment.create({ userId, productId, star, message });
    res.json({ message: "comment created" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
  }
});

module.exports = route;
