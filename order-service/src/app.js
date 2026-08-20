const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const orderRoutes = require("./routes/orderRoutes");
const { swaggerUi, swaggerDocument } = require("./swagger");


const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(express.json());

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "order-service",
    status: "healthy",
  });
});

app.use("/api/v1/orders", orderRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

module.exports = app;