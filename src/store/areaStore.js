import { create } from "zustand";
import {
  getAreas,
  getAreaById,
  createArea,
  updateArea,
  deleteArea,
} from "../api/areaApi";

const useAreaStore = create((set, get) => ({
  areas: [],
  currentArea: null,
  loading: false,
  error: null,

  fetchAreas: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await getAreas(params);
      set({
        areas: response,
        loading: false,
      });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchAreaById: async (id) => {
    set({ loading: true, error: null });
    try {
      const area = await getAreaById(id);
      set({ currentArea: area, loading: false });
      return area;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  addArea: async (data) => {
    set({ loading: true, error: null });
    try {
      await createArea(data);
      // Refresh the areas list
      await get().fetchAreas();
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  editArea: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await updateArea(id, data);
      // Refresh the areas list
      await get().fetchAreas();
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  removeArea: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteArea(id);
      // Refresh the areas list
      await get().fetchAreas();
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentArea: () => set({ currentArea: null }),
}));

export default useAreaStore;
