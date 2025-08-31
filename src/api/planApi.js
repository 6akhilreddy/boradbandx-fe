import axiosInstance from "./axiosInstance";
import { URLS } from "../config/urls";
import useUserStore from "../store/userStore";

export const getPlans = async (params = {}) => {
  try {
    // Get user's company ID for filtering
    const { getCompanyId, getRoleCode } = useUserStore.getState();
    const companyId = getCompanyId();
    const roleCode = getRoleCode();

    // Add company filter for non-super admin users
    if (roleCode !== "SUPER_ADMIN" && companyId) {
      params.companyId = companyId;
    }

    const response = await axiosInstance.get(URLS.PLANS, { params });
    return response.data;
  } catch (error) {
    console.error("Get plans failed:", error);
    throw error;
  }
};

export const getPlanById = async (id) => {
  try {
    const response = await axiosInstance.get(`${URLS.PLANS}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get plan by id failed:", error);
    throw error;
  }
};

export const createPlan = async (data) => {
  try {
    const response = await axiosInstance.post(URLS.PLANS, data);
    return response.data;
  } catch (error) {
    console.error("Create plan failed:", error);
    throw error;
  }
};

export const updatePlan = async (id, data) => {
  try {
    const response = await axiosInstance.put(`${URLS.PLANS}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Update plan failed:", error);
    throw error;
  }
};

export const deletePlan = async (id) => {
  try {
    const response = await axiosInstance.delete(`${URLS.PLANS}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete plan failed:", error);
    throw error;
  }
};
