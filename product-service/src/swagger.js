const swaggerUi = require("swagger-ui-express");

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "SmartRetailX Product Service API",
    version: "1.0.0",
    description: "Product management microservice for SmartRetailX",
  },
  servers: [
    {
      url: "http://localhost:5002",
      description: "Local development server",
    },
  ],
  tags: [
    {
      name: "Products",
      description: "Product management operations",
    },
  ],
  paths: {
    "/api/v1/products": {
      post: {
        tags: ["Products"],
        summary: "Create a product",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ProductInput",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Product created successfully",
          },
          409: {
            description: "SKU already exists",
          },
        },
      },

      get: {
        tags: ["Products"],
        summary: "Get all products",
        responses: {
          200: {
            description: "Products retrieved successfully",
          },
        },
      },
    },

    "/api/v1/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Get a product by ID",
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
            description: "Product retrieved successfully",
          },
          404: {
            description: "Product not found",
          },
        },
      },

      put: {
        tags: ["Products"],
        summary: "Update a product",
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
                $ref: "#/components/schemas/ProductUpdate",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Product updated successfully",
          },
          404: {
            description: "Product not found",
          },
        },
      },

      delete: {
        tags: ["Products"],
        summary: "Delete a product",
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
            description: "Product deleted successfully",
          },
          404: {
            description: "Product not found",
          },
        },
      },
    },
  },

  components: {
    schemas: {
      ProductInput: {
        type: "object",
        required: ["name", "sku", "price", "category"],
        properties: {
          name: {
            type: "string",
            example: "Wireless Mouse",
          },
          description: {
            type: "string",
            example: "Ergonomic wireless mouse",
          },
          sku: {
            type: "string",
            example: "WM-001",
          },
          price: {
            type: "number",
            example: 4500.0,
          },
          category: {
            type: "string",
            example: "Electronics",
          },
          stock: {
            type: "integer",
            example: 50,
          },
        },
      },

      ProductUpdate: {
        type: "object",
        properties: {
          name: {
            type: "string",
            example: "Wireless Mouse Pro",
          },
          description: {
            type: "string",
            example: "Updated description",
          },
          sku: {
            type: "string",
            example: "WM-001",
          },
          price: {
            type: "number",
            example: 5000.0,
          },
          category: {
            type: "string",
            example: "Electronics",
          },
          stock: {
            type: "integer",
            example: 75,
          },
          status: {
            type: "string",
            enum: ["ACTIVE", "INACTIVE"],
            example: "ACTIVE",
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
