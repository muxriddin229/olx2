const { DataTypes } = require("sequelize")
const {db} = require("../config/db")
const Category = require("./category")

const Product = db.define("products", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    authorId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
})

// Category.hasMany(Product, {foreignKey: "categoryId"})
// Product.belongsTo(Category, {foreignKey: "categoryId"})

module.exports = Product