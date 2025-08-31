import axiosInstance from "./axiosInstance";

export const transactionApi = {
  // Get customer transaction history
  getCustomerTransactions: async (customerId) => {
    const response = await axiosInstance.get(
      `/transactions/customer/${customerId}`
    );
    return response.data;
  },

  // Create a new transaction
  createTransaction: async (transactionData) => {
    const response = await axiosInstance.post("/transactions", transactionData);
    return response.data;
  },

  // Get transaction statistics for a customer
  getCustomerTransactionStats: async (customerId) => {
    const response = await axiosInstance.get(
      `/transactions/customer/${customerId}/stats`
    );
    return response.data;
  },
};

export default transactionApi;
