import { jwtDecode } from "jwt-decode";
import useUserStore from "../store/userStore";

export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    console.error("Invalid token:", error);
    return true;
  }
};

export const validateAndHandleToken = () => {
  const { token, clearUser } = useUserStore.getState();

  if (!token) {
    return false;
  }

  if (isTokenExpired(token)) {
    // Clear user data from store
    clearUser();

    // Clear localStorage
    localStorage.removeItem("user-store");

    // Only redirect if not already on login page
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    return false;
  }

  return true;
};

export const getTokenExpirationTime = (token) => {
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000; // Convert to milliseconds
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};
