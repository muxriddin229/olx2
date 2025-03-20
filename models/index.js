const { db } = require("../config/db");
const User = require("./user");
const Region = require("./Region");
const Comment = require("./Comment");
const Order = require("./Order");
const OrderItem = require("./OrderItem");

// Region - User (1:N)
Region.hasMany(User, { foreignKey: "regionID", onDelete: "CASCADE" });
User.belongsTo(Region, { foreignKey: "regionID", onDelete: "CASCADE" });

// User - Comment (1:N)
User.hasMany(Comment, { foreignKey: "userId", onDelete: "CASCADE" });
Comment.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });

// User - Order (1:N)
User.hasMany(Order, { foreignKey: "userId", onDelete: "CASCADE" });
Order.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });

// Order - OrderItem (1:N)
Order.hasMany(OrderItem, { foreignKey: "orderId", onDelete: "CASCADE" });
OrderItem.belongsTo(Order, { foreignKey: "orderId", onDelete: "CASCADE" });

module.exports = { db, User, Region, Comment, Order, OrderItem };
