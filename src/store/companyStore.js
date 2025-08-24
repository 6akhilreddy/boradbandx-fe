import { create } from "zustand";
// import { persist, createJSONStorage } from "zustand/middleware";
import {
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from "../api/companyApi";

const useCompanyStore = create((set, get) => ({
  companies: [],
  loading: false,
  error: "",
  fetchCompanies: async () => {
    set({ loading: true, error: "" });
    try {
      const companies = await getCompanies();
      set({ companies, loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to load companies",
        loading: false,
      });
    }
  },
  createCompany: async (data) => {
    set({ loading: true, error: "" });
    try {
      await createCompany(data);
      await get().fetchCompanies();
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to create company",
        loading: false,
      });
    }
  },
  updateCompany: async (id, data) => {
    set({ loading: true, error: "" });
    try {
      await updateCompany(id, data);
      await get().fetchCompanies();
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to update company",
        loading: false,
      });
    }
  },
  deleteCompany: async (id) => {
    set({ loading: true, error: "" });
    try {
      await deleteCompany(id);
      await get().fetchCompanies();
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to delete company",
        loading: false,
      });
    }
  },
}));

export default useCompanyStore;
