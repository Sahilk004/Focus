import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["notes", "media", "transcribe", "chat", "schedule"], required: true },
    inputMetadata: {
      filename: String,
      mimetype: String,
      size: Number,
      youtubeUrl: String,
      role: String,
      originalLength: Number,
      extra: mongoose.Schema.Types.Mixed,
    },
    content: {
      // Flexible container for returned payloads from different flows
      processed: String,
      transcript: String,
      analysis: String,
      evidence: [
        {
          bullet: String,
          quote: String,
          startIndex: Number,
          endIndex: Number,
        },
      ],
      notes: [String],
      flashcards: [
        {
          question: String,
          answer: String,
        },
      ],
      quiz: [
        {
          question: String,
          options: [String],
          correctIndex: Number,
        },
      ],
      response: String,
      schedule: String,
    },
  },
  { timestamps: true }
);

ResultSchema.index({ user: 1, createdAt: -1 });
ResultSchema.index({ user: 1, type: 1, createdAt: -1 });

const Result = mongoose.model("Result", ResultSchema);
export default Result;
