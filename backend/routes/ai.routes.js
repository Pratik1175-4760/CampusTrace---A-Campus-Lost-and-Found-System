import express from "express";
import { analyzeImage, smartSearch } from "../controllers/ai.controller.js";

const router = express.Router();

// POST → analyze uploaded image using Gemini
router.post("/analyze-image", analyzeImage);

// POST → smart natural language search parsing
router.post("/smart-search", smartSearch);

export default router;