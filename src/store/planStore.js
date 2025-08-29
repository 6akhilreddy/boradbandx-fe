import { create } from "zustand";
import {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
} from "../api/planApi";

const usePlanStore = create((set, get) => ({
  plans: [],
  currentPlan: null,
  loading: false,
  error: null,

  fetchPlans: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await getPlans(params);
      set({
        plans: response,
        loading: false,
      });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchPlanById: async (id) => {
    set({ loading: true, error: null });
    try {
      const plan = await getPlanById(id);
      set({ currentPlan: plan, loading: false });
      return plan;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  addPlan: async (data) => {
    set({ loading: true, error: null });
    try {
      await createPlan(data);
      // Refresh the plans list
      await get().fetchPlans();
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  editPlan: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await updatePlan(id, data);
      // Refresh the plans list
      await get().fetchPlans();
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  removePlan: async (id) => {
    set({ loading: true, error: null });
    try {
      await deletePlan(id);
      // Refresh the plans list
      await get().fetchPlans();
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentPlan: () => set({ currentPlan: null }),
}));

export default usePlanStore;

