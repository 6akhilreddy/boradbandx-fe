import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import useAgentStore from "../store/agentStore";
import Spinner from "../components/Spinner";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Filter,
  X,
  DollarSign,
} from "lucide-react";

const Agents = () => {
  const navigate = useNavigate();
  const {
    agents,
    loading,
    error,
    fetchAgents,
    addAgent,
    clearError,
  } = useAgentStore();

  // filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    status: "ACTIVE",
  });

  // initial fetch
  useEffect(() => {
    fetchAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // debounced fetch when filters change
  useEffect(() => {
    const t = setTimeout(() => {
      fetchAgents({
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  const handleAddAgent = async (e) => {
    e.preventDefault();
    await addAgent(newAgent);
    setShowAddModal(false);
  };

  const getStatusBadge = (status) => {
    if (status === "ACTIVE") return { text: "Active", class: "bg-emerald-100 text-emerald-700" };
    return { text: "Inactive", class: "bg-red-100 text-red-700" };
  };

  return (
    <Layout>
      {/* Header (stack on mobile) */}
      <div className="mt-2 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <h2 className="text-2xl font-bold sm:truncate">Agents</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto justify-center text-white px-4 py-2 rounded-lg shadow-md
                     bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500
                     hover:from-purple-600 hover:to-cyan-600
                     transition-transform hover:scale-[1.02] text-sm sm:text-base"
        >
          <span className="inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Agent
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
              placeholder="Search agents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-full bg-gray-100 border border-transparent
                         focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-48 px-4 py-2 rounded-full bg-gray-100 border border-transparent
                       focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          {/* Clear */}
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("");
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
                placeholder="Search agents..."
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
            {(search || statusFilter) && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("");
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
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
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
        <Spinner loadingTxt="Loading agents..." />
      ) : (
        <>
          {/* Desktop Table Layout */}
          <div className="hidden lg:block">
            {/* Desktop Header Row */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-1">
              <div className="overflow-x-auto max-w-full">
                <div className="grid grid-cols-8 gap-4 px-6 py-4 bg-gray-50 w-full">
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">NAME</div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">EMAIL</div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">PHONE</div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">TOTAL COLLECTION</div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">LAST MONTH</div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">TODAY</div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">STATUS</div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">ACTION</div>
                </div>
              </div>
            </div>

            {/* Desktop Data Rows */}
            <div className="space-y-2 w-full">
              {agents.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
                  No agents found
                </div>
              ) : (
                agents.map((agent) => {
                  const badge = getStatusBadge(agent.status);
                  return (
                    <div
                      key={agent.id}
                      className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="grid grid-cols-8 gap-4 items-center w-full">
                        {/* NAME */}
                        <div className="col-span-1 flex items-center min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">{agent.name}</div>
                        </div>

                        {/* EMAIL */}
                        <div className="col-span-1 flex items-center min-w-0">
                          <div className="text-sm text-gray-700 truncate">{agent.email}</div>
                        </div>

                        {/* PHONE */}
                        <div className="col-span-1 flex items-center min-w-0">
                          <div className="text-sm text-gray-700 truncate">{agent.phone}</div>
                        </div>

                        {/* TOTAL COLLECTION */}
                        <div className="col-span-1 flex items-center min-w-0">
                          <div className="font-medium text-gray-900 truncate">₹{agent.collection?.total || 0}</div>
                        </div>

                        {/* LAST MONTH */}
                        <div className="col-span-1 flex items-center min-w-0">
                          <div className="text-sm text-gray-700 truncate">₹{agent.collection?.lastMonth || 0}</div>
                        </div>

                        {/* TODAY */}
                        <div className="col-span-1 flex items-center min-w-0">
                          <div className="text-sm text-gray-700 truncate">₹{agent.collection?.today || 0}</div>
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
                              onClick={() => navigate(`/agents/${agent.id}`)}
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
                              title="Edit Agent"
                              onClick={() => navigate(`/agents/${agent.id}/edit`)}
                            >
                              <Edit className="w-5 h-5" />
                              <span className="hidden md:block absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                Edit Agent
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
            {agents.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
                No agents found
              </div>
            ) : (
              <div className="space-y-3">
                {agents.map((agent) => {
                  const badge = getStatusBadge(agent.status);
                  return (
                    <div
                      key={agent.id}
                      className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow duration-200"
                    >
                      {/* Top Section - Name and Status */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm font-semibold text-gray-900">{agent.name}</div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badge.class}`}>
                          {badge.text}
                        </span>
                      </div>

                      {/* Two Column Layout for Data */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* Left Column */}
                        <div className="space-y-3">
                          {/* Email */}
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Email</div>
                            <div className="text-sm text-gray-900">{agent.email}</div>
                          </div>

                          {/* Phone */}
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Phone</div>
                            <div className="text-sm text-gray-900">{agent.phone}</div>
                          </div>

                          {/* Total Collection */}
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Total Collection</div>
                            <div className="text-lg font-bold text-gray-900">₹{agent.collection?.total || 0}</div>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-3">
                          {/* Last Month Collection */}
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Last Month</div>
                            <div className="text-sm text-gray-900">₹{agent.collection?.lastMonth || 0}</div>
                          </div>

                          {/* Today's Collection */}
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Today</div>
                            <div className="text-sm text-gray-900">₹{agent.collection?.today || 0}</div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-center gap-2 pt-3 border-t border-gray-100">
                        <button
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-xs font-medium"
                          onClick={() => navigate(`/agents/${agent.id}`)}
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                        <button
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors text-xs font-medium"
                          onClick={() => navigate(`/agents/${agent.id}/edit`)}
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

      {/* Add Agent Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add New Agent</h3>
            </div>
            <form onSubmit={handleAddAgent} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    required
                    value={newAgent.name}
                    onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={newAgent.email}
                    onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    required
                    value={newAgent.phone}
                    onChange={(e) => setNewAgent({ ...newAgent, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    required
                    value={newAgent.password}
                    onChange={(e) => setNewAgent({ ...newAgent, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={newAgent.status}
                    onChange={(e) => setNewAgent({ ...newAgent, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
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
                  Add Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Agents;
