import "dotenv/config";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { createTables } from "./models/tables.js";
import swaggerDocument from "./config/swagger.js";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import sellerRoutes from "./routes/seller.routes.js";

createTables();

const app = express();
app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/seller", sellerRoutes);

app.use((err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    error: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`TechMart API running on http://localhost:${PORT}`);
});
