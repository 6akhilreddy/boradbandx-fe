import { create } from "zustand";
// import { persist, createJSONStorage } from "zustand/middleware";
import {
  getAdminsByCompany,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  resetAdminPassword,
} from "../api/adminApi";

const useAdminStore = create((set, get) => ({
  admins: {}, // { [companyId]: { loading, data, error } }
  fetchAdmins: async (companyId) => {
    set((state) => ({
      admins: {
        ...state.admins,
        [companyId]: { loading: true, data: [], error: "" },
      },
    }));
    try {
      const data = await getAdminsByCompany(companyId);
      set((state) => ({
        admins: {
          ...state.admins,
          [companyId]: { loading: false, data, error: "" },
        },
      }));
    } catch (error) {
      set((state) => ({
        admins: {
          ...state.admins,
          [companyId]: {
            loading: false,
            data: [],
            error: error.response?.data?.message || "Failed to load admins",
          },
        },
      }));
    }
  },
  createAdmin: async (companyId, data) => {
    await createAdmin(companyId, data);
    await get().fetchAdmins(companyId);
  },
  updateAdmin: async (adminId, companyId, data) => {
    await updateAdmin(adminId, data);
    await get().fetchAdmins(companyId);
  },
  deleteAdmin: async (adminId, companyId) => {
    await deleteAdmin(adminId);
    await get().fetchAdmins(companyId);
  },
  resetAdminPassword: async (adminId, password, companyId) => {
    await resetAdminPassword(adminId, password);
    await get().fetchAdmins(companyId);
  },
}));

export default useAdminStore;
