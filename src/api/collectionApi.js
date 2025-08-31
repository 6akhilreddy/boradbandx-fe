import axiosInstance from "./axiosInstance";

const COLLECTION_API = {
  // Get collection data with filters
  getCollectionData: (params) => {
    return axiosInstance.get("/collection/data", { params });
  },

  // Get collection summary statistics
  getCollectionSummary: (params) => {
    return axiosInstance.get("/collection/summary", { params });
  },

  // Get areas for filter dropdown
  getAreas: () => {
    return axiosInstance.get("/collection/areas");
  },
};

export default COLLECTION_API;
