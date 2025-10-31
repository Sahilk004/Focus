// // notesController.js

// import fs from "fs";
// import { chatComplete } from "../utils/aiGenerator.js";
// import Result from "../models/resultModel.js";

// export async function processNotes(req, res) {
//   try {
//     if (!req.file) return res.status(400).json({ error: "No file uploaded" });

//     let textContent = "";

//     if (req.file.mimetype === "application/pdf") {
//       try {
//         const dataBuffer = fs.readFileSync(req.file.path);
//         console.log('Processing PDF file:', req.file.path);

//         // DYNAMIC IMPORT — This is the key fix
//         const pdfParseModule = await import("pdf-parse");
//         const pdfParse = pdfParseModule.default || pdfParseModule;

//         const pdfData = await pdfParse(dataBuffer);
//         console.log('PDF parsed successfully');
//         textContent = pdfData.text;
//       } catch (error) {
//         console.error('Error processing PDF:', error);
//         return res.status(500).json({ error: 'Failed to process PDF file: ' + error.message });
//       }
//     } else {
//       textContent = fs.readFileSync(req.file.path, "utf-8");
//     }

//     const messages = [
//       { role: "system", content: `You are an ADHD-friendly study assistant. Break down complex content into:\n1. Key Concepts\n2. Digestible Chunks\n3. Practice Questions\n4. Study Tips\nUse clear formatting.` },
//       { role: "user", content: `Process these notes:\n\n${textContent.substring(0, 15000)}` },
//     ];

//     const processedContent = await chatComplete(messages, { temperature: 0.7, max_tokens: 2000 });

//     // Clean up uploaded file
//     try { fs.unlinkSync(req.file.path); } catch {}

//     // Save result (optional)
//     try {
//       await Result.create({
//         user: req.user?.id,
//         type: "notes",
//         inputMetadata: {
//           filename: req.file.originalname,
//           mimetype: req.file.mimetype,
//           size: req.file.size,
//           originalLength: textContent.length,
//         },
//         content: { processed: processedContent, sourceText: textContent.substring(0, 15000) },
//       });
//     } catch (err) {
//       console.error("Failed to save result:", err);
//     }

//     res.json({ success: true, processed: processedContent, originalLength: textContent.length });
//   } catch (error) {
//     console.error("Error processing notes:", error);
//     res.status(500).json({ error: "Failed to process notes.", details: error.message });
//   }
// }



// //////




// src/controllers/notesController.js

import fs from "fs";
import { createRequire } from "module";
import { chatComplete } from "../utils/aiGenerator.js";
import Result from "../models/resultModel.js";

// This is the KEY FIX
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export async function processNotes(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let textContent = "";

    // === HANDLE PDF ===
    if (req.file.mimetype === "application/pdf") {
      try {
        const dataBuffer = fs.readFileSync(req.file.path);
        console.log("Processing PDF file:", req.file.path);

        // Use require() via createRequire — 100% reliable
        if (typeof pdfParse !== "function") {
          throw new Error("pdf-parse is not a function. Is it installed?");
        }

        const pdfData = await pdfParse(dataBuffer);
        console.log("PDF parsed successfully");
        textContent = pdfData.text;
      } catch (error) {
        console.error("Error processing PDF:", error);
        return res
          .status(500)
          .json({ error: "Failed to process PDF file: " + error.message });
      }
    }
    // === HANDLE TEXT FILES ===
    else {
      try {
        textContent = fs.readFileSync(req.file.path, "utf-8");
      } catch (error) {
        console.error("Error reading text file:", error);
        return res
          .status(500)
          .json({ error: "Failed to read file content" });
      }
    }

    // === AI PROCESSING ===
    const messages = [
      {
        role: "system",
        content: `You are an ADHD-friendly study assistant. Break down complex content into:
1. Key Concepts
2. Digestible Chunks
3. Practice Questions
4. Study Tips
Use clear formatting with #, ##, **bold**, and bullet points.`,
      },
      {
        role: "user",
        content: `Process these notes:\n\n${textContent.substring(0, 15000)}`,
      },
    ];

    const processedContent = await chatComplete(messages, {
      temperature: 0.7,
      max_tokens: 2000,
    });

    // === CLEAN UP ===
    try {
      fs.unlinkSync(req.file.path);
    } catch (err) {
      console.warn("Failed to delete file:", err);
    }

    // === SAVE TO DB ===
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
        content: {
          processed: processedContent,
          sourceText: textContent.substring(0, 15000),
        },
      });
    } catch (err) {
      console.error("DB save failed:", err);
    }

    // === SUCCESS ===
    res.json({
      success: true,
      processed: processedContent,
      originalLength: textContent.length,
    });
  } catch (error) {
    console.error("Error processing notes:", error);
    res.status(500).json({
      error: "Failed to process notes.",
      details: error.message,
    });
  }
}