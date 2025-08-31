import axiosInstance from "./axiosInstance";
import { URLS } from "../config/urls";
import useUserStore from "../store/userStore";

export const searchCustomers = async (params = {}) => {
  try {
    const { getCompanyId } = useUserStore.getState();
    const companyId = getCompanyId();

    if (companyId) {
      params.companyId = companyId;
    }

    const response = await axiosInstance.get(
      `${URLS.PAYMENTS}/search-customers`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("Search customers failed:", error);
    throw error;
  }
};

export const getCustomerPaymentDetails = async (customerId) => {
  try {
    const response = await axiosInstance.get(
      `${URLS.PAYMENTS}/customer/${customerId}`
    );
    return response.data;
  } catch (error) {
    console.error("Get customer payment details failed:", error);
    throw error;
  }
};

export const recordPayment = async (data) => {
  try {
    const response = await axiosInstance.post(`${URLS.PAYMENTS}/record`, data);
    return response.data;
  } catch (error) {
    console.error("Record payment failed:", error);
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

    const response = await axiosInstance.get(`${URLS.PAYMENTS}/history`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Get payment history failed:", error);
    throw error;
  }
};
