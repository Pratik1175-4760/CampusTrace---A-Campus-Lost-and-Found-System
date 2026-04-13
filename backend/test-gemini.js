/**
 * Quick Gemini API test — run BEFORE starting the server
 *
 * Usage:
 *   cd backend
 *   node test-gemini.js
 *
 * Should print the model's response if your key is valid.
 */

import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const key = process.env.GEMINI_API_KEY;

if (!key || key === "your_gemini_api_key_here") {
  console.error("❌  GEMINI_API_KEY is not set in backend/.env");
  console.error("    Get your free key at: https://aistudio.google.com");
  process.exit(1);
}

console.log("🔑  Key found:", key.slice(0, 8) + "..." + key.slice(-4));
console.log("📡  Calling Gemini API...\n");

const ai = new GoogleGenAI({ apiKey: key });

try {
  // ── Test 1: basic text ──────────────────────────────────────────
  const r1 = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-05-20",
    contents: "Say exactly: PICT Lost and Found AI is working!",
  });
  console.log("✅  Text test:", r1.text);

  // ── Test 2: JSON output (smart search simulation) ───────────────
  const r2 = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-05-20",
    contents: [
      {
        role: "user",
        parts: [{
          text: `Parse this lost item search: "blue bottle near library"
Return ONLY JSON: {"category":"<value>","area":"<value>","keywords":["<words>"],"dateHint":null}`,
        }],
      },
    ],
  });
  console.log("✅  JSON test:", r2.text.trim());

  console.log("\n🎉  Gemini API is working correctly!");
  console.log("    You can now start the backend with: npm run dev");

} catch (err) {
  console.error("\n❌  Gemini API error:", err.message);

  if (err.message?.includes("API_KEY_INVALID") || err.message?.includes("API key")) {
    console.error("\n   → Your API key is invalid or not activated yet.");
    console.error("   → Wait 1-2 minutes after creating the key, then retry.");
  } else if (err.message?.includes("quota")) {
    console.error("\n   → Daily quota exceeded. Free tier resets at midnight Pacific time.");
  } else if (err.message?.includes("model")) {
    console.error("\n   → Model not found. Trying fallback model...");
    try {
      const fallback = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: "Say: fallback works",
      });
      console.log("✅  Fallback model works:", fallback.text);
      console.log("\n   → Update MODEL in ai.controller.js to: gemini-2.0-flash");
    } catch (e2) {
      console.error("❌  Fallback also failed:", e2.message);
    }
  }
  process.exit(1);
}