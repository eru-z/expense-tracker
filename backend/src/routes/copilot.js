import express from "express";
import fetch from "node-fetch";

const router = express.Router();
const GROQ_API_KEY = process.env.GROQ_API_KEY;

router.post("/", async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.json({ reply: "No message provided." });
    }

    if (!GROQ_API_KEY) {
      console.error("Missing GROQ_API_KEY");
      return res.json({ reply: "AI not configured on server." });
    }

    // Simple financial guardrails
    if (context?.balance != null && Number(context.balance) < 0) {
      return res.json({
        reply: "Your balance is currently negative. It's not recommended to spend more right now."
      });
    }

    const prompt = `
You are a responsible financial assistant.
Use the provided context JSON to answer carefully and clearly.

Context:
${JSON.stringify(context || {}, null, 2)}

User: ${message}
Assistant:
`;

    // Timeout protection
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    const raw = await groqRes.text();
    console.log("RAW GROQ RESPONSE:", raw);

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return res.json({ reply: "AI returned invalid JSON." });
    }

    if (data.error) {
      console.error("Groq API Error:", data.error);
      return res.json({ reply: `Groq API Error: ${data.error.message}` });
    }

    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      console.error("No reply content:", data);
      return res.json({ reply: "AI returned no usable response." });
    }

    res.json({ reply });

  } catch (err) {
    console.error("Copilot error:", err);

    if (err.name === "AbortError") {
      return res.json({ reply: "AI request timed out." });
    }

    res.json({ reply: "AI failed. Please try again later." });
  }
});

export default router;
