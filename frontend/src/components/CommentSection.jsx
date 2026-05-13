import { useState, useEffect } from "react";

import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import API from "../api/axios";

import "./CommentSection.css";

function timeAgo(dateStr) {
  if (!dateStr) return "";

  const diff = Date.now() - new Date(dateStr).getTime();

  const mins = Math.floor(diff / 60000);

  if (mins < 1) return "just now";

  if (mins < 60) return `${mins}m ago`;

  const hrs = Math.floor(mins / 60);

  if (hrs < 24) return `${hrs}h ago`;

  const days = Math.floor(hrs / 24);

  if (days < 30) return `${days}d ago`;

  return `${Math.floor(days / 30)}mo ago`;
}

export default function CommentSection({
  videoId,

  initialComments = [],
}) {
  const { user } = useAuth();

  const [comments, setComments] = useState(initialComments);

  const [newText, setNewText] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [editText, setEditText] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    setComments(initialComments || []);
  }, [initialComments]);

  // ======================
  // ADD COMMENT
  // ======================

  const handleAdd = async () => {
    if (!newText.trim()) return;

    setLoading(true);

    setError("");

    try {
      const res = await API.post(
        `/comments/${videoId}`,

        {
          text: newText.trim(),
        },
      );

      // IMPORTANT FIX

      const newComment = res.data.comment;

      setComments((prev) => [newComment, ...prev]);

      setNewText("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // EDIT COMMENT
  // ======================

  const handleEdit = async (commentId) => {
    if (!editText.trim()) return;

    setError("");

    try {
      const res = await API.put(
        `/comments/${videoId}/${commentId}`,

        {
          text: editText.trim(),
        },
      );

      // IMPORTANT FIX

      const updatedComment = res.data.comment;

      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? updatedComment : c)),
      );

      setEditingId(null);

      setEditText("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to edit comment");
    }
  };

  // ======================
  // DELETE COMMENT
  // ======================

  const handleDelete = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;

    setError("");

    try {
      await API.delete(`/comments/${videoId}/${commentId}`);

      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete comment");
    }
  };

  return (
    <div className="comments">
      <h3 className="comments-heading">{comments.length} Comments</h3>

      {error && <p className="error-msg">{error}</p>}

      {/* COMMENT INPUT */}

      {user ? (
        <div className="comment-input-row">
          <div className="comment-avatar">
            {user.username?.[0]?.toUpperCase() || "U"}
          </div>

          <div className="comment-input-wrap">
            <textarea
              className="comment-textarea"
              placeholder="Add a comment..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              rows={2}
              maxLength={1000}
            />

            <div className="comment-input-actions">
              <button
                className="btn-ghost"
                onClick={() => setNewText("")}
                disabled={!newText}
              >
                Cancel
              </button>

              <button
                className="btn-primary"
                onClick={handleAdd}
                disabled={!newText.trim() || loading}
              >
                {loading ? "Posting..." : "Comment"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="comments-signin">
          <Link to="/login" className="link-accent">
            Sign in
          </Link>{" "}
          to leave a comment
        </p>
      )}

      {/* COMMENTS LIST */}

      <div className="comments-list">
        {comments.length === 0 && (
          <p className="comments-empty">No comments yet. Be the first!</p>
        )}

        {comments.map((comment) => {
          const isOwner =
            user && (comment.userId?._id || comment.userId) === user._id;

          const isEditing = editingId === comment._id;

          return (
            <div key={comment._id} className="comment-item">
              <div className="comment-avatar comment-avatar--sm">
                {(comment.username || "U")[0].toUpperCase()}
              </div>

              <div className="comment-body">
                <div className="comment-header">
                  <span className="comment-user">{comment.username}</span>

                  <span className="comment-time">
                    {timeAgo(comment.createdAt)}
                  </span>
                </div>

                {isEditing ? (
                  <div className="comment-edit">
                    <textarea
                      className="comment-textarea"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={2}
                      autoFocus
                      maxLength={1000}
                    />

                    <div className="comment-input-actions">
                      <button
                        className="btn-ghost"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>

                      <button
                        className="btn-primary"
                        onClick={() => handleEdit(comment._id)}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="comment-text">{comment.text}</p>
                )}

                {isOwner && !isEditing && (
                  <div className="comment-actions">
                    <button
                      className="comment-action-btn"
                      onClick={() => {
                        setEditingId(comment._id);

                        setEditText(comment.text);
                      }}
                    >
                      ✏️ Edit
                    </button>

                    <button
                      className="comment-action-btn comment-action-btn--danger"
                      onClick={() => handleDelete(comment._id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
