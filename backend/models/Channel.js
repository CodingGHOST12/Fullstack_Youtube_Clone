import mongoose from "mongoose";

const channelSchema = new mongoose.Schema(
  {
    channelName: {
      type: String,

      required: [true, "Channel name is required"],

      trim: true,

      maxlength: [100, "Channel name cannot exceed 100 characters"],
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      required: true,
    },

    description: {
      type: String,

      default: "",

      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },

    channelBanner: {
      type: String,

      default: "https://picsum.photos/1200/300",
    },

    subscribers: {
      type: Number,

      default: 0,

      min: 0,
    },

    videos: [
      {
        type: mongoose.Schema.Types.ObjectId,

        ref: "Video",
      },
    ],
  },

  {
    timestamps: true,
  },
);

const Channel = mongoose.model("Channel", channelSchema);

export default Channel;
