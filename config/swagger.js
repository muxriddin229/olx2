const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "User Authentication API",
      version: "1.0.0",
      description: "Foydalanuvchi autentifikatsiyasi va boshqaruvi API'si",
    },
    servers: [
      {
        url: "http://localhost:5000/api",
        description: "Local server",
      },
    ],
  },
  apis: ["./routes/authRoutes.js"],
};

const swaggerSpec = swaggerJSDoc(options);

const swaggerDocs = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = swaggerDocs;
