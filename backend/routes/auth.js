import express from "express";

import jwt from "jsonwebtoken";

import User from "../models/User.js";

import protect from "../middleware/auth.js";

const router = express.Router();

// ======================
// GENERATE JWT
// ======================

const generateToken = (id) => {
  return jwt.sign(
    { id },

    process.env.JWT_SECRET,

    {
      expiresIn: "7d",
    },
  );
};


// REGISTER USER

router.post("/register", async (req, res) => {
  try {
    let { username, email, password } = req.body;

    // VALIDATION

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    username = username.trim();

    email = email.trim().toLowerCase();

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // CHECK EXISTING USER

    const emailExists = await User.findOne({
      email,
    });

    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const usernameExists = await User.findOne({
      username,
    });

    if (usernameExists) {
      return res.status(400).json({
        success: false,
        message: "Username already taken",
      });
    }

    // CREATE USER

    const newUser = await User.create({
      username,
      email,
      password,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token: generateToken(newUser._id),
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        avatar: newUser.avatar,
        channels: newUser.channels,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
});

// LOGIN USER

router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,

        message: "Email and password are required",
      });
    }

    email = email.trim().toLowerCase();

    // FIND USER

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(401).json({
        success: false,

        message: "Invalid email or password",
      });
    }

    // CHECK PASSWORD

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,

        message: "Invalid email or password",
      });
    }

    // RESPONSE

    res.status(200).json({
      success: true,

      message: "Login successful",

      token: generateToken(user._id),

      user: {
        _id: user._id,

        username: user.username,

        email: user.email,

        avatar: user.avatar,

        channels: user.channels,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
});

// CURRENT USER

router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

      .select("-password")

      .populate("channels");

    if (!user) {
      return res.status(404).json({
        success: false,

        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,

      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
});

export default router;
