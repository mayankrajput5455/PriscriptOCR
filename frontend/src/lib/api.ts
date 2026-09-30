import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Response interceptor - only redirect to login if a protected request fails 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    const isAuthCheck = url.includes("/auth/me") || url.includes("/auth/login");
    const isPublicRoute =
      window.location.pathname.startsWith("/login") ||
      window.location.pathname.startsWith("/signup") ||
      window.location.pathname.startsWith("/verify");

    if (error.response?.status === 401 && !isAuthCheck && !isPublicRoute) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
