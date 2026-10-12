import axiosInstance from "./axiosInstance";
import { URLS } from "../config/urls";

export const getInventory = async (params = {}) => {
  try {
    const response = await axiosInstance.get(URLS.INVENTORY, { params });
    return response.data;
  } catch (error) {
    console.error("Get inventory failed:", error);
    throw error;
  }
};

export const getAvailableInventory = async (params = {}) => {
  try {
    const response = await axiosInstance.get(`${URLS.INVENTORY}/available`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Get available inventory failed:", error);
    throw error;
  }
};

export const getInventoryById = async (id) => {
  try {
    const response = await axiosInstance.get(`${URLS.INVENTORY}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get inventory by id failed:", error);
    throw error;
  }
};

export const createHardware = async (data) => {
  try {
    const response = await axiosInstance.post(URLS.INVENTORY, data);
    return response.data;
  } catch (error) {
    console.error("Create hardware failed:", error);
    throw error;
  }
};

export const updateHardware = async (id, data) => {
  try {
    const response = await axiosInstance.put(`${URLS.INVENTORY}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Update hardware failed:", error);
    throw error;
  }
};

export const deleteHardware = async (id) => {
  try {
    const response = await axiosInstance.delete(`${URLS.INVENTORY}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete hardware failed:", error);
    throw error;
  }
};

export const replaceHardware = async (id, data) => {
  try {
    const response = await axiosInstance.post(
      `${URLS.INVENTORY}/${id}/replace`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Replace hardware failed:", error);
    throw error;
  }
};
