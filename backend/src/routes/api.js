import { Router } from "express";
import * as chat from "../controllers/chatController.js";
import * as results from "../controllers/resultsController.js";
import * as notes from "../controllers/notesController.js";
import authRoutes from "./authRoutes.js";
import { validateYoutubeUrl, requireBodyField } from "../middleware/validateInput.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/process-notes", protect, upload.single("file"), notes.processNotes);

router.post("/chat", protect, requireBodyField("message"), chat.chat);

router.post("/study-schedule", protect, schedule.studySchedule);

// Auth
router.get("/results", protect, results.listResults);
router.get("/results/:id", protect, results.getResult);
router.delete("/results/:id", protect, results.deleteResult);
router.use("/auth", authRoutes);

export default router;


