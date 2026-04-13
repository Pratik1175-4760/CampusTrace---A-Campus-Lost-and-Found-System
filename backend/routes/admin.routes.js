import express from "express";
import { adminLogin, getAllItemsAdmin, getTransactions, getStats } from "../controllers/admin.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authLimiter, validatePagination } from "../middleware/validation.js";

const router = express.Router();

router.post("/login", authLimiter, adminLogin);
router.get("/items", protect, validatePagination, getAllItemsAdmin);
router.get("/transactions", protect, validatePagination, getTransactions);
router.get("/stats", protect, getStats);

export default router;