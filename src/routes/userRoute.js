import express from "express";
import { createUser, loginUser, getProfile, logoutUser } from "../controllers/userController.js";
import { authenticateToken, isAdmin } from "../middleware/authMiddleware.js";

const userRoute = express.Router();

// create user (admin only)
userRoute.post("/users", authenticateToken, isAdmin, createUser);

// login
userRoute.post("/login", loginUser);

// get profile (login required)
userRoute.get("/profile", authenticateToken, getProfile);

// logout
userRoute.post("/logout", authenticateToken, logoutUser);

export default userRoute;
