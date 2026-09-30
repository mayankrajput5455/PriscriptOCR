import axios from "axios";

export const BACKEND_URL = (
  import.meta.env.VITE_API_URL || "https://priscriptocr.onrender.com"
).replace(/\/+$/, "");

export const API_BASE_URL = BACKEND_URL.endsWith("/api")
  ? BACKEND_URL
  : `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor - attach Bearer token if stored in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("prescriptocr_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - persist token and only redirect to login if a protected request fails 401
api.interceptors.response.use(
  (response) => {
    if (response.data?.token) {
      localStorage.setItem("prescriptocr_token", response.data.token);
    }
    return response;
  },
  (error) => {
    const url = error.config?.url || "";
    const isAuthCheck = url.includes("/auth/me") || url.includes("/auth/login");
    const isPublicRoute =
      window.location.pathname.startsWith("/login") ||
      window.location.pathname.startsWith("/signup") ||
      window.location.pathname.startsWith("/verify");

    if (error.response?.status === 401) {
      localStorage.removeItem("prescriptocr_token");
      if (!isAuthCheck && !isPublicRoute) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
