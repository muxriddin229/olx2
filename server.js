const express = require("express");
const { connectDb } = require("./config/db");
const { db } = require("./models");
const authRoutes = require("./routes/authRoutes");
const swaggerDocs = require("./config/swagger");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/category");
const orderRoutes = require("./routes/order");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const app = express();
app.use(express.json());

connectDb();

// Swagger options
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "E-Commerce API",
      version: "1.0.0",
      description: "API documentation for the E-Commerce application",
    },
    servers: [{ url: "http://localhost:5000" }],
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/auth", authRoutes);
app.use("/category", categoryRoutes);
app.use("/products", productRoutes);
app.use("/order", orderRoutes);

swaggerDocs(app);

app.listen(5000, async () => {
  await db.sync({ force: false });
  console.log("Server 5000-portda ishlayapti");
  console.log("Swagger docs available at http://localhost:5000/api-docs");
});
