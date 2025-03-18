const express = require("express");
const Product = require("../models/product");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();


router.get("/", async (req, res) => {
    try {
        const products = await Product.findAll();
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


router.post("/", authMiddleware, async (req, res) => {
    const { name, authorId, categoryId, image, price, description } = req.body;

    try {
        const product = await Product.create({ name, authorId, categoryId, image, price, description });
        res.status(201).json({ message: "Mahsulot qo'shildi", product });
    } catch (error) {
        res.status(500).json({ message: "Xatolik", error });
    }
});


router.put("/:id", authMiddleware, async (req, res) => {
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
