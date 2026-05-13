import { NavLink, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import "./Sidebar.css";

const navItems = [
  {
    icon: "🏠",
    label: "Home",
    to: "/",
    category: null,
    sort: null,
  },

  {
    icon: "🔥",
    label: "Trending",
    to: "/?sort=trending",
    category: null,
    sort: "trending",
  },

  {
    icon: "🎵",
    label: "Music",
    to: "/?category=Music",
    category: "Music",
  },

  {
    icon: "🎮",
    label: "Gaming",
    to: "/?category=Gaming",
    category: "Gaming",
  },

  {
    icon: "📰",
    label: "News",
    to: "/?category=News",
    category: "News",
  },

  {
    icon: "⚽",
    label: "Sports",
    to: "/?category=Sports",
    category: "Sports",
  },

  {
    icon: "💡",
    label: "Technology",
    to: "/?category=Technology",
    category: "Technology",
  },

  {
    icon: "📚",
    label: "Education",
    to: "/?category=Education",
    category: "Education",
  },
];

export default function Sidebar({ isOpen }) {
  const { user } = useAuth();

  const location = useLocation();

  const currentCategory = new URLSearchParams(location.search).get("category");
  const currentSort = new URLSearchParams(location.search).get("sort");

  return (
    <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = item.sort
            ? currentSort === item.sort
            : item.category
              ? currentCategory === item.category
              : location.pathname === "/" && !currentCategory && !currentSort;

          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={`sidebar-item ${isActive ? "active" : ""}`}
            >
              <span className="sidebar-icon">{item.icon}</span>

              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* USER SECTION */}

      {user && (
        <>
          <div className="sidebar-divider" />

          <div className="sidebar-section-label">Your Content</div>

          <NavLink
            to={
              user.channels && user.channels.length > 0
                ? `/channel/${user.channels[0]._id || user.channels[0]}`
                : "/channel/create"
            }
            className="sidebar-item"
          >
            <span className="sidebar-icon">📺</span>

            <span className="sidebar-label">Your Channel</span>
          </NavLink>
        </>
      )}

      {/* FOOTER */}

      <div className="sidebar-divider" />

      <p className="sidebar-footer">© 2026 VidStream</p>
    </aside>
  );
}
