import db from "../config/database.js";

function findAll() {
  return db.prepare("SELECT * FROM products").all();
}

function findById(id) {
  return db.prepare("SELECT * FROM products WHERE id = ?").get(id);
}

function create(name, description, price, stock_quantity) {
  const result = db
    .prepare(
      "INSERT INTO products (name, description, price, stock_quantity) VALUES (?, ?, ?, ?)",
    )
    .run(name, description, price, stock_quantity);

  return findById(result.lastInsertRowid);
}

function update(id, name, description, price, stock_quantity) {
  const product = findById(id);
  if (!product) return null;

  db.prepare(
    "UPDATE products SET name = ?, description = ?, price = ?, stock_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
  ).run(name, description, price, stock_quantity, id);

  return findById(id);
}

function remove(id) {
  const product = findById(id);
  if (!product) return { error: "Product not found", status: 404 };
  if (product.has_been_sold) {
    return { error: "Cannot delete a produt that has been sold", status: 409 };
  }

  db.prepare("DELETE FROM products WHERE id= ?").run(id);
  return { delete: true };
}

export { findAll, findById, create, update, remove };
