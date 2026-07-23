import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { cleanDb, seedUser, seedProduct, generateToken } from "./setup.js";

describe("Seller", () => {
  let sellerToken;
  let clientToken;

  beforeEach(() => {
    cleanDb();
    const seller = seedUser({ role: "seller", email: "seller@test.com" });
    const client = seedUser({ role: "client", email: "client@test.com" });
    sellerToken = generateToken(seller);
    clientToken = generateToken(client);
  });

  describe("GET /seller/sales", () => {
    it("should return all sales", async () => {
      const product = seedProduct({ name: "Mouse", price: 29.99, stock_quantity: 10 });

      await request(app)
        .post("/orders")
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ items: [{ product_id: product.id, quantity: 2 }] });

      const res = await request(app)
        .get("/seller/sales")
        .set("Authorization", `Bearer ${sellerToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toHaveProperty("client_name");
      expect(res.body[0].items).toHaveLength(1);
    });

    it("should return 403 for client", async () => {
      const res = await request(app)
        .get("/seller/sales")
        .set("Authorization", `Bearer ${clientToken}`);

      expect(res.status).toBe(403);
    });

    it("should return empty array when no sales", async () => {
      const res = await request(app)
        .get("/seller/sales")
        .set("Authorization", `Bearer ${sellerToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe("GET /seller/sales/:product_id", () => {
    it("should return sales for a specific product", async () => {
      const product = seedProduct({ name: "Mouse", price: 29.99, stock_quantity: 10 });

      await request(app)
        .post("/orders")
        .set("Authorization", `Bearer ${clientToken}`)
        .send({ items: [{ product_id: product.id, quantity: 3 }] });

      const res = await request(app)
        .get(`/seller/sales/${product.id}`)
        .set("Authorization", `Bearer ${sellerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.product.name).toBe("Mouse");
      expect(res.body.total_sold).toBe(3);
      expect(res.body.total_revenue).toBe(89.97);
      expect(res.body.sales).toHaveLength(1);
    });

    it("should return 404 for non-existent product", async () => {
      const res = await request(app)
        .get("/seller/sales/9999")
        .set("Authorization", `Bearer ${sellerToken}`);

      expect(res.status).toBe(404);
    });

    it("should return zero stats for unsold product", async () => {
      const product = seedProduct({ name: "Mouse", price: 29.99, stock_quantity: 10 });

      const res = await request(app)
        .get(`/seller/sales/${product.id}`)
        .set("Authorization", `Bearer ${sellerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.total_sold).toBe(0);
      expect(res.body.total_revenue).toBe(0);
      expect(res.body.sales).toEqual([]);
    });

    it("should return 403 for client", async () => {
      const product = seedProduct({ name: "Mouse", price: 29.99 });

      const res = await request(app)
        .get(`/seller/sales/${product.id}`)
        .set("Authorization", `Bearer ${clientToken}`);

      expect(res.status).toBe(403);
    });
  });
});
