const {Router} = require("express");
const Order = require("../model/order");
const User = require("../model/user");
const OrderItem = require("../model/orderItem");
const Product = require("../model/product");

const route = Router()

route.get("/my-orders", async (req, res)=>{
    try {
        let userId = req.user.id
        let limit = parseInt(req.query.limit) || 10
        let page = parseInt(req.query.page) || 1
        let offset = (page-1)*limit
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
                            attributes: ["name", "price"]
                        }
                    ],
                }
            ],
        })
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "server error"})
    }
})

route.get("/orders", async (req, res)=>{
    try {
        let limit = parseInt(req.query.limit) || 10
        let page = parseInt(req.query.page) || 1
        let offset = (page-1)*limit
        let orders = await Order.findAll({
            limit,
            offset,
            include: [
                {
                    model: OrderItem,
                    include: [
                        {
                            model: Product,
                            attributes: ["name", "price"]
                        }
                    ],
                }
            ],
        })
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "server error"})
    }
})

route.post("/", async (req, res)=>{
    try {
        let {userId} = req.body
        let user = await User.findByPk(userId)
        if(!user) return res.status(404).json({ message:"user not found" })
        let order = await Order.create({userId})
        res.json({message:"order created", orderId: order.id})
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "server error"})
    }
})

module.exports = route