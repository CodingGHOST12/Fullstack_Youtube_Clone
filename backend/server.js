import express from "express";

import mongoose from "mongoose";

import cors from "cors";

import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";

import videoRoutes from "./routes/videos.js";

import channelRoutes from "./routes/channels.js";

import commentRoutes from "./routes/comments.js";

dotenv.config();

const app = express();


// MIDDLEWARE

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",

    credentials: true,
  }),
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);


// ROUTES

app.use("/api/auth", authRoutes);

app.use("/api/videos", videoRoutes);

app.use("/api/channels", channelRoutes);

app.use("/api/comments", commentRoutes);


// HEALTH CHECK

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    message: "YouTube Clone API is running",
  });
});


// 404 HANDLER

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});


// GLOBAL ERROR HANDLER

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});


// DATABASE CONNECTION

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);

    process.exit(1);
  }
};


startServer();
