const swaggerUi = require("swagger-ui-express");

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "SmartRetailX Inventory Service API",
    version: "1.0.0",
    description: "API for managing product inventory and stock reservations.",
  },
  servers: [
    {
      url: "http://localhost:5004",
    },
  ],
  tags: [
    {
      name: "Inventory",
      description: "Inventory management operations",
    },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Inventory"],
        summary: "Health check",
        responses: {
          200: {
            description: "Service is healthy",
          },
        },
      },
    },

    "/api/v1/inventory": {
      post: {
        tags: ["Inventory"],
        summary: "Create inventory",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateInventory",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Inventory created successfully",
          },
          400: {
            description: "Invalid request",
          },
          409: {
            description: "Inventory already exists",
          },
          500: {
            description: "Server error",
          },
        },
      },

      get: {
        tags: ["Inventory"],
        summary: "Get all inventory",
        responses: {
          200: {
            description: "Inventory retrieved successfully",
          },
          500: {
            description: "Server error",
          },
        },
      },
    },

    "/api/v1/inventory/{productId}": {
      get: {
        tags: ["Inventory"],
        summary: "Get inventory by product ID",
        parameters: [
          {
            name: "productId",
            in: "path",
            required: true,
            schema: {
              type: "integer",
              example: 1,
            },
          },
        ],
        responses: {
          200: {
            description: "Inventory retrieved successfully",
          },
          400: {
            description: "Invalid product ID",
          },
          404: {
            description: "Inventory not found",
          },
        },
      },
    },

    "/api/v1/inventory/{productId}/stock": {
      patch: {
        tags: ["Inventory"],
        summary: "Update inventory stock",
        parameters: [
          {
            name: "productId",
            in: "path",
            required: true,
            schema: {
              type: "integer",
              example: 1,
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateStock",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Stock updated successfully",
          },
          400: {
            description: "Invalid quantity or insufficient stock",
          },
          404: {
            description: "Inventory not found",
          },
        },
      },
    },

    "/api/v1/inventory/{productId}/reserve": {
      patch: {
        tags: ["Inventory"],
        summary: "Reserve inventory stock",
        parameters: [
          {
            name: "productId",
            in: "path",
            required: true,
            schema: {
              type: "integer",
              example: 1,
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ReserveStock",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Stock reserved successfully",
          },
          400: {
            description: "Invalid quantity or insufficient available stock",
          },
          404: {
            description: "Inventory not found",
          },
        },
      },
    },
  },

  components: {
    schemas: {
      CreateInventory: {
        type: "object",
        required: ["productId"],
        properties: {
          productId: {
            type: "integer",
            example: 1,
          },
          quantity: {
            type: "integer",
            minimum: 0,
            example: 50,
          },
        },
      },

      UpdateStock: {
        type: "object",
        required: ["quantity"],
        properties: {
          quantity: {
            type: "integer",
            example: 20,
            description:
              "Amount to add to or remove from current stock. Use a negative value to reduce stock.",
          },
        },
      },

      ReserveStock: {
        type: "object",
        required: ["quantity"],
        properties: {
          quantity: {
            type: "integer",
            minimum: 1,
            example: 10,
          },
        },
      },
    },
  },
};

module.exports = {
  swaggerUi,
  swaggerDocument,
};
