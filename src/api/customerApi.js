import axiosInstance from "./axiosInstance";
import { URLS } from "../config/urls";
import useUserStore from "../store/userStore";

export const getCustomers = async (params = {}) => {
  try {
    // Get user's company ID for filtering
    const { getCompanyId, getRoleCode } = useUserStore.getState();
    const companyId = getCompanyId();
    const roleCode = getRoleCode();

    // Add company filter for non-super admin users
    if (roleCode !== "SUPER_ADMIN" && companyId) {
      params.companyId = companyId;
    }

    const response = await axiosInstance.get(URLS.CUSTOMERS, { params });
    return response.data;
  } catch (error) {
    console.error("Get customers failed:", error);
    throw error;
  }
};

export const getCustomerById = async (id) => {
  try {
    const response = await axiosInstance.get(`${URLS.CUSTOMERS}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get customer by id failed:", error);
    throw error;
  }
};

export const createCustomer = async (data) => {
  try {
    // Get user's company ID for automatic assignment
    const { getCompanyId, getRoleCode } = useUserStore.getState();
    const companyId = getCompanyId();
    const roleCode = getRoleCode();

    // Add company ID for non-super admin users
    if (roleCode !== "SUPER_ADMIN" && companyId) {
      data.customer = {
        ...data.customer,
        companyId: companyId,
      };
    }

    const response = await axiosInstance.post(URLS.CUSTOMERS, data);
    return response.data;
  } catch (error) {
    console.error("Create customer failed:", error);
    throw error;
  }
};

export const updateCustomer = async (id, data) => {
  try {
    const response = await axiosInstance.put(`${URLS.CUSTOMERS}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Update customer failed:", error);
    throw error;
  }
};

export const deleteCustomer = async (id) => {
  try {
    const response = await axiosInstance.delete(`${URLS.CUSTOMERS}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete customer failed:", error);
    throw error;
  }
};

export const addPendingCharge = async (customerId, pendingChargeData) => {
  try {
    const response = await axiosInstance.post(
      `${URLS.CUSTOMERS}/${customerId}/pending-charge`,
      pendingChargeData
    );
    return response.data;
  } catch (error) {
    console.error("Add pending charge failed:", error);
    throw error;
  }
};

export const getCustomerBalanceHistory = async (customerId) => {
  try {
    const response = await axiosInstance.get(
      `${URLS.CUSTOMERS}/${customerId}/balance-history`
    );
    return response.data;
  } catch (error) {
    console.error("Get customer balance history failed:", error);
    throw error;
  }
};
