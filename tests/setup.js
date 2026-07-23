import { beforeAll, afterAll, afterEach } from "vitest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../src/config/database.js";

export function cleanDb() {
  db.exec("DELETE FROM order_items");
  db.exec("DELETE FROM orders");
  db.exec("DELETE FROM products");
  db.exec("DELETE FROM users");
  db.exec("DELETE FROM sqlite_sequence");
}

export function seedUser(data = {}) {
  const defaults = {
    name: "Test User",
    email: `test${Date.now()}${Math.random().toString(36).slice(2)}@example.com`,
    password: "password123",
    role: "client",
    ...data,
  };
  const hashed = bcrypt.hashSync(defaults.password, 10);
  const result = db
    .prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)")
    .run(defaults.name, defaults.email, hashed, defaults.role);
  return { ...defaults, id: Number(result.lastInsertRowid) };
}

export function seedProduct(data = {}) {
  const defaults = {
    name: `Product ${Date.now()}-${Math.random().toString(36).slice(2)}`,
    description: "Test product",
    price: 29.99,
    stock_quantity: 50,
    ...data,
  };
  const result = db
    .prepare("INSERT INTO products (name, description, price, stock_quantity) VALUES (?, ?, ?, ?)")
    .run(defaults.name, defaults.description, defaults.price, defaults.stock_quantity);
  return { ...defaults, id: Number(result.lastInsertRowid) };
}

export function generateToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "24h" });
}
