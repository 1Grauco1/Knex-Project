import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { cleanDb } from "./setup.js";

describe("Auth", () => {
  beforeEach(() => {
    cleanDb();
  });

  describe("POST /auth/register", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/auth/register").send({
        name: "John",
        email: "john@test.com",
        password: "123456",
        role: "client",
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.name).toBe("John");
      expect(res.body.email).toBe("john@test.com");
      expect(res.body.role).toBe("client");
    });

    it("should return 400 if fields are missing", async () => {
      const res = await request(app).post("/auth/register").send({
        name: "John",
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("All fields are required");
    });

    it("should return 400 for invalid role", async () => {
      const res = await request(app).post("/auth/register").send({
        name: "John",
        email: "john@test.com",
        password: "123456",
        role: "admin",
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Role must be client or seller");
    });

    it("should return 409 for duplicate email", async () => {
      await request(app).post("/auth/register").send({
        name: "John",
        email: "john@test.com",
        password: "123456",
        role: "client",
      });

      const res = await request(app).post("/auth/register").send({
        name: "Jane",
        email: "john@test.com",
        password: "789012",
        role: "seller",
      });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe("Email already registered");
    });
  });

  describe("POST /auth/login", () => {
    it("should login and return a token", async () => {
      await request(app).post("/auth/register").send({
        name: "John",
        email: "john@test.com",
        password: "123456",
        role: "client",
      });

      const res = await request(app).post("/auth/login").send({
        email: "john@test.com",
        password: "123456",
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
    });

    it("should return 400 if email or password missing", async () => {
      const res = await request(app).post("/auth/login").send({
        email: "john@test.com",
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Email and password are required");
    });

    it("should return 401 for wrong credentials", async () => {
      await request(app).post("/auth/register").send({
        name: "John",
        email: "john@test.com",
        password: "123456",
        role: "client",
      });

      const res = await request(app).post("/auth/login").send({
        email: "john@test.com",
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Invalid credentials");
    });

    it("should return 401 for non-existent user", async () => {
      const res = await request(app).post("/auth/login").send({
        email: "nonexistent@test.com",
        password: "123456",
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Invalid credentials");
    });
  });
});
