import { URLS } from "../config/urls";
import axiosInstance from "./axiosInstance";
import useUserStore from "../store/userStore";

export const login = async (phone, password) => {
  try {
    const response = await axiosInstance.post(URLS.LOGIN, {
      phone,
      password,
    });

    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem("user-store");
};

// Admin login as agent (impersonation)
export const loginAsAgent = async (agentId) => {
  try {
    // Get token manually to ensure it's available
    const { token } = useUserStore.getState();
    let authToken = token;

    if (!authToken) {
      try {
        const userStore = JSON.parse(
          localStorage.getItem("user-store") || "{}"
        );
        authToken = userStore?.state?.token;
      } catch (e) {
        console.error("Error reading token from localStorage:", e);
      }
    }

    if (!authToken) {
      throw new Error("No authentication token available");
    }

    // Manually add Authorization header to ensure it's set
    const response = await axiosInstance.post(
      `${URLS.AUTH}/login-as-agent/${agentId}`,
      {}, // empty body
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Login as agent failed:", error);
    throw error;
  }
};

// Exit impersonation
export const exitImpersonation = async () => {
  try {
    const response = await axiosInstance.post(
      `${URLS.AUTH}/exit-impersonation`
    );
    return response.data;
  } catch (error) {
    console.error("Exit impersonation failed:", error);
    throw error;
  }
};
