import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import axiosInstance from "../api/axiosInstance";

const AddPendingCharge = ({ customerId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    chargeType: "ROUTER_INSTALLATION",
    description: "",
    amount: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const chargeTypes = [
    { value: "ROUTER_INSTALLATION", label: "Router Installation" },
    { value: "EQUIPMENT_CHARGE", label: "Equipment Charge" },
    { value: "LATE_FEE", label: "Late Fee" },
    { value: "ADJUSTMENT", label: "Adjustment" },
    { value: "OTHER", label: "Other" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.description.trim() || !formData.amount) {
      setError("Please fill in all required fields");
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.post(`/customers/${customerId}/pending-charge`, {
        chargeType: formData.chargeType,
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
      });

      if (response.data.success) {
        onSuccess(response.data.data);
        setFormData({
          chargeType: "ROUTER_INSTALLATION",
          description: "",
          amount: "",
        });
      }
    } catch (err) {
      console.error("Error adding pending charge:", err);
      setError(err.response?.data?.message || "Failed to add pending charge");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Add Pending Charge</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Charge Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Charge Type *
            </label>
            <select
              name="chargeType"
              value={formData.chargeType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {chargeTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              placeholder="Enter charge description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (₹) *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Add Charge
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPendingCharge;
