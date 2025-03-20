const { DataTypes } = require("sequelize")
const {db} = require("../config/db")
const Order = require("./order")
const Product = require("./product")

const OrderItem = db.define("orderItemss", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
})

Order.hasMany(OrderItem, {foreignKey: "orderId"})
OrderItem.belongsTo(Order, {foreignKey: "orderId"})

Product.hasMany(OrderItem, {foreignKey: "productId"})
OrderItem.belongsTo(Product, {foreignKey: "productId"})


module.exports = OrderItem