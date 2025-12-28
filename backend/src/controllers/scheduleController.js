import { chatComplete } from "../utils/aiGenerator.js";
import Result from "../models/resultModel.js";

export async function studySchedule(req, res) {
  try {
    const { examDate, startDate, endDate, topics, hoursPerDay } = req.body || {};

    const messages = [
      {
        role: "system",
        content:
          "Create an ADHD-friendly study schedule. Use daily tasks, time blocks with breaks, variety, and clear formatting.",
      },
      {
        role: "user",
        content: `Create a study schedule with these constraints:
- Start date: ${startDate || "(not specified)"}
- End date: ${endDate || "(not specified)"}
- Exam date: ${examDate || "(optional)"}
- Topics: ${topics}
- Available hours per day: ${hoursPerDay || 2}

Rules:
- Spread the plan between start and end dates if provided; otherwise infer a reasonable timeline before the exam date if given.
- Keep tasks realistic with breaks and variety.
- Output a day-by-day plan with dates if possible.`,
      },
    ];

    const schedule = await chatComplete(messages, {
      temperature: 0.7,
      max_tokens: 1500,
    });

    try {
      await Result.create({
        user: req.user?.id,
        type: "schedule",
        inputMetadata: { extra: { examDate, startDate, endDate, topics, hoursPerDay } },
        content: { schedule },
      });
    } catch (saveError) {
      console.warn("Warning: failed to save result to DB", saveError.message);
    }

    res.json({ success: true, schedule });
  } catch (error) {
    console.error("Error generating schedule:", error);
    res.status(500).json({
      error: "Failed to create study schedule.",
      details: error.message,
    });
  }
}
