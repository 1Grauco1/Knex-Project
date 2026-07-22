import db from "../config/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

function register(name, email, password, role) {
  const existing = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(email);
  if (existing) {
    return { error: "Email already registered", status: 409 };
  }

  const hashed = bcrypt.hashSync(password, 10);
  const result = db
    .prepare("INSERT INTO users(name, email, password, role) VALUES (?, ?, ?, ?)")
    .run(name, email, hashed, role);

  return { id: result.lastInsertRowid, name, email, role };
}

function login(email, password) {
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user) {
    return { error: "Invalid credentials", status: 401 };
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return { error: "Invalid credentials", status: 401 };
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "24h" },
  );

  return { token };
}

export { register, login };
