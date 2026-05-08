import jwt from "jsonwebtoken";

export default function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.token;

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : cookieToken;

  if (!token) {
    return res.status(401).json({ message: "Nedostaje token." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload.id || payload._id;
    req.user = { id: userId, _id: userId, ...payload };
    next();
  } catch {
    return res.status(401).json({ message: "Neispravan ili istekao token." });
  }
}