import axios from "axios";
import { BASE_URL } from "../config/urls";
import useUserStore from "../store/userStore";
import { validateAndHandleToken } from "../utils/tokenUtils";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Skip token validation for authentication-related requests
    if (config.url?.includes("/auth/")) {
      // For auth requests (login, logout, etc.), just proceed without token validation
      return config;
    }

    // Validate token before making request
    if (!validateAndHandleToken()) {
      // Token is invalid/expired, request will be cancelled
      return Promise.reject(new Error("Token expired"));
    }

    // Get token from Zustand store instead of localStorage
    const userStore = JSON.parse(localStorage.getItem("user-store") || "{}");
    const token = userStore?.state?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (invalid/expired token)
    if (error.response?.status === 401) {
      // Clear user data from store
      const { clearUser } = useUserStore.getState();
      clearUser();

      // Clear localStorage
      localStorage.removeItem("user-store");

      // Only redirect if not already on login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
