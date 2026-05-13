import express from "express";

import mongoose from "mongoose";

import Video from "../models/Video.js";

import Channel from "../models/Channel.js";

import protect from "../middleware/auth.js";

const router = express.Router();

const sanitizeObjectIdArray = (list) =>
  Array.isArray(list)
    ? list
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => id.toString())
    : [];

// @route  GET /api/videos
// @desc   Get all videos
// @access Public

router.get("/", async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    let query = {};

    if (search) {
      query.title = {
        $regex: search,
        $options: "i",
      };
    }

    if (category && category !== "All") {
      query.category = category;
    }

    const sortOption = sort === "trending" ? { views: -1 } : { createdAt: -1 };

    const videos = await Video.find(query)

      .populate("channelId", "channelName")

      .populate("uploader", "username avatar")

      .sort(sortOption);

    res.status(200).json({
      success: true,
      count: videos.length,
      videos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route  GET /api/videos/:id
// @desc   Get single video
// @access Public

router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    await Video.updateOne(
      { _id: video._id },
      { $inc: { views: 1 } },
      { runValidators: false },
    );

    const populatedVideo = await Video.findById(video._id)
      .populate(
        "channelId",
        "channelName description subscribers channelBanner",
      )
      .populate("uploader", "username avatar")
      .populate("comments.userId", "username avatar");

    res.status(200).json({
      success: true,
      video: populatedVideo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route  POST /api/videos
// @desc   Create video
// @access Private

router.post("/", protect, async (req, res) => {
  try {
    const { title, thumbnailUrl, videoUrl, description, channelId, category } =
      req.body;

    if (!title || !videoUrl) {
      return res.status(400).json({
        success: false,
        message: "Title and video URL are required",
      });
    }

    let validChannel = null;

    // Optional channel support

    if (channelId) {
      const channel = await Channel.findById(channelId);

      if (!channel) {
        return res.status(404).json({
          success: false,
          message: "Channel not found",
        });
      }

      if (channel.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You do not own this channel",
        });
      }

      validChannel = channel;
    }

    const video = await Video.create({
      title,

      thumbnailUrl: thumbnailUrl || "",

      videoUrl,

      description: description || "",

      channelId: validChannel?._id || null,

      uploader: req.user._id,

      category: category || "Entertainment",
    });

    // Add to channel only if channel exists

    if (validChannel) {
      validChannel.videos.push(video._id);

      await validChannel.save();
    }

    const populatedVideo = await Video.findById(video._id)

      .populate("channelId", "channelName")

      .populate("uploader", "username avatar");

    res.status(201).json({
      success: true,
      message: "Video uploaded successfully",
      video: populatedVideo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route  PUT /api/videos/:id
// @desc   Update video
// @access Private

router.put("/:id", protect, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    if (video.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const { title, thumbnailUrl, videoUrl, description, category } = req.body;

    if (title) video.title = title;

    if (thumbnailUrl !== undefined) {
      video.thumbnailUrl = thumbnailUrl;
    }

    if (videoUrl) {
      video.videoUrl = videoUrl;
    }

    if (description !== undefined) {
      video.description = description;
    }

    if (category) {
      video.category = category;
    }

    await video.save();

    const updatedVideo = await Video.findById(video._id)

      .populate("channelId", "channelName")

      .populate("uploader", "username avatar");

    res.status(200).json({
      success: true,
      message: "Video updated successfully",
      video: updatedVideo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route  DELETE /api/videos/:id
// @desc   Delete video
// @access Private

router.delete("/:id", protect, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    if (video.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Remove from channel if exists

    if (video.channelId) {
      await Channel.findByIdAndUpdate(video.channelId, {
        $pull: {
          videos: video._id,
        },
      });
    }

    await video.deleteOne();

    res.status(200).json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route  PUT /api/videos/:id/like
// @desc   Like video
// @access Private

router.put("/:id/like", protect, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    video.likes = sanitizeObjectIdArray(video.likes);
    video.dislikes = sanitizeObjectIdArray(video.dislikes);

    const userId = req.user._id.toString();

    const alreadyLiked = video.likes.includes(userId);

    const alreadyDisliked = video.dislikes.includes(userId);

    if (alreadyLiked) {
      video.likes = video.likes.filter((id) => id !== userId);
    } else {
      video.likes.push(userId);

      if (alreadyDisliked) {
        video.dislikes = video.dislikes.filter((id) => id !== userId);
      }
    }

    await Video.updateOne(
      { _id: video._id },
      {
        likes: video.likes,
        dislikes: video.dislikes,
      },
      { runValidators: false },
    );

    res.status(200).json({
      success: true,
      likes: video.likes.length,
      dislikes: video.dislikes.length,
      liked: !alreadyLiked,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route  PUT /api/videos/:id/dislike
// @desc   Dislike video
// @access Private

router.put("/:id/dislike", protect, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    video.likes = sanitizeObjectIdArray(video.likes);
    video.dislikes = sanitizeObjectIdArray(video.dislikes);

    const userId = req.user._id.toString();

    const alreadyDisliked = video.dislikes.includes(userId);

    const alreadyLiked = video.likes.includes(userId);

    if (alreadyDisliked) {
      video.dislikes = video.dislikes.filter((id) => id !== userId);
    } else {
      video.dislikes.push(userId);

      if (alreadyLiked) {
        video.likes = video.likes.filter((id) => id !== userId);
      }
    }

    await Video.updateOne(
      { _id: video._id },
      {
        likes: video.likes,
        dislikes: video.dislikes,
      },
      { runValidators: false },
    );

    res.status(200).json({
      success: true,
      likes: video.likes.length,
      dislikes: video.dislikes.length,
      disliked: !alreadyDisliked,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
