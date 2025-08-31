import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import usePlanStore from "../store/planStore";
import Spinner from "../components/Spinner";
import useApiLoading from "../hooks/useApiLoading";
import Alert from "../components/Alert";
import {
  Search,
  Plus,
  Edit,
  Filter,
  X,
} from "lucide-react";

const Plans = () => {
  const navigate = useNavigate();
  const {
    plans,
    loading,
    error,
    fetchPlans,
    addPlan,
    editPlan,
    clearError,
  } = usePlanStore();
  const apiLoading = useApiLoading();

  // filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: "",
    monthlyPrice: "",
    gstRate: 18,
    code: "",
    benefits: "",
    isActive: true,
  });
  const [editingPlan, setEditingPlan] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: "success", message: "" });
  const [buttonLoading, setButtonLoading] = useState(false);

  // Combined fetch with debouncing
  useEffect(() => {
    const t = setTimeout(() => {
      fetchPlans({
        ...(search && { search }),
        ...(statusFilter && { isActive: statusFilter === "true" }),
      });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  const handleAddPlan = async (e) => {
    e.preventDefault();
    setButtonLoading(true);
    try {
      // Convert monthlyPrice to number for submission
      const planData = {
        ...newPlan,
        monthlyPrice: parseFloat(newPlan.monthlyPrice) || 0
      };
      await addPlan(planData);
      setShowAddModal(false);
      setNewPlan({
        name: "",
        monthlyPrice: "",
        gstRate: 18,
        code: "",
        benefits: "",
        isActive: true,
      });
      setAlert({ show: true, type: "success", message: "Plan added successfully!" });
    } catch (error) {
      console.error('Error adding plan:', error);
      setAlert({ show: true, type: "error", message: "Failed to add plan. Please try again." });
    } finally {
      setButtonLoading(false);
    }
  };

  const handleEditPlan = async (e) => {
    e.preventDefault();
    setButtonLoading(true);
    try {
      // Convert monthlyPrice to number for submission
      const planData = {
        ...editingPlan,
        monthlyPrice: parseFloat(editingPlan.monthlyPrice) || 0
      };
      await editPlan(editingPlan.id, planData);
      setShowEditModal(false);
      setEditingPlan(null);
      setAlert({ show: true, type: "success", message: "Plan updated successfully!" });
    } catch (error) {
      console.error('Error updating plan:', error);
      setAlert({ show: true, type: "error", message: "Failed to update plan. Please try again." });
    } finally {
      setButtonLoading(false);
    }
  };

  const openEditModal = (plan) => {
    setEditingPlan({
      id: plan.id,
      name: plan.name,
      monthlyPrice: plan.monthlyPrice || "",
      gstRate: plan.gstRate,
      code: plan.code,
      benefits: plan.benefits,
      isActive: plan.isActive,
    });
    setShowEditModal(true);
  };

  const getStatusBadge = (isActive) => {
    if (isActive) return { text: "Active", class: "bg-emerald-100 text-emerald-700" };
    return { text: "Inactive", class: "bg-red-100 text-red-700" };
  };

  return (
    <Layout>
      {/* Header (stack on mobile) */}
      <div className="mt-2 mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <h2 className="text-2xl font-bold sm:truncate">Plans</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto justify-center text-white px-4 py-2 rounded-lg shadow-md
                     bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500
                     hover:from-purple-600 hover:to-cyan-600
                     transition-transform hover:scale-[1.02] text-sm sm:text-base cursor-pointer"
        >
          <span className="inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Plan
          </span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl shadow mb-4">
        {/* Desktop Layout */}
        <div className="hidden lg:flex flex-row gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search plans..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-lg bg-gray-100 border border-transparent
                         focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-48 px-4 py-2 rounded-lg bg-gray-100 border border-transparent
                       focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          {/* Clear */}
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("");
            }}
            className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm"
          >
            Clear Filters
          </button>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Search Bar with Filter Icon */}
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search plans..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-lg bg-gray-100 border border-transparent
                           focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            
            {/* Filter Icon Button */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <Filter className="w-4 h-4" />
            </button>

            {/* Clear Button with X Icon */}
            {(search || statusFilter) && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("");
                }}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile Filters Dropdown */}
          {showMobileFilters && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200
                             focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-700 hover:text-red-900">
            ×
          </button>
        </div>
      )}

      {/* Alert Messages */}
      {alert.show && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ show: false, type: "success", message: "" })}
        />
      )}

      {/* Data */}
      {(loading || apiLoading) ? (
        <Spinner loadingTxt="Loading plans..." size="large" />
      ) : (
        <>
          {/* Desktop Table Layout */}
          <div className="hidden lg:block">
            {/* Desktop Header Row */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-3">
              <div className="overflow-x-auto max-w-full">
                <div className="grid grid-cols-7 gap-4 px-6 py-4 bg-gray-50 w-full">
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">CODE</div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">NAME</div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">PRICE</div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">GST RATE</div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">BENEFITS</div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">STATUS</div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">ACTION</div>
                </div>
              </div>
            </div>

            {/* Desktop Data Rows */}
            <div className="space-y-3 w-full">
              {plans.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
                  No plans found
                </div>
              ) : (
                plans.map((plan) => {
                  const badge = getStatusBadge(plan.isActive);
                  return (
                    <div
                      key={plan.id}
                      className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="grid grid-cols-7 gap-4 items-center w-full">
                        {/* CODE */}
                        <div className="col-span-1 flex items-center min-w-0">
                          <div className="font-medium text-gray-900 truncate">{plan.code || "N/A"}</div>
                        </div>

                        {/* NAME */}
                        <div className="col-span-1 flex items-center min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">{plan.name}</div>
                        </div>

                        {/* PRICE */}
                        <div className="col-span-1 flex items-center min-w-0">
                          <div className="font-medium text-gray-900 truncate">₹{plan.monthlyPrice || 0}</div>
                        </div>

                        {/* GST RATE */}
                        <div className="col-span-1 flex items-center min-w-0">
                          <div className="text-sm text-gray-700 truncate min-w-0 w-full">{plan.gstRate || 0}%</div>
                        </div>

                        {/* BENEFITS */}
                        <div className="col-span-1 flex items-start min-w-0">
                          <div className="text-sm text-gray-700 break-words min-w-0 w-full leading-relaxed">
                            {plan.benefits || "N/A"}
                          </div>
                        </div>

                        {/* STATUS */}
                        <div className="col-span-1 flex items-center min-w-0">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${badge.class} truncate`}>
                            {badge.text}
                          </span>
                        </div>

                        {/* ACTION */}
                        <div className="col-span-1 flex items-center justify-center">
                          <button
                            className="inline-flex items-center justify-center w-10 h-10 rounded-md transition-all cursor-pointer
                                       hover:shadow-sm text-gray-600 hover:text-green-600 bg-gray-50 hover:bg-green-50
                                       group relative border border-gray-200"
                            title="Edit Plan"
                            onClick={() => openEditModal(plan)}
                          >
                            <Edit className="w-5 h-5" />
                            <span className="hidden md:block absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                              Edit Plan
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden">
            {plans.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
                No plans found
              </div>
            ) : (
              <div className="space-y-3">
                {plans.map((plan) => {
                  const badge = getStatusBadge(plan.isActive);
                  return (
                    <div
                      key={plan.id}
                      className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow duration-200"
                    >
                      {/* Top Section - Code and Status */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          {plan.code || "N/A"}
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badge.class}`}>
                          {badge.text}
                        </span>
                      </div>

                      {/* Two Column Layout for Data */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* Left Column */}
                        <div className="space-y-3">
                          {/* Plan Name */}
                          <div>
                            <div className="text-sm font-semibold text-gray-900 mb-1">{plan.name}</div>
                          </div>

                          {/* Price */}
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Price</div>
                            <div className="text-lg font-bold text-gray-900">₹{plan.monthlyPrice || 0}</div>
                          </div>

                          {/* GST Rate */}
                          <div>
                            <div className="text-xs text-gray-500 mb-1">GST Rate</div>
                            <div className="text-sm text-gray-900">{plan.gstRate || 0}%</div>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-3">
                          {/* Benefits */}
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Benefits</div>
                            <div className="text-sm text-gray-900 break-words">
                              {plan.benefits || "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-center gap-2 pt-3 border-t border-gray-100">
                        <button
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors text-xs font-medium"
                          onClick={() => openEditModal(plan)}
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Plan Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add New Plan</h3>
            </div>
            <form onSubmit={handleAddPlan} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plan Name</label>
                  <input
                    type="text"
                    required
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plan Code</label>
                  <input
                    type="text"
                    value={newPlan.code}
                    onChange={(e) => setNewPlan({ ...newPlan, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPlan.monthlyPrice}
                    onChange={(e) => setNewPlan({ ...newPlan, monthlyPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GST Rate (%)</label>
                  <input
                    type="number"
                    value={newPlan.gstRate}
                    onChange={(e) => setNewPlan({ ...newPlan, gstRate: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Benefits</label>
                  <textarea
                    rows="3"
                    value={newPlan.benefits}
                    onChange={(e) => setNewPlan({ ...newPlan, benefits: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={newPlan.isActive}
                    onChange={(e) => setNewPlan({ ...newPlan, isActive: e.target.value === "true" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                {buttonLoading ? (
                  <div className="px-4 py-2 flex items-center justify-center">
                    <Spinner loadingTxt="Adding..." size="small" />
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-white shadow-md bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 transition-transform hover:scale-[1.02] cursor-pointer"
                  >
                    Add Plan
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {showEditModal && editingPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Edit Plan</h3>
            </div>
            <form onSubmit={handleEditPlan} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plan Name</label>
                  <input
                    type="text"
                    required
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plan Code</label>
                  <input
                    type="text"
                    value={editingPlan.code}
                    onChange={(e) => setEditingPlan({ ...editingPlan, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingPlan.monthlyPrice}
                    onChange={(e) => setEditingPlan({ ...editingPlan, monthlyPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GST Rate (%)</label>
                  <input
                    type="number"
                    value={editingPlan.gstRate}
                    onChange={(e) => setEditingPlan({ ...editingPlan, gstRate: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Benefits</label>
                  <textarea
                    rows="3"
                    value={editingPlan.benefits}
                    onChange={(e) => setEditingPlan({ ...editingPlan, benefits: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={editingPlan.isActive}
                    onChange={(e) => setEditingPlan({ ...editingPlan, isActive: e.target.value === "true" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPlan(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                {buttonLoading ? (
                  <div className="px-4 py-2 flex items-center justify-center">
                    <Spinner loadingTxt="Updating..." size="small" />
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-white shadow-md bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 transition-transform hover:scale-[1.02] cursor-pointer"
                  >
                    Update Plan
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Plans;
