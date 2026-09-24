import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: "25mb" }));

// Initialize Gemini if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// AI Crop Disease Diagnostic Endpoint
app.post("/api/diagnose", async (req, res) => {
  try {
    const { imageBase64, cropHint, language = "hi" } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: "Gemini API key is not configured. Falling back to local diagnostic engine.",
      });
    }

    const promptText = `
You are KisanMitra, an expert agronomist and plant pathologist specializing in Indian agriculture (Bihar, UP, Punjab, MP, Maharashtra).
Analyze the provided crop photo or description.
Crop context: ${cropHint || "General field crop"}.
Language requested: ${language === "hi" ? "Hindi (Devanagari)" : "English"}.

Provide a response in JSON format with:
{
  "cropName": "Crop name in Hindi and English (e.g. टमाटर (Tomato))",
  "diseaseName": "Disease name in Hindi and English (e.g. अगेती झुलसा (Early Blight))",
  "severity": "mild" | "moderate" | "severe",
  "confidence": number between 85 and 99,
  "symptomsHindi": "Brief symptoms in simple Hindi",
  "symptomsEnglish": "Brief symptoms in English",
  "organicRemedyHindi": "Home/organic remedy (नीम का तेल, ट्राइकोडर्मा, छाछ आदि) with real-world measures (चम्मच, बाल्टी)",
  "organicRemedyEnglish": "Home/organic remedy with spoon/bucket measures",
  "chemicalRemedyHindi": "Chemical fungicide/pesticide with dosages (e.g., कॉपर ऑक्सीक्लोराइड 2 ग्राम प्रति लीटर / 15 लीटर ढोलकी में 30 ग्राम)",
  "chemicalRemedyEnglish": "Chemical remedy with dosage (per bucket/sprayer)",
  "dosageVisuals": {
    "spoons": number (e.g. 2),
    "waterBuckets": number (e.g. 1),
    "sprayTanks": number (e.g. 1)
  },
  "cautionHindi": "Safety caution (दवा छिड़कते समय मास्क पहनें, हवा की दिशा में छिड़कें)",
  "cautionEnglish": "Safety caution in English",
  "audioSummaryHindi": "Short 2-sentence voice summary for farmer in simple spoken Hindi",
  "audioSummaryEnglish": "Short 2-sentence voice summary for farmer in English"
}
`;

    const parts: any[] = [];
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: cleanBase64,
        },
      });
    }
    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
      },
    });

    const outputText = response.text || "{}";
    const parsed = JSON.parse(outputText);
    return res.json(parsed);
  } catch (error: any) {
    console.error("Diagnosis error:", error);
    return res.status(500).json({ error: error.message || "Failed to analyze crop" });
  }
});

// AI Kisan Sahayak Agronomy Q&A Endpoint
app.post("/api/ask", async (req, res) => {
  try {
    const { question, language = "hi" } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: "Gemini API key is not configured.",
      });
    }

    const systemInstruction = `You are "Kisan Sahayak" (किसान सहायक), a warm, friendly, and practical rural agricultural expert.
Speak in clear, respectful, everyday Hindi (with transliterated terms where helpful) or English depending on the language: ${language}.
Keep advice actionable for smallholder farmers: fertilizer timings (यूरिया, डीएपी), irrigation, organic pest repellents (नीम काढ़ा), weather tips, and mandis. Keep responses under 4 sentences so it's easily read aloud via voice.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: question,
      config: {
        systemInstruction,
      },
    });

    return res.json({ answer: response.text });
  } catch (error: any) {
    console.error("Ask error:", error);
    return res.status(500).json({ error: error.message || "Assistant error" });
  }
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", geminiConfigured: !!ai });
});

// Mount Vite in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`KisanMitra server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
