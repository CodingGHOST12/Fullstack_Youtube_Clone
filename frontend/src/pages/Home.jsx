import { useState, useEffect } from "react";

import { useSearchParams, useNavigate } from "react-router-dom";

import API from "../api/axios";

import VideoCard from "../components/VideoCard";

import FilterBar from "../components/FilterBar";

import "./Home.css";

export default function Home() {
  const [searchParams] = useSearchParams();

  const searchQuery = searchParams.get("search") || "";

  const categoryParam = searchParams.get("category") || "All";

  const sortParam = searchParams.get("sort") || "";

  const [videos, setVideos] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState(categoryParam);

  // ======================
  // UPDATE CATEGORY
  // ======================

  useEffect(() => {
    setActiveCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    if (!sortParam) return;

    setActiveCategory("All");
  }, [sortParam]);

  const handleCategorySelect = (category) => {
    setActiveCategory(category);

    const params = new URLSearchParams();

    if (searchQuery) {
      params.set("search", searchQuery);
    }

    if (category && category !== "All") {
      params.set("category", category);
    }

    const path = params.toString() ? `/?${params.toString()}` : "/";

    navigate(path);
  };

  // ======================
  // FETCH VIDEOS
  // ======================

  useEffect(() => {
    fetchVideos();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, activeCategory, sortParam]);

  const fetchVideos = async () => {
    setLoading(true);

    setError("");

    try {
      const params = {};

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (activeCategory && activeCategory !== "All") {
        params.category = activeCategory;
      }

      if (sortParam) {
        params.sort = sortParam;
      }

      const res = await API.get("/videos", { params });

      // FIXED IMPORTANT PART

      setVideos(res.data.videos || []);
    } catch (err) {
      console.error(err);

      setError("Failed to load videos. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <FilterBar active={activeCategory} onSelect={handleCategorySelect} />

      <div className="home-inner">
        {searchQuery && (
          <p className="search-result-label">
            Results for <strong>"{searchQuery}"</strong>
          </p>
        )}

        {sortParam === "trending" && !searchQuery && (
          <p className="search-result-label">
            Showing <strong>Trending</strong> videos
          </p>
        )}

        {/* LOADING */}

        {loading && (
          <div className="page-loader">
            <div className="spinner" />
          </div>
        )}

        {/* ERROR */}

        {error && !loading && (
          <div className="empty-state">
            <span className="empty-icon">⚠️</span>

            <p>{error}</p>
          </div>
        )}

        {/* EMPTY */}

        {!loading && !error && videos.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">🎬</span>

            <p>
              No videos found
              {searchQuery ? ` for "${searchQuery}"` : ""}
            </p>
          </div>
        )}

        {/* VIDEOS */}

        {!loading && !error && videos.length > 0 && (
          <div className="video-grid">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
