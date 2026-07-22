import { Router } from "express";
import authenticate from "../middleware/auth.js";
import role from "../middleware/role.js";
import orderController from "../controllers/order.controller.js";

const router = Router();

router.post("/", authenticate, role("client"), orderController.create);
router.get("/", authenticate, role("client"), orderController.listByUser);

export default router;
