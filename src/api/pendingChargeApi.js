import axiosInstance from "./axiosInstance";

export const pendingChargeApi = {
  // Get pending charges for a customer
  getCustomerPendingCharges: async (customerId) => {
    const response = await axiosInstance.get(
      `/pending-charges/customer/${customerId}`
    );
    return response.data;
  },

  // Create a new pending charge
  createPendingCharge: async (pendingChargeData) => {
    const response = await axiosInstance.post(
      "/pending-charges",
      pendingChargeData
    );
    return response.data;
  },

  // Update a pending charge
  updatePendingCharge: async (id, pendingChargeData) => {
    const response = await axiosInstance.put(
      `/pending-charges/${id}`,
      pendingChargeData
    );
    return response.data;
  },

  // Delete a pending charge
  deletePendingCharge: async (id) => {
    const response = await axiosInstance.delete(`/pending-charges/${id}`);
    return response.data;
  },

  // Get pending charges summary for a customer
  getCustomerPendingChargesSummary: async (customerId) => {
    const response = await axiosInstance.get(
      `/pending-charges/customer/${customerId}/summary`
    );
    return response.data;
  },
};

export default pendingChargeApi;
