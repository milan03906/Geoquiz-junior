import { Router } from "express";
import requireAuth from "../middleware/requireAuth.js";
import { submitAttempt, getAttemptById } from "../controllers/attemptController.js";
import { getUserAttempts } from "../controllers/attemptController.js";
import { deleteAttempt } from "../controllers/attemptController.js";
import { getLeaderboard } from "../controllers/attemptController.js";

const router = Router();

router.get("/user/me", requireAuth, getUserAttempts);
router.post("/submit", requireAuth, submitAttempt);
router.get('/leaderboard', requireAuth, getLeaderboard);
router.get("/:id", requireAuth, getAttemptById);
router.delete("/:id", requireAuth, deleteAttempt);




export default router;