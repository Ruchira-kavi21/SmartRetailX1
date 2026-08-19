const prisma = require("../config/prisma");

const createOrder = async (req, res) => {
  try {
    const { productId, quantity, totalAmount } = req.body;

    // The authenticated user's ID comes from the JWT.
    // Do not trust userId supplied by the client.
    const userId = req.user.userId;

    if (!productId || !quantity || totalAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: "productId, quantity and totalAmount are required",
      });
    }

    // Reserve stock before creating the order
    const inventoryServiceUrl =
      process.env.INVENTORY_SERVICE_URL || "http://localhost:5004";

    const authHeader = req.headers.authorization;

    const inventoryResponse = await fetch(
      `${inventoryServiceUrl}/api/v1/inventory/${productId}/reserve`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          quantity,
        }),
      }
    );

    const inventoryData = await inventoryResponse.json();

    if (!inventoryResponse.ok) {
      return res.status(inventoryResponse.status).json({
        success: false,
        message: "Unable to reserve inventory",
        inventory: inventoryData,
      });
    }

    const order = await prisma.order.create({
      data: {
        userId,
        productId,
        quantity,
        totalAmount,
      },
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const where =
      req.user.role === "ADMIN"
        ? {}
        : {
            userId: req.user.userId,
          };

    const orders = await prisma.order.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Customers can only access their own orders.
    if (
      req.user.role !== "ADMIN" &&
      order.userId !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only access your own orders.",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    // Only administrators can change order status.
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. Only administrators can update order status.",
      });
    }

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // Only CONFIRMED and CANCELLED are valid status changes.
    if (!["CONFIRMED", "CANCELLED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Order can only be confirmed or cancelled.",
      });
    }

    const existingOrder = await prisma.order.findUnique({
      where: {
        id,
      },
    });

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Only PENDING orders can be confirmed or cancelled.
    if (existingOrder.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message:
          `Order is already ${existingOrder.status} and cannot be changed.`,
      });
    }

    const order = await prisma.order.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Order ${status.toLowerCase()} successfully`,
      data: order,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
};