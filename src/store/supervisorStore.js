import { create } from "zustand";
import {
  fetchSupervisors,
  fetchSupervisorById,
  createSupervisor,
  updateSupervisor,
} from "../api/supervisorApi";

const useSupervisorStore = create((set, get) => ({
  supervisors: [],
  selectedSupervisor: null,
  loading: false,
  error: null,

  fetchSupervisors: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchSupervisors(params);
      set({ supervisors: data, loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.error || error.message,
        loading: false,
      });
    }
  },

  fetchSupervisorById: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchSupervisorById(id);
      set({ selectedSupervisor: data, loading: false });
      return data;
    } catch (error) {
      set({
        error: error.response?.data?.error || error.message,
        loading: false,
      });
      throw error;
    }
  },

  addSupervisor: async (data) => {
    const created = await createSupervisor(data);
    set({ supervisors: [created, ...get().supervisors] });
    return created;
  },

  editSupervisor: async (id, data) => {
    const updated = await updateSupervisor(id, data);
    set({
      supervisors: get().supervisors.map((s) =>
        s.id === id ? { ...s, ...updated } : s
      ),
    });
    return updated;
  },

  clearError: () => set({ error: null }),
}));

export default useSupervisorStore;
