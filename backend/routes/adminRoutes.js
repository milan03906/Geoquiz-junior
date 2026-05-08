import { Router } from "express";
import requireAuth from "../middleware/requireAuth.js";
import requireRole from "../middleware/requireRole.js";
import AuditLog from "../models/AuditLog.js";


import {
  getStats,
  getQuestionsAdmin,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getUsers,
  updateUserRole,
  deleteUser,
  getContacts,
  markContactAsRead,
  deleteContact,
} from "../controllers/adminController.js";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/stats", getStats);


router.get("/questions", getQuestionsAdmin);
router.post("/questions", createQuestion);
router.put("/questions/:id", updateQuestion);
router.delete("/questions/:id", deleteQuestion);


router.get("/users", getUsers);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);


router.get("/contacts", getContacts);
router.patch("/contacts/:id/read", markContactAsRead);
router.delete("/contacts/:id", deleteContact);

router.get("/audit-logs", async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;