const { Router } = require("express");
const { Op } = require("sequelize");
const Product = require("../model/product");
const User = require("../model/user");
const authMiddleware = require("../middleware/authMiddleware");
const { productSchema, productPatchSchema } = require("../validations/productValidation");
const winston = require("winston");
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
    new MongoDB({
      db: "nt",
      options: { useNewUrlParser: true, useUnifiedTopology: true },
      collection: "loglars",
    }),
  ],
});

const routerLogger = logger.child({ module: "products" });

const checkPermission = (user, product) => {
  if (user.role === "shop" && product.authorId !== user.id) {
    throw new Error("You don't have permission to modify this product");
  }
};

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

    const allowedSortFields = ["price", "name", "createdAt"];
    let order = [];
    if (sort && sort.includes("_")) {
      let [field, direction] = sort.split("_");
      if (allowedSortFields.includes(field) && ["asc", "desc"].includes(direction.toLowerCase())) {
        order.push([field, direction.toUpperCase()]);
      }
    }

    let products = await Product.findAll({ where, order, limit, offset });
    res.json({ products });

    routerLogger.info("Product list retrieved");
  } catch (error) {
    routerLogger.error(`Error fetching products: ${error.message}`, { error });
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

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

router.post("/", authMiddleware(["shop", "admin"]), async (req, res) => {
  try {
    let id = req.user.id;
    let { error } = productSchema.validate(req.body);
    if (error)
      return res.status(400).json({ errors: error.details.map(e => ({ field: e.path[0], message: e.message })) });

    let product = await Product.create({ ...req.body, authorId: id });
    res.status(201).json({ message: "Product added", product });

    routerLogger.info("Product created");
  } catch (error) {
    routerLogger.error(`Error creating product: ${error.message}`, { error });
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.patch("/:id", authMiddleware(["shop", "admin", "super-admin"]), async (req, res) => {
  try {
    let id = req.user.id;
    let user = await User.findByPk(id);
    let product = await Product.findByPk(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    checkPermission(user, product);

    let { error } = productPatchSchema.validate(req.body);
    if (error)
      return res.status(400).json({ errors: error.details.map(e => ({ field: e.path[0], message: e.message })) });

    await product.update(req.body);
    res.json({ message: "Product updated", product });

    routerLogger.info(`Product ${req.params.id} updated`);
  } catch (error) {
    routerLogger.error(`Error updating product: ${error.message}`, { error });
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.delete("/:id", authMiddleware(["shop", "admin"]), async (req, res) => {
  try {
    let id = req.user.id;
    let user = await User.findByPk(id);
    let product = await Product.findByPk(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    checkPermission(user, product);

    await product.destroy();
    res.json({ message: "Product deleted" });

    routerLogger.info(`Product ${req.params.id} deleted`);
  } catch (error) {
    routerLogger.error(`Error deleting product: ${error.message}`, { error });
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
