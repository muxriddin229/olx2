const express = require("express");
const { connectDb } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/category");
const orderRoutes = require("./routes/order");
const orderItemRoutes = require("./routes/orderItem");
const regionRoutes = require("./routes/region");
const commentRoutes = require("./routes/comment");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();
app.use(express.json());

app.use("/uploads", express.static("uploads"));
app.use("/upload", require("./middleware/multer"));



connectDb();

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-commerce API",
      version: "1.0.0",
      description: "API for managing an e-commerce platform",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"],
};


const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use("/auth", authRoutes);
app.use("/category", categoryRoutes);
app.use("/comment", commentRoutes);
app.use("/order", orderRoutes);
app.use("/orderItem", orderItemRoutes);
app.use("/products", productRoutes);
app.use("/region", regionRoutes);

app.listen(5000, async () => {
  console.log("Server 5000-portda ishlayapti");
  console.log("Swagger docs available at http://localhost:5000/api-docs");
});
