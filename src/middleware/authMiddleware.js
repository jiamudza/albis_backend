import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  let token;

  console.log("===== AUTH =====");
  console.log("URL:", req.originalUrl);
  console.log("Authorization:", req.headers.authorization);
  console.log("Cookies:", req.cookies);

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
    console.log("Token dari Authorization");
  }

  if (!token && req.cookies?.token) {
    token = req.cookies.token;
    console.log("Token dari Cookie");
  }

  console.log("Final Token:", token);

  if (!token) {
    console.log("TOKEN MISSING");
    return res.status(401).json({
      error: "Access denied, token missing",
    });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    console.log("JWT VERIFIED:", req.user);

    next();
  } catch (err) {
    console.log("JWT ERROR:", err.message);

    return res.status(403).json({
      error: "Invalid or expired token",
    });
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


