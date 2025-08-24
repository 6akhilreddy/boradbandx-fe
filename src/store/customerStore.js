import { useState } from "react";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../api/customerApi";

export const useCustomerStore = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCustomers = async (params) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCustomers(params);
      setCustomers(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (data) => {
    setLoading(true);
    setError(null);
    try {
      await createCustomer(data);
      await fetchCustomers();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const editCustomer = async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      await updateCustomer(id, data);
      await fetchCustomers();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const removeCustomer = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deleteCustomer(id);
      await fetchCustomers();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    addCustomer,
    editCustomer,
    removeCustomer,
  };
};
