const express = require("express");
const {connectDb} = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/order");

const app = express();
app.use(express.json());
connectDb();

app.use("/products", productRoutes);
app.use("/order", orderRoutes);

app.listen(3000, ()=>console.log("server started on port 3000"));