import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, ".env") });
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import attemptRoutes from "./routes/attemptRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import User from "./models/User.js";


const app = express();
const PORT = process.env.PORT || 4242;

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/attempts", attemptRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/payment", paymentRoutes);

app.use((err, _req, res, _next) => {
  res.status(500).json({ message: err.message || "Greška na serveru." });
});

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Povezan na MongoDB!");

    const count = await User.countDocuments();
    if (count === 0) {
      const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await User.create({
        name: "Geo Admin",
        email: process.env.ADMIN_EMAIL || "admin@geoquizjunior.com",
        passwordHash,
        role: "admin",
      });
      console.log("✅ Podrazumevani admin kreiran.");
    }

    app.listen(PORT, () => console.log(`✅ Backend pokrenut na http://localhost:${PORT}`));
  } catch (error) {
    console.error("❌ Greška pri pokretanju servera:", error);
    process.exit(1);
  }
}

start();