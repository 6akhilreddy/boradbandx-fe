import { URLS } from "../config/urls";
import axiosInstance from "./axiosInstance";

export const getAdminsByCompany = async (companyId) => {
  try {
    const response = await axiosInstance.get(
      `${URLS.ADMINS_COMPANY}/${companyId}`
    );
    return response.data;
  } catch (error) {
    console.error("Get admins by company failed:", error);
    throw error;
  }
};

export const createAdmin = async (companyId, data) => {
  try {
    const response = await axiosInstance.post(URLS.ADMINS, {
      ...data,
      companyId,
    });
    return response.data;
  } catch (error) {
    console.error("Create admin failed:", error);
    throw error;
  }
};

export const updateAdmin = async (adminId, data) => {
  try {
    const response = await axiosInstance.put(`${URLS.ADMINS}/${adminId}`, data);
    return response.data;
  } catch (error) {
    console.error("Update admin failed:", error);
    throw error;
  }
};

export const deleteAdmin = async (adminId) => {
  try {
    const response = await axiosInstance.delete(`${URLS.ADMINS}/${adminId}`);
    return response.data;
  } catch (error) {
    console.error("Delete admin failed:", error);
    throw error;
  }
};

export const resetAdminPassword = async (adminId, password) => {
  try {
    const response = await axiosInstance.put(`${URLS.ADMINS}/${adminId}`, {
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Reset admin password failed:", error);
    throw error;
  }
};
