import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import useCustomerStore from "../store/customerStore";
import Spinner from "../components/Spinner";
import { ArrowLeft, Save } from "lucide-react";

const CustomerEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentCustomer,
    loading,
    error,
    fetchCustomerById,
    editCustomer,
    clearError,
    clearCurrentCustomer,
  } = useCustomerStore();

  const [formData, setFormData] = useState({
    customer: {
      fullName: "",
      billingName: "",
      phone: "",
      phoneSecondary: "",
      email: "",
      address: "",
      areaId: "",
      customerCode: "",
      latitude: "",
      longitude: "",
      assignedAgentId: "",
      installationDate: "",
      securityDeposit: 0,
      gstNumber: "",
      advance: 0,
      remarks: "",
      isActive: true,
    },
    hardware: {
      deviceType: "",
      macAddress: "",
      ipAddress: "",
    },
    subscription: {
      planId: "",
      agreedMonthlyPrice: 0,
      billingType: "POSTPAID",
      billingCycle: "MONTHLY",
      billingCycleValue: 1,
      additionalCharge: 0,
      discount: 0,
      status: "ACTIVE",
    },
  });

  useEffect(() => {
    if (id) {
      fetchCustomerById(id);
    }
    return () => {
      clearCurrentCustomer();
    };
  }, [id]);

  useEffect(() => {
    if (currentCustomer) {
      setFormData({
        customer: {
          fullName: currentCustomer.fullName || "",
          billingName: currentCustomer.billingName || "",
          phone: currentCustomer.phone || "",
          phoneSecondary: currentCustomer.phoneSecondary || "",
          email: currentCustomer.email || "",
          address: currentCustomer.address || "",
          areaId: currentCustomer.areaId || "",
          customerCode: currentCustomer.customerCode || "",
          latitude: currentCustomer.latitude || "",
          longitude: currentCustomer.longitude || "",
          assignedAgentId: currentCustomer.assignedAgentId || "",
          installationDate: currentCustomer.installationDate || "",
          securityDeposit: currentCustomer.securityDeposit || 0,
          gstNumber: currentCustomer.gstNumber || "",
          advance: currentCustomer.advance || 0,
          remarks: currentCustomer.remarks || "",
          isActive: currentCustomer.isActive !== undefined ? currentCustomer.isActive : true,
        },
        hardware: {
          deviceType: currentCustomer.hardware?.deviceType || "",
          macAddress: currentCustomer.hardware?.macAddress || "",
          ipAddress: currentCustomer.hardware?.ipAddress || "",
        },
        subscription: {
          planId: currentCustomer.subscription?.planId || "",
          agreedMonthlyPrice: currentCustomer.subscription?.agreedMonthlyPrice || 0,
          billingType: currentCustomer.subscription?.billingType || "POSTPAID",
          billingCycle: currentCustomer.subscription?.billingCycle || "MONTHLY",
          billingCycleValue: currentCustomer.subscription?.billingCycleValue || 1,
          additionalCharge: currentCustomer.subscription?.additionalCharge || 0,
          discount: currentCustomer.subscription?.discount || 0,
          status: currentCustomer.subscription?.status || "ACTIVE",
        },
      });
    }
  }, [currentCustomer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await editCustomer(id, formData);
      navigate(`/customers/${id}`);
    } catch (error) {
      console.error("Failed to update customer:", error);
    }
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <Layout>
        <Spinner loadingTxt="Loading customer details..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/customers/${id}`)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Customer</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={formData.customer.fullName}
                onChange={(e) => handleInputChange("customer", "fullName", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Billing Name</label>
              <input
                type="text"
                value={formData.customer.billingName}
                onChange={(e) => handleInputChange("customer", "billingName", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input
                type="tel"
                value={formData.customer.phone}
                onChange={(e) => handleInputChange("customer", "phone", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Phone</label>
              <input
                type="tel"
                value={formData.customer.phoneSecondary}
                onChange={(e) => handleInputChange("customer", "phoneSecondary", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.customer.email}
                onChange={(e) => handleInputChange("customer", "email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Code *</label>
              <input
                type="text"
                value={formData.customer.customerCode}
                onChange={(e) => handleInputChange("customer", "customerCode", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
              <input
                type="text"
                value={formData.customer.gstNumber}
                onChange={(e) => handleInputChange("customer", "gstNumber", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Installation Date</label>
              <input
                type="date"
                value={formData.customer.installationDate}
                onChange={(e) => handleInputChange("customer", "installationDate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit</label>
              <input
                type="number"
                value={formData.customer.securityDeposit}
                onChange={(e) => handleInputChange("customer", "securityDeposit", parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Advance Payment</label>
              <input
                type="number"
                value={formData.customer.advance}
                onChange={(e) => handleInputChange("customer", "advance", parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.customer.isActive}
                onChange={(e) => handleInputChange("customer", "isActive", e.target.value === "true")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={true}>Active</option>
                <option value={false}>Inactive</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              value={formData.customer.address}
              onChange={(e) => handleInputChange("customer", "address", e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <textarea
              value={formData.customer.remarks}
              onChange={(e) => handleInputChange("customer", "remarks", e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Hardware Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Hardware Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Device Type</label>
              <input
                type="text"
                value={formData.hardware.deviceType}
                onChange={(e) => handleInputChange("hardware", "deviceType", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MAC Address</label>
              <input
                type="text"
                value={formData.hardware.macAddress}
                onChange={(e) => handleInputChange("hardware", "macAddress", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
              <input
                type="text"
                value={formData.hardware.ipAddress}
                onChange={(e) => handleInputChange("hardware", "ipAddress", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Subscription Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
              <select
                value={formData.subscription.planId}
                onChange={(e) => handleInputChange("subscription", "planId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Plan</option>
                <option value="1">Basic 50Mbps - ₹499</option>
                <option value="2">Standard 100Mbps - ₹799</option>
                <option value="3">Premium 300Mbps - ₹999</option>
                <option value="4">Pro 500Mbps - ₹1499</option>
                <option value="5">Gigabit 1Gbps - ₹2499</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Price</label>
              <input
                type="number"
                value={formData.subscription.agreedMonthlyPrice}
                onChange={(e) => handleInputChange("subscription", "agreedMonthlyPrice", parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Billing Type</label>
              <select
                value={formData.subscription.billingType}
                onChange={(e) => handleInputChange("subscription", "billingType", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="POSTPAID">Postpaid</option>
                <option value="PREPAID">Prepaid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.subscription.status}
                onChange={(e) => handleInputChange("subscription", "status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(`/customers/${id}`)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </form>
    </Layout>
  );
};

export default CustomerEdit;
