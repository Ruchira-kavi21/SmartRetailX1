const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Route
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        service: "Authentication Service",
        status: "Running 🚀"
    });
});

module.exports = app;