import express from "express";
import mongoose from "mongoose";
import UserTable from "./user.schema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS ?? "12", 10);

// ✅ Increase token expiry (e.g., 30 days)
const JWT_EXPIRY = process.env.JWT_EXPIRY ?? "30d";

// Cookie expiry matches token expiry
const COOKIE_EXPIRY_MS = parseInt(
  process.env.COOKIE_EXPIRY_MS ?? `${30 * 24 * 60 * 60 * 1000}`, // 30 days in ms
);

router.post("/register", async (req, res) => {
  try {
    const { username, email, mobileNumber, password } = req.body;

    if (!username || !email || !mobileNumber || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Optional: check if email already exists
    const existingUser = await UserTable.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new UserTable({
      username,
      email,
      mobileNumber,
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // ✅ Find user
    const loginUser = await UserTable.findOne({ email });
    if (!loginUser) {
      return res.status(401).json({ message: "Email not registered" });
    }

    // ✅ Compare password
    const isMatch = await bcrypt.compare(password, loginUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // ✅ JWT payload
    const payload = {
      id: loginUser._id,
      username: loginUser.username,
      email: loginUser.email,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    // ✅ Remove sensitive info before sending
    const { password: _, __v, ...userData } = loginUser.toObject();

    // ✅ Set cookie
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true on HTTPS
      sameSite: "lax",
      maxAge: COOKIE_EXPIRY_MS,
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: userData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

export { router as Usercontroller };
