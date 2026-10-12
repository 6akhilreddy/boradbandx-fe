import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Boxes,
  Plus,
  Search,
  ArrowRightLeft,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  Router,
  Monitor,
  RefreshCw,
  Server,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Spinner from "../components/Spinner";
import Toast from "../components/Toast";
import useUserStore from "../store/userStore";
import {
  getInventory,
  getAvailableInventory,
  createHardware,
  updateHardware,
  deleteHardware,
  replaceHardware,
} from "../api/inventoryApi";

const CATEGORIES = [
  "Router",
  "Set Top_Box",
  "ONT",
  "OLT",
  "Switch",
  "Other",
];

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Status" },
  { value: "WITH_CUSTOMER", label: "With Customer" },
  { value: "AVAILABLE", label: "Available" },
  { value: "FAULTY", label: "Faulty" },
  { value: "UNDER_REPAIR", label: "Under Repair" },
  { value: "RETIRED", label: "Retired" },
];

const getStatusBadge = (status) => {
  switch (status) {
    case "AVAILABLE":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "WITH_CUSTOMER":
      return "bg-blue-50 text-blue-700 border border-blue-200";
    case "FAULTY":
      return "bg-rose-50 text-rose-700 border border-rose-200";
    case "UNDER_REPAIR":
      return "bg-amber-50 text-amber-700 border border-amber-200";
    case "RETIRED":
      return "bg-purple-50 text-purple-700 border border-purple-200";
    default:
      return "bg-gray-100 text-gray-700 border border-gray-200";
  }
};

const formatStatusText = (status) => {
  switch (status) {
    case "WITH_CUSTOMER":
      return "With Customer";
    case "AVAILABLE":
      return "Available";
    case "FAULTY":
      return "Faulty";
    case "UNDER_REPAIR":
      return "Under Repair";
    case "RETIRED":
      return "Retired";
    default:
      return status;
  }
};

