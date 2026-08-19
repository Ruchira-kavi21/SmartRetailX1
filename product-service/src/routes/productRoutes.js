const express = require("express");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticateToken, getProducts);

router.get("/:id", authenticateToken, getProductById);

router.post("/", authenticateToken, createProduct);

router.put("/:id", authenticateToken, updateProduct);

router.delete("/:id", authenticateToken, deleteProduct);

module.exports = router;