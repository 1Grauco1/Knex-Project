import db from "../config/database.js";

function createOrder(userId, items) {
  const transaction = db.transaction(() => {
    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const product = db
        .prepare("SELECT * FROM products WHERE id = ?")
        .get(item.product_id);
      if (!product) {
        throw { error: "Product ${item.product_id} not found", status: 404 };
      }
      if (product.stock_quantity < item.quantity) {
        throw { error: `Insufficient stock for ${product.name}`, status: 409 };
      }
      if (item.quantity <= 0) {
        throw { error: "Quantity must be positive", status: 400 };
      }

      const unitPrice = product.price;
      totalPrice += unitPrice * item.quantity;

      db.prepare(
        "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?",
      ).run(item.quantity, product.id);

      db.prepare("UPDATE products SET has_been_sold = 1 WHERE id = ?").run(
        product.id,
      );

      orderItems.push({
        product_id: product.id,
        quantity: item.quantity,
        unit_price: unitPrice,
      });
    }

    const orderResult = db
      .prepare("INSERT INTO orders (user_id, total_price) VALUES (?, ?)")
      .run(userId, totalPrice);

    const orderId = orderResult.lastInsertRowid;

    const insertItem = db.prepare(
      "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
    );

    for (const oi of orderItems) {
      insertItem.run(orderId, oi.product_id, oi.quantity, oi.unit_price);
    }

    return { id: orderId, total_price: totalPrice, items: orderItems };
  });

  return transaction();
}

function findOrdersByUser(userId) {
  const orders = db
    .prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId);

  return orders.map((order) => {
    const items = db
      .prepare(
        `SELECT oi.*, p.name AS product_name 
        FROM order_items oi JOIN products p ON p.id = oi.product_id 
        WHERE oi.order_id = ?`,
      )
      .all(order.id);

    return { ...order, items };
  });
}

export { createOrder, findOrdersByUser };
