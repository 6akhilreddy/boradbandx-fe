import axiosInstance from "./axiosInstance";
import { URLS } from "../config/urls";
import useUserStore from "../store/userStore";

export const getAgents = async (params = {}) => {
  try {
    // Get user's company ID for filtering
    const { getCompanyId, getRoleCode } = useUserStore.getState();
    const companyId = getCompanyId();
    const roleCode = getRoleCode();

    // Add company filter for non-super admin users
    if (roleCode !== "SUPER_ADMIN" && companyId) {
      params.companyId = companyId;
    }

    const response = await axiosInstance.get(URLS.AGENTS, { params });
    return response.data;
  } catch (error) {
    console.error("Get agents failed:", error);
    throw error;
  }
};

export const getAgentById = async (id) => {
  try {
    const response = await axiosInstance.get(`${URLS.AGENTS}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get agent by id failed:", error);
    throw error;
  }
};

export const createAgent = async (data) => {
  try {
    // Get user's company ID for automatic assignment
    const { getCompanyId, getRoleCode } = useUserStore.getState();
    const companyId = getCompanyId();
    const roleCode = getRoleCode();

    // Add company ID for non-super admin users
    if (roleCode !== "SUPER_ADMIN" && companyId) {
      data.companyId = companyId;
    }

    const response = await axiosInstance.post(URLS.AGENTS, data);
    return response.data;
  } catch (error) {
    console.error("Create agent failed:", error);
    throw error;
  }
};

export const updateAgent = async (id, data) => {
  try {
    const response = await axiosInstance.put(`${URLS.AGENTS}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Update agent failed:", error);
    throw error;
  }
};

export const deleteAgent = async (id) => {
  try {
    const response = await axiosInstance.delete(`${URLS.AGENTS}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete agent failed:", error);
    throw error;
  }
};
