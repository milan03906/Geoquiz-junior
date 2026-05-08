import Attempt from "../models/Attempt.js";
import Question from "../models/Question.js";

function isDragDropCorrect(selectedAnswer, correctPairs) {
  if (!selectedAnswer || typeof selectedAnswer !== "object") return false;
  if (!correctPairs || typeof correctPairs !== "object") return false;
  const selectedKeys = Object.keys(selectedAnswer);
  const correctKeys = Object.keys(correctPairs);
  if (selectedKeys.length !== correctKeys.length) return false;
  return correctKeys.every((itemId) => selectedAnswer[itemId] === correctPairs[itemId]);
}

function isAnswerCorrect(question, selectedAnswer) {
  const type = question.type || "mcq";
  if (type === "drag_drop") return isDragDropCorrect(selectedAnswer, question.specialData?.correctPairs);
  if (type === "map_click") return String(selectedAnswer || "") === String(question.specialData?.correctId || "");
  return String(selectedAnswer || "").trim() === String(question.correctAnswer || "").trim();
}

function getPoints(question, isCorrect, timeElapsed, totalAnswers) {
  if (!isCorrect) return 0;
  let points = question.difficulty === "hard" ? 15 : question.difficulty === "medium" ? 10 : 5;
  if (timeElapsed / totalAnswers < 20) points += 2;
  return points;
}

export async function submitAttempt(req, res) {
  try {
    const { answers, category, difficulty, grade, timeElapsed = 0 } = req.body;
    const userId = req.user?._id;

    const questionsFromDb = await Question.find({ _id: { $in: answers.map(a => a.questionId) } });
    const questionMap = new Map(questionsFromDb.map(q => [q._id.toString(), q]));

    let totalPoints = 0;
    let correctCount = 0;

    const detailedQuestions = answers.map(ans => {
      const q = questionMap.get(ans.questionId);
      if (!q) return null;

      const isCorrect = isAnswerCorrect(q, ans.selectedAnswer);
      if (isCorrect) correctCount++;
      const points = getPoints(q, isCorrect, timeElapsed, answers.length);
      totalPoints += points;

      return {
        questionId: q._id,
        questionText: q.text,
        selectedAnswer: ans.selectedAnswer,
        correctAnswer: q.correctAnswer || q.specialData?.correctPairs || q.specialData?.correctId,
        isCorrect,
        pointsEarned: points,
      };
    }).filter(Boolean);

    const newAttempt = await Attempt.create({
      user: userId,
      category,
      difficulty,
      grade,
      questions: detailedQuestions,
      totalPoints,
      correctCount,
      totalQuestions: detailedQuestions.length,
      score: Math.round((correctCount / detailedQuestions.length) * 100),
      timeElapsed,
    });
    
    await logAction(userId, "QUIZ_SUBMIT", `Kategorija: ${category}, Poeni: ${totalPoints}`, req.ip);
    res.status(201).json(newAttempt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getAttemptById(req, res) {
  try {
    const attempt = await Attempt.findById(req.params.id).populate("user", "name email role");
    if (!attempt) return res.status(404).json({ message: "Pokušaj nije pronađen." });

    const isOwner = attempt.user?._id.toString() === req.user?._id?.toString();
    const isAdmin = req.user?.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Zabranjen pristup." });

    const attemptData = attempt.toObject();
    res.json({
      ...attemptData,
      correctCount: attemptData.correctCount ?? 0,
      totalPoints: attemptData.totalPoints ?? 0,
      totalQuestions: attemptData.totalQuestions ?? attemptData.questions?.length ?? 0,
      score: attemptData.score ?? 0,
      questions: attemptData.questions || attemptData.answers || [],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getUserAttempts(req, res) {
  try {
    const attempts = await Attempt.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, attempts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function deleteAttempt(req, res) {
  try {
    const attempt = await Attempt.findById(req.params.id);
    if (!attempt) return res.status(404).json({ message: "Nije nađeno." });
    if (attempt.user.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Zabranjeno." });
    await attempt.deleteOne();
    res.json({ success: true, message: "Obrisano." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getLeaderboard(req, res) {
  try {
    const { type } = req.query;
    let matchQuery = {};
    let nextReset = null;

    if (type === "weekly") {
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const startOfWeek = new Date(now.setDate(diff));
      startOfWeek.setHours(0, 0, 0, 0);
      matchQuery = { createdAt: { $gte: startOfWeek } };
      nextReset = new Date(startOfWeek);
      nextReset.setDate(startOfWeek.getDate() + 7);
    }

    const leaderboard = await Attempt.aggregate([
      { $match: matchQuery },
      { $group: { _id: "$user", totalScore: { $sum: "$score" }, attemptsCount: { $sum: 1 } } },
      { $sort: { totalScore: -1 } },
      { $limit: 10 },
      { $addFields: { userObjectId: { $toObjectId: "$_id" } } },
      { $lookup: { from: "users", localField: "userObjectId", foreignField: "_id", as: "userInfo" } },
      { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
      { $project: { _id: 1, totalScore: 1, attemptsCount: 1, username: { $ifNull: ["$userInfo.name", "$userInfo.username", "Istraživač"] } } },
    ]);

    res.status(200).json({ leaderboard: leaderboard || [], nextReset });
  } catch (error) {
    res.status(500).json({ message: "Greška na serveru." });
  }
}