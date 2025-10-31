import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// export async function transcribeAudioStream(fileStream) {
//   return await groq.audio.transcriptions.create({
//     file: fileStream,
//     model: "whisper-large-v3",
//     response_format: "json",
//   });
// }

//
export async function transcribeAudioStream(fileStream) {
  try {
    return await groq.audio.transcriptions.create({
      file: fileStream,
      model: "whisper-large-v3",
      response_format: "json",
    });
  } catch (e) {
    console.error("Transcription API error:", e.message);
    throw e;
  }
}

//

export async function generateStudyArtifacts(transcriptText) {
  const schemaHint = `Return strict JSON with keys: notes (array), flashcards (array of {question, answer}), quiz (array of {question, options (4), correctIndex}).`;
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are an ADHD-friendly study assistant. From the transcript, produce concise notes, flashcards, and a quiz. ${schemaHint}`,
      },
      { role: "user", content: `Transcript to analyze (trimmed):\n\n${transcriptText.substring(0, 20000)}` },
    ],
    temperature: 0.4,
    response_format: { type: "json_object" },
    max_tokens: 1600,
  });
  try {
    const parsed = JSON.parse(completion.choices[0].message.content || "{}");
    return {
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
      flashcards: Array.isArray(parsed.flashcards) ? parsed.flashcards : [],
      quiz: Array.isArray(parsed.quiz) ? parsed.quiz : [],
    };
  } catch {
    return { notes: [], flashcards: [], quiz: [] };
  }
}

export async function generateRoleAwareSummary(transcriptText, roleLabel) {
  const role = (roleLabel || "Student").trim();
  const roleHint = `Tailor content for the role: ${role}.`;
  const analysisCompletion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are an ADHD-friendly meeting assistant. ${roleHint}\nProvide: Key Points, Action Items, Follow-up Questions, Summary (2-3 sentences). Use concise, scannable formatting.`,
      },
      { role: "user", content: `Transcript (trimmed):\n\n${transcriptText.substring(0, 20000)}` },
    ],
    temperature: 0.6,
    max_tokens: 1500,
  });

  const evidenceSchemaHint = `Return strict JSON: { evidence: [ { bullet: string, quote: string, startIndex: number, endIndex: number } ] }.`;
  const evidenceCompletion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: `Extract role-aware evidence for: ${role}. ${evidenceSchemaHint}` },
      { role: "user", content: `Transcript string (use exact substring matching):\n\n${transcriptText.substring(0, 20000)}` },
    ],
    temperature: 0.2,
    response_format: { type: "json_object" },
    max_tokens: 800,
  });
  let evidence = [];
  try {
    const parsed = JSON.parse(evidenceCompletion.choices[0].message.content || "{}");
    if (parsed && Array.isArray(parsed.evidence)) evidence = parsed.evidence;
  } catch {}
  return { analysis: analysisCompletion.choices[0].message.content, evidence };
}

export async function chatComplete(messages, options = {}) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens ?? 1000,
  });
  return completion.choices[0].message.content;
}


