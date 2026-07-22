const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "TechMart API",
    version: "1.0.0",
    description: "API for TechMart virtual store",
  },
  servers: [{ url: "http://localhost:3001" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "apiKey",
        in: "header",
        name: "Authorization",
        description: "Enter: Bearer <token>",
      },
    },
    schemas: {
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password", "role"],
        properties: {
          name: { type: "string", example: "Glauco" },
          email: {
            type: "string",
            format: "email",
            example: "Glauco@test.com",
          },
          password: { type: "string", example: "123456" },
          role: {
            type: "string",
            enum: ["client", "seller"],
            example: "client",
          },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "Glaco@test.com" },
          password: { type: "string", example: "123456" },
        },
      },
      Product: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Wireless Mouse" },
          description: { type: "string", example: "Ergonomic wireless mouse" },
          price: { type: "number", example: 29.99 },
          stock_quantity: { type: "integer", example: 50 },
          has_been_sold: { type: "integer", example: 0 },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },
      CreateProductRequest: {
        type: "object",
        required: ["name", "price", "stock_quantity"],
        properties: {
          name: { type: "string", example: "Wireless Mouse" },
          description: { type: "string", example: "Ergonomic wireless mouse" },
          price: { type: "number", example: 29.99 },
          stock_quantity: { type: "integer", example: 50 },
        },
      },
      OrderItem: {
        type: "object",
        required: ["product_id", "quantity"],
        properties: {
          product_id: { type: "integer", example: 1 },
          quantity: { type: "integer", example: 2 },
        },
      },
      Order: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          user_id: { type: "integer", example: 1 },
          total_price: { type: "number", example: 59.98 },
          created_at: { type: "string", format: "date-time" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "integer" },
                order_id: { type: "integer" },
                product_id: { type: "integer" },
                product_name: { type: "string" },
                quantity: { type: "integer" },
                unit_price: { type: "number" },
              },
            },
          },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "User registered",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "integer" },
                    name: { type: "string" },
                    email: { type: "string" },
                    role: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          409: {
            description: "Email already registered",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and get a JWT token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { token: { type: "string" } },
                },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/products": {
      get: {
        tags: ["Products"],
        summary: "List all products",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Product list",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Product" },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
        },
      },
      post: {
        tags: ["Products"],
        summary: "Create a product (seller only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateProductRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Product created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Product" },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: { description: "Unauthorized" },
          403: { description: "Access denied (not a seller)" },
        },
      },
    },
    "/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Get a product by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Product found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Product" },
              },
            },
          },
          401: { description: "Unauthorized" },
          404: {
            description: "Product not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      put: {
        tags: ["Products"],
        summary: "Update a product (seller only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateProductRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Product updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Product" },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: { description: "Unauthorized" },
          403: { description: "Access denied" },
          404: {
            description: "Product not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Products"],
        summary: "Delete a product (seller only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          204: { description: "Product deleted" },
          401: { description: "Unauthorized" },
          403: { description: "Access denied" },
          404: {
            description: "Product not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/orders": {
      post: {
        tags: ["Orders"],
        summary: "Create an order (client only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["items"],
                properties: {
                  items: {
                    type: "array",
                    items: { $ref: "#/components/schemas/OrderItem" },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Order created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Order" },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: { description: "Unauthorized" },
          403: { description: "Access denied (not a client)" },
          409: {
            description: "Insufficient stock",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      get: {
        tags: ["Orders"],
        summary: "List orders for the logged-in user (client only)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Order list",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Order" },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          403: { description: "Access denied (not a client)" },
        },
      },
    },
    "/seller/sales": {
      get: {
        tags: ["Seller"],
        summary: "List all sales (seller only)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Sales list" },
          401: { description: "Unauthorized" },
          403: { description: "Access denied (not a seller)" },
        },
      },
    },
    "/seller/sales/{product_id}": {
      get: {
        tags: ["Seller"],
        summary: "Get sales by product (seller only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "product_id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: { description: "Sales details" },
          401: { description: "Unauthorized" },
          403: { description: "Access denied" },
          404: {
            description: "Product not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
  },
};

export default swaggerDocument;
