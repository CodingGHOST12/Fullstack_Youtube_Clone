import express from "express";
import Channel from "../models/Channel.js";
import Video from "../models/Video.js";
import User from "../models/User.js";
import protect from "../middleware/auth.js";

const router = express.Router();

// @route  POST /api/channels
// @desc   Create a new channel
// @access Private
router.post("/", protect, async (req, res) => {
  try {
    const { channelName, description, channelBanner } = req.body;

    if (!channelName) {
      return res.status(400).json({
        success: false,
        message: "Channel name is required",
      });
    }

    const channel = await Channel.create({
      channelName,
      description: description || "",
      channelBanner: channelBanner || "",
      owner: req.user._id,
    });

    await User.findByIdAndUpdate(req.user._id, {
      $push: { channels: channel._id },
    });

    res.status(201).json({
      success: true,
      message: "Channel created successfully",
      channel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route  GET /api/channels/:id
// @desc   Get channel by ID
// @access Public
router.get("/:id", async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id).populate(
      "owner",
      "username avatar",
    );

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Channel not found",
      });
    }

    res.status(200).json({
      success: true,
      channel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route  GET /api/channels/:id/videos
// @desc   Get all videos for a channel
// @access Public
router.get("/:id/videos", async (req, res) => {
  try {
    const videos = await Video.find({ channelId: req.params.id })
      .populate("channelId", "channelName")
      .populate("uploader", "username avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      videos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route  PUT /api/channels/:id
// @desc   Update channel info
// @access Private (owner only)
router.put("/:id", protect, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Channel not found",
      });
    }

    if (channel.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this channel",
      });
    }

    const { channelName, description, channelBanner } = req.body;
    if (channelName) channel.channelName = channelName;
    if (description !== undefined) channel.description = description;
    if (channelBanner !== undefined) channel.channelBanner = channelBanner;

    const updated = await channel.save();

    res.status(200).json({
      success: true,
      message: "Channel updated successfully",
      channel: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
