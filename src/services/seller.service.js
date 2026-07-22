import db from "../config/database.js";

function findAllSales() {
  const orders = db
    .prepare(
      `SELECT o.*, u.name AS client_name 
      FROM orders o JOIN users u ON u.id= o.user_id 
      ORDER BY o.created_at DESC`,
    )
    .all();

  return orders.map((order) => {
    const items = db
      .prepare(
        `SELECT oi.*, p.name AS product_name 
        FROM order_items oi JOIN products p ON p.id= oi.product_id 
        WHERE oi.order_id = ?`,
      )
      .all(order_id);

    return { ...order, items };
  });
}

function findSalesByProduct(productId) {
  const product = db
    .prepare("SELECT * FROM products where id= ?")
    .get(productId);

  if (!product) return null;

  const items = db
    .prepare(
      `SELECT oi.*, o.created_at AS order_date, u.name AS client_name
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     JOIN users u ON u.id = o.user_id
     WHERE oi.product_id = ?
     ORDER BY o.created_at DESC`,
    )
    .all(productId);

  const totalSold = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalRevenue = items.reduce(
    (sum, i) => sum + i.quantity * i.unit_price,
    0,
  );

  return {
    product: { id: product.id, name: product.name },
    total_sold: totalSold,
    total_revenue: totalRevenue,
    sales: items,
  };
}

export { findAllSales, findSalesByProduct };
