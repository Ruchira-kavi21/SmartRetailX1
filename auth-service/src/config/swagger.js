const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",

        info: {
            title: "SmartRetailX Auth Service API",
            version: "1.0.0",
            description:
                "Authentication and authorization API for the SmartRetailX platform"
        },

        servers: [
            {
                url: "http://localhost:5001",
                description: "Local development server"
            }
        ],

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        }
    },

    apis: ["./src/routes/*.js"]
};

module.exports = swaggerJsdoc(options);