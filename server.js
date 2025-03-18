const express = require("express");
const {connectDb} = require("./config/db");
const productRoutes = require("./routes/productRoutes");

const app = express();
app.use(express.json());
connectDb();

app.use("/products", productRoutes);

app.listen(3000, ()=>console.log("server started on port 3000"));