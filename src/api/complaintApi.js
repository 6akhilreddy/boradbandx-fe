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

export const searchCustomers = async (query) => {
  try {
    const response = await axiosInstance.get(
      `${URLS.COMPLAINTS}/search-customers`,
      {
        params: { search: query },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Search customers failed:", error);
    throw error;
  }
};

export const getComplaintComments = async (id) => {
  try {
    const response = await axiosInstance.get(
      `${URLS.COMPLAINTS}/${id}/comments`
    );
    return response.data;
  } catch (error) {
    console.error("Get complaint comments failed:", error);
    throw error;
  }
};

export const addComplaintComment = async (id, comment) => {
  try {
    const payload =
      typeof comment === "string" ? { comment } : comment;
    const response = await axiosInstance.post(
      `${URLS.COMPLAINTS}/${id}/comments`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Add complaint comment failed:", error);
    throw error;
  }
};

export const deleteComplaintComment = async (id, commentId) => {
  try {
    const response = await axiosInstance.delete(
      `${URLS.COMPLAINTS}/${id}/comments/${commentId}`
    );
    return response.data;
  } catch (error) {
    console.error("Delete complaint comment failed:", error);
    throw error;
  }
};
