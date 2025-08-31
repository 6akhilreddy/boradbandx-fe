import axiosInstance from "./axiosInstance";
import { URLS } from "../config/urls";
import useUserStore from "../store/userStore";

export const getAgents = async (params = {}) => {
  try {
    const response = await axiosInstance.get(URLS.AGENTS, { params });
    return response.data;
  } catch (error) {
    console.error("Get agents failed:", error);
    throw error;
  }
};

export const getAgentById = async (id) => {
  try {
    const response = await axiosInstance.get(`${URLS.AGENTS}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get agent by id failed:", error);
    throw error;
  }
};

export const createAgent = async (data) => {
  try {
    const response = await axiosInstance.post(URLS.AGENTS, data);
    return response.data;
  } catch (error) {
    console.error("Create agent failed:", error);
    throw error;
  }
};

export const updateAgent = async (id, data) => {
  try {
    const response = await axiosInstance.put(`${URLS.AGENTS}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Update agent failed:", error);
    throw error;
  }
};

export const deleteAgent = async (id) => {
  try {
    const response = await axiosInstance.delete(`${URLS.AGENTS}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete agent failed:", error);
    throw error;
  }
};

export const getAgentPaymentHistory = async (id, params = {}) => {
  try {
    const response = await axiosInstance.get(`${URLS.AGENTS}/${id}/payments`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Get agent payment history failed:", error);
    throw error;
  }
};
