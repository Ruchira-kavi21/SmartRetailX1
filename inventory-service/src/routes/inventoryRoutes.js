const express = require("express");

const {
  createInventory,
  getAllInventory,
  getInventoryByProduct,
  updateStock,
  reserveStock,
} = require("../controllers/inventoryController");

const router = express.Router();

router.post("/", createInventory);
router.get("/", getAllInventory);
router.get("/:productId", getInventoryByProduct);
router.patch("/:productId/stock", updateStock);
router.patch("/:productId/reserve", reserveStock);

module.exports = router;
