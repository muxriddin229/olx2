const { Sequelize } = require("sequelize");

const db = new Sequelize("n17", "root", "2004", {
  host: "localhost",
  dialect: "mysql",
});

async function connectDb() {
  try {
    await db.authenticate();
    console.log("Databasega muvaffaqiyatli ulandi.");
    await db.sync({ force: true });
    console.log("Model sinxronizatsiya qilindi.");
  } catch (error) {
    console.error("DB ulanish xatosi:", error);
  }
}

module.exports = { connectDb, db };
