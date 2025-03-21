const { Router } = require("express");
const Order = require("../model/order");
const User = require("../model/user");
const OrderItem = require("../model/orderItem");
const Product = require("../model/product");
const route = Router();
const winston = require("winston");
const { MongoDB } = require("winston-mongodb");
const { protect, authorize } = require("../middleware/authMiddleware");
const { or } = require("sequelize");

const { json, combine, timestamp } = winston.format;

const logger = winston.createLogger({
  level: "silly",
  format: combine(timestamp(), json()),
  transports: [
    new winston.transports.File({ filename: "loglar" }),
    new winston.transports.Console(),
    new MongoDB({
      collection: "loglars",
      db: "mongodb://localhost:27017/nt",
    }),
  ],
});
/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: API для управления заказами
 */

const routerLogger = logger.child({ module: "orders" });
/**
 * @swagger
 * /order/my-orders:
 *   get:
 *     tags: [Orders]
 *     summary: Получить заказы текущего пользователя
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *         description: Количество заказов на странице
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
route.get("/my-orders", protect, async (req, res) => {
  try {
    let userId = req.user.id;
    let limit = parseInt(req.query.limit) || 10;
    let page = parseInt(req.query.page) || 1;
    let offset = (page - 1) * limit;
    let orders = await Order.findAll({
      where: { userId },
      limit,
      offset,
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              attributes: ["name", "price"],
            },
          ],
        },
      ],
    });
    res.json(orders);
    routerLogger.log("info", "orders get");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
    routerLogger.log("error", "error on orders get");
  }
});

/**
 * @swagger
 * /order:
 *   get:
 *     tags: [Orders]
 *     summary: Получить все заказы (только для админа)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *         description: Количество заказов на странице
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *         description: Номер страницы
 *     responses:
 *       200:
 *         description: Успешный запрос
 *       403:
 *         description: Недостаточно прав
 *       500:
 *         description: Ошибка сервера
 */
route.get("/", protect, authorize(["ADMIN"]), async (req, res) => {
  try {
    let limit = parseInt(req.query.limit) || 10;
    let page = parseInt(req.query.page) || 1;
    let offset = (page - 1) * limit;
    let orders = await Order.findAll({
      limit,
      offset,
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              attributes: ["name", "price"],
            },
          ],
        },
      ],
    });
    res.json(orders);
    routerLogger.log("info", "orders get");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
    routerLogger.log("error", "error on orders get");
  }
});
/**
 * @swagger
 * /order:
 *   post:
 *     tags: [Orders]
 *     summary: Создать заказ
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Заказ создан
 *       500:
 *         description: Ошибка сервера
 */
route.post("/", protect, async (req, res) => {
  try {
    let userId = req.user.id;
    let order = await Order.create({ userId });
    res.json({ message: "order created", orderId: order.id });
    routerLogger.log("info", "order created");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
    routerLogger.log("error", "error on order post");
  }
});

/**
 * @swagger
 * /order/{id}:
 *   delete:
 *     tags: [Orders]
 *     summary: Удалить заказ по ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID заказа
 *     responses:
 *       200:
 *         description: Заказ успешно удалён
 *       403:
 *         description: Недостаточно прав для удаления заказа
 *       404:
 *         description: Заказ не найден
 *       500:
 *         description: Ошибка сервера
 */
route.delete("/:id", protect, async (req, res) => {
  try {
    let userId = req.user.id;
    let user = await User.findByPk(userId);
    let order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: "order not found" });
    if (user.role === "USER" && order.userId != userId)
      return res
        .status(403)
        .json({ message: "You don't have permission to delete this order" });
    await OrderItem.destroy({ where: { orderId: order.id } });
    await order.destroy();
    res.json({ message: "order deleted"});
    routerLogger.log("info", "order deleted");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
    routerLogger.log("error", "error on order delete");
  }
});

module.exports = route;
