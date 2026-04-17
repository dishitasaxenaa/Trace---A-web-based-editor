import { Router } from "express";

const router = Router();

const SYSTEM_PROMPT = `You are an expert coding assistant embedded inside a code editor.

You help users understand, debug, and improve their code. You support the following actions:

1. **Explain Code**
   - Clearly explain what the code does step-by-step
   - Keep the explanation simple and structured

2. **Time and Space Complexity**
   - Analyze and provide time and space complexity
   - Mention best, average, and worst case if applicable

3. **Provide Hints**
   - Do NOT give full solutions unless explicitly asked
   - Guide the user with hints and thought process

4. **General Questions**
   - Answer any questions related to the given code

Guidelines:
- Always base your answer on the provided code
- Be concise but clear
- Use bullet points where helpful
- Avoid unnecessary jargon
- If the code is incorrect, point out issues politely
- Output should be well-structured and easy to read`;

router.post("/ai/chat", async (req, res) => {
  try {
    const { message, code, language, history = [] } = req.body;

    const API_KEY = process.env.GROQ_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ error: "GroqAI API key is not configured." });
    }

    // Build the messages array: system + history + new user message
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      // Inject code context as the first assistant-acknowledged message
      {
        role: "user",
        content: `Language: ${language}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\``,
      },
      {
        role: "assistant",
        content: "Got it! I've reviewed the code. What would you like to know?",
      },
      // Prior conversation turns (skip the welcome message, id=0)
      ...history.filter((m) => m.content && m.content.trim()),
      // Current user message
      { role: "user", content: message },
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        max_tokens: 1024,
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error("GroqAI error:", errData);
      return res.status(response.status).json({
        error: errData?.error?.message || `GroqAI request failed (${response.status})`,
      });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "No response from AI.";

    res.json({ content: text });
  } catch (err) {
    console.error("AI route error:", err);
    res.status(500).json({ error: "AI request failed. Please try again." });
  }
});

export default router;