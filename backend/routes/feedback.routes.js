import express from "express";
import {
  submitFeedback,
  getFeedback,
  getFeedbackById,
  updateFeedbackStatus,
  deleteFeedback,
  getFeedbackStats,
} from "../controllers/feedback.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { submitLimiter, validatePagination, validateObjectId } from "../middleware/validation.js";

const router = express.Router();

// Public routes
router.post("/", submitLimiter, submitFeedback);
router.get("/", validatePagination, getFeedback);
router.get("/:id", validateObjectId("id"), getFeedbackById);

// Admin routes (protected)
router.patch("/:id/status", protect, validateObjectId("id"), updateFeedbackStatus);
router.delete("/:id", protect, validateObjectId("id"), deleteFeedback);
router.get("/stats/overview", protect, getFeedbackStats);

export default router;
