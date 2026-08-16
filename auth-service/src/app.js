const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        service: "Authentication Service",
        status: "Running"
    });
});

// API Routes
app.use("/api/v1/auth", authRoutes);

module.exports = app;