import axiosInstance from "./axiosInstance";
import { URLS } from "../config/urls";

export const getCompanies = async () => {
  try {
    const response = await axiosInstance.get(URLS.COMPANIES);
    return response.data;
  } catch (error) {
    console.error("Get companies failed:", error);
    throw error;
  }
};

export const getCompanyById = async (id) => {
  try {
    const response = await axiosInstance.get(`${URLS.COMPANIES}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get company by id failed:", error);
    throw error;
  }
};

export const createCompany = async (data) => {
  try {
    const response = await axiosInstance.post(URLS.COMPANIES, data);
    return response.data;
  } catch (error) {
    console.error("Create company failed:", error);
    throw error;
  }
};

export const updateCompany = async (id, data) => {
  try {
    const response = await axiosInstance.put(`${URLS.COMPANIES}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Update company failed:", error);
    throw error;
  }
};

export const deleteCompany = async (id) => {
  try {
    const response = await axiosInstance.delete(`${URLS.COMPANIES}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete company failed:", error);
    throw error;
  }
};
