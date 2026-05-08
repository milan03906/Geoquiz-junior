import AuditLog from "../models/AuditLog.js";

export async function logAction(userId, action, details = "", ip = "") {
  try {
    await AuditLog.create({ user: userId, action, details, ip });
  } catch (err) {
    console.error("Audit log greška:", err.message);
  }
}