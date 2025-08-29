import { create } from "zustand";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../api/customerApi";

const useCustomerStore = create((set, get) => ({
  customers: [],
  currentCustomer: null,
  loading: false,
  error: null,
  pagination: {
    totalItems: 0,
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  },

  fetchCustomers: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await getCustomers(params);
      set({
        customers: response.data,
        pagination: response.pagination,
        loading: false,
      });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchCustomerById: async (id) => {
    set({ loading: true, error: null });
    try {
      const customer = await getCustomerById(id);
      set({ currentCustomer: customer, loading: false });
      return customer;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  addCustomer: async (data) => {
    set({ loading: true, error: null });
    try {
      await createCustomer(data);
      // Refresh the current page
      const { pagination } = get();
      await get().fetchCustomers({
        page: pagination.currentPage,
        limit: pagination.pageSize,
      });
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  editCustomer: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await updateCustomer(id, data);
      // Refresh the current page
      const { pagination } = get();
      await get().fetchCustomers({
        page: pagination.currentPage,
        limit: pagination.pageSize,
      });
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  removeCustomer: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteCustomer(id);
      // Refresh the current page
      const { pagination } = get();
      await get().fetchCustomers({
        page: pagination.currentPage,
        limit: pagination.pageSize,
      });
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentCustomer: () => set({ currentCustomer: null }),
}));

export default useCustomerStore;
