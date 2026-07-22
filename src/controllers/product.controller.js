import * as productService from "../services/product.service.js";

function findAll(res) {
  const products = productService.findALl();
  return res.json(products);
}

function findById(req, res) {
  const product = productService.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  return res.json(product);
}

function create(req, res) {
  const { name, description, price, stock_quantity } = req.body;

  if (!name || price === undefined || stock_quantity === undefined) {
    return res
      .status(400)
      .json({ error: "Name, price and stock_quantity are required" });
  }

  if (price < 0 || stock_quantity < 0) {
    return res
      .status(400)
      .json({ error: "Price and stock must be non negative" });
  }

  const product = productService.create(
    name,
    description,
    price,
    stock_quantity,
  );
  return res.status(201).json(product);
}

function update(req, res) {
  const { name, description, price, stock_quantity } = req.body;

  if (!name || price === undefined || stock_quantity === undefined) {
    return res
      .status(400)
      .json({ error: "Name, price and stock_quantity are required" });
  }

  const product = productService.update(
    req.params.id,
    name,
    description,
    price,
    stock_quantity,
  );
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  return res.json(product);
}

function remove(req, res) {
  const result = productService.remove(req.params.id);
  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }
  return res.status(204).send();
}

export { findAll, findById, create, update, remove };
