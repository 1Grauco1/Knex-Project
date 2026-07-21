import { Router } from "express";
import authenticate from "../middleware/auth.js";
import role from "../middleware/role.js";
import productController from "../controllers/product.controller.js";

const router = Router();

router.get("/", authenticate, productController.findAll);
router.get("/:id", authenticate, productController.findById);
router.post("/", authenticate, role("seller"), productController.create);
router.put("/:id", authenticate, role("seller"), productController.update);
router.delete("/:id", authenticate, role("seller"), productController.remove);

export default router;
