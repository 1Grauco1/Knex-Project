import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { cleanDb, seedUser, seedProduct, generateToken } from "./setup.js";

describe("Orders", () => {
  let clientToken;
  let sellerToken;
  let client;
  let seller;

  beforeEach(() => {
    cleanDb();
    seller = seedUser({ role: "seller", email: "seller@test.com" });
    client = seedUser({ role: "client", email: "client@test.com" });
    sellerToken = generateToken(seller);
    clientToken = generateToken(client);
  });

  describe("POST /orders", () => {
    it("should create an order", async () => {
      const product = seedProduct({ name: "Mouse", price: 29.99, stock_quantity: 10 });

      const res = await request(app)
        .post("/orders")
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ items: [{ product_id: product.id, quantity: 2 }] });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.total_price).toBe(59.98);
      expect(res.body.items).toHaveLength(1);
    });

    it("should return 400 if items missing", async () => {
      const res = await request(app)
        .post("/orders")
        .set("Authorization", `Bearer ${clientToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Items array is required");
    });

    it("should return 400 for empty items array", async () => {
      const res = await request(app)
        .post("/orders")
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ items: [] });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Items array is required");
    });

    it("should return 403 for seller trying to create order", async () => {
      const product = seedProduct({ name: "Mouse", price: 29.99, stock_quantity: 10 });

      const res = await request(app)
        .post("/orders")
        .set("Authorization", `Bearer ${sellerToken}`)
        .send({ items: [{ product_id: product.id, quantity: 1 }] });

      expect(res.status).toBe(403);
    });

    it("should return 404 for non-existent product", async () => {
      const res = await request(app)
        .post("/orders")
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ items: [{ product_id: 9999, quantity: 1 }] });

      expect(res.status).toBe(404);
    });

    it("should return 409 for insufficient stock", async () => {
      const product = seedProduct({ name: "Mouse", price: 29.99, stock_quantity: 1 });

      const res = await request(app)
        .post("/orders")
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ items: [{ product_id: product.id, quantity: 5 }] });

      expect(res.status).toBe(409);
    });

    it("should reduce stock after order", async () => {
      const product = seedProduct({ name: "Mouse", price: 29.99, stock_quantity: 10 });

      await request(app)
        .post("/orders")
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ items: [{ product_id: product.id, quantity: 3 }] });

      const res = await request(app)
        .get(`/products/${product.id}`)
        .set("Authorization", `Bearer ${clientToken}`);

      expect(res.body.stock_quantity).toBe(7);
    });
  });

  describe("GET /orders", () => {
    it("should return user's orders", async () => {
      const product = seedProduct({ name: "Mouse", price: 29.99, stock_quantity: 10 });

      await request(app)
        .post("/orders")
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ items: [{ product_id: product.id, quantity: 1 }] });

      const res = await request(app)
        .get("/orders")
        .set("Authorization", `Bearer ${clientToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].items).toHaveLength(1);
    });

    it("should return 403 for seller", async () => {
      const res = await request(app)
        .get("/orders")
        .set("Authorization", `Bearer ${sellerToken}`);

      expect(res.status).toBe(403);
    });

    it("should return empty array for user with no orders", async () => {
      const res = await request(app)
        .get("/orders")
        .set("Authorization", `Bearer ${clientToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });
});
