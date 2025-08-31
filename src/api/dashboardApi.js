import axiosInstance from "./axiosInstance";
import { URLS } from "../config/urls";
import useUserStore from "../store/userStore";

export const getDashboardStats = async (params = {}) => {
  try {
    const { getCompanyId } = useUserStore.getState();
    const companyId = getCompanyId();

    if (companyId) {
      params.companyId = companyId;
    }

    const response = await axiosInstance.get(`${URLS.DASHBOARD}/stats`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Get dashboard stats failed:", error);
    throw error;
  }
};

export const getAreaWiseCollection = async (params = {}) => {
  try {
    const { getCompanyId } = useUserStore.getState();
    const companyId = getCompanyId();

    if (companyId) {
      params.companyId = companyId;
    }

    const response = await axiosInstance.get(
      `${URLS.DASHBOARD}/area-collection`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("Get area-wise collection failed:", error);
    throw error;
  }
};

export const getAgentWiseCollection = async (params = {}) => {
  try {
    const { getCompanyId } = useUserStore.getState();
    const companyId = getCompanyId();

    if (companyId) {
      params.companyId = companyId;
    }

    const response = await axiosInstance.get(
      `${URLS.DASHBOARD}/agent-collection`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("Get agent-wise collection failed:", error);
    throw error;
  }
};
