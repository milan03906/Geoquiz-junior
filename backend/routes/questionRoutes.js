import { Router } from "express";
import requireAuth from "../middleware/requireAuth.js";
import { getQuestions, getQuizQuestions } from "../controllers/questionController.js";

const router = Router();

router.get("/", requireAuth, getQuestions);
router.get("/quiz", requireAuth, getQuizQuestions);

export default router;