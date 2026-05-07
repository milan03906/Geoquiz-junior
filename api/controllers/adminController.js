import Question from "../models/Question.js";
import User from "../models/User.js";
import Contact from "../models/Contact.js";
import Attempt from "../models/Attempt.js";

function buildQuestionQuery(req) {
  const { category, difficulty, grade, search } = req.query;
  const query = {};
  if (category && category !== "all") query.category = category;
  if (difficulty && difficulty !== "all") query.difficulty = difficulty;
  if (grade && grade !== "all") query.grade = Number(grade);
  if (search) query.text = { $regex: search, $options: "i" };
  return query;
}

function normalizeOptions(options) {
  if (Array.isArray(options)) return options.map((o) => String(o).trim()).filter(Boolean);
  if (typeof options === "string") return options.split("\n").map((o) => o.trim()).filter(Boolean);
  return [];
}

export async function getQuestionsAdmin(req, res) {
  try {
    const query = buildQuestionQuery(req);
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const total = await Question.countDocuments(query);
    const questions = await Question.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.json({ questions, page, limit, total, totalPages: Math.ceil(total / limit) || 1 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function createQuestion(req, res) {
  try {
    const { text, options, correctAnswer, category, difficulty, grade } = req.body;
    if (!text || !correctAnswer || !category || !difficulty || !grade)
      return res.status(400).json({ message: "Sva polja su obavezna." });

    const normalizedOptions = normalizeOptions(options);
    if (normalizedOptions.length < 2)
      return res.status(400).json({ message: "Potrebne su najmanje 2 opcije." });
    if (!normalizedOptions.includes(correctAnswer))
      return res.status(400).json({ message: "Tačan odgovor mora biti jedna od opcija." });

    const question = await Question.create({
      text: text.trim(),
      options: normalizedOptions,
      correctAnswer: correctAnswer.trim(),
      category,
      difficulty,
      grade: Number(grade),
    });
    res.status(201).json({ message: "Pitanje je kreirano.", question });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function updateQuestion(req, res) {
  try {
    const { text, options, correctAnswer, category, difficulty, grade } = req.body;
    const normalizedOptions = normalizeOptions(options);

    if (normalizedOptions.length < 2)
      return res.status(400).json({ message: "Potrebne su najmanje 2 opcije." });
    if (!normalizedOptions.includes(correctAnswer))
      return res.status(400).json({ message: "Tačan odgovor mora biti jedna od opcija." });

    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { text: text?.trim(), options: normalizedOptions, correctAnswer: correctAnswer?.trim(), category, difficulty, grade: Number(grade) },
      { new: true, runValidators: true }
    );
    if (!question) return res.status(404).json({ message: "Pitanje nije pronađeno." });
    res.json({ message: "Pitanje je ažurirano.", question });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function deleteQuestion(req, res) {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ message: "Pitanje nije pronađeno." });
    res.json({ message: "Pitanje je obrisano." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getUsers(req, res) {
  try {
    const { search = "", role = "all" } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const query = {};

    if (search) query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
    if (role !== "all") query.role = role;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ users, page, limit, total, totalPages: Math.ceil(total / limit) || 1 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function updateUserRole(req, res) {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role))
      return res.status(400).json({ message: "Neispravna rola." });

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "Korisnik nije pronađen." });
    res.json({ message: "Rola je ažurirana.", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function deleteUser(req, res) {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: "Korisnik nije pronađen." });
    if (targetUser._id.toString() === req.user.id)
      return res.status(400).json({ message: "Ne možeš obrisati samog sebe." });

    if (targetUser.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1)
        return res.status(400).json({ message: "Mora postojati bar jedan admin." });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Korisnik je obrisan." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getContacts(req, res) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const total = await Contact.countDocuments();
    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.json({ contacts, page, limit, total, totalPages: Math.ceil(total / limit) || 1 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function markContactAsRead(req, res) {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!contact) return res.status(404).json({ message: "Poruka nije pronađena." });
    res.json({ message: "Poruka je označena kao pročitana.", contact });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function deleteContact(req, res) {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ message: "Poruka nije pronađena." });
    res.json({ message: "Poruka je obrisana." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getStats(req, res) {
  try {
    const [questionsCount, usersCount, attemptsCount, contactsCount, unreadContactsCount, adminsCount] =
      await Promise.all([
        Question.countDocuments(),
        User.countDocuments(),
        Attempt.countDocuments(),
        Contact.countDocuments(),
        Contact.countDocuments({ isRead: false }),
        User.countDocuments({ role: "admin" }),
      ]);

    const recentAttempts = await Attempt.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "username");

    res.json({ questionsCount, usersCount, attemptsCount, contactsCount, unreadContactsCount, adminsCount, recentAttempts });
  } catch (error) {
    res.status(500).json({ message: "Greška na serveru" });
  }
}