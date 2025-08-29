import axiosInstance from "./axiosInstance";
import { URLS } from "../config/urls";
import useUserStore from "../store/userStore";

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

export const getAdminById = async (id) => {
  try {
    const response = await axiosInstance.get(`${URLS.ADMINS}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get admin by id failed:", error);
    throw error;
  }
};

export const createAdmin = async (data) => {
  try {
    // Get user's company ID for automatic assignment if not super admin
    const { getCompanyId, getRoleCode } = useUserStore.getState();
    const companyId = getCompanyId();
    const roleCode = getRoleCode();

    // Add company ID for non-super admin users
    if (roleCode !== "SUPER_ADMIN" && companyId) {
      data.companyId = companyId;
    }

    const response = await axiosInstance.post(URLS.ADMINS, data);
    return response.data;
  } catch (error) {
    console.error("Create admin failed:", error);
    throw error;
  }
};

export const updateAdmin = async (id, data) => {
  try {
    const response = await axiosInstance.put(`${URLS.ADMINS}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Update admin failed:", error);
    throw error;
  }
};

export const deleteAdmin = async (id) => {
  try {
    const response = await axiosInstance.delete(`${URLS.ADMINS}/${id}`);
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
