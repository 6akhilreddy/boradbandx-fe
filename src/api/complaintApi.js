import axiosInstance from "./axiosInstance";
import { URLS } from "../config/urls";

export const getComplaints = async (params = {}) => {
  try {
    const response = await axiosInstance.get(URLS.COMPLAINTS, { params });
    return response.data;
  } catch (error) {
    console.error("Get complaints failed:", error);
    throw error;
  }
};

export const getComplaintById = async (id) => {
  try {
    const response = await axiosInstance.get(`${URLS.COMPLAINTS}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get complaint by id failed:", error);
    throw error;
  }
};

export const createComplaint = async (data) => {
  try {
    const response = await axiosInstance.post(URLS.COMPLAINTS, data);
    return response.data;
  } catch (error) {
    console.error("Create complaint failed:", error);
    throw error;
  }
};

export const updateComplaint = async (id, data) => {
  try {
    const response = await axiosInstance.put(`${URLS.COMPLAINTS}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Update complaint failed:", error);
    throw error;
  }
};

export const deleteComplaint = async (id) => {
  try {
    const response = await axiosInstance.delete(`${URLS.COMPLAINTS}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete complaint failed:", error);
    throw error;
  }
};

export const searchCustomers = async (search) => {
  try {
    const response = await axiosInstance.get(
      `${URLS.COMPLAINTS}/search-customers`,
      {
        params: { search },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Search customers failed:", error);
    throw error;
  }
};

export const getComplaintComments = async (complaintId) => {
  try {
    const response = await axiosInstance.get(
      `${URLS.COMPLAINTS}/${complaintId}/comments`
    );
    return response.data;
  } catch (error) {
    console.error("Get complaint comments failed:", error);
    throw error;
  }
};

export const addComplaintComment = async (complaintId, comment) => {
  try {
    const response = await axiosInstance.post(
      `${URLS.COMPLAINTS}/${complaintId}/comments`,
      {
        comment,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Add complaint comment failed:", error);
    throw error;
  }
};

export const deleteComplaintComment = async (complaintId, commentId) => {
  try {
    const response = await axiosInstance.delete(
      `${URLS.COMPLAINTS}/${complaintId}/comments/${commentId}`
    );
    return response.data;
  } catch (error) {
    console.error("Delete complaint comment failed:", error);
    throw error;
  }
};
