import * as sellerService from "../services/seller.service.js";

function listSales(req, res) {
  const sales = sellerService.findAllSales();
  return res.json(sales);
}

function listSalesByProduct(req, res) {
  const { product_id } = req.params;
  const result = sellerService.findSalesByProduct(product_id);

  if (!result) {
    return res.status(404).json({ error: "Product not found" });
  }

  if (result.sales.length === 0) {
    return res.json({
      message: "This product has never been sold",
      product: result.product,
      total_sold: 0,
      total_revenue: 0,
      sales: [],
    });
  }

  return res.json(result);
}

export { listSales, listSalesByProduct };
