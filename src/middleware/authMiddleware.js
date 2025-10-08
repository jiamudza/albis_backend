import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  let token;

  // 1️⃣ Cek header Authorization
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // 2️⃣ Kalau tidak ada di header, ambil dari cookie
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ error: "Access denied, token missing" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
};


export const isAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "User not authenticated" });
  console.log(req.user.role)
  if (!req.user.role || !Array.isArray(req.user.role) || !req.user.role.includes("Admin")) {
    return res.status(403).json({ error: "Admin only" });
  }
  next();
};

export const isSPMB = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "User not authenticated" });
  if (!req.user.role || !Array.isArray(req.user.role) || !req.user.role.includes("SPMB")) {
    return res.status(403).json({ error: "Panitia Inti Saja" });
  }
  next();
};


