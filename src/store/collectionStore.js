import { create } from "zustand";
import COLLECTION_API from "../api/collectionApi";

const useCollectionStore = create((set, get) => ({
  // State
  collectionData: [],
  summary: null,
  areas: [],
  loading: false,
  error: null,
  filters: {
    startDate: null,
    endDate: null,
    areaId: null,
    paymentMethod: null,
  },

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Set filters
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  // Reset filters
  resetFilters: () =>
    set({
      filters: {
        startDate: null,
        endDate: null,
        areaId: null,
        paymentMethod: null,
      },
    }),

  // Fetch collection data
  fetchCollectionData: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await COLLECTION_API.getCollectionData(params);
      set({ collectionData: response.data.data });
    } catch (error) {
      set({
        error:
          error.response?.data?.message || "Failed to fetch collection data",
      });
    } finally {
      set({ loading: false });
    }
  },

  // Fetch collection summary
  fetchCollectionSummary: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await COLLECTION_API.getCollectionSummary(params);
      set({ summary: response.data.data });
    } catch (error) {
      set({
        error:
          error.response?.data?.message || "Failed to fetch collection summary",
      });
    } finally {
      set({ loading: false });
    }
  },

  // Fetch areas
  fetchAreas: async () => {
    try {
      set({ loading: true, error: null });
      const response = await COLLECTION_API.getAreas();
      set({ areas: response.data.data });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch areas",
      });
    } finally {
      set({ loading: false });
    }
  },

  // Fetch all collection data with current filters
  fetchAllCollectionData: async () => {
    const { filters } = get();
    const params = {};

    if (filters.startDate && filters.endDate) {
      params.startDate = filters.startDate;
      params.endDate = filters.endDate;
    }
    if (filters.areaId) {
      params.areaId = filters.areaId;
    }
    if (filters.paymentMethod) {
      params.paymentMethod = filters.paymentMethod;
    }

    await Promise.all([
      get().fetchCollectionData(params),
      get().fetchCollectionSummary(params),
    ]);
  },
}));

export default useCollectionStore;
