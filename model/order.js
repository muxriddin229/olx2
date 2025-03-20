const { DataTypes } = require("sequelize")
const {db} = require("../config/db")
const User = require("./user")

const Order = db.define("orders", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
})

User.hasMany(Order, {foreignKey: "userId"})
Order.belongsTo(User, {foreignKey: "userId"})

module.exports = Order