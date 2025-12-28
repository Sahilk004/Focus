import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ytdl, trySupadataTranscript, tryAssemblyAISummary, tryPipedYoutubeFallback, downloadWithYtDlp, checkFfmpegAvailable } from "../utils/youtube.js";
import { uploadsDirPath } from "../utils/fileHandler.js";
import { transcribeAudioStream, generateRoleAwareSummary, generateStudyArtifacts } from "../utils/aiGenerator.js";
import Result from "../models/resultModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function transcribeMedia(req, res) {
  let tempFilePath = null;
  try {
    if (!req.file && !req.body?.url) return res.status(400).json({ error: "No media file or URL provided" });

    let inputStream;
    if (req.file) {
      tempFilePath = req.file.path;
      inputStream = fs.createReadStream(tempFilePath);
    } else {
      const url = (req.body.url || "").trim();
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
      if (!youtubeRegex.test(url)) return res.status(400).json({ error: "Please provide a valid YouTube URL" });

      if (process.env.SUPADATA_API_KEY) {
        const supa = await trySupadataTranscript(url);
        if (supa && !supa.error && supa.text) {
          const role = (req.body?.role || "Student").trim();
          const roleAware = await generateRoleAwareSummary(supa.text, role);
          const artifacts = await generateStudyArtifacts(supa.text);
          try {
            await Result.create({
              user: req.user?.id,
              type: "media",
              inputMetadata: { youtubeUrl: url, role },
              content: {
                transcript: supa.text,
                analysis: roleAware.analysis,
                evidence: roleAware.evidence,
                notes: artifacts.notes,
                flashcards: artifacts.flashcards,
                quiz: artifacts.quiz,
              },
            });
          } catch {}
          return res.json({ success: true, transcript: supa.text, analysis: roleAware.analysis, role, evidence: roleAware.evidence, notes: artifacts.notes, flashcards: artifacts.flashcards, quiz: artifacts.quiz });
        }
      }

      if (process.env.ENABLE_ASSEMBLYAI_URL === "true" && process.env.ASSEMBLYAI_API_KEY) {
        const aai = await tryAssemblyAISummary(url);
        if (aai && !aai.error && (aai.text || aai.summary)) {
          const artifacts = await generateStudyArtifacts(aai.text || "");
          try {
            await Result.create({
              user: req.user?.id,
              type: "media",
              inputMetadata: { youtubeUrl: url },
              content: {
                transcript: aai.text || "",
                analysis: aai.summary || "",
                notes: artifacts.notes,
                flashcards: artifacts.flashcards,
                quiz: artifacts.quiz,
              },
            });
          } catch {}
          return res.json({ success: true, transcript: aai.text || "", analysis: aai.summary || "", notes: artifacts.notes, flashcards: artifacts.flashcards, quiz: artifacts.quiz });
        }
      }

      if (process.env.ALLOW_YOUTUBE_FALLBACK === "true" && ytdl.validateURL(url)) {
        const uploadsDir = uploadsDirPath();
        tempFilePath = path.join(uploadsDir, `${Date.now()}-download.webm`);
        try {
          await new Promise((resolve, reject) => {
            const writeStream = fs.createWriteStream(tempFilePath);
            const reqHeaders = { "User-Agent": "Mozilla/5.0", "Accept-Language": "en-US,en;q=0.9", Referer: "https://www.youtube.com/" };
            const stream = ytdl(url, { quality: "highestaudio", filter: "audioonly", requestOptions: { headers: reqHeaders }, dlChunkSize: 0 });
            stream.on("error", (err) => reject(new Error(`YouTube download failed: ${err.message}`))).pipe(writeStream).on("error", reject).on("finish", resolve);
          });
        } catch (ytErr) {
          let fallbackSuccess = false;
          if (process.env.ENABLE_YTDLP === "true") {
            try {
              const ffmpegAvailable = await checkFfmpegAvailable();
              const usesFfmpeg = process.env.ENABLE_FFMPEG === "true" && ffmpegAvailable;
              const dlPath = usesFfmpeg ? tempFilePath.replace(/\.[a-z0-9]+$/i, ".mp3") : tempFilePath;
              await downloadWithYtDlp(url, dlPath, { extractAudio: usesFfmpeg });
              if (usesFfmpeg && dlPath !== tempFilePath) {
                try { fs.unlinkSync(tempFilePath); } catch {}
                tempFilePath = dlPath;
              }
              fallbackSuccess = true;
            } catch (e) { console.warn("yt-dlp failed:", e.message); }
          }
          if (!fallbackSuccess && process.env.ENABLE_PIPED_FALLBACK === "true") {
            try { await tryPipedYoutubeFallback(url, tempFilePath); fallbackSuccess = true; } catch (e) { console.warn("Piped fallback failed:", e.message); }
          }
          if (!fallbackSuccess) throw new Error(`All YouTube download methods failed. Original error: ${ytErr.message}`);
        }
        inputStream = fs.createReadStream(tempFilePath);
      } else {
        const why = "No YouTube processing method available. Configure SUPADATA_API_KEY, AssemblyAI, or fallback options.";
        return res.status(502).json({ error: "Failed to transcribe media", details: why });
      }
    }

    const transcription = await transcribeAudioStream(inputStream);
    const role = (req.body?.role || "Student").trim();
    const roleAware = await generateRoleAwareSummary(transcription.text, role);
    const artifacts = await generateStudyArtifacts(transcription.text);
    if (tempFilePath && fs.existsSync(tempFilePath)) { try { fs.unlinkSync(tempFilePath); } catch {} }
    try {
      await Result.create({
        user: req.user?.id,
        type: "media",
        inputMetadata: req.file
          ? { filename: req.file.originalname, mimetype: req.file.mimetype, size: req.file.size, role }
          : { youtubeUrl: req.body?.url, role },
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
    console.error("Error transcribing media:", error);
    if (tempFilePath && fs.existsSync(tempFilePath)) { try { fs.unlinkSync(tempFilePath); } catch {} }
    const details = /extract functions/i.test(error.message) ? "YouTube refused extraction. Try a different link, or provide a direct media URL." : error.message;
    res.status(500).json({ error: "Failed to transcribe media", details });
  }
}