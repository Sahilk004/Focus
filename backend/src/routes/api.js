import { Router } from "express";
import { upload } from "../utils/fileHandler.js";
import * as health from "../controllers/healthController.js";
import * as notes from "../controllers/notesController.js";
import * as transcribe from "../controllers/transcribeController.js";
import * as media from "../controllers/mediaController.js";
import * as chat from "../controllers/chatController.js";
import * as schedule from "../controllers/scheduleController.js";
import * as results from "../controllers/resultsController.js";
import authRoutes from "./authRoutes.js";
import { validateYoutubeUrl, requireBodyField } from "../middleware/validateInput.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/health", health.status);

router.post("/process-notes", protect, upload.single("file"), notes.processNotes);

router.post("/transcribe", protect, upload.single("audio"), transcribe.transcribe);

router.post(
  "/transcribe-media",
  protect,
  upload.single("media"),
  media.transcribeMedia,
);

router.post("/chat", protect, requireBodyField("message"), chat.chat);

router.post("/study-schedule", protect, schedule.studySchedule);

// Auth
router.get("/results", protect, results.listResults);
router.get("/results/:id", protect, results.getResult);
router.delete("/results/:id", protect, results.deleteResult);
router.use("/auth", authRoutes);

export default router;