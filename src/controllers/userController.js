import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { insertUser, findUserByUsername, getUserProfile } from "../models/userModel.js";

// create user (admin only)
export const createUser = async (req, res) => {
  try {
    const { username, password, id_role, role, nama_lengkap } = req.body;

    if (!username || !password || !id_role || !role || !nama_lengkap) {
      console.log(req.body)
      return res.status(400).json({ error: "Semua field wajib diisi." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: uuidv4(),
      username,
      nama_lengkap,
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

//     simpan token di HTTP-only cookie
//   res.cookie("token", token, {
//   httpOnly: true,
//   secure: true,          // HARUS true di HTTPS (Netlify & Vercel keduanya HTTPS)
//   sameSite: "none",      // HARUS "none" agar bisa cross-site
//   maxAge: 24 * 60 * 60 * 1000,
// });

const isProduction = process.env.NODE_ENV === "production";

res.cookie("token", token, {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
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
    const user = await getUserProfile(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.status(200).json({
      user,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};



// logout
export const logoutUser = (req, res) => {
  res.clearCookie("token");
  console.log(res)
  res.status(200).json({ message: "Logout berhasil" });
};
