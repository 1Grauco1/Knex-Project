import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { cleanDb, seedUser, seedProduct, generateToken } from "./setup.js";

describe("Products", () => {
  let sellerToken;
  let clientToken;

  beforeEach(() => {
    cleanDb();
    const seller = seedUser({ role: "seller", email: "seller@test.com" });
    const client = seedUser({ role: "client", email: "client@test.com" });
    sellerToken = generateToken(seller);
    clientToken = generateToken(client);
  });

  describe("GET /products", () => {
    it("should return 401 without token", async () => {
      const res = await request(app).get("/products");
      expect(res.status).toBe(401);
    });

    it("should return empty array when no products", async () => {
      const res = await request(app)
        .get("/products")
        .set("Authorization", `Bearer ${clientToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("should return all products", async () => {
      seedProduct({ name: "Mouse", price: 29.99, stock_quantity: 10 });
      seedProduct({ name: "Keyboard", price: 49.99, stock_quantity: 5 });

      const res = await request(app)
        .get("/products")
        .set("Authorization", `Bearer ${clientToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });
  });

  describe("GET /products/:id", () => {
    it("should return a product by id", async () => {
      const product = seedProduct({ name: "Mouse", price: 29.99 });

      const res = await request(app)
        .get(`/products/${product.id}`)
        .set("Authorization", `Bearer ${clientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Mouse");
      expect(res.body.price).toBe(29.99);
    });

    it("should return 404 for non-existent product", async () => {
      const res = await request(app)
        .get("/products/9999")
        .set("Authorization", `Bearer ${clientToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Product not found");
    });
  });

  describe("POST /products", () => {
    it("should create a product (seller)", async () => {
      const res = await request(app)
        .post("/products")
        .set("Authorization", `Bearer ${sellerToken}`)
        .send({
          name: "Mouse",
          description: "Wireless mouse",
          price: 29.99,
          stock_quantity: 10,
        });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe("Mouse");
      expect(res.body.price).toBe(29.99);
    });

    it("should return 403 for client trying to create product", async () => {
      const res = await request(app)
        .post("/products")
        .set("Authorization", `Bearer ${clientToken}`)
        .send({
          name: "Mouse",
          price: 29.99,
          stock_quantity: 10,
        });

      expect(res.status).toBe(403);
    });

    it("should return 400 if required fields missing", async () => {
      const res = await request(app)
        .post("/products")
        .set("Authorization", `Bearer ${sellerToken}`)
        .send({ name: "Mouse" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Name, price and stock_quantity are required");
    });

    it("should return 400 for negative price", async () => {
      const res = await request(app)
        .post("/products")
        .set("Authorization", `Bearer ${sellerToken}`)
        .send({
          name: "Mouse",
          price: -10,
          stock_quantity: 10,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Price and stock must be non negative");
    });
  });

  describe("PUT /products/:id", () => {
    it("should update a product (seller)", async () => {
      const product = seedProduct({ name: "Mouse" });

      const res = await request(app)
        .put(`/products/${product.id}`)
        .set("Authorization", `Bearer ${sellerToken}`)
        .send({
          name: "Updated Mouse",
          description: "Updated",
          price: 39.99,
          stock_quantity: 20,
        });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Updated Mouse");
      expect(res.body.price).toBe(39.99);
    });

    it("should return 404 for non-existent product", async () => {
      const res = await request(app)
        .put("/products/9999")
        .set("Authorization", `Bearer ${sellerToken}`)
        .send({
          name: "Mouse",
          price: 29.99,
          stock_quantity: 10,
        });

      expect(res.status).toBe(404);
    });

    it("should return 403 for client trying to update", async () => {
      const product = seedProduct({ name: "Mouse" });

      const res = await request(app)
        .put(`/products/${product.id}`)
        .set("Authorization", `Bearer ${clientToken}`)
        .send({
          name: "Mouse",
          price: 29.99,
          stock_quantity: 10,
        });

      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /products/:id", () => {
    it("should delete a product (seller)", async () => {
      const product = seedProduct({ name: "Mouse" });

      const res = await request(app)
        .delete(`/products/${product.id}`)
        .set("Authorization", `Bearer ${sellerToken}`);

      expect(res.status).toBe(204);
    });

    it("should return 404 for non-existent product", async () => {
      const res = await request(app)
        .delete("/products/9999")
        .set("Authorization", `Bearer ${sellerToken}`);

      expect(res.status).toBe(404);
    });

    it("should return 409 if product has been sold", async () => {
      const product = seedProduct({ name: "Mouse" });

      const client = seedUser({ role: "client", email: "buyer@test.com" });
      const clientJwt = generateToken(client);

      await request(app)
        .post("/orders")
        .set("Authorization", `Bearer ${clientJwt}`)
        .send({ items: [{ product_id: product.id, quantity: 1 }] });

      const res = await request(app)
        .delete(`/products/${product.id}`)
        .set("Authorization", `Bearer ${sellerToken}`);

      expect(res.status).toBe(409);
    });
  });
});
