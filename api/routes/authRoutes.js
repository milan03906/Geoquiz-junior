import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import requireAuth from "../middleware/requireAuth.js";

const router = Router();

function createToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Sva polja su obavezna." });
    if (password.length < 6)
      return res.status(400).json({ message: "Lozinka mora imati bar 6 karaktera." });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email već postoji." });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: "user",
    });

    const token = createToken(user);
    res.status(201).json({
      message: "Registracija uspešna.",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Sva polja su obavezna." });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user)
      return res.status(401).json({ message: "Neispravni podaci za prijavu." });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok)
      return res.status(401).json({ message: "Neispravni podaci za prijavu." });

    const token = createToken(user);
    res.json({
      message: "Prijava uspešna.",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isPremium: user.isPremium },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "Korisnik nije pronađen." });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;