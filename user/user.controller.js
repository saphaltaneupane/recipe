import express from "express";
import mongoose from "mongoose";
import UserTable from "./user.schema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS ?? "12", 10);
const JWT_EXPIRY = process.env.JWT_EXPIRY ?? "7d";
const COOKIE_EXPIRY_MS = parseInt(
  process.env.COOKIE_EXPIRY_MS ?? `${7 * 24 * 60 * 60 * 1000}`
);

router.post("/register", async (req, res) => {
  const newUser = req.body;

  //   find user , throw
  const user = await UserTable.findOne({ email: newUser.email });

  //  if user, throw error

  if (user) {
    return res.status(409).send({ message: "user already exists." });
  }

  const plainPassword = newUser.password;
  const saltround = 10;
  const hashedPassword = await bcrypt.hash(plainPassword, saltround);
  console.log(hashedPassword);

  newUser.password = hashedPassword;

  UserTable.create(newUser);
  return res.status(201).send({ message: "registered successfully" });
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
