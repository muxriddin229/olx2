const { Router } = require("express");
const Order = require("../model/order");
const User = require("../model/user");
const OrderItem = require("../model/orderItem");
const Product = require("../model/product");
const route = Router()
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

const routerLogger = logger.child({module: "orders"})
/**
 * @swagger
 * /orders/my-orders:
 *   get:
 *     summary: Get all orders of the authenticated user
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of orders
 *       500:
 *         description: Server error
 */
route.get("/my-orders", async (req, res) => {
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
    routerLogger.log("info", "orders get")

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
    routerLogger.log("error", "error on orders get")

  }
});


route.get("/orders", async (req, res) => {
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
    routerLogger.log("info", "orders get")

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
    routerLogger.log("error", "error on orders get")

  }
});

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Order created
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
route.post("/", async (req, res) => {
  try {
    let { userId } = req.body;
    let user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "user not found" });
    let order = await Order.create({ userId });
    res.json({ message: "order created", orderId: order.id });
    routerLogger.log("info", "orders created")

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
    routerLogger.log("error", "error on orders post")

  }
});

module.exports = route;
