import { useState, useEffect, useRef } from "react";

import { Link, useNavigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import "./Header.css";

export default function Header({
  sidebarOpen,

  toggleSidebar,
}) {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const location = useLocation();

  const dropdownRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [dropdownOpen, setDropdownOpen] = useState(false);

  // ======================
  // SEARCH HANDLER
  // ======================

  const currentCategory = new URLSearchParams(location.search).get("category");
  const currentSort = new URLSearchParams(location.search).get("sort");

  const handleSearch = (e) => {
    e.preventDefault();

    const query = searchQuery.trim();
    const params = new URLSearchParams();

    if (query) {
      params.set("search", query);
    }

    if (currentCategory) {
      params.set("category", currentCategory);
    }

    if (currentSort) {
      params.set("sort", currentSort);
    }

    const path = params.toString() ? `/?${params.toString()}` : "/";

    navigate(path);
  };

  // ======================
  // LOGOUT
  // ======================

  const handleLogout = () => {
    logout();

    setDropdownOpen(false);

    navigate("/");
  };

  // ======================
  // CLOSE DROPDOWN
  // ======================

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ======================
  // CLOSE DROPDOWN ON ROUTE
  // ======================

  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  // ======================
  // GET USER INITIAL
  // ======================

  const getInitial = (name) => (name ? name[0].toUpperCase() : "U");

  return (
    <header className="header">
      {/* LEFT */}

      <div className="header-left">
        <button
          className="hamburger"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <span />
          <span />
          <span />
        </button>

        <Link to="/" className="logo">
          <span className="logo-icon">▶</span>

          <span className="logo-text">VidStream</span>
        </Link>
      </div>

      {/* SEARCH */}

      <form className="search-form" onSubmit={handleSearch}>
        <input
          className="search-input"
          type="text"
          placeholder="Search videos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <button type="submit" className="search-btn" aria-label="Search">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="11" cy="11" r="8" />

            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>
      </form>

      {/* RIGHT */}

      <div className="header-right">
        {user ? (
          <div className="user-menu" ref={dropdownRef}>
            <button
              className="avatar-btn"
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-label="User menu"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="avatar-img"
                />
              ) : (
                <span className="avatar-initials">
                  {getInitial(user.username)}
                </span>
              )}
            </button>

            {dropdownOpen && (
              <div className="dropdown">
                <div className="dropdown-user">
                  <span className="dropdown-name">{user.username}</span>

                  <span className="dropdown-email">{user.email}</span>
                </div>

                <div className="dropdown-divider" />

                <Link
                  to={
                    user.channels && user.channels.length > 0
                      ? `/channel/${user.channels[0]._id || user.channels[0]}`
                      : "/channel/create"
                  }
                  className="dropdown-item"
                >
                  📺 My Channel
                </Link>

                <button
                  className="dropdown-item logout-item"
                  onClick={handleLogout}
                >
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="signin-btn">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />

              <circle cx="12" cy="7" r="4" />
            </svg>
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
