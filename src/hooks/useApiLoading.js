import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance"; // Adjust path as needed

const useApiLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeRequests, setActiveRequests] = useState(0);

  useEffect(() => {
    // Add request interceptor
    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        setActiveRequests((prev) => prev + 1);
        return config;
      },
      (error) => {
        setActiveRequests((prev) => Math.max(0, prev - 1));
        return Promise.reject(error);
      }
    );

    // Add response interceptor
    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => {
        setActiveRequests((prev) => Math.max(0, prev - 1));
        return response;
      },
      (error) => {
        setActiveRequests((prev) => Math.max(0, prev - 1));
        return Promise.reject(error);
      }
    );

    // Cleanup interceptors on unmount
    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Sync isLoading with activeRequests
  useEffect(() => {
    setIsLoading(activeRequests > 0);
  }, [activeRequests]);

  return isLoading;
};

export default useApiLoading;
