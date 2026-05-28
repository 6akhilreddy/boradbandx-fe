import axiosInstance from "./axiosInstance";
import { URLS } from "../config/urls";

export const fetchSupervisors = async (params = {}) => {
  const response = await axiosInstance.get(URLS.SUPERVISORS, { params });
  return response.data;
};

export const fetchSupervisorById = async (id) => {
  const response = await axiosInstance.get(`${URLS.SUPERVISORS}/${id}`);
  return response.data;
};

export const createSupervisor = async (data) => {
  const response = await axiosInstance.post(URLS.SUPERVISORS, data);
  return response.data;
};

export const updateSupervisor = async (id, data) => {
  const response = await axiosInstance.put(`${URLS.SUPERVISORS}/${id}`, data);
  return response.data;
};

export const deleteSupervisor = async (id) => {
  const response = await axiosInstance.delete(`${URLS.SUPERVISORS}/${id}`);
  return response.data;
};
