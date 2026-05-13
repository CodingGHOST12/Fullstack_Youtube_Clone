import { BrowserRouter, Routes, Route } from "react-router-dom";

import { useState } from "react";

import { AuthProvider } from "./context/AuthContext";

import Header from "./components/Header";

import Sidebar from "./components/Sidebar";

import Home from "./pages/Home";

import Login from "./pages/Login";

import Register from "./pages/Register";

import VideoPlayer from "./pages/VideoPlayer";

import ChannelPage from "./pages/ChannelPage";

import "./index.css";

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <>
      <Header
        sidebarOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      <div className="layout">
        <Sidebar isOpen={sidebarOpen} />

        <main className={`main-content ${sidebarOpen ? "sidebar-open" : ""}`}>
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/login" element={<Login />} />

            <Route path="/register" element={<Register />} />

            {/* FIXED ROUTE */}

            <Route path="/watch/:id" element={<VideoPlayer />} />

            <Route path="/channel/:id" element={<ChannelPage />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
