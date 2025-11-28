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
    // Skip token validation and header for login endpoint (unauthenticated)
    // But NOT for login-as-agent
    if (
      config.url?.includes("/auth/login") &&
      !config.url?.includes("login-as-agent")
    ) {
      return config;
    }

    // Get token from Zustand store - try store first, then localStorage
    const { token: storeToken } = useUserStore.getState();
    const token =
      storeToken ||
      (() => {
        try {
          const userStore = JSON.parse(
            localStorage.getItem("user-store") || "{}"
          );
          return userStore?.state?.token;
        } catch {
          return null;
        }
      })();

    // For authenticated endpoints (including login-as-agent), we need a token
    const urlString = config.url || "";
    const isLoginAsAgent = urlString.includes("login-as-agent");
    const isExitImpersonation = urlString.includes("exit-impersonation");

    if (isLoginAsAgent || isExitImpersonation) {
      if (!token) {
        return Promise.reject(new Error("No authentication token available"));
      }
      // Add token to the request
      if (!config.headers) {
        config.headers = {};
      }
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    }

    // For all other requests, validate token
    if (!validateAndHandleToken()) {
      // Token is invalid/expired, request will be cancelled
      return Promise.reject(new Error("Token expired"));
    }

    // Add token to all authenticated requests
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
      // Don't redirect if this is an auth endpoint (login-as-agent, exit-impersonation)
      // These endpoints handle their own errors
      const isAuthEndpoint = error.config?.url?.includes("/auth/");

      if (!isAuthEndpoint) {
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
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
