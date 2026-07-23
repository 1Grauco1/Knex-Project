import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { cleanDb, seedUser, generateToken } from "./setup.js";

describe("Middleware", () => {
  beforeEach(() => {
    cleanDb();
  });

  describe("Authentication", () => {
    it("should return 401 without Authorization header", async () => {
      const res = await request(app).get("/products");
      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Token not provided");
    });

    it("should return 401 with invalid token", async () => {
      const res = await request(app)
        .get("/products")
        .set("Authorization", "Bearer invalidtoken");

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Invalid or expired token");
    });

    it("should return 401 with malformed header", async () => {
      const res = await request(app)
        .get("/products")
        .set("Authorization", "InvalidFormat");

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Token not provided");
    });
  });

  describe("Role authorization", () => {
    it("should return 403 when client accesses seller route", async () => {
      const client = seedUser({ role: "client", email: "client@test.com" });
      const token = generateToken(client);

      const res = await request(app)
        .post("/products")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Mouse", price: 29.99, stock_quantity: 10 });

      expect(res.status).toBe(403);
    });

    it("should return 403 when seller accesses client route", async () => {
      const seller = seedUser({ role: "seller", email: "seller@test.com" });
      const token = generateToken(seller);

      const res = await request(app)
        .get("/orders")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
    });
  });

  describe("Error handling", () => {
    it("should return 404 for unknown routes", async () => {
      const res = await request(app).get("/unknown");
      expect(res.status).toBe(404);
    });
  });
});
