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
  process.env.COOKIE_EXPIRY_MS ?? `${7 * 24 * 60 * 60 * 1000}`,
  10
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
  const { email, password } = req.body; // get email & password from request

  try {
    const loginUser = await UserTable.findOne({ email });

    if (!loginUser) {
      return res.status(401).send({ message: "Email not registered." });
    }

    const isMatch = await bcrypt.compare(password, loginUser.password);

    const payload = {
      id: loginUser._id,
      name: loginUser.name,
      email: loginUser.email,
    };
    if (!isMatch) {
      return res.status(401).send({ message: "Invalid password." });
    }
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    const { password: _, __v, ...userDetails } = loginUser.toObject();

    // ✅ FIX cookie options
    res.cookie("accessToken", token, {
      httpOnly: false,
      secure: true,
      sameSite: "none",
      maxAge: COOKIE_EXPIRY_MS,
    });

    return res.status(200).send({
      message: "Login successful",
      token,
      user: {
        id: loginUser._id,
        name: loginUser.name,
        email: loginUser.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Server error" });
  }
});
export { router as Usercontroller };
