import { useState, useEffect } from "react";

import { useParams, Link } from "react-router-dom";

import API from "../api/axios";

import { useAuth } from "../context/AuthContext";

import CommentSection from "../components/CommentSection";

import "./VideoPlayer.css";

function formatViews(n) {
  if (!n) return "0";

  if (n >= 1_000_000) {
    return (n / 1_000_000).toFixed(1) + "M";
  }

  if (n >= 1_000) {
    return (n / 1_000).toFixed(1) + "K";
  }

  return n.toString();
}

export default function VideoPlayer() {
  const { id } = useParams();

  const { user } = useAuth();

  const [video, setVideo] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [related, setRelated] = useState([]);

  const [actionLoading, setActionLoading] = useState(false);

  const [likeState, setLikeState] = useState({
    liked: false,

    disliked: false,

    likes: 0,

    dislikes: 0,
  });

  // ======================
  // FETCH VIDEO + RELATED
  // ======================

  useEffect(() => {
    fetchVideo();

    fetchRelatedVideos();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ======================
  // FETCH SINGLE VIDEO
  // ======================

  const fetchVideo = async () => {
    setLoading(true);

    setError("");

    try {
      const res = await API.get(`/videos/${id}`);

      const currentVideo = res.data.video;

      setVideo(currentVideo);

      const userId = user?._id;

      setLikeState({
        liked: userId
          ? currentVideo.likes?.some((l) => (l._id || l) === userId)
          : false,

        disliked: userId
          ? currentVideo.dislikes?.some((d) => (d._id || d) === userId)
          : false,

        likes: currentVideo.likes?.length || 0,

        dislikes: currentVideo.dislikes?.length || 0,
      });
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message || err.message || "Video not found.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // FETCH RELATED VIDEOS
  // ======================

  const fetchRelatedVideos = async () => {
    try {
      const res = await API.get("/videos");

      const videos = res.data.videos || [];

      setRelated(
        videos

          .filter((v) => v._id !== id)

          .slice(0, 8),
      );
    } catch (err) {
      console.error(err);
    }
  };

  // ======================
  // LIKE VIDEO
  // ======================

  const handleLike = async () => {
    if (!user) return;

    setActionLoading(true);

    try {
      const res = await API.put(`/videos/${id}/like`);

      setLikeState((prev) => ({
        liked: res.data.liked,

        disliked: res.data.liked ? false : prev.disliked,

        likes: res.data.likes,

        dislikes: res.data.dislikes,
      }));
    } catch (err) {
      console.error(err);
    }

    setActionLoading(false);
  };

  // ======================
  // DISLIKE VIDEO
  // ======================

  const handleDislike = async () => {
    if (!user) return;

    setActionLoading(true);

    try {
      const res = await API.put(`/videos/${id}/dislike`);

      setLikeState((prev) => ({
        disliked: res.data.disliked,

        liked: res.data.disliked ? false : prev.liked,

        likes: res.data.likes,

        dislikes: res.data.dislikes,
      }));
    } catch (err) {
      console.error(err);
    }

    setActionLoading(false);
  };

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

  if (error || !video) {
    return (
      <div className="player-page">
        <div className="empty-state">
          <span className="empty-icon">⚠️</span>

          <p>{error}</p>
        </div>
      </div>
    );
  }

  // ======================
  // VIDEO URL
  // ======================

  const videoSrc =
    video.videoUrl?.includes("youtube.com") ||
    video.videoUrl?.includes("youtu.be")
      ? video.videoUrl

          .replace("watch?v=", "embed/")

          .replace("youtu.be/", "youtube.com/embed/")
      : video.videoUrl;

  return (
    <div className="player-page">
      {/* MAIN */}

      <div className="player-main">
        {/* VIDEO */}

        <div className="player-wrap">
          <iframe
            className="player-frame"
            src={videoSrc}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* INFO */}

        <div className="player-info">
          <span className="player-category">{video.category}</span>

          <h1 className="player-title">{video.title}</h1>

          <div className="player-meta-row">
            {/* CHANNEL */}

            <div className="player-channel">
              <Link
                to={`/channel/${video.channelId?._id}`}
                className="player-channel-link"
              >
                <div className="player-channel-avatar">
                  {(video.channelId?.channelName ||
                    video.uploader?.username ||
                    "C")[0].toUpperCase()}
                </div>

                <div>
                  <p className="player-channel-name">
                    {video.channelId?.channelName ||
                      video.uploader?.username ||
                      "Unknown"}
                  </p>

                  <p className="player-views">
                    {formatViews(video.views)} views
                  </p>
                </div>
              </Link>
            </div>

            {/* ACTIONS */}

            <div className="player-actions">
              <button
                className={`action-btn ${
                  likeState.liked ? "action-btn--active" : ""
                }`}
                onClick={handleLike}
                disabled={actionLoading || !user}
              >
                👍
                <span>{formatViews(likeState.likes)}</span>
              </button>

              <button
                className={`action-btn ${
                  likeState.disliked
                    ? "action-btn--active action-btn--dislike"
                    : ""
                }`}
                onClick={handleDislike}
                disabled={actionLoading || !user}
              >
                👎
                <span>{formatViews(likeState.dislikes)}</span>
              </button>
            </div>
          </div>

          {/* DESCRIPTION */}

          {video.description && (
            <div className="player-desc">
              <p>{video.description}</p>
            </div>
          )}

          {/* COMMENTS */}

          <CommentSection
            videoId={video._id}
            initialComments={video.comments || []}
          />
        </div>
      </div>

      {/* RELATED */}

      <aside className="player-aside">
        <h3 className="aside-heading">More Videos</h3>

        <div className="related-list">
          {related.map((v) => (
            <Link key={v._id} to={`/watch/${v._id}`} className="related-card">
              <div className="related-thumb-wrap">
                <img
                  src={
                    v.thumbnailUrl ||
                    `https://picsum.photos/seed/${v._id}/320/180`
                  }
                  alt={v.title}
                  className="related-thumb"
                  onError={(e) => {
                    e.target.src = `https://picsum.photos/seed/${v._id}/320/180`;
                  }}
                />
              </div>

              <div className="related-info">
                <p className="related-title">{v.title}</p>

                <p className="related-channel">
                  {v.channelId?.channelName || v.uploader?.username}
                </p>

                <p className="related-views">{formatViews(v.views)} views</p>
              </div>
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}