const Inventory = () => {
  const navigate = useNavigate();
  const { hasPermission, isAdmin, isSuperAdmin } = useUserStore();

  const canAdd = hasPermission("inventory.add") || isAdmin() || isSuperAdmin();
  const canEdit = hasPermission("inventory.edit") || isAdmin() || isSuperAdmin();
  const canDelete = hasPermission("inventory.delete") || isAdmin() || isSuperAdmin();

  // State
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    available: 0,
    withCustomers: 0,
    faulty: 0,
    underRepair: 0,
    retired: 0,
  });
  const [stockByCategory, setStockByCategory] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailedAdd, setIsDetailedAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    category: "Router",
    deviceName: "",
    macAddress: "",
    ipAddress: "",
    serialNumber: "",
    membershipNumber: "",
    purchaseCost: "",
    notes: "",
    status: "AVAILABLE",
  });
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // Replace Modal state
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [selectedForReplace, setSelectedForReplace] = useState(null);
  const [availableStock, setAvailableStock] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [replaceSearch, setReplaceSearch] = useState("");
  const [chosenReplacementId, setChosenReplacementId] = useState(null);
  const [markFaulty, setMarkFaulty] = useState(false);
  const [replaceNotes, setReplaceNotes] = useState("");
  const [submittingReplace, setSubmittingReplace] = useState(false);

  // Edit Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState(null);
  const [editForm, setEditForm] = useState({
    category: "Router",
    deviceName: "",
    macAddress: "",
    ipAddress: "",
    serialNumber: "",
    membershipNumber: "",
    purchaseCost: "",
    notes: "",
    status: "AVAILABLE",
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState(null);

  // Fetch Inventory List
  const fetchInventoryData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        search: searchTerm,
        status: selectedStatus,
        category: selectedCategory,
      };

      const res = await getInventory(params);
      if (res.success && res.data) {
        setItems(res.data.items || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
        if (res.data.stats) setStats(res.data.stats);
        if (res.data.stockByCategory) setStockByCategory(res.data.stockByCategory);
      }
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
      setToast({
        type: "error",
        message: error.response?.data?.message || "Failed to load inventory data",
      });
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, selectedStatus, selectedCategory]);

  useEffect(() => {
    fetchInventoryData();
  }, [fetchInventoryData]);

  // Handle Add Hardware Form Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.macAddress.trim()) {
      setToast({ type: "error", message: "MAC address is required" });
      return;
    }

    try {
      setSubmittingAdd(true);
      const res = await createHardware(addForm);
      if (res.success) {
        setToast({ type: "success", message: "Hardware added successfully!" });
        setIsAddModalOpen(false);
        setAddForm({
          category: "Router",
          deviceName: "",
          macAddress: "",
          ipAddress: "",
          serialNumber: "",
          membershipNumber: "",
          purchaseCost: "",
          notes: "",
          status: "AVAILABLE",
        });
        setIsDetailedAdd(false);
        fetchInventoryData();
      }
    } catch (error) {
      console.error("Add hardware error:", error);
      setToast({
        type: "error",
        message: error.response?.data?.message || "Failed to add hardware",
      });
    } finally {
      setSubmittingAdd(false);
    }
  };

  // Open Replace Modal
  const handleOpenReplace = async (item) => {
    setSelectedForReplace(item);
    setChosenReplacementId(null);
    setMarkFaulty(false);
    setReplaceNotes("");
    setReplaceSearch("");
    setIsReplaceModalOpen(true);
    setLoadingAvailable(true);

    try {
      const res = await getAvailableInventory({
        category: item.category || "Router",
      });
      if (res.success && res.data) {
        setAvailableStock(res.data);
      }
    } catch (error) {
      console.error("Failed to load available hardware:", error);
      setToast({ type: "error", message: "Failed to load replacement stock" });
    } finally {
      setLoadingAvailable(false);
    }
  };

  // Filter available stock in replace modal
  const filteredAvailableStock = useMemo(() => {
    if (!replaceSearch.trim()) return availableStock;
    const q = replaceSearch.toLowerCase();
    return availableStock.filter(
      (s) =>
        (s.macAddress && s.macAddress.toLowerCase().includes(q)) ||
        (s.ipAddress && s.ipAddress.toLowerCase().includes(q)) ||
        (s.serialNumber && s.serialNumber.toLowerCase().includes(q)) ||
        (s.deviceName && s.deviceName.toLowerCase().includes(q)) ||
        (s.membershipNumber && s.membershipNumber.toLowerCase().includes(q))
    );
  }, [availableStock, replaceSearch]);

  // Handle Replace Submit
  const handleReplaceSubmit = async (e) => {
    e.preventDefault();
    if (!chosenReplacementId) {
      setToast({ type: "error", message: "Please select a replacement device" });
      return;
    }

    try {
      setSubmittingReplace(true);
      const res = await replaceHardware(selectedForReplace.id, {
        replacementInventoryId: chosenReplacementId,
        markFaulty,
        notes: replaceNotes,
      });

      if (res.success) {
        setToast({
          type: "success",
          message: "Hardware replaced successfully!",
        });
        setIsReplaceModalOpen(false);
        setSelectedForReplace(null);
        fetchInventoryData();
      }
    } catch (error) {
      console.error("Replace error:", error);
      setToast({
        type: "error",
        message: error.response?.data?.message || "Failed to replace hardware",
      });
    } finally {
      setSubmittingReplace(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setSelectedForEdit(item);
    setEditForm({
      category: item.category || "Router",
      deviceName: item.deviceName || "",
      macAddress: item.macAddress || "",
      ipAddress: item.ipAddress || "",
      serialNumber: item.serialNumber || "",
      membershipNumber: item.membershipNumber || "",
      purchaseCost: item.purchaseCost || "",
      notes: item.notes || "",
      status: item.status || "AVAILABLE",
    });
    setIsEditModalOpen(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.macAddress.trim()) {
      setToast({ type: "error", message: "MAC address is required" });
      return;
    }

    try {
      setSubmittingEdit(true);
      const res = await updateHardware(selectedForEdit.id, editForm);
      if (res.success) {
        setToast({ type: "success", message: "Hardware updated successfully!" });
        setIsEditModalOpen(false);
        setSelectedForEdit(null);
        fetchInventoryData();
      }
    } catch (error) {
      console.error("Update error:", error);
      setToast({
        type: "error",
        message: error.response?.data?.message || "Failed to update hardware",
      });
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Handle Delete
  const handleDelete = async (item) => {
    if (
      !window.confirm(
        `Are you sure you want to remove device ${item.macAddress} from inventory?`
      )
    ) {
      return;
    }

    try {
      const res = await deleteHardware(item.id);
      if (res.success) {
        setToast({ type: "success", message: "Hardware removed from inventory" });
        fetchInventoryData();
      }
    } catch (error) {
      console.error("Delete error:", error);
      setToast({
        type: "error",
        message: error.response?.data?.message || "Failed to delete hardware",
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Hardware Inventory
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage router, ONT, and network hardware assets and subscriber assignments
              </p>
            </div>

            {canAdd && (
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm shadow-sm transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Hardware
              </button>
            )}
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* AVAILABLE */}
            <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 border-l-4 border-l-emerald-500">
              <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                AVAILABLE
              </span>
              <div className="text-2xl font-bold text-emerald-600 mt-2">
                {stats.available}
              </div>
            </div>

            {/* WITH CUSTOMERS */}
            <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 border-l-4 border-l-blue-500">
              <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                WITH CUSTOMERS
              </span>
              <div className="text-2xl font-bold text-blue-600 mt-2">
                {stats.withCustomers}
              </div>
            </div>

            {/* FAULTY */}
            <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 border-l-4 border-l-rose-500">
              <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                FAULTY
              </span>
              <div className="text-2xl font-bold text-rose-600 mt-2">
                {stats.faulty}
              </div>
            </div>

            {/* UNDER REPAIR */}
            <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 border-l-4 border-l-amber-500">
              <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                UNDER REPAIR
              </span>
              <div className="text-2xl font-bold text-amber-500 mt-2">
                {stats.underRepair}
              </div>
            </div>

            {/* RETIRED */}
            <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 border-l-4 border-l-purple-500">
              <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                RETIRED
              </span>
              <div className="text-2xl font-bold text-purple-600 mt-2">
                {stats.retired}
              </div>
            </div>
          </div>

          {/* Stock by Category Section */}
          <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Stock by Category
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <th className="pb-3 pr-4">Category</th>
                    <th className="pb-3 px-4 text-center">Available</th>
                    <th className="pb-3 px-4 text-center">Issued</th>
                    <th className="pb-3 pl-4 text-center">Faulty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stockByCategory.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-4 text-center text-gray-400">
                        No category stock data available
                      </td>
                    </tr>
                  ) : (
                    stockByCategory.map((cat, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/60 transition">
                        <td className="py-3 pr-4 font-medium text-gray-800">
                          {cat.category}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-600">
                          {cat.available}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-blue-600">
                          {cat.issued}
                        </td>
                        <td className="py-3 pl-4 text-center font-bold text-rose-600">
                          {cat.faulty}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Hardware List Section */}
          <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-bold text-gray-900">
                Hardware List
              </h2>

              {/* Search & Filter Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[200px] flex-1 sm:flex-none">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search STB, MAC, mer"
                    className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  <option value="ALL">All Types</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Hardware Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="py-16 text-center">
                  <Spinner loadingTxt="Loading hardware inventory..." size="large" />
                </div>
              ) : items.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <Boxes className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-base font-medium">No hardware items found</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Try adjusting search parameters or add new inventory
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-500 bg-gray-50/50">
                      <th className="py-3 px-4">Hardware</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Card / Membership</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((hw) => {
                      return (
                        <tr
                          key={hw.id}
                          className="hover:bg-blue-50/30 transition group"
                        >
                          {/* Hardware column: IP + Ref + Brand/Model */}
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <div className="font-semibold text-rose-600">
                                {hw.ipAddress || "No IP"}{" "}
                                {hw.serialNumber && (
                                  <span className="text-gray-500 font-normal text-xs ml-1">
                                    Ref {hw.serialNumber}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {hw.deviceName || hw.category || "Router"}
                              </div>
                            </div>
                          </td>

                          {/* Category column */}
                          <td className="py-3 px-4 font-medium text-gray-700">
                            {hw.category || "Router"}
                          </td>

                          {/* Card / Membership: MAC in pink + IP/Mem */}
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className="font-mono font-medium text-rose-600 text-xs">
                                {hw.macAddress}
                              </span>
                              <span className="text-xs text-gray-500 mt-0.5 font-mono">
                                {hw.membershipNumber || hw.ipAddress || "-"}
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                                hw.status
                              )}`}
                            >
                              {formatStatusText(hw.status)}
                            </span>
                          </td>

                          {/* Customer */}
                          <td className="py-3 px-4">
                            {hw.Customer ? (
                              <Link
                                to={`/customers/${hw.Customer.id}`}
                                className="text-blue-600 hover:text-blue-800 font-medium hover:underline text-xs"
                              >
                                #{hw.Customer.customerCode || hw.Customer.id}{" "}
                                {hw.Customer.fullName}
                              </Link>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Replace button (available when WITH_CUSTOMER) */}
                              {canEdit && hw.status === "WITH_CUSTOMER" && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenReplace(hw)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-xs font-medium shadow-xs transition cursor-pointer"
                                  title="Replace device"
                                >
                                  <ArrowRightLeft className="w-3.5 h-3.5" />
                                  Replace
                                </button>
                              )}

                              {/* Edit Button */}
                              {canEdit && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(hw)}
                                  className="p-1 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition"
                                  title="Edit hardware details"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Delete Button */}
                              {canDelete && hw.status !== "WITH_CUSTOMER" && (
                                <button
                                  type="button"
                                  onClick={() => handleDelete(hw)}
                                  className="p-1 text-gray-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition"
                                  title="Remove from inventory"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-sm text-gray-500">
                <span>
                  Showing {(page - 1) * limit + 1} to{" "}
                  {Math.min(page * limit, total)} of {total} hardware items
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="text-gray-700 font-medium">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= ADD HARDWARE MODAL ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Add Hardware</h3>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDetailedAdd}
                    onChange={(e) => setIsDetailedAdd(e.target.checked)}
                    className="rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  Detailed
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={addForm.category}
                  onChange={(e) =>
                    setAddForm({ ...addForm, category: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Device Name
                </label>
                <input
                  type="text"
                  value={addForm.deviceName}
                  onChange={(e) =>
                    setAddForm({ ...addForm, deviceName: e.target.value })
                  }
                  placeholder="e.g. TP-Link WR841N"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  MAC Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addForm.macAddress}
                  onChange={(e) =>
                    setAddForm({ ...addForm, macAddress: e.target.value })
                  }
                  placeholder="MAC address"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                />
              </div>

              {/* Detailed Fields */}
              {isDetailedAdd && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        IP Address
                      </label>
                      <input
                        type="text"
                        value={addForm.ipAddress}
                        onChange={(e) =>
                          setAddForm({ ...addForm, ipAddress: e.target.value })
                        }
                        placeholder="192.168.1.1"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Reference / Serial
                      </label>
                      <input
                        type="text"
                        value={addForm.serialNumber}
                        onChange={(e) =>
                          setAddForm({
                            ...addForm,
                            serialNumber: e.target.value,
                          })
                        }
                        placeholder="RTR-400"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Membership / Card No
                      </label>
                      <input
                        type="text"
                        value={addForm.membershipNumber}
                        onChange={(e) =>
                          setAddForm({
                            ...addForm,
                            membershipNumber: e.target.value,
                          })
                        }
                        placeholder="410326"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={addForm.status}
                        onChange={(e) =>
                          setAddForm({ ...addForm, status: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                      >
                        <option value="AVAILABLE">Available</option>
                        <option value="UNDER_REPAIR">Under Repair</option>
                        <option value="FAULTY">Faulty</option>
                        <option value="RETIRED">Retired</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      rows={2}
                      value={addForm.notes}
                      onChange={(e) =>
                        setAddForm({ ...addForm, notes: e.target.value })
                      }
                      placeholder="Optional notes or supplier details..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdd}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {submittingAdd ? "Adding..." : "Add Hardware"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= REPLACE HARDWARE MODAL ================= */}
      {isReplaceModalOpen && selectedForReplace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Replace Hardware
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Select an available {selectedForReplace.category || "Router"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsReplaceModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReplaceSubmit} className="p-6 space-y-4">
              {/* Search Available Hardware */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Search Available Hardware
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={replaceSearch}
                    onChange={(e) => setReplaceSearch(e.target.value)}
                    placeholder="Search STB, MAC, label, or reference"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* List of Available Hardware Options */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {loadingAvailable ? (
                  <div className="py-6 text-center text-sm text-gray-500">
                    <Spinner loadingTxt="Finding available stock..." size="small" />
                  </div>
                ) : filteredAvailableStock.length === 0 ? (
                  <div className="py-6 text-center text-sm text-gray-500 border border-dashed border-gray-200 rounded-lg">
                    No available {selectedForReplace.category} stock found.
                  </div>
                ) : (
                  filteredAvailableStock.map((stock) => {
                    const isSelected = chosenReplacementId === stock.id;
                    return (
                      <label
                        key={stock.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border text-sm cursor-pointer transition ${
                          isSelected
                            ? "border-blue-500 bg-blue-50/40 ring-1 ring-blue-500"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <input
                          type="radio"
                          name="replacementDevice"
                          checked={isSelected}
                          onChange={() => setChosenReplacementId(stock.id)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1 font-mono text-xs">
                          <span className="font-semibold text-rose-600">
                            {stock.macAddress}
                          </span>
                          {stock.serialNumber && (
                            <span className="text-gray-600 ml-1.5 font-sans">
                              Ref {stock.serialNumber}
                            </span>
                          )}
                          {stock.ipAddress && (
                            <span className="text-gray-500 ml-1.5 font-sans">
                              | {stock.ipAddress}
                            </span>
                          )}
                          {stock.deviceName && (
                            <div className="text-[11px] text-gray-400 font-sans mt-0.5">
                              {stock.deviceName}
                            </div>
                          )}
                        </div>
                      </label>
                    );
                  })
                )}
              </div>

              <div className="text-xs text-gray-500 font-medium">
                {filteredAvailableStock.length} available items
              </div>

              {/* Checkbox: Mark the replaced device as faulty */}
              <div className="pt-2">
                <label className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={markFaulty}
                    onChange={(e) => setMarkFaulty(e.target.checked)}
                    className="rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  Mark the replaced device as faulty
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Replacement Notes
                </label>
                <input
                  type="text"
                  value={replaceNotes}
                  onChange={(e) => setReplaceNotes(e.target.value)}
                  placeholder="Reason for replacement (e.g. port damage, slow speed)..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsReplaceModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReplace || !chosenReplacementId}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-medium rounded-lg shadow-xs transition disabled:opacity-40 cursor-pointer"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  {submittingReplace ? "Replacing..." : "Replace Hardware"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT HARDWARE MODAL ================= */}
      {isEditModalOpen && selectedForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Edit Hardware Details
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="WITH_CUSTOMER">With Customer</option>
                    <option value="FAULTY">Faulty</option>
                    <option value="UNDER_REPAIR">Under Repair</option>
                    <option value="RETIRED">Retired</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Device Name
                </label>
                <input
                  type="text"
                  value={editForm.deviceName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, deviceName: e.target.value })
                  }
                  placeholder="e.g. TP-Link WR841N"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  MAC Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.macAddress}
                  onChange={(e) =>
                    setEditForm({ ...editForm, macAddress: e.target.value })
                  }
                  placeholder="MAC address"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    IP Address
                  </label>
                  <input
                    type="text"
                    value={editForm.ipAddress}
                    onChange={(e) =>
                      setEditForm({ ...editForm, ipAddress: e.target.value })
                    }
                    placeholder="192.168.1.1"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Reference / Serial
                  </label>
                  <input
                    type="text"
                    value={editForm.serialNumber}
                    onChange={(e) =>
                      setEditForm({ ...editForm, serialNumber: e.target.value })
                    }
                    placeholder="RTR-400"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Membership Number
                </label>
                <input
                  type="text"
                  value={editForm.membershipNumber}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      membershipNumber: e.target.value,
                    })
                  }
                  placeholder="410326"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                  placeholder="Notes..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {submittingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Inventory;
