import { Link } from "react-router-dom";

import "./VideoCard.css";

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

function timeAgo(dateStr) {
  if (!dateStr) return "";

  const diff = Date.now() - new Date(dateStr).getTime();

  const mins = Math.floor(diff / 60000);

  if (mins < 60) {
    return `${mins}m ago`;
  }

  const hrs = Math.floor(mins / 60);

  if (hrs < 24) {
    return `${hrs}h ago`;
  }

  const days = Math.floor(hrs / 24);

  if (days < 30) {
    return `${days}d ago`;
  }

  const months = Math.floor(days / 30);

  if (months < 12) {
    return `${months}mo ago`;
  }

  return `${Math.floor(months / 12)}y ago`;
}

export default function VideoCard({ video }) {
  if (!video) return null;

  const channelName =
    video.channelId?.channelName ||
    video.uploader?.username ||
    "Unknown Channel";

  const thumbnail =
    video.thumbnailUrl || `https://picsum.photos/seed/${video._id}/480/270`;

  return (
    <Link to={`/watch/${video._id}`} className="video-card">
      <div className="card-thumb-wrap">
        <img
          className="card-thumb"
          src={thumbnail}
          alt={video.title}
          loading="lazy"
          onError={(e) => {
            e.target.src = `https://picsum.photos/seed/${video._id}/480/270`;
          }}
        />

        <span className="card-category">
          {video.category || "Entertainment"}
        </span>
      </div>

      <div className="card-info">
        <div className="card-avatar">
          {channelName[0]?.toUpperCase() || "U"}
        </div>

        <div className="card-meta">
          <h3 className="card-title">{video.title || "Untitled Video"}</h3>

          <p className="card-channel">{channelName}</p>

          <p className="card-stats">
            {formatViews(video.views)} views · {timeAgo(video.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
}
