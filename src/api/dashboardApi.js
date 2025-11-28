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
