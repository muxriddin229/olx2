const { DataTypes } = require("sequelize");
const { db } = require("../config/db");
const Region = require("./region");

const User = db.define("User", {
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("USER", "ADMIN", "SUPER_ADMIN", "SHOP"),
    defaultValue: "USER",
  },
  image: {
    type: DataTypes.STRING,
  },
  year: {
    type: DataTypes.INTEGER,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Region.hasMany(User, {foreignKey: "regionId"})
User.belongsTo(Region, {foreignKey: "regionId"})

module.exports = User;
