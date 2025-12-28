import { chatComplete } from "../utils/aiGenerator.js";
import Result from "../models/resultModel.js";

export async function chat(req, res) {
  try {
    const { message, context } = req.body || {};
    if (!message) return res.status(400).json({ error: "Message is required" });
    const messages = [
      { role: "system", content: `You are an ADHD-friendly assistant. Provide clear, concise answers with bullets and actionable advice.` },
    ];
    if (context) messages.push({ role: "system", content: `Context from previous content:\n${context}` });
    messages.push({ role: "user", content: message });
    const response = await chatComplete(messages, { temperature: 0.7, max_tokens: 1000 });
    try {
      await Result.create({
        user: req.user?.id,
        type: "chat",
        inputMetadata: { extra: { prompt: message } },
        content: { response },
      });
    } catch {}
    res.json({ success: true, response });
  } catch (error) {
    console.error("Error in chat:", error);
    res.status(500).json({ error: "Failed to get a response.", details: error.message });
  }
}


