import bcrypt from "bcrypt";
import { z } from "zod";
import User from "../models/userModel.js";
import { generateToken } from "../utils/tokenUtils.js";

const schema = z.object({
  username: z.string().min(3),
  password: z
    .string()
    .min(6, "Password should be at least 6 characters long")
    .max(16, "Password too long")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[^a-zA-Z0-9]/, "Must contain a special character"),
});

export const signup = async (req, res) => {
  try {
    const validation = schema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.errors
        .map((e) => `${e.path[0]}: ${e.message}`)
        .join(", ");
      return res.status(400).json({ error: errors });
    }

    const { username, password } = req.body;
    const existing = await User.findOne({ username });
    if (existing)
      return res.status(400).json({ error: "Username already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, password: hashed });

    const token = generateToken(newUser._id);
    res.status(201).json({ message: "Signup successful", token });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const signin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: "Invalid username" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid password" });

    const token = generateToken(user._id);
    res.status(200).json({ message: "Signin successful", token });
  } catch (err) {
    console.error("Signin Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
