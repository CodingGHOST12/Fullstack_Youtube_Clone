import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    username: {
      type: String,
      required: true,
      trim: true,
    },

    avatar: {
      type: String,
      default: "",
    },

    text: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  },
);

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Video title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    thumbnailUrl: {
      type: String,
      default: "",
    },

    videoUrl: {
      type: String,
      required: [true, "Video URL is required"],
      trim: true,
    },

    description: {
      type: String,
      default: "",
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },

    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      default: null,
    },

    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    views: {
      type: Number,
      default: 0,
      min: 0,
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    category: {
      type: String,
      enum: [
        "All",
        "Music",
        "Gaming",
        "News",
        "Sports",
        "Technology",
        "Education",
        "Entertainment",
        "Travel",
        "Cooking",
        "Coding",
        "Podcasts",
      ],
      default: "Entertainment",
    },

    comments: [commentSchema],
  },
  {
    timestamps: true,
  },
);

const Video = mongoose.model("Video", videoSchema);

export default Video;
