const express = require("express");

const {
  createInventory,
  getAllInventory,
  getInventoryByProduct,
  updateStock,
  reserveStock,
  deleteInventory,
} = require("../controllers/inventoryController");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const {
  authorizeRoles,
} = require("../middleware/roleMiddleware");

const router = express.Router();

// Authenticated users can view inventory
router.get(
  "/",
  authenticateToken,
  getAllInventory
);

router.get(
  "/:productId",
  authenticateToken,
  getInventoryByProduct
);

// ADMIN inventory management
router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN"),
  createInventory
);

router.patch(
  "/:productId/stock",
  authenticateToken,
  authorizeRoles("ADMIN"),
  updateStock
);

router.delete("/:id", deleteInventory);

// Used by the Order Service
router.patch(
  "/:productId/reserve",
  reserveStock
);

module.exports = router;