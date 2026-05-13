import express from "express";

import Video from "../models/Video.js";

import protect from "../middleware/auth.js";

const router = express.Router();

// @route  GET /api/comments/:videoId
// @desc   Get comments for a video
// @access Public

router.get("/:videoId", async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    res.status(200).json({
      success: true,
      count: video.comments.length,
      comments: video.comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route  POST /api/comments/:videoId
// @desc   Add comment
// @access Private

router.post("/:videoId", protect, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const video = await Video.findById(req.params.videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    const newComment = {
      userId: req.user._id,

      username: req.user.username,

      avatar: req.user.avatar || "",

      text: text.trim(),
    };

    video.comments.unshift(newComment);

    await video.save();

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: video.comments[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route  PUT /api/comments/:videoId/:commentId
// @desc   Edit comment
// @access Private

router.put("/:videoId/:commentId", protect, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const video = await Video.findById(req.params.videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    const comment = video.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to edit this comment",
      });
    }

    comment.text = text.trim();

    await video.save();

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route  DELETE /api/comments/:videoId/:commentId
// @desc   Delete comment
// @access Private

router.delete("/:videoId/:commentId", protect, async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    const comment = video.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this comment",
      });
    }

    video.comments.pull({
      _id: req.params.commentId,
    });

    await video.save();

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
