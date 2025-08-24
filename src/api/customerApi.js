import axiosInstance from "./axiosInstance";
import { URLS } from "../config/urls";

export const getCustomers = async (params) => {
  try {
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
