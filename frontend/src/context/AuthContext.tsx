import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";
import type { SessionPayload } from "../types";

interface AuthContextType {
  user: SessionPayload | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.user);
    } catch {
      setUser(null);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore
    }
    localStorage.removeItem("prescriptocr_token");
    setUser(null);
    window.location.href = "/login";
  };

  useEffect(() => {
    // Check if URL has token (from OAuth callback)
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");
    if (tokenFromUrl) {
      localStorage.setItem("prescriptocr_token", tokenFromUrl);
      params.delete("token");
      const newQuery = params.toString();
      const newUrl =
        window.location.pathname +
        (newQuery ? `?${newQuery}` : "") +
        window.location.hash;
      window.history.replaceState({}, "", newUrl);
    }

    refresh().finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
