const { Router } = require("express");
const { Op } = require("sequelize");
const Product = require("../model/product");
const User = require("../model/user");
const { authorize, protect } = require("../middleware/authMiddleware");
const {
  productSchema,
  productPatchSchema,
} = require("../validations/productValidation");
const winston = require("winston");
const Category = require("../model/category");
require("winston-mongodb");
require("dotenv").config();

const router = Router();
const { json, combine, timestamp } = winston.format;

const logger = winston.createLogger({
  level: "silly",
  format: combine(timestamp(), json()),
  transports: [
    new winston.transports.File({ filename: "loglar.log" }),
    new winston.transports.Console(),
  ],
});

const routerLogger = logger.child({ module: "products" });

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: API для управления продуктами
 */

/**
 * @swagger
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: Получить список продуктов
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *         description: Количество продуктов на странице
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *         description: Номер страницы
 *     responses:
 *       200:
 *         description: Успешный запрос
 *       500:
 *         description: Ошибка сервера
 */
router.get("/", async (req, res) => {
  try {
    let limit = parseInt(req.query.limit) || 10;
    let page = parseInt(req.query.page) || 1;
    let offset = (page - 1) * limit;
    let { sort, minPrice, maxPrice, category, filter } = req.query;

    let where = {};
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }
    if (category) where.categoryId = category;
    if (filter) where.name = { [Op.like]: `%${filter}%` };

    let products = await Product.findAll({
      where,
      limit,
      offset,
      include: [
        { model: Category, attributes: ["name"] },
        { model: User, attributes: ["fullName"] },
      ],
    });

    res.json({ products });
    routerLogger.info("Product list retrieved");
  } catch (error) {
    routerLogger.error(`Error fetching products: ${error.message}`, { error });
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     tags: [Products] 
 *     summary: Получить продукт по ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID продукта
 *     responses:
 *       200:
 *         description: Продукт найден
 *       404:
 *         description: Продукт не найден
 */
router.get("/:id", async (req, res) => {
  try {
    let product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
    routerLogger.info(`Product ${req.params.id} retrieved`);
  } catch (error) {
    routerLogger.error(`Error fetching product: ${error.message}`, { error });
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * @swagger
 * /products:
 *   post:
 *     tags: [Products]
 *     summary: Создать продукт
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               categoryId:
 *                 type: integer
 *               image:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Продукт создан
 *       400:
 *         description: Ошибка валидации
 *       500:
 *         description: Ошибка сервера
 */
router.post("/", protect, authorize(["SHOP", "ADMIN"]), async (req, res) => {
  try {
    let id = req.user.id;
    let { error } = productSchema.validate(req.body);
    if (error)
      return res.status(400).json({
        errors: error.details.map((e) => ({
          field: e.path[0],
          message: e.message,
        })),
      });

    let product = await Product.create({ ...req.body, authorId: id });
    res.status(201).json({ message: "Product added", product });

    routerLogger.info("Product created");
  } catch (error) {
    routerLogger.error(`Error creating product: ${error.message}`, { error });
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     tags: [Products]
 *     summary: Обновить продукт по ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID продукта
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Продукт успешно обновлён
 *       403:
 *         description: Недостаточно прав для изменения продукта
 *       404:
 *         description: Продукт не найден
 *       500:
 *         description: Ошибка сервера
 */
router.patch(
  "/:id",
  protect,
  authorize(["SHOP", "ADMIN", "SUPER_ADMIN"]),
  async (req, res) => {
    try {
      let id = req.user.id;
      let user = await User.findByPk(id);
      let product = await Product.findByPk(req.params.id);

      if (!product)
        return res.status(404).json({ message: "Product not found" });

      if (user.role === "SHOP" && product.authorId !== user.id)
        return res.status(403).json({
          message: "You don't have permission to update this product",
        });

      let { error } = productPatchSchema.validate(req.body);
      if (error)
        return res.status(400).json({
          errors: error.details.map((e) => ({
            field: e.path[0],
            message: e.message,
          })),
        });

      await product.update(req.body);
      res.json({ message: "Product updated", product });

      routerLogger.info(`Product ${req.params.id} updated`);
    } catch (error) {
      routerLogger.error(`Error updating product: ${error.message}`, { error });
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Удалить продукт по ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID продукта
 *     responses:
 *       200:
 *         description: Продукт успешно удалён
 *       403:
 *         description: Недостаточно прав для удаления продукта
 *       404:
 *         description: Продукт не найден
 *       500:
 *         description: Ошибка сервера
 */
router.delete(
  "/:id",
  protect,
  authorize(["SHOP", "ADMIN"]),
  async (req, res) => {
    try {
      let id = req.user.id;
      let user = await User.findByPk(id);
      let product = await Product.findByPk(req.params.id);

      if (!product)
        return res.status(404).json({ message: "Product not found" });

      if (user.role === "SHOP" && product.authorId !== user.id)
        return res.status(403).json({
          message: "You don't have permission to delete this product",
        });

      await product.destroy();
      res.json({ message: "Product deleted" });

      routerLogger.info(`Product ${req.params.id} deleted`);
    } catch (error) {
      routerLogger.error(`Error deleting product: ${error.message}`, { error });
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

module.exports = router;
