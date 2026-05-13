import { createContext, useContext, useState, useEffect } from "react";

import API from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  // ======================
  // RESTORE SESSION
  // ======================

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("token");

        const savedUser = localStorage.getItem("user");

        if (!token) {
          return;
        }

        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }

        const res = await API.get("/auth/me");

        const currentUser = res.data.user;

        setUser(currentUser);

        localStorage.setItem("user", JSON.stringify(currentUser));
      } catch (error) {
        console.error(error);

        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // ======================
  // LOGIN
  // ======================

  const login = (userData, token) => {
    localStorage.setItem("token", token);

    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
  };

  // ======================
  // LOGOUT
  // ======================

  const logout = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    setUser(null);
  };

  // ======================
  // REFRESH USER
  // ======================

  const refreshUser = async () => {
    try {
      const res = await API.get("/auth/me");

      // IMPORTANT FIX

      const currentUser = res.data.user;

      setUser(currentUser);

      localStorage.setItem("user", JSON.stringify(currentUser));
    } catch (error) {
      console.error(error);

      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,

        loading,

        login,

        logout,

        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
