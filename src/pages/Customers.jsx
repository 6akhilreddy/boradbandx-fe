import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import useCustomerStore from "../store/customerStore";
import Spinner from "../components/Spinner";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
  Wallet,
  Filter,
  X,
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

  // filters (date removed)
  const [search, setSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");

  // pagination
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(1);

  // modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    customer: {
      fullName: "",
      phone: "",
      email: "",
      address: "",
      customerCode: "",
      areaId: "",
      assignedAgentId: "",
      installationDate: "",
      securityDeposit: 0,
      gstNumber: "",
      advance: 0,
      remarks: "",
    },
    hardware: { deviceType: "", macAddress: "", ipAddress: "" },
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

  // initial fetch
  useEffect(() => {
    fetchCustomers({ page: pageIndex, limit: pageSize });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // debounced fetch when filters change
  useEffect(() => {
    const t = setTimeout(() => {
      setPageIndex(1);
      fetchCustomers({
        page: 1,
        limit: pageSize,
        ...(search && { search }),
        ...(areaFilter && { areaId: areaFilter }),
        ...(paymentStatusFilter && { paymentStatus: paymentStatusFilter }),
      });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, areaFilter, paymentStatusFilter, pageSize]);

  const handlePageChange = (next) => {
    if (!pagination) return;
    if (next < 1 || next > pagination.totalPages) return;
    setPageIndex(next);
    fetchCustomers({
      page: next,
      limit: pageSize,
      ...(search && { search }),
      ...(areaFilter && { areaId: areaFilter }),
      ...(paymentStatusFilter && { paymentStatus: paymentStatusFilter }),
    });
  };

  const handlePageSizeChange = (size) => {
    const n = Number(size) || 10;
    setPageSize(n);
    setPageIndex(1);
    fetchCustomers({
      page: 1,
      limit: n,
      ...(search && { search }),
      ...(areaFilter && { areaId: areaFilter }),
      ...(paymentStatusFilter && { paymentStatus: paymentStatusFilter }),
    });
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    await addCustomer(newCustomer);
    setShowAddModal(false);
    handlePageChange(1);
  };

  const getBalanceStatus = (balance) => {
    if (balance === 0) return { text: "Paid", class: "bg-emerald-100 text-emerald-700" };
    if (balance > 0) return { text: "Unpaid", class: "bg-red-100 text-red-700" };
    return { text: "Credit", class: "bg-blue-100 text-blue-700" };
  };

  return (
    <Layout>
      {/* Header (stack on mobile) */}
      <div className="mt-2 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <h2 className="text-2xl font-bold sm:truncate">Customers</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto justify-center text-white px-4 py-2 rounded-lg shadow-md
                     bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500
                     hover:from-purple-600 hover:to-cyan-600
                     transition-transform hover:scale-[1.02] text-sm sm:text-base"
        >
          <span className="inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Customer
          </span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-3 rounded-xl shadow mb-2">
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
            className="w-48 px-4 py-2 rounded-full bg-gray-100 border border-transparent
                       focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
            className="w-48 px-4 py-2 rounded-full bg-gray-100 border border-transparent
                       focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
                             focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
                             focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
      {loading ? (
        <Spinner loadingTxt="Loading customers..." />
      ) : (
        <>
          {/* Desktop Table Layout */}
          <div className="hidden lg:block">
            {/* Desktop Header Row */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-1">
              <div className="overflow-x-auto max-w-full">
                <div className="grid grid-cols-10 gap-4 px-6 py-4 bg-gray-50 w-full">
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">S.CODE</div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">CUSTOMER</div>
                  <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">HARDWARE</div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">BALANCE</div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">AREA</div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">PLAN</div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">DUE DATE</div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">STATUS</div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">ACTION</div>
                </div>
              </div>
            </div>

            {/* Desktop Data Rows */}
            <div className="space-y-2 w-full">
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
                      <div className="grid grid-cols-10 gap-4 items-center w-full">
                        {/* S.CODE */}
                        <div className="col-span-1 flex items-center min-w-0">
                          <div className="font-medium text-gray-900 truncate">{c.customerCode}</div>
                        </div>

                        {/* CUSTOMER */}
                        <div className="col-span-1 flex items-center min-w-0">
                          <div className="min-w-0 w-full">
                            <div className="text-sm font-semibold text-gray-900 truncate">{c.fullName}</div>
                            <div className="text-xs text-gray-500 truncate">{c.phone}</div>
                          </div>
                        </div>

                        {/* HARDWARE */}
                        <div className="col-span-2 flex items-center min-w-0">
                          <div className="font-mono text-xs text-gray-700 min-w-0 w-full">
                            {c.macAddress ? <div className="truncate">MAC: {c.macAddress}</div> : null}
                            {c.ipAddress ? <div className="truncate">IP:&nbsp;&nbsp;&nbsp;{c.ipAddress}</div> : null}
                          </div>
                        </div>

                        {/* BALANCE */}
                        <div className="col-span-1 flex items-center min-w-0">
                          <div className="font-medium text-gray-900 truncate">₹{c.balance || 0}</div>
                        </div>

                        {/* AREA */}
                        <div className="col-span-1 flex items-center min-w-0">
                          <div className="text-sm text-gray-700 truncate min-w-0 w-full">{c.areaName || ""}</div>
                        </div>

                        {/* PLAN */}
                        <div className="col-span-1 flex items-center min-w-0">
                          <div className="text-sm min-w-0 w-full">
                            <div className="font-semibold text-gray-900 truncate">{c.planName || ""}</div>
                            {price ? <div className="text-gray-500 truncate">₹{price}/month</div> : null}
                          </div>
                        </div>

                        {/* DUE DATE */}
                        <div className="col-span-1 flex items-center min-w-0">
                          <div className="text-sm text-gray-700 truncate min-w-0 w-full">
                            {c.dueDate ? new Date(c.dueDate).toLocaleDateString() : ""}
                          </div>
                        </div>

                        {/* STATUS */}
                        <div className="col-span-1 flex items-center min-w-0">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${badge.class} truncate`}>
                            {badge.text}
                          </span>
                        </div>

                        {/* ACTION */}
                        <div className="col-span-1 flex items-center justify-end">
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
                                         hover:shadow-sm text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50
                                         group relative border border-gray-200"
                              title="Collection"
                              onClick={() => navigate(`/collections/new?customerId=${c.id}`)}
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
              <div className="space-y-3">
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
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* Left Column */}
                        <div className="space-y-3">
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
                        <div className="space-y-3">
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

                          {/* Hardware Info */}
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Hardware</div>
                            <div className="text-xs text-gray-900 space-y-1">
                              {c.macAddress && <div>MAC: {c.macAddress}</div>}
                              {c.ipAddress && <div>IP: {c.ipAddress}</div>}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-center gap-2 pt-3 border-t border-gray-100">
                        <button
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-xs font-medium"
                          onClick={() => navigate(`/customers/${c.id}`)}
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                        <button
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors text-xs font-medium"
                          onClick={() => navigate(`/collections/new?customerId=${c.id}`)}
                        >
                          <Wallet className="w-3 h-3" />
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

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add New Customer</h3>
            </div>
            <form onSubmit={handleAddCustomer} className="p-6 space-y-6">
              {/* keep your existing fields... */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-white
                             bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500
                             hover:from-emerald-600 hover:to-cyan-600"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Customers;
