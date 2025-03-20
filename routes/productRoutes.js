const { Router } = require("express");
const { Op } = require("sequelize");
const Product = require("../model/product");

const authMiddleware = require("../middleware/authMiddleware");
const {
  productSchema,
  productPatchSchema,
} = require("../validations/productValidation");

const winston = require("winston");
require("winston-mongodb");
const router = Router();
const { json, combine, timestamp } = winston.format;

const logger = winston.createLogger({
  level: "silly",
  format: combine(timestamp(), json()),
  transports: [
    new winston.transports.File({ filename: "loglar" }),
    new winston.transports.Console(),
    new winston.transports.MongoDB({
      collection: "loglars",
      db: "mongodb://localhost:27017/nt",
    }),
  ],
});

const routerLogger = logger.child({ module: "products" });

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

    let order = [];
    if (sort) {
      let [field, direction] = sort.split("_");
      if (["asc", "desc"].includes(direction)) {
        order.push([field, direction.toUpperCase()]);
      }
    }

    let products = await Product.findAll({ where, order, limit, offset });
    if (!products.length)
      return res.status(404).json({ message: "Mahsulot topilmadi" });

    res.json(products);
    routerLogger.log("info", "product get");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server xatolik", error });
    routerLogger.log("error", "error on product get");
  }
});

router.get("/:id", async (req, res) => {
  try {
    let product = await Product.findByPk(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Mahsulot topilmadi" });

    res.json(product);
    routerLogger.log("info", "product get by id");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server xatolik", error });
    routerLogger.log("error", "error on product get by id");
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    let { error } = productSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    let product = await Product.create(req.body);
    res.status(201).json({ message: "Mahsulot qo'shildi", product });
    routerLogger.log("info", "product created");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server xatolik", error });
    routerLogger.log("error", "error on product create");
  }
});

router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    let product = await Product.findByPk(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Mahsulot topilmadi" });

    let { error } = productPatchSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    await product.update(req.body);
    res.json({ message: "Mahsulot yangilandi", product });
    routerLogger.log("info", "product updated");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server xatolik", error });
    routerLogger.log("error", "error on product update");
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    let product = await Product.findByPk(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Mahsulot topilmadi" });

    await product.destroy();
    res.json({ message: "Mahsulot o'chirildi" });
    routerLogger.log("info", "product deleted");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server xatolik", error });
    routerLogger.log("error", "error on product delete");
  }
});

module.exports = router;
