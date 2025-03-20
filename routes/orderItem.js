const {Router} = require("express");
const Order = require("../model/order");
const User = require("../model/user");
const Product = require("../model/product");
const OrderItem = require("../model/orderItem");

const route = Router()

route.post("/", async (req, res)=>{
    try {
        let {orderId, productId} = req.body
        let order = await Order.findByPk(orderId)
        let product = await Product.findByPk(productId)
        if(!order) return res.status(404).json({ message:"order not found" })
        if(!product) return res.status(404).json({ message:"product not found" })
        await OrderItem.create({orderId, productId})
        res.json({message:"orderItem created"})
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "server error"})
    }
})

module.exports = route