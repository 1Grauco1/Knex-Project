import { Router } from "express";
import authenticate from "../middleware/auth.js";
import role from "../middleware/role.js";
import sellerController from "../controllers/seller.controller.js";

const router = Router();

router.get("/sales", authenticate, role("seller"), sellerController.listSales);
router.get(
  "/sales/:product_id",
  authenticate,
  role("seller"),
  sellerController.listSalesByProduct,
);

export default router;
