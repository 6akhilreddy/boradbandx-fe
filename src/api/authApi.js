import { URLS } from "../config/urls";
import axiosInstance from "./axiosInstance";

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
