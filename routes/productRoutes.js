const express = require("express");
const { Op } = require("sequelize");
const Product = require("../model/product");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();


const validateProduct = (req, res, next) => {
    const { name, authorId, categoryId, image, price, description } = req.body;
    
    if (!name || !image || !description) {
        return res.status(400).json({ message: "Ism, rasm va tavsif bo'sh bo'lmasligi kerak" });
    }
    if (!price || isNaN(price) || price <= 0) {
        return res.status(400).json({ message: "Narx musbat son bo'lishi kerak" });
    }
    if (!Number.isInteger(authorId) || !Number.isInteger(categoryId)) {
        return res.status(400).json({ message: "AuthorId va CategoryId butun son bo'lishi kerak" });
    }
    next();
};


router.get("/", async (req, res) => {
    try {
        const { sort, filter, minPrice, maxPrice, category } = req.query;
        let whereCondition = {};

        if (minPrice || maxPrice) {
            whereCondition.price = {};
            if (minPrice) whereCondition.price[Op.gte] = parseFloat(minPrice);
            if (maxPrice) whereCondition.price[Op.lte] = parseFloat(maxPrice);
        }

        if (category) {
            whereCondition.categoryId = category;
        }

        let orderCondition = [];
        if (sort) {
            const [field, direction] = sort.split("_");
            if (["asc", "desc"].includes(direction)) {
                orderCondition.push([field, direction.toUpperCase()]);
            }
        }

        const products = await Product.findAll({
            where: whereCondition,
            order: orderCondition.length ? orderCondition : undefined,
        });

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Xatolik", error });
    }
});


router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: "Mahsulot topilmadi" });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: "Xatolik", error });
    }
});


router.post("/", authMiddleware, validateProduct, async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ message: "Mahsulot qo'shildi", product });
    } catch (error) {
        res.status(500).json({ message: "Xatolik", error });
    }
});


router.patch("/:id", authMiddleware, validateProduct, async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: "Mahsulot topilmadi" });

        await product.update(req.body);
        res.json({ message: "Mahsulot yangilandi", product });
    } catch (error) {
        res.status(500).json({ message: "Xatolik", error });
    }
});


router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: "Mahsulot topilmadi" });
        await product.destroy();
        res.json({ message: "Mahsulot o'chirildi" });
    } catch (error) {
        res.status(500).json({ message: "Xatolik", error });
    }
});

module.exports = router;
