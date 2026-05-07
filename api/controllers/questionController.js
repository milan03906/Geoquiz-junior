import Question from "../models/Question.js";

function buildQuery(req) {
  const { category, difficulty, grade, search } = req.query;
  const query = {};

  if (category && category !== "all") query.category = category;
  if (difficulty && difficulty !== "all") query.difficulty = difficulty;
  if (grade && grade !== "all") query.grade = Number(grade);
  if (search) query.text = { $regex: search, $options: "i" };

  return query;
}

function sanitizeForQuiz(question) {
  const type = question.type || "mcq";

  const base = {
    _id: question._id,
    text: question.text,
    type,
    category: question.category,
    difficulty: question.difficulty,
    grade: question.grade,
  };

  if (type === "mcq") {
    base.options = question.options || [];
  }

  if (type === "drag_drop") {
    base.specialData = {
      items: question.specialData?.items || [],
      zones: question.specialData?.zones || [],
    };
  }

  if (type === "map_click") {
    base.specialData = {
      mapCenter: question.specialData?.mapCenter || [10, 20],
      zoom: question.specialData?.zoom || 1.5,
      choices: question.specialData?.choices || [], 
      markerSize: question.specialData?.markerSize ?? 6,
    };
  }

  return base;
}

export async function getQuestions(req, res) {
  try {
    const query = buildQuery(req);
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 6);

    const total = await Question.countDocuments(query);

    const questions = await Question.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("text options category difficulty grade type");

    res.json({
      questions,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getQuizQuestions(req, res) {
  try {
    const query = buildQuery(req);
    const requestedLimit = Math.max(1, Number(req.query.limit) || 30);
    const mapQuestions = await Question.aggregate([
      { $match: { ...query, type: "map_click" } },
      { $sample: { size: 2 } },
    ]);

    
    const dragDropQuestions = await Question.aggregate([
      { $match: { ...query, type: "drag_drop" } },
      { $sample: { size: 2 } },
    ]);

    const pickedIds = [...mapQuestions, ...dragDropQuestions].map(q => q._id);

    const remainingLimit = Math.max(0, requestedLimit - pickedIds.length);
    
    const otherQuestions = await Question.aggregate([
      { 
        $match: { 
          ...query, 
          _id: { $nin: pickedIds } 
        } 
      },
      { $sample: { size: remainingLimit } },
    ]);

    const finalQuestions = [...mapQuestions, ...dragDropQuestions, ...otherQuestions]
      .sort(() => Math.random() - 0.5) 
      .map(sanitizeForQuiz);

    res.json({
      questions: finalQuestions,
      total: finalQuestions.length,
      requestedLimit,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}