const express = require("express");
const { connectDb } = require("./config/db");
const { db } = require("./models");
const authRoutes = require("./routes/authRoutes");
const swaggerDocs = require("./config/swagger");

const app = express();
app.use(express.json());

connectDb();

app.use("/api/auth", authRoutes);

swaggerDocs(app);

app.listen(5000, async () => {
  await db.sync({ force: false });
  console.log("Server 5000-portda ishlayapti");
});
