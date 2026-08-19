const prisma = require("../config/prisma");

const createInventory = async (req, res) => {
  try {
    const { productId, quantity = 0 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "productId is required",
      });
    }

    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        message: "quantity cannot be negative",
      });
    }

    const existing = await prisma.inventory.findUnique({
      where: { productId: Number(productId) },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Inventory already exists for this product",
      });
    }

    const inventory = await prisma.inventory.create({
      data: {
        productId: Number(productId),
        quantity: Number(quantity),
      },
    });

    res.status(201).json({
      success: true,
      message: "Inventory created successfully",
      data: inventory,
    });
  } catch (error) {
    console.error("Create inventory error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create inventory",
    });
  }
};

const getAllInventory = async (req, res) => {
  try {
    const inventory = await prisma.inventory.findMany({
      orderBy: {
        id: "asc",
      },
    });

    res.status(200).json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    console.error("Get inventory error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve inventory",
    });
  }
};

const getInventoryByProduct = async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid productId",
      });
    }

    const inventory = await prisma.inventory.findUnique({
      where: { productId },
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found",
      });
    }

    res.status(200).json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    console.error("Get inventory by product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve inventory",
    });
  }
};

const updateStock = async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const { quantity } = req.body;

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid productId",
      });
    }

    if (quantity === undefined || !Number.isInteger(Number(quantity))) {
      return res.status(400).json({
        success: false,
        message: "quantity must be an integer",
      });
    }

    const inventory = await prisma.inventory.findUnique({
      where: { productId },
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found",
      });
    }

    const newQuantity = inventory.quantity + Number(quantity);

    if (newQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock",
      });
    }

    const updatedInventory = await prisma.inventory.update({
      where: { productId },
      data: {
        quantity: newQuantity,
      },
    });

    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      data: updatedInventory,
    });
  } catch (error) {
    console.error("Update stock error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update stock",
    });
  }
};

const reserveStock = async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const { quantity } = req.body;

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid productId",
      });
    }

    if (!Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: "quantity must be a positive integer",
      });
    }

    const inventory = await prisma.inventory.findUnique({
      where: { productId },
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found",
      });
    }

    const availableStock = inventory.quantity - inventory.reserved;

    if (Number(quantity) > availableStock) {
      return res.status(400).json({
        success: false,
        message: "Insufficient available stock",
      });
    }

    const updatedInventory = await prisma.inventory.update({
      where: { productId },
      data: {
        reserved: {
          increment: Number(quantity),
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Stock reserved successfully",
      data: updatedInventory,
    });
  } catch (error) {
    console.error("Reserve stock error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to reserve stock",
    });
  }
};
const deleteInventory = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid inventory id",
      });
    }

    const inventory = await prisma.inventory.findUnique({
      where: { id },
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found",
      });
    }

    if (inventory.reserved > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete inventory with reserved stock",
      });
    }

    await prisma.inventory.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Inventory deleted successfully",
    });
  } catch (error) {
    console.error("Delete inventory error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete inventory",
    });
  }
};

module.exports = {
  createInventory,
  getAllInventory,
  getInventoryByProduct,
  updateStock,
  reserveStock,
  deleteInventory,
};
