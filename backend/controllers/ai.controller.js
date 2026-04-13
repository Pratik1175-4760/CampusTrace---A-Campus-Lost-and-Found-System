import { GoogleGenAI } from "@google/genai";
import { AppError } from "../middleware/errorHandler.js";

// ── FastAPI AI server (your trained MobileNetV2 — handles image analysis) ─────
// Running locally: http://localhost:8001
// After deployment on Render: set AI_SERVER_URL in backend .env
const AI_SERVER = process.env.AI_SERVER_URL || "http://localhost:8001";

// ── Gemini SDK (text only — smart search, works free in India, no vision) ─────
const getAI = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "your_gemini_api_key_here") {
    throw new AppError(
      "Gemini API key not configured. Add GEMINI_API_KEY=your_key to backend/.env",
      500
    );
  }
  return new GoogleGenAI({ apiKey: key });
};

// gemini-1.5-flash → text-only, stable, free tier works in India
const MODEL = "gemini-1.5-flash";

// ── Safe JSON parser ──────────────────────────────────────────────────────────
const safeParseJSON = (text, fallback) => {
  try {
    const clean = text.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return fallback;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/analyze-image
// Body: { imageBase64: string, mimeType?: string }
// NOW calls FastAPI (trained MobileNetV2) instead of Gemini Vision
// Gemini Vision = blocked in India on free tier
// MobileNetV2 = runs locally, completely free, no API restrictions
// ─────────────────────────────────────────────────────────────────────────────
export const analyzeImage = async (req, res) => {
  const { imageBase64, mimeType = "image/jpeg" } = req.body;
  if (!imageBase64) throw new AppError("imageBase64 is required", 400);

  try {
    const response = await fetch(`${AI_SERVER}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64, mimeType }),
      signal: AbortSignal.timeout(15000), // 15s timeout
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || `AI server responded with ${response.status}`);
    }

    const data = await response.json();

    // Sanitise category — same as before
    const VALID = ["ID Card", "Bottle", "Calculator", "Accessory", "Other"];
    const category = VALID.includes(data.category) ? data.category : "Other";

    res.json({
      success: true,
      data: {
        category:    category,
        description: data.description || "",
        tags:        data.tags        || [],
        confidence:  data.confidence  || "low",
      },
    });

  } catch (err) {
    console.error("AI server error:", err.message);

    if (err.message?.includes("ECONNREFUSED") || err.message?.includes("fetch failed")) {
      // AI server not running — graceful fallback so form still works manually
      return res.json({
        success: true,
        data: { category: "Other", description: "", tags: [], confidence: "low" },
        warning: "AI server offline. Please fill the form manually.",
      });
    }

    if (err.message?.includes("timeout") || err.name === "TimeoutError") {
      return res.json({
        success: true,
        data: { category: "Other", description: "", tags: [], confidence: "low" },
        warning: "AI server took too long. Please fill the form manually.",
      });
    }

    // Any other error — graceful fallback
    res.json({
      success: true,
      data: { category: "Other", description: "", tags: [], confidence: "low" },
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/smart-search
// Body: { query: string }
// STILL uses Gemini — text-only, no vision, works free in India ✅
// ─────────────────────────────────────────────────────────────────────────────
export const smartSearch = async (req, res) => {
  const { query } = req.body;
  if (!query?.trim()) throw new AppError("query is required", 400);

  const ai = getAI();

  const prompt = `You are a search parser for a campus LOST ITEMS system at PICT Pune.
This system helps users find items they have LOST on campus.

Valid categories: "ID Card", "Bottle", "Calculator", "Accessory", "Other"
Valid location areas: "Library", "Playground", "Classroom", "Building Block", "Seminar Hall", "Campus"

User search: "${query}"

IMPORTANT: Extract keywords for finding LOST items only. 
- Ignore words like "found", "saw", "spotted" (these are contextual)
- Focus on: WHAT was lost (item, color, description) and WHERE (location)
- Example: "laptop found in library" means user lost a laptop in library → extract "laptop" and "Library"

Return ONLY this JSON — no markdown, no extra text:
{
  "category": "<matched category or null>",
  "area": "<matched location or null>",
  "keywords": ["<2-4 keywords from the query - exclude 'found', 'saw', 'spotted'>"],
  "dateHint": "<today | yesterday | null>"
}

Examples:
"blue bottle in library" → {"category":"Bottle","area":"Library","keywords":["blue","bottle"],"dateHint":null}
"laptop found in library" → {"category":null,"area":"Library","keywords":["laptop"],"dateHint":null}
"id card classroom today" → {"category":"ID Card","area":"Classroom","keywords":["id","card"],"dateHint":"today"}`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const raw    = response.text ?? "";
    const parsed = safeParseJSON(raw, {
      category: null,
      area:     null,
      keywords: [query.trim()],
      dateHint: null,
    });

    res.json({ success: true, data: parsed });

  } catch (err) {
    console.error("Gemini smart search error:", err.message);
    // Graceful fallback — plain keyword search still works
    res.json({
      success: true,
      data: { category: null, area: null, keywords: [query.trim()], dateHint: null },
    });
  }
};
