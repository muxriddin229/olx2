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
const { MongoDB } = require("winston-mongodb");
const router = Router();
const { json, combine, timestamp } = winston.format;

const logger = winston.createLogger({
  level: "silly",
  format: combine(timestamp(), json()),
  transports: [
    new winston.transports.File({ filename: "loglar.log" }),
    new winston.transports.Console(),
    new MongoDB({
      db: "mongodb://localhost:27017/nt",
      collection: "loglars",
      level: "error",
      options: { useUnifiedTopology: true },
    }),
  ],
});

const routerLogger = logger.child({ module: "products" });

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Получить список продуктов
 *     description: Возвращает список всех продуктов с возможностью фильтрации, сортировки и пагинации.
 *     parameters:
 *       - name: limit
 *         in: query
 *         description: Количество элементов на странице (по умолчанию 10)
 *         schema:
 *           type: integer
 *       - name: page
 *         in: query
 *         description: Номер страницы (по умолчанию 1)
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Успешный ответ
 *       404:
 *         description: Продукты не найдены
 */
router.get("/", async (req, res) => {
  try {
    let limit = parseInt(req.query.limit) || 10;
    let page = parseInt(req.query.page) || 1;
    let offset = (page - 1) * limit;
    let products = await Product.findAll({ limit, offset });
    if (!products.length)
      return res.status(404).json({ message: "Mahsulot topilmadi" });

    res.json(products);
    routerLogger.info("Product list retrieved");
  } catch (error) {
    routerLogger.error(`Error fetching products: ${error.message}`, { error });
    res.status(500).json({ message: "Server xatolik", error });
  }
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Получить продукт по ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID продукта
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Успешный ответ
 *       404:
 *         description: Продукт не найден
 */
router.get("/:id", async (req, res) => {
  try {
    let product = await Product.findByPk(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Mahsulot topilmadi" });

    res.json(product);
    routerLogger.info(`Product ${req.params.id} retrieved`);
  } catch (error) {
    routerLogger.error(`Error fetching product: ${error.message}`, { error });
    res.status(500).json({ message: "Server xatolik", error });
  }
});

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Создать продукт
 *     description: Создает новый продукт и добавляет в базу данных.
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
 *                 example: "IPhone 13"
 *               authorId:
 *                 type: integer
 *                 example: 1
 *               categoryId:
 *                 type: integer
 *                 example: 2
 *               image:
 *                 type: string
 *                 example: "https://example.com/image.jpg"
 *               price:
 *                 type: integer
 *                 example: 999
 *               description:
 *                 type: string
 *                 example: "Новейший iPhone 13 с лучшей камерой"
 *     responses:
 *       201:
 *         description: Продукт успешно создан
 *       400:
 *         description: Ошибка валидации
 */

router.post("/", protect, authorize(["shop", "admin"]), async (req, res) => {
  try {
    let id = req.user.id;
    let { error } = productSchema.validate(req.body);
    if (error)
      return res
        .status(400)
        .json({ message: error.details.map((e) => e.message) });

    let product = await Product.create({ ...req.body, authorId: id });
    res.status(201).json({ message: "Mahsulot qo'shildi", product });
    routerLogger.info("Product created");
  } catch (error) {
    routerLogger.error(`Error creating product: ${error.message}`, { error });
    res.status(500).json({ message: "Server xatolik", error });
  }
});

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Удалить продукт
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID продукта
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Продукт удален
 *       403:
 *         description: Нет прав для удаления
 */
router.delete(
  "/:id",
  protect,
  authorize(["shop", "admin"]),
  async (req, res) => {
    try {
      let id = req.user.id;
      let user = await User.findByPk(id);
      let product = await Product.findByPk(req.params.id);

      if (!product)
        return res.status(404).json({ message: "Mahsulot topilmadi" });
      if (user.role === "shop" && product.authorId !== id)
        return res
          .status(403)
          .json({
            message: "You don't have permission to delete this product",
          });

      await product.destroy();
      res.json({ message: "Mahsulot o'chirildi" });
      routerLogger.info(`Product ${req.params.id} deleted`);
    } catch (error) {
      routerLogger.error(`Error deleting product: ${error.message}`, { error });
      res.status(500).json({ message: "Server xatolik", error });
    }
  }
);

module.exports = router;
