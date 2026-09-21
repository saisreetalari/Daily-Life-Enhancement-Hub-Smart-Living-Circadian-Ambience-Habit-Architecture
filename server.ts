import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI client
let genAI: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!genAI) {
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

// System prompt for Daily Life Enhancement Assistant
const SYSTEM_INSTRUCTION = `You are "Aura", an intelligent, empathetic Daily Life Enhancement Assistant.
Your mission is to make daily living smoother, calmer, more intentional, and healthier.
You advise on:
1. Daily habits, micro-routines, and streak maintenance.
2. Home environment optimization (lighting, ambient sounds, temperature, wind-down rituals).
3. Energy management, time-blocking, stress reduction, and hydration/sleep hygiene.
4. Quick nutritious meals, hydration pacing, and practical productivity tips.

Keep your tone warm, concise, actionable, and encouraging. Avoid clinical jargon or fluffy filler.
When appropriate, you can suggest concrete actions:
- A new micro-habit
- A smart home environment adjustment (e.g., Dim Warm lighting, 68°F cooling, Rain soundscape)
- A focused 15-30 minute time block
Format responses clearly with short paragraphs or 2-3 bullet points.`;

// API Health
app.get("/api/health", (_req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY");
  res.json({
    status: "ok",
    app: "Daily Life Enhancement Hub",
    aiEnabled: hasKey,
    timestamp: new Date().toISOString(),
  });
});

// API Assistant Chat
app.post("/api/assistant/chat", async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    const ai = getGenAI();

    // Context summary for grounding the AI response in current user life state
    const contextPrompt = context
      ? `\nCurrent User State:
- Time of Day: ${context.timeOfDay || "daytime"}
- Active Home Scene: ${context.activeScene || "Standard"}
- Habits Completed Today: ${context.completedHabitsCount ?? 0}/${context.totalHabitsCount ?? 0}
- Logged Energy Level: ${context.energyLevel ?? "Moderate"}/5
- Water Intake: ${context.waterCups ?? 0} cups logged
- Top active habits: ${(context.habitsSummary || []).slice(0, 5).join(", ") || "None"}
`
      : "";

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: `${contextPrompt}\nUser says: "${message}"`,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.7,
          },
        });

        const reply = response.text || "I am here to help you optimize your daily routine and home rhythm.";
        res.json({ reply, source: "gemini-3.8-flash" });
        return;
      } catch (geminiErr: any) {
        console.warn("Gemini model temporary error, using fallback life advisor:", geminiErr?.message);
        // continue to intelligent fallback below
      }
    }

    // Graceful intelligent fallback when API key is not yet set or model is temporarily busy
    const fallbackResponses: Record<string, string> = {
      morning: "Good morning! Start by drinking a tall glass of water before looking at screens, review your top 2 habits for today, and let natural sunlight into your room to anchor your circadian rhythm.",
      focus: "For deep focus: set your room temperature to around 68-70°F (20°C), dim harsh overhead lights to warm task lighting, turn on the alpha-binaural focus soundscape, and commit to a single 25-minute sprint.",
      evening: "As evening sets in, shift your lighting to amber/warm tones, lower the thermostat for restorative sleep, and write down one accomplishment from today to signal closure to your nervous system.",
      habit: "To make a habit stick, anchor it to an existing behavior (e.g. 'After I brew coffee, I will drink 1 full glass of water'). Keep the initial barrier under 2 minutes of effort.",
      meal: "A quick 10-minute balanced lunch: Warm whole grain wrap or bowl with avocado, greens, canned chickpeas or eggs, olive oil, lemon juice, and a pinch of sea salt.",
    };

    const lower = message.toLowerCase();
    let reply = "Here is a quick daily enhancement tip: prioritize one keystone habit today, keep your hydration consistent, and tune your workspace ambience for low sensory friction.";

    if (lower.includes("morning") || lower.includes("wake")) {
      reply = fallbackResponses.morning;
    } else if (lower.includes("focus") || lower.includes("work") || lower.includes("study")) {
      reply = fallbackResponses.focus;
    } else if (lower.includes("evening") || lower.includes("night") || lower.includes("sleep") || lower.includes("wind")) {
      reply = fallbackResponses.evening;
    } else if (lower.includes("habit") || lower.includes("streak") || lower.includes("routine")) {
      reply = fallbackResponses.habit;
    } else if (lower.includes("eat") || lower.includes("food") || lower.includes("lunch") || lower.includes("dinner") || lower.includes("meal")) {
      reply = fallbackResponses.meal;
    }

    res.json({
      reply,
      source: "local-optimizer",
    });
  } catch (err: any) {
    console.error("Assistant chat error:", err);
    res.status(500).json({ error: "Failed to process life assistant request", details: err?.message });
  }
});

// API Habit Suggester
app.post("/api/assistant/suggest-habits", async (req, res) => {
  try {
    const { category, goal } = req.body;
    const ai = getGenAI();

    if (ai) {
      const prompt = `Generate 3 smart, high-impact micro-habits for a user focusing on: "${goal || category || "Daily Wellness & Focus"}".
Respond strictly with a valid JSON array of objects with keys:
- "title": short action-oriented name (e.g. "Morning Sunlight Walk")
- "category": one of ["Health", "Focus", "Home", "Mindfulness", "Sleep"]
- "frequency": "Daily"
- "durationMinutes": integer between 2 and 30
- "impactDescription": 1 concise sentence explaining why it improves daily life.
Do NOT enclose in markdown backticks.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          temperature: 0.6,
        },
      });

      let text = response.text?.trim() || "[]";
      if (text.startsWith("```json")) {
        text = text.replace(/^```json/, "").replace(/```$/, "").trim();
      } else if (text.startsWith("```")) {
        text = text.replace(/^```/, "").replace(/```$/, "").trim();
      }

      try {
        const habits = JSON.parse(text);
        res.json({ habits });
        return;
      } catch (parseErr) {
        console.warn("JSON parse error from Gemini, using curated defaults", parseErr);
      }
    }

    // Default curated suggestions
    const curated = [
      {
        title: "2-Minute Circadian Sunlight",
        category: "Health",
        frequency: "Daily",
        durationMinutes: 5,
        impactDescription: "Signals natural wakefulness to your cortisol cycle and sharpens daytime focus.",
      },
      {
        title: "Hydration Anchor Glass",
        category: "Health",
        frequency: "Daily",
        durationMinutes: 2,
        impactDescription: "Immediate rehydration prevents morning brain fog and kickstarts metabolism.",
      },
      {
        title: "Desk Clean-Slate Reset",
        category: "Home",
        frequency: "Daily",
        durationMinutes: 3,
        impactDescription: "Clearing visual clutter before bed reduces cognitive fatigue next morning.",
      },
    ];

    res.json({ habits: curated });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to generate habits", details: err?.message });
  }
});

// Vite middleware / production serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Daily Life Enhancement Hub running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
