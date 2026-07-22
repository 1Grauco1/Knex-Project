import orderService from "../services/order.service.js";

function create(req, res) {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Items array is required" });
  }

  try {
    const order = orderService.createOrder(req.user.id, items);
    return res.status(201).json(order);
  } catch (err) {
    return res
      .status(err.status || 500)
      .json({ error: err.error || "Internal server error" });
  }
}

function listByUser(req, res) {
  const orders = orderService.findOrdersByUser(req.user.id);
  return res.json(orders);
}

export { create, listByUser };
