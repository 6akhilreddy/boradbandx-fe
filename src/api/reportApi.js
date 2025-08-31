import axiosInstance from "./axiosInstance";
import { URLS } from "../config/urls";
import useUserStore from "../store/userStore";

export const getInvoiceHistory = async (params = {}) => {
  try {
    console.log("getInvoiceHistory called with params:", params);
    const { getCompanyId, isAuthenticated } = useUserStore.getState();
    const companyId = getCompanyId();
    const authenticated = isAuthenticated();

    console.log("Auth state:", { companyId, authenticated });

    if (companyId) {
      params.companyId = companyId;
    }

    console.log("Making API call to:", `${URLS.REPORTS}/invoices`);
    const response = await axiosInstance.get(`${URLS.REPORTS}/invoices`, {
      params,
    });
    console.log("API response received:", response);
    return response.data;
  } catch (error) {
    console.error("Get invoice history failed:", error);
    throw error;
  }
};

export const getPaymentHistory = async (params = {}) => {
  try {
    const { getCompanyId } = useUserStore.getState();
    const companyId = getCompanyId();

    if (companyId) {
      params.companyId = companyId;
    }

    const response = await axiosInstance.get(`${URLS.REPORTS}/payments`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Get payment history failed:", error);
    throw error;
  }
};

export const getUserHistory = async (customerId, params = {}) => {
  try {
    const { getCompanyId } = useUserStore.getState();
    const companyId = getCompanyId();

    if (companyId) {
      params.companyId = companyId;
    }

    const response = await axiosInstance.get(
      `${URLS.REPORTS}/user/${customerId}`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("Get user history failed:", error);
    throw error;
  }
};

export const getAreas = async () => {
  try {
    const response = await axiosInstance.get(`${URLS.REPORTS}/areas`);
    return response.data;
  } catch (error) {
    console.error("Get areas failed:", error);
    throw error;
  }
};
