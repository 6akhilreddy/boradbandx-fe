import axiosInstance from "./axiosInstance";
import { URLS } from "../config/urls";
import useUserStore from "../store/userStore";

export const getAreas = async (params = {}) => {
  try {
    // Get user's company ID for filtering
    const { getCompanyId, getRoleCode } = useUserStore.getState();
    const companyId = getCompanyId();
    const roleCode = getRoleCode();

    // Add company filter for non-super admin users
    if (roleCode !== "SUPER_ADMIN" && companyId) {
      params.companyId = companyId;
    }

    const response = await axiosInstance.get(URLS.AREAS, { params });
    return response.data;
  } catch (error) {
    console.error("Get areas failed:", error);
    throw error;
  }
};

export const getAreaById = async (id) => {
  try {
    const { getCompanyId, getRoleCode } = useUserStore.getState();
    const companyId = getCompanyId();
    const roleCode = getRoleCode();

    const params = {};
    if (roleCode !== "SUPER_ADMIN" && companyId) {
      params.companyId = companyId;
    }

    const response = await axiosInstance.get(`${URLS.AREAS}/${id}`, { params });
    return response.data;
  } catch (error) {
    console.error("Get area by ID failed:", error);
    throw error;
  }
};

export const createArea = async (data) => {
  try {
    // Get user's company ID for automatic assignment
    const { getCompanyId, getRoleCode } = useUserStore.getState();
    const companyId = getCompanyId();
    const roleCode = getRoleCode();

    // Add company ID for non-super admin users
    if (roleCode !== "SUPER_ADMIN" && companyId) {
      data.companyId = companyId;
    }

    const response = await axiosInstance.post(URLS.AREAS, data);
    return response.data;
  } catch (error) {
    console.error("Create area failed:", error);
    throw error;
  }
};

export const updateArea = async (id, data) => {
  try {
    // Get user's company ID for automatic assignment
    const { getCompanyId, getRoleCode } = useUserStore.getState();
    const companyId = getCompanyId();
    const roleCode = getRoleCode();

    // Add company ID for non-super admin users
    if (roleCode !== "SUPER_ADMIN" && companyId) {
      data.companyId = companyId;
    }

    const response = await axiosInstance.put(`${URLS.AREAS}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Update area failed:", error);
    throw error;
  }
};

export const deleteArea = async (id) => {
  try {
    const { getCompanyId, getRoleCode } = useUserStore.getState();
    const companyId = getCompanyId();
    const roleCode = getRoleCode();

    const params = {};
    if (roleCode !== "SUPER_ADMIN" && companyId) {
      params.companyId = companyId;
    }

    const response = await axiosInstance.delete(`${URLS.AREAS}/${id}`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Delete area failed:", error);
    throw error;
  }
};
