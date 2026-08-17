const swaggerUi = require("swagger-ui-express");

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "SmartRetailX Order Service API",
    version: "1.0.0",
    description: "Order processing API for the SmartRetailX platform",
  },
  servers: [
    {
      url: "http://localhost:5003",
      description: "Local development server",
    },
  ],
  tags: [
    {
      name: "Orders",
      description: "Order management operations",
    },
  ],
  paths: {
    "/api/v1/orders": {
      post: {
        tags: ["Orders"],
        summary: "Create a new order",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateOrder",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Order created successfully",
          },
          400: {
            description: "Invalid request",
          },
          500: {
            description: "Internal server error",
          },
        },
      },

      get: {
        tags: ["Orders"],
        summary: "Get all orders",
        responses: {
          200: {
            description: "Orders retrieved successfully",
          },
          500: {
            description: "Internal server error",
          },
        },
      },
    },

    "/api/v1/orders/{id}": {
      get: {
        tags: ["Orders"],
        summary: "Get order by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          200: {
            description: "Order retrieved successfully",
          },
          404: {
            description: "Order not found",
          },
        },
      },
    },

    "/api/v1/orders/{id}/status": {
      patch: {
        tags: ["Orders"],
        summary: "Update order status",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateStatus",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Order status updated successfully",
          },
          400: {
            description: "Invalid order status",
          },
          500: {
            description: "Internal server error",
          },
        },
      },
    },
  },

  components: {
    schemas: {
      CreateOrder: {
        type: "object",
        required: ["userId", "productId", "quantity", "totalAmount"],
        properties: {
          userId: {
            type: "integer",
            example: 1,
          },
          productId: {
            type: "integer",
            example: 1,
          },
          quantity: {
            type: "integer",
            example: 2,
          },
          totalAmount: {
            type: "number",
            example: 2500.00,
          },
        },
      },

      UpdateStatus: {
        type: "object",
        required: ["status"],
        properties: {
          status: {
            type: "string",
            enum: ["PENDING", "CONFIRMED", "CANCELLED"],
            example: "CONFIRMED",
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