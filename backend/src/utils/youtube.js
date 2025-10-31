import fs from "fs";
import path from "path";
import ytdl from "ytdl-core";
import { execFile } from "child_process";

// --- Supadata Transcript ---
export async function trySupadataTranscript(url) {
  const apiKey = process.env.SUPADATA_API_KEY;
  if (!apiKey) return null;

  const endpoint = `https://api.supadata.ai/v1/transcript?url=${encodeURIComponent(url)}`;
  const https = await import("https");

  return await new Promise((resolve) => {
    const req = https.default.get(
      endpoint,
      { headers: { "x-api-key": apiKey } },
      (resp) => {
        const chunks = [];
        resp.on("data", (d) => chunks.push(d));
        resp.on("end", () => {
          try {
            const text = Buffer.concat(chunks).toString("utf8");
            const status = resp.statusCode || 0;
            const contentType = (resp.headers && resp.headers["content-type"]) || "";
            let body = null;
            if (/application\/json/i.test(contentType)) body = JSON.parse(text);

            if (status >= 400)
              return resolve({ error: true, status, detail: body?.message || "Supadata error" });

            if (body?.transcript?.trim())
              return resolve({ text: body.transcript });

            resolve({ error: true, status, detail: "Empty transcript" });
          } catch (e) {
            resolve({ error: true, status: resp.statusCode || 0, detail: e.message });
          }
        });
        resp.on("error", (e) => resolve({ error: true, detail: e.message }));
      },
    );
    req.on("error", () => resolve(null));
  });
}

// --- AssemblyAI ---
export async function tryAssemblyAISummary(url) {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) return null;
  const https = await import("https");

  function postTranscript() {
    const body = JSON.stringify({
      audio_url: url,
      summarization: true,
      summary_model: "informative",
    });
    return new Promise((resolve, reject) => {
      const req = https.default.request(
        "https://api.assemblyai.com/v2/transcript",
        {
          method: "POST",
          headers: {
            authorization: apiKey,
            "content-type": "application/json",
            "content-length": Buffer.byteLength(body),
          },
        },
        (resp) => {
          const chunks = [];
          resp.on("data", (d) => chunks.push(d));
          resp.on("end", () => {
            try {
              resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
            } catch (e) {
              reject(e);
            }
          });
        },
      );
      req.on("error", reject);
      req.write(body);
      req.end();
    });
  }

  function getTranscript(id) {
    return new Promise((resolve, reject) => {
      const req = https.default.get(
        `https://api.assemblyai.com/v2/transcript/${id}`,
        { headers: { authorization: apiKey } },
        (resp) => {
          const chunks = [];
          resp.on("data", (d) => chunks.push(d));
          resp.on("end", () => {
            try {
              resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
            } catch (e) {
              reject(e);
            }
          });
        },
      );
      req.on("error", reject);
    });
  }

  try {
    const created = await postTranscript();
    if (!created?.id) return { error: true, detail: "AssemblyAI: failed to create job" };

    const deadline = Date.now() + 60000;
    while (Date.now() < deadline) {
      const status = await getTranscript(created.id);
      if (status.status === "completed")
        return { text: status.text || "", summary: status.summary || "" };
      if (status.status === "error")
        return { error: true, detail: status.error || "AssemblyAI job error" };
      await new Promise((r) => setTimeout(r, 2000));
    }
    return { error: true, detail: "AssemblyAI: timeout" };
  } catch (e) {
    return { error: true, detail: e.message };
  }
}

// --- FFmpeg ---
export function checkFfmpegAvailable() {
  return new Promise((resolve) => {
    const proc = execFile("ffmpeg", ["-version"], (err) => resolve(!err));
    proc.on("error", () => resolve(false));
  });
}

export function extractAudioWithFfmpeg(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const args = [
      "-y",
      "-i", inputPath,
      "-vn",
      "-acodec", "libmp3lame",
      "-ar", "44100",
      "-ac", "2",
      "-b:a", "192k",
      outputPath,
    ];
    const proc = execFile("ffmpeg", args, (err) => {
      if (err) reject(new Error(`FFmpeg failed: ${err.message}`));
      else resolve(true);
    });
    proc.on("error", (err) => reject(new Error(`FFmpeg not found: ${err.message}`)));
  });
}

// --- yt-dlp ---
export function downloadWithYtDlp(url, outputPath, { extractAudio = false } = {}) {
  return new Promise(async (resolve, reject) => {
    const args = ["--extractor-args", "youtube:player_client=android,web", "--no-check-certificate"];

    if (process.env.YTDLP_ARGS)
      args.push(...process.env.YTDLP_ARGS.split(" ").filter(Boolean));

    if (extractAudio) {
      const ffmpegAvailable = await checkFfmpegAvailable();
      if (!ffmpegAvailable)
        return reject(new Error("FFmpeg required for audio extraction but not found"));
      args.push("-x", "--audio-format", "mp3");
    } else {
      args.push("-f", "bestaudio/best");
    }

    args.push("-o", outputPath, url);
    const proc = execFile("yt-dlp", args, { maxBuffer: 10 * 1024 * 1024 }, (err) => {
      if (err) reject(new Error(err.message));
      else resolve(true);
    });
    proc.on("error", (err) => reject(new Error(`yt-dlp not found: ${err.message}`)));
  });
}

// --- Piped Fallback ---
export async function tryPipedYoutubeFallback(youtubeUrl, outputPath) {
  const videoId = ytdl.getURLVideoID(youtubeUrl);
  const https = await import("https");
  const hosts = [
    "https://piped.video",
    "https://piped.lunar.icu",
    "https://piped.projectsegfau.lt",
  ];
  let streams = null;
  let lastErr = null;

  for (const host of hosts) {
    const apiUrl = `${host}/api/v1/streams/${videoId}`;
    try {
      const res = await new Promise((resolve, reject) => {
        const chunks = [];
        https.default.get(apiUrl, (resp) => {
          const contentType = resp.headers?.["content-type"] || "";
          if (resp.statusCode >= 400)
            return reject(new Error(`Piped API status ${resp.statusCode} @ ${host}`));
          resp.on("data", (d) => chunks.push(d));
          resp.on("end", () => {
            const text = Buffer.concat(chunks).toString("utf8");
            if (!/application\/json/i.test(contentType))
              return reject(new Error(`Non-JSON response from ${host}`));
            try { resolve(JSON.parse(text)); } catch { reject(new Error(`Invalid JSON from ${host}`)); }
          });
          resp.on("error", reject);
        }).on("error", reject);
      });
      streams = res?.audioStreams || [];
      if (streams.length) break;
    } catch (e) {
      lastErr = e;
      continue;
    }
  }

  if (!streams?.length)
    throw new Error(lastErr ? lastErr.message : "No audio streams via Piped");

  const best = streams.reduce((a, b) => ((a.bitrate || 0) > (b.bitrate || 0) ? a : b));
  const ua = { "User-Agent": "Mozilla/5.0", "Accept-Language": "en-US,en;q=0.9" };
  await downloadToFile({ url: best.url, destPath: outputPath, headers: ua });

  async function downloadToFile({ url, destPath, headers = {} }) {
    const protocol = url.startsWith("https:") ? await import("https") : await import("http");
    await new Promise((resolve, reject) => {
      const reqOpts = new URL(url);
      reqOpts.headers = headers;
      const writeStream = fs.createWriteStream(destPath);
      protocol.default
        .get(reqOpts, (response) => {
          if (response.statusCode >= 400)
            return reject(new Error(`Failed to download: status ${response.statusCode}`));
          response.on("error", reject)
            .pipe(writeStream)
            .on("error", reject)
            .on("finish", resolve);
        })
        .on("error", reject);
    });
  }
}

export { ytdl };
