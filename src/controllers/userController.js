import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { insertUser, findUserByUsername, getUserProfile } from "../models/userModel.js";

// create user (admin only)
export const createUser = async (req, res) => {
  try {
    const { username, password, id_role, role } = req.body;

    if (!username || !password || !id_role || !role) {
      return res.status(400).json({ error: "Semua field wajib diisi." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: uuidv4(),
      username,
      password: hashedPassword,
      id_role,
      role,
    };

    const savedUser = await insertUser(newUser);

    res.status(201).json({
      message: "User berhasil dibuat",
      user: {
        id: savedUser.id,
        username: savedUser.username,
        role: savedUser.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// login user
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await findUserByUsername(username);
    if (!user) return res.status(404).json({ error: "User tidak ditemukan" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Password salah" });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // simpan token di HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login berhasil",
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get profile
export const getProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("🔍 AUTH HEADER:", authHeader);

    if (!authHeader) {
      return res.status(401).json({ error: "Token missing" });
    }

    const token = authHeader.split(" ")[1];
    console.log("🔍 TOKEN VALUE:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ DECODED:", decoded);

    const user = await getUserProfile(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ user });
  } catch (err) {
    console.log("❌ ERROR VERIFY TOKEN:", err.message);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};



// logout
export const logoutUser = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout berhasil" });
};
