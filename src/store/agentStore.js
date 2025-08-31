import { create } from "zustand";
import {
  getAgents,
  getAgentById,
  createAgent,
  updateAgent,
  deleteAgent,
  getAgentPaymentHistory,
} from "../api/agentApi";

const useAgentStore = create((set, get) => ({
  agents: [],
  currentAgent: null,
  loading: false,
  error: null,

  fetchAgents: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await getAgents(params);
      set({
        agents: response,
        loading: false,
      });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchAgentById: async (id) => {
    set({ loading: true, error: null });
    try {
      const agent = await getAgentById(id);
      set({ currentAgent: agent, loading: false });
      return agent;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  addAgent: async (data) => {
    set({ loading: true, error: null });
    try {
      await createAgent(data);
      // Refresh the agents list
      await get().fetchAgents();
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  editAgent: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await updateAgent(id, data);
      // Refresh the agents list
      await get().fetchAgents();
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  removeAgent: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteAgent(id);
      // Refresh the agents list
      await get().fetchAgents();
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentAgent: () => set({ currentAgent: null }),

  fetchAgentPaymentHistory: async (id, params = {}) => {
    set({ loading: true, error: null });
    try {
      const payments = await getAgentPaymentHistory(id, params);
      set({ loading: false });
      return payments;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));

export default useAgentStore;
