const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are an expert competitive programming assistant inside a code editor called Trace.

Your capabilities:
• Explain code logic step-by-step
• Analyze time and space complexity
• Suggest optimizations with trade-offs
• Debug errors and edge cases
• Provide hints without giving away full solutions

Rules:
• Be concise – competitive programmers value brevity
• Use markdown formatting (bold, code blocks, lists)
• When showing code, use fenced code blocks with the language tag
• If the user's code is empty or missing, ask them to write some code first`;

// ── Build Gemini conversation history ──
function buildHistory(history = []) {
  return history
    .filter((h) => h.role === "user" || h.role === "assistant")
    .slice(-20)
    .map((h) => ({
      role: h.role === "assistant" ? "model" : "user",
      parts: [{ text: h.content }],
    }));
}

function buildUserMessage({ message, code, language }) {
  if (code) {
    return `[Current code — ${language}]:\n\`\`\`${language.toLowerCase()}\n${code}\n\`\`\`\n\n${message}`;
  }
  return message;
}

// ── Standard (non-streaming) ──
async function chat({ message, code, language, history }) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM_PROMPT,
  });

  const chatSession = model.startChat({
    history: buildHistory(history),
    generationConfig: {
      maxOutputTokens: 1024,
    },
  });

  const userText = buildUserMessage({ message, code, language });
  const result = await chatSession.sendMessage(userText);
  const response = result.response;

  return response.text();
}

// ── Streaming (SSE) ──
async function chatStream({ message, code, language, history, onChunk }) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM_PROMPT,
  });

  const chatSession = model.startChat({
    history: buildHistory(history),
    generationConfig: {
      maxOutputTokens: 1024,
    },
  });

  const userText = buildUserMessage({ message, code, language });
  const result = await chatSession.sendMessageStream(userText);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) onChunk(text);
  }
}

module.exports = { chat, chatStream };