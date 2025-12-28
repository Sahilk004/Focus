import fs from "fs";
import { transcribeAudioStream, generateRoleAwareSummary, generateStudyArtifacts } from "../utils/aiGenerator.js";
import Result from "../models/resultModel.js";

export async function transcribe(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: "No audio file uploaded" });
    const transcription = await transcribeAudioStream(fs.createReadStream(req.file.path));
    const role = (req.body?.role || "Student").trim();
    const roleAware = await generateRoleAwareSummary(transcription.text, role);
    const artifacts = await generateStudyArtifacts(transcription.text);
    try { fs.unlinkSync(req.file.path); } catch {}
    try {
      await Result.create({
        user: req.user?.id,
        type: "transcribe",
        inputMetadata: {
          filename: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          role,
        },
        content: {
          transcript: transcription.text,
          analysis: roleAware.analysis,
          evidence: roleAware.evidence,
          notes: artifacts.notes,
          flashcards: artifacts.flashcards,
          quiz: artifacts.quiz,
        },
      });
    } catch {}
    res.json({ success: true, transcript: transcription.text, analysis: roleAware.analysis, role, evidence: roleAware.evidence, notes: artifacts.notes, flashcards: artifacts.flashcards, quiz: artifacts.quiz });
  } catch (error) {
    console.error("Error transcribing:", error);
    res.status(500).json({ error: "Failed to transcribe audio.", details: error.message });
  }
}