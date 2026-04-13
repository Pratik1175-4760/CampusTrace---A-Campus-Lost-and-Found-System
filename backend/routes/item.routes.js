import express from "express";
import { upload } from "../config/cloudinary.js";
import { reportItem, getItems, getItemById, verifyItem, collectItem, updateStatus } from "../controllers/item.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getItems);
router.get("/:id", getItemById);
router.post("/report", upload.single("image"), reportItem);
router.post("/:id/collect", collectItem);
router.patch("/:id/verify", protect, verifyItem);
router.patch("/:id/status", protect, updateStatus);

export default router;