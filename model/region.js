const { DataTypes } = require("sequelize")
const {db} = require("../config/db")

const Region = db.define("regions", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
})


module.exports = Region