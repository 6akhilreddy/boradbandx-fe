import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import useApiLoading from "../hooks/useApiLoading";
import useCustomerStore from "../store/customerStore";
import Spinner from "../components/Spinner";
import Alert from "../components/Alert";
import pendingChargeApi from "../api/pendingChargeApi";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
  Wallet,
  Filter,
  X,
  Receipt,
  FileText,
} from "lucide-react";

const Customers = () => {
  const navigate = useNavigate();
  const {
    customers,
    loading,
    error,
    pagination,
    fetchCustomers,
    addCustomer,
    clearError,
  } = useCustomerStore();
  const apiLoading = useApiLoading();

  // filters (date removed)
  const [search, setSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");

  // pagination
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(1);

  // modal
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showAddBillModal, setShowAddBillModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [billForm, setBillForm] = useState({
    amount: '',
    description: '',
    chargeType: 'OTHER'
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [alert, setAlert] = useState({ show: false, type: "success", message: "" });
  const [buttonLoading, setButtonLoading] = useState(false);

  // Combined fetch with debouncing
  useEffect(() => {
    const t = setTimeout(() => {
      fetchCustomers({
        page: pageIndex,
        limit: pageSize,
        ...(search && { search }),
        ...(areaFilter && { areaId: areaFilter }),
        ...(paymentStatusFilter && { paymentStatus: paymentStatusFilter }),
      });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, areaFilter, paymentStatusFilter, pageSize, pageIndex, refreshTrigger]);

  const handlePageChange = useCallback((next) => {
    if (!pagination) return;
    if (next < 1 || next > pagination.totalPages) return;
    setPageIndex(next);
  }, [pagination]);

  const handlePageSizeChange = useCallback((size) => {
    const n = Number(size) || 10;
    setPageSize(n);
    setPageIndex(1);
  }, []);



  const getBalanceStatus = (balance) => {
    if (balance === 0) return { text: "Paid", class: "bg-emerald-100 text-emerald-700" };
    if (balance > 0) return { text: "Unpaid", class: "bg-red-100 text-red-700" };
    return { text: "Credit", class: "bg-blue-100 text-blue-700" };
  };

  const handleAddBill = (customer) => {
    setSelectedCustomer(customer);
    setBillForm({
      amount: '',
      description: '',
      chargeType: 'OTHER'
    });
    setShowAddBillModal(true);
  };

  const handleBillSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomer || !billForm.amount || !billForm.description) {
      return;
    }

    setButtonLoading(true);
    try {
      await pendingChargeApi.createPendingCharge({
        customerId: selectedCustomer.id,
        chargeType: billForm.chargeType,
        description: billForm.description,
        amount: parseFloat(billForm.amount)
      });

      setShowAddBillModal(false);
      setSelectedCustomer(null);
      setBillForm({
        amount: '',
        description: '',
        chargeType: 'OTHER'
      });

      // Show success message
      setAlert({ show: true, type: "success", message: "Bill added successfully!" });

      // Refresh customers list
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error adding bill item:', error);
      setAlert({ show: true, type: "error", message: "Failed to add bill. Please try again." });
    } finally {
      setButtonLoading(false);
    }
  };

  const handleViewHistory = (customer) => {
    // Navigate to reports page with user selected
    navigate(`/reports?tab=user&customerId=${customer.id}&customerName=${encodeURIComponent(customer.fullName)}&customerCode=${encodeURIComponent(customer.customerCode || '')}&customerPhone=${encodeURIComponent(customer.phone || '')}&customerArea=${encodeURIComponent(customer.areaName || '')}`);
  };

  return (
    <Layout>
      {/* Header (stack on mobile) */}
      <div className="mt-2 mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <h2 className="text-2xl font-bold sm:truncate">Customers</h2>
        <button
          onClick={() => navigate("/customers/add")}
          className="w-full sm:w-auto justify-center text-white px-4 py-2 rounded-lg shadow-md
                     bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500
                     hover:from-purple-600 hover:to-cyan-600
                     transition-transform hover:scale-[1.02] text-sm sm:text-base cursor-pointer"
        >
          <span className="inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Customer
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
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-full bg-gray-100 border border-transparent
                         focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {/* Area */}
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="w-48 px-4 py-2 rounded-lg bg-gray-100 border border-transparent
                       focus:outline-none focus:ring-2 focus:ring-emerald-400 pr-8"
          >
            <option value="">All Areas</option>
            <option value="1">North Zone</option>
            <option value="2">South Zone</option>
            <option value="3">East Zone</option>
            <option value="4">West Zone</option>
            <option value="5">Central Zone</option>
          </select>

          {/* Payment Status */}
          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="w-48 px-4 py-2 rounded-lg bg-gray-100 border border-transparent
                       focus:outline-none focus:ring-2 focus:ring-emerald-400 pr-8"
          >
            <option value="">All Payments</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>

          {/* Clear */}
          <button
            onClick={() => {
              setSearch("");
              setAreaFilter("");
              setPaymentStatusFilter("");
              handlePageSizeChange(10);
            }}
            className="px-3 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm"
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
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-full bg-gray-100 border border-transparent
                           focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            
            {/* Filter Icon Button */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <Filter className="w-4 h-4" />
            </button>

            {/* Clear Button with X Icon */}
            {(search || areaFilter || paymentStatusFilter) && (
              <button
                onClick={() => {
                  setSearch("");
                  setAreaFilter("");
                  setPaymentStatusFilter("");
                  handlePageSizeChange(10);
                }}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile Filters Dropdown */}
          {showMobileFilters && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3">
              {/* Area Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                <select
                  value={areaFilter}
                  onChange={(e) => setAreaFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200
                             focus:outline-none focus:ring-2 focus:ring-emerald-400 pr-8"
                >
                  <option value="">All Areas</option>
                  <option value="1">North Zone</option>
                  <option value="2">South Zone</option>
                  <option value="3">East Zone</option>
                  <option value="4">West Zone</option>
                  <option value="5">Central Zone</option>
                </select>
              </div>

              {/* Payment Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200
                             focus:outline-none focus:ring-2 focus:ring-emerald-400 pr-8"
                >
                  <option value="">All Payments</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alert Messages */}
      {alert.show && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ show: false, type: "success", message: "" })}
        />
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-700 hover:text-red-900">
            ×
          </button>
        </div>
      )}

      {/* Data */}
      {(loading || apiLoading) ? (
        <Spinner loadingTxt="Loading customers..." size="large" />
      ) : (
        <>
          {/* Desktop Table Layout */}
          <div className="hidden lg:block">
            {/* Desktop Header Row */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-3">
              <div className="overflow-x-auto max-w-full">
                <div className="grid grid-cols-8 gap-4 px-6 py-4 bg-gray-50 w-full min-w-[1200px]">
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">S.CODE</div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">CUSTOMER</div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">BALANCE</div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">AREA</div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">PLAN</div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">DUE DATE</div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">STATUS</div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider w-24 text-right">ACTION</div>
                </div>
              </div>
            </div>

            {/* Desktop Data Rows */}
            <div className="space-y-3 w-full">
              {customers.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
                  No customers found
                </div>
              ) : (
                customers.map((c) => {
                  const badge = getBalanceStatus(c.balance);
                  const price = c.agreedMonthlyPrice ?? c.monthlyPrice;
                  return (
                    <div
                      key={c.id}
                      className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="grid grid-cols-8 gap-4 items-center w-full min-w-[1200px]">
                        {/* S.CODE */}
                        <div className="col-span-1 flex items-center min-w-0 w-24">
                          <div className="font-medium text-gray-900 truncate w-full">{c.customerCode}</div>
                        </div>

                        {/* CUSTOMER */}
                        <div className="col-span-1 flex items-center min-w-0">
                          <div className="min-w-0 w-full">
                            <div className="text-sm font-semibold text-gray-900 truncate">{c.fullName}</div>
                            <div className="text-xs text-gray-500 truncate">{c.phone}</div>
                          </div>
                        </div>

                        {/* BALANCE */}
                        <div className="col-span-1 flex items-center min-w-0 w-20">
                          <div className="font-medium text-gray-900 truncate w-full">₹{c.balance || 0}</div>
                        </div>

                        {/* AREA */}
                        <div className="col-span-1 flex items-center min-w-0 w-24">
                          <div className="text-sm text-gray-700 truncate w-full">{c.areaName || ""}</div>
                        </div>

                        {/* PLAN */}
                        <div className="col-span-1 flex items-center min-w-0 w-32">
                          <div className="text-sm min-w-0 w-full">
                            <div className="font-semibold text-gray-900 truncate">{c.planName || ""}</div>
                            {price ? <div className="text-gray-500 truncate">₹{price}/month</div> : null}
                          </div>
                        </div>

                        {/* DUE DATE */}
                        <div className="col-span-1 flex items-center min-w-0 w-24">
                          <div className="text-sm text-gray-700 truncate w-full">
                            {c.dueDate ? new Date(c.dueDate).toLocaleDateString() : ""}
                          </div>
                        </div>

                        {/* STATUS */}
                        <div className="col-span-1 flex items-center min-w-0 w-20">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${badge.class} truncate w-full text-center`}>
                            {badge.text}
                          </span>
                        </div>

                        {/* ACTION */}
                        <div className="col-span-1 flex items-center justify-center min-w-0 w-24">
                          <div className="flex gap-2">
                            <button
                              className="inline-flex items-center justify-center w-10 h-10 rounded-md transition-all cursor-pointer
                                         hover:shadow-sm text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50
                                         group relative border border-gray-200"
                              title="View Details"
                              onClick={() => navigate(`/customers/${c.id}`)}
                            >
                              <Eye className="w-5 h-5" />
                              <span className="hidden md:block absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                View Details
                              </span>
                            </button>
                            <button
                              className="inline-flex items-center justify-center w-10 h-10 rounded-md transition-all cursor-pointer
                                         hover:shadow-sm text-gray-600 hover:text-green-600 bg-gray-50 hover:bg-green-50
                                         group relative border border-gray-200"
                              title="Add to Bill"
                              onClick={() => handleAddBill(c)}
                            >
                              <Receipt className="w-5 h-5" />
                              <span className="hidden md:block absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                Add to Bill
                              </span>
                            </button>
                            <button
                              className="inline-flex items-center justify-center w-10 h-10 rounded-md transition-all cursor-pointer
                                         hover:shadow-sm text-gray-600 hover:text-purple-600 bg-gray-50 hover:bg-purple-50
                                         group relative border border-gray-200"
                              title="View History"
                              onClick={() => handleViewHistory(c)}
                            >
                              <FileText className="w-5 h-5" />
                              <span className="hidden md:block absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                View History
                              </span>
                            </button>
                            <button
                              className="inline-flex items-center justify-center w-10 h-10 rounded-md transition-all cursor-pointer
                                         hover:shadow-sm text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50
                                         group relative border border-gray-200"
                              title="Collection"
                              onClick={() => navigate(`/payments?customerId=${c.id}`)}
                            >
                              <Wallet className="w-5 h-5" />
                              <span className="hidden md:block absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                Collection
                              </span>
                            </button>
                          </div>
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
            {customers.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
                No customers found
              </div>
            ) : (
              <div className="space-y-4">
                {customers.map((c) => {
                  const badge = getBalanceStatus(c.balance);
                  const price = c.agreedMonthlyPrice ?? c.monthlyPrice;
                  return (
                    <div
                      key={c.id}
                      className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow duration-200"
                    >
                      {/* Top Section - Customer Code and Status */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          {c.customerCode}
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badge.class}`}>
                          {badge.text}
                        </span>
                      </div>

                                            {/* Two Column Layout for Data */}
                      <div className="grid grid-cols-2 gap-6 mb-4">
                        {/* Left Column */}
                        <div className="space-y-4">
                          {/* Customer Name and Phone */}
                          <div>
                            <div className="text-sm font-semibold text-gray-900 mb-1">{c.fullName}</div>
                            <div className="text-xs text-gray-500">{c.phone}</div>
                          </div>

                          {/* Balance */}
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Balance</div>
                            <div className="text-lg font-bold text-gray-900">₹{c.balance || 0}</div>
                          </div>

                          {/* Area */}
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Area</div>
                            <div className="text-sm text-gray-900">{c.areaName || ""}</div>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                          {/* Plan */}
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Plan</div>
                            <div className="text-sm font-medium text-gray-900">{c.planName || ""}</div>
                            {price && <div className="text-xs text-gray-500">₹{price}/month</div>}
                          </div>

                          {/* Due Date */}
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Due Date</div>
                            <div className="text-sm text-gray-900">
                              {c.dueDate ? new Date(c.dueDate).toLocaleDateString() : ""}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-100">
                        <button
                          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-sm font-medium"
                          onClick={() => navigate(`/customers/${c.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors text-sm font-medium"
                          onClick={() => handleAddBill(c)}
                        >
                          <Receipt className="w-4 h-4" />
                          Add Bill
                        </button>
                        <button
                          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors text-sm font-medium"
                          onClick={() => handleViewHistory(c)}
                        >
                          <FileText className="w-4 h-4" />
                          History
                        </button>
                        <button
                          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors text-sm font-medium"
                          onClick={() => navigate(`/payments?customerId=${c.id}`)}
                        >
                          <Wallet className="w-4 h-4" />
                          Collection
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

                                  {/* Pagination + page size BELOW table/cards */}
            {pagination && (
              <div className="bg-white mt-2 p-3 rounded-xl shadow">
                {/* Desktop Pagination */}
                <div className="hidden sm:flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {pagination.totalItems > 0 ? (pagination.currentPage - 1) * pageSize + 1 : 0}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(pagination.currentPage * pageSize, pagination.totalItems)}
                    </span>{" "}
                    of <span className="font-medium">{pagination.totalItems}</span> results
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-700">Show</label>
                      <select
                        value={pageSize}
                        onChange={(e) => handlePageSizeChange(e.target.value)}
                        className="px-3 py-2 rounded-md bg-gray-100 border border-gray-200
                                   focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      >
                        <option value={10}>10</option>
                        <option value={30}>30</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="text-sm text-gray-500">per page</span>
                    </div>

                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={!pagination.hasPrevious}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm
                                   font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .filter((p) => {
                          const cur = pagination.currentPage;
                          const total = pagination.totalPages;
                          return p === 1 || p === total || (p >= cur - 1 && p <= cur + 1);
                        })
                        .map((p, idx, arr) => {
                          const prev = arr[idx - 1];
                          const gap = prev && p - prev > 1;
                          return (
                            <React.Fragment key={p}>
                              {gap && (
                                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                  ...
                                </span>
                              )}
                              <button
                                onClick={() => handlePageChange(p)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  p === pagination.currentPage
                                    ? "z-10 bg-emerald-50 border-emerald-500 text-emerald-700"
                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                }`}
                              >
                                {p}
                              </button>
                            </React.Fragment>
                          );
                        })}

                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={!pagination.hasNext}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm
                                   font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </nav>
                  </div>
                </div>

                {/* Mobile Pagination */}
                <div className="sm:hidden">
                  {/* Results Info */}
                  <div className="text-center text-sm text-gray-700 mb-3">
                    Showing{" "}
                    <span className="font-medium">
                      {pagination.totalItems > 0 ? (pagination.currentPage - 1) * pageSize + 1 : 0}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(pagination.currentPage * pageSize, pagination.totalItems)}
                    </span>{" "}
                    of <span className="font-medium">{pagination.totalItems}</span> results
                  </div>

                  {/* Page Size Selector */}
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <label className="text-sm text-gray-700">Show</label>
                    <select
                      value={pageSize}
                      onChange={(e) => handlePageSizeChange(e.target.value)}
                      className="px-2 py-1 rounded-md bg-gray-100 border border-gray-200 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                      <option value={10}>10</option>
                      <option value={30}>30</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="text-sm text-gray-500">per page</span>
                  </div>

                  {/* Mobile Navigation */}
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevious}
                      className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Current Page Indicator */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-emerald-500 bg-emerald-50 text-emerald-700 font-medium text-sm">
                      {pagination.currentPage}
                    </div>

                    <span className="text-sm text-gray-500 mx-2">of {pagination.totalPages}</span>

                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNext}
                      className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
        </>
      )}

      {/* Add Bill Modal */}
      {showAddBillModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Add to Bill - {selectedCustomer.fullName}
              </h3>
              <button
                onClick={() => {
                  setShowAddBillModal(false);
                  setSelectedCustomer(null);
                }}
                className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleBillSubmit} className="p-6">
              <div className="space-y-4">
                {/* Charge Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Charge Type
                  </label>
                  <select
                    value={billForm.chargeType}
                    onChange={(e) => setBillForm(prev => ({ ...prev, chargeType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                    required
                  >
                    <option value="ROUTER_INSTALLATION">Router Installation</option>
                    <option value="EQUIPMENT_CHARGE">Equipment Charge</option>
                    <option value="LATE_FEE">Late Fee</option>
                    <option value="ADJUSTMENT">Adjustment</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={billForm.amount}
                    onChange={(e) => setBillForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                    placeholder="Enter amount"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={billForm.description}
                    onChange={(e) => setBillForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                    placeholder="Enter description for this charge"
                    rows="3"
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddBillModal(false);
                    setSelectedCustomer(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
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
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:via-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    Add to Bill
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

export default Customers;
