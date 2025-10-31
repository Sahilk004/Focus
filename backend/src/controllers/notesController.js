import fs from "fs";
import pdf from "pdf-parse";
import { chatComplete } from "../utils/aiGenerator.js";
import Result from "../models/resultModel.js";

export async function processNotes(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    let textContent = "";
    if (req.file.mimetype === "application/pdf") {
      const dataBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdf(dataBuffer);
      textContent = pdfData.text;
    } else {
      textContent = fs.readFileSync(req.file.path, "utf-8");
    }

    const messages = [
      { role: "system", content: `You are an ADHD-friendly study assistant. Break down complex content into:\n1. Key Concepts\n2. Digestible Chunks\n3. Practice Questions\n4. Study Tips\nUse clear formatting.` },
      { role: "user", content: `Process these notes:\n\n${textContent.substring(0, 15000)}` },
    ];
    const processedContent = await chatComplete(messages, { temperature: 0.7, max_tokens: 2000 });

    try { fs.unlinkSync(req.file.path); } catch {}

    try {
      await Result.create({
        user: req.user?.id,
        type: "notes",
        inputMetadata: {
          filename: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          originalLength: textContent.length,
        },
        content: { processed: processedContent, sourceText: textContent.substring(0, 15000) },
      });
    } catch {}

    res.json({ success: true, processed: processedContent, originalLength: textContent.length });
  } catch (error) {
    console.error("Error processing notes:", error);
    res.status(500).json({ error: "Failed to process notes.", details: error.message });
  }
}


