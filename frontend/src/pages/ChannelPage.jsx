import { useState, useEffect } from "react";

import { useParams, useNavigate, Link } from "react-router-dom";

import API from "../api/axios";

import { useAuth } from "../context/AuthContext";

import VideoCard from "../components/VideoCard";

import "./ChannelPage.css";

const CATEGORIES = [
  "Music",

  "Gaming",

  "News",

  "Sports",

  "Technology",

  "Education",

  "Entertainment",

  "Travel",

  "Cooking",
];

const EMPTY_VIDEO = {
  title: "",

  thumbnailUrl: "",

  videoUrl: "",

  description: "",

  category: "Entertainment",
};

const EMPTY_CHANNEL = {
  channelName: "",

  description: "",
};

export default function ChannelPage() {
  const { id } = useParams();

  const navigate = useNavigate();

  const { user, refreshUser } = useAuth();

  const [channel, setChannel] = useState(null);

  const [videos, setVideos] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ======================
  // CREATE CHANNEL MODAL
  // ======================

  const [showCreateChannel, setShowCreateChannel] = useState(false);

  const [channelForm, setChannelForm] = useState(EMPTY_CHANNEL);

  const [channelError, setChannelError] = useState("");

  const [channelLoading, setChannelLoading] = useState(false);

  // ======================
  // VIDEO MODAL
  // ======================

  const [showVideoModal, setShowVideoModal] = useState(false);

  const [videoForm, setVideoForm] = useState(EMPTY_VIDEO);

  const [editingVideoId, setEditingVideoId] = useState(null);

  const [videoError, setVideoError] = useState("");

  const [videoLoading, setVideoLoading] = useState(false);

  // ======================
  // OWNER CHECK
  // ======================

  const isOwner =
    user && channel && (channel.owner?._id || channel.owner) === user._id;

  // ======================
  // LOAD CHANNEL
  // ======================

  useEffect(() => {
    if (id === "create") {
      setShowCreateChannel(true);

      setLoading(false);

      return;
    }

    fetchChannel();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ======================
  // FETCH CHANNEL
  // ======================

  const fetchChannel = async () => {
    setLoading(true);

    setError("");

    try {
      const [chRes, vidRes] = await Promise.all([
        API.get(`/channels/${id}`),

        API.get(`/channels/${id}/videos`),
      ]);

      // IMPORTANT FIXES

      setChannel(chRes.data.channel);

      setVideos(vidRes.data.videos || []);
    } catch (err) {
      console.error(err);

      setError("Channel not found.");
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // CREATE CHANNEL
  // ======================

  const handleCreateChannel = async (e) => {
    e.preventDefault();

    if (!channelForm.channelName.trim()) {
      setChannelError("Channel name is required");

      return;
    }

    setChannelLoading(true);

    setChannelError("");

    try {
      const res = await API.post("/channels", channelForm);

      await refreshUser();

      // IMPORTANT FIX

      navigate(`/channel/${res.data.channel._id}`);
    } catch (err) {
      console.error(err);

      setChannelError(
        err.response?.data?.message || "Failed to create channel",
      );
    } finally {
      setChannelLoading(false);
    }
  };

  // ======================
  // OPEN ADD VIDEO
  // ======================

  const openAddVideo = () => {
    setEditingVideoId(null);

    setVideoForm({
      ...EMPTY_VIDEO,
    });

    setVideoError("");

    setShowVideoModal(true);
  };

  // ======================
  // OPEN EDIT VIDEO
  // ======================

  const openEditVideo = (video) => {
    setEditingVideoId(video._id);

    setVideoForm({
      title: video.title,

      thumbnailUrl: video.thumbnailUrl || "",

      videoUrl: video.videoUrl || "",

      description: video.description || "",

      category: video.category || "Entertainment",
    });

    setVideoError("");

    setShowVideoModal(true);
  };

  // ======================
  // SAVE VIDEO
  // ======================

  const handleVideoSubmit = async (e) => {
    e.preventDefault();

    if (!videoForm.title.trim() || !videoForm.videoUrl.trim()) {
      setVideoError("Title and Video URL are required");

      return;
    }

    setVideoLoading(true);

    setVideoError("");

    try {
      if (editingVideoId) {
        await API.put(
          `/videos/${editingVideoId}`,

          videoForm,
        );
      } else {
        await API.post("/videos", {
          ...videoForm,
          channelId: channel._id,
        });
      }

      setShowVideoModal(false);

      fetchChannel();
    } catch (err) {
      console.error(err);

      setVideoError(err.response?.data?.message || "Failed to save video");
    } finally {
      setVideoLoading(false);
    }
  };

  // ======================
  // DELETE VIDEO
  // ======================

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm("Delete this video?")) return;

    try {
      await API.delete(`/videos/${videoId}`);

      setVideos((prev) => prev.filter((v) => v._id !== videoId));
    } catch (err) {
      console.error(err);

      alert(err.response?.data?.message || "Failed to delete video");
    }
  };

  // ======================
  // LOGIN REQUIRED
  // ======================

  if (!user && id === "create") {
    return (
      <div className="channel-page">
        <div className="empty-state">
          <span className="empty-icon">🔒</span>

          <p>
            Please{" "}
            <Link to="/login" className="link-accent">
              sign in
            </Link>{" "}
            to create a channel.
          </p>
        </div>
      </div>
    );
  }

  // ======================
  // CREATE CHANNEL PAGE
  // ======================

  if (showCreateChannel && id === "create") {
    return (
      <div className="channel-page">
        <div className="create-channel-card">
          <h2 className="modal-title">Create Your Channel</h2>

          {channelError && <p className="error-msg">{channelError}</p>}

          <form onSubmit={handleCreateChannel} className="video-form">
            <div className="form-group">
              <label>Channel Name *</label>

              <input
                className="form-input"
                value={channelForm.channelName}
                onChange={(e) =>
                  setChannelForm((prev) => ({
                    ...prev,

                    channelName: e.target.value,
                  }))
                }
                placeholder="My Awesome Channel"
              />
            </div>

            <div className="form-group">
              <label>Description</label>

              <textarea
                className="form-input form-textarea"
                value={channelForm.description}
                onChange={(e) =>
                  setChannelForm((prev) => ({
                    ...prev,

                    description: e.target.value,
                  }))
                }
                placeholder="What is your channel about?"
                rows={3}
              />
            </div>

            <button type="submit" className="btn-red" disabled={channelLoading}>
              {channelLoading ? "Creating..." : "🚀 Create Channel"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ======================
  // LOADING
  // ======================

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" />
      </div>
    );
  }

  // ======================
  // ERROR
  // ======================

  if (error) {
    return (
      <div className="channel-page">
        <div className="empty-state">
          <span className="empty-icon">⚠️</span>

          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="channel-page">
      {/* BANNER */}

      <div
        className="channel-banner"
        style={{
          backgroundImage: channel.channelBanner
            ? `url(${channel.channelBanner})`
            : undefined,
        }}
      >
        {!channel.channelBanner && (
          <div className="channel-banner-default">
            <span>{channel.channelName?.[0]?.toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* CHANNEL INFO */}

      <div className="channel-info-row">
        <div className="channel-avatar-lg">
          {channel.channelName?.[0]?.toUpperCase()}
        </div>

        <div className="channel-meta">
          <h1 className="channel-name">{channel.channelName}</h1>

          <p className="channel-stats">
            {channel.subscribers?.toLocaleString()} subscribers ·{" "}
            {videos.length} videos
          </p>

          {channel.description && (
            <p className="channel-desc">{channel.description}</p>
          )}
        </div>

        {isOwner && (
          <button className="btn-red" onClick={openAddVideo}>
            + Upload Video
          </button>
        )}
      </div>

      {/* VIDEOS */}

      <div className="channel-videos">
        <h2 className="section-heading">Videos</h2>

        {videos.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🎬</span>

            <p>
              No videos yet.
              {isOwner && ' Click "Upload Video" to get started!'}
            </p>
          </div>
        ) : (
          <div className="video-grid-channel">
            {videos.map((video) => (
              <div key={video._id} className="channel-video-wrap">
                <VideoCard video={video} />

                {isOwner && (
                  <div className="channel-video-actions">
                    <button
                      className="channel-action-btn"
                      onClick={() => openEditVideo(video)}
                    >
                      ✏️ Edit
                    </button>

                    <button
                      className="channel-action-btn channel-action-btn--danger"
                      onClick={() => handleDeleteVideo(video._id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* VIDEO MODAL */}

      {showVideoModal && (
        <div className="modal-overlay" onClick={() => setShowVideoModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">
              {editingVideoId ? "Edit Video" : "Upload New Video"}
            </h2>

            {videoError && <p className="error-msg">{videoError}</p>}

            <form className="video-form" onSubmit={handleVideoSubmit}>
              <div className="form-group">
                <label>Title *</label>

                <input
                  className="form-input"
                  value={videoForm.title}
                  onChange={(e) =>
                    setVideoForm((prev) => ({
                      ...prev,

                      title: e.target.value,
                    }))
                  }
                  placeholder="Video title"
                />
              </div>

              <div className="form-group">
                <label>Video URL *</label>

                <input
                  className="form-input"
                  value={videoForm.videoUrl}
                  onChange={(e) =>
                    setVideoForm((prev) => ({
                      ...prev,

                      videoUrl: e.target.value,
                    }))
                  }
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              <div className="form-group">
                <label>Thumbnail URL</label>

                <input
                  className="form-input"
                  value={videoForm.thumbnailUrl}
                  onChange={(e) =>
                    setVideoForm((prev) => ({
                      ...prev,

                      thumbnailUrl: e.target.value,
                    }))
                  }
                  placeholder="https://example.com/thumb.jpg"
                />
              </div>

              <div className="form-group">
                <label>Category</label>

                <select
                  className="form-input form-select"
                  value={videoForm.category}
                  onChange={(e) =>
                    setVideoForm((prev) => ({
                      ...prev,

                      category: e.target.value,
                    }))
                  }
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>

                <textarea
                  className="form-input form-textarea"
                  value={videoForm.description}
                  onChange={(e) =>
                    setVideoForm((prev) => ({
                      ...prev,

                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe your video..."
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-ghost-modal"
                  onClick={() => setShowVideoModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-red"
                  disabled={videoLoading}
                >
                  {videoLoading
                    ? "Saving..."
                    : editingVideoId
                      ? "Save Changes"
                      : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
