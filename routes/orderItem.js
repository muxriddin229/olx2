const { Router } = require("express");
const Order = require("../model/order");
const User = require("../model/user");
const Product = require("../model/product");
const OrderItem = require("../model/orderItem");
const winston = require("winston");
require("winston-mongodb")
 const route = Router()
const { json, combine, timestamp } = winston.format;

const logger = winston.createLogger({
  level: "silly",
  format: combine(timestamp(), json()),
  transports: [
    new winston.transports.File({  filename: "loglar" }),
    new winston.transports.Console(),
    new winston.transports.MongoDB({
      collection: "loglars",
      db: "mongodb://localhost:27017/nt"
    }),
  ],
});

const routerLogger = logger.child({module: "orderItems"})
/**
 * @swagger
 * /order-items:
 *   post:
 *     summary: Add a product to an order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: integer
 *               productId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: OrderItem created
 *       404:
 *         description: Order or product not found
 *       500:
 *         description: Server error
 */
route.post("/", async (req, res) => {
  try {
    let { orderId, productId } = req.body;
    let order = await Order.findByPk(orderId);
    let product = await Product.findByPk(productId);
    if (!order) return res.status(404).json({ message: "order not found" });
    if (!product) return res.status(404).json({ message: "product not found" });
    await OrderItem.create({ orderId, productId });
    res.json({ message: "orderItem created" });
    routerLogger.log("info", "orderItem created")
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
    routerLogger.log("error", "error on orderItem create")

  }
});

module.exports = route;