import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import useApiLoading from "../hooks/useApiLoading";
import Spinner from "../components/Spinner";
import Alert from "../components/Alert";
import {
  getComplaints,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  searchCustomers,
  getComplaintComments,
  addComplaintComment,
  deleteComplaintComment,
} from "../api/complaintApi";
import { getAgents } from "../api/agentApi";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  MessageSquare,
  X,
  Download,
  Filter,
  RotateCcw,
} from "lucide-react";
import DatePicker from "../components/DatePicker";

const Complaints = () => {
  const navigate = useNavigate();
  const apiLoading = useApiLoading();

  // State
  const [complaints, setComplaints] = useState([]);
  const [statusCounts, setStatusCounts] = useState({ OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: "success", message: "" });

  // Filters
  const [statusFilter, setStatusFilter] = useState("OPEN");
  const [assignedAgentFilter, setAssignedAgentFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [search, setSearch] = useState("");

  // Pagination
  const [pageSize, setPageSize] = useState(20);
  const [pageIndex, setPageIndex] = useState(1);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerSearchResults, setCustomerSearchResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [agents, setAgents] = useState([]);
  
  // Comment modal state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    customerId: "",
    message: "",
    status: "OPEN",
    assignedAgentId: "",
  });

  // Fetch complaints
  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page: pageIndex,
        limit: pageSize,
        ...(statusFilter && { status: statusFilter }),
        ...(assignedAgentFilter && { assignedAgentId: assignedAgentFilter }),
        ...(dateFilter && { startDate: dateFilter, endDate: dateFilter }),
        ...(search && { search }),
      };

      const response = await getComplaints(params);
      setComplaints(response.data || []);
      setPagination(response.pagination || null);
      // Update status counts if provided by API
      if (response.statusCounts) {
        setStatusCounts(response.statusCounts);
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, statusFilter, assignedAgentFilter, dateFilter, search]);


  // Fetch agents
  const fetchAgents = useCallback(async () => {
    try {
      const response = await getAgents({ status: "ACTIVE" });
      setAgents(response || []);
    } catch (err) {
      console.error("Failed to fetch agents:", err);
    }
  }, []);

  // Search customers
  const handleCustomerSearch = useCallback(async (query) => {
    if (query.length < 2) {
      setCustomerSearchResults([]);
      return;
    }
    try {
      const results = await searchCustomers(query);
      setCustomerSearchResults(results || []);
    } catch (err) {
      console.error("Failed to search customers:", err);
      setCustomerSearchResults([]);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
    fetchAgents(); // Always fetch agents to populate dropdowns
  }, [fetchComplaints, fetchAgents]);

  useEffect(() => {
    if (showAddModal || showEditModal) {
      fetchAgents();
    }
  }, [showAddModal, showEditModal, fetchAgents]);

  // Load comments for a complaint
  const loadComments = useCallback(async () => {
    if (!selectedComplaint) return;
    setLoadingComments(true);
    try {
      const response = await getComplaintComments(selectedComplaint.id);
      setComments(response || []);
    } catch (err) {
      console.error("Failed to load comments:", err);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  }, [selectedComplaint]);

  // Load comments when comment modal opens
  useEffect(() => {
    if (showCommentModal && selectedComplaint) {
      loadComments();
    }
  }, [showCommentModal, selectedComplaint, loadComments]);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (customerSearch) {
        handleCustomerSearch(customerSearch);
      } else {
        setCustomerSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [customerSearch, handleCustomerSearch]);

  const handlePageChange = useCallback((next) => {
    if (!pagination) return;
    if (next < 1 || next > pagination.totalPages) return;
    setPageIndex(next);
  }, [pagination]);

  const handlePageSizeChange = useCallback((size) => {
    const n = Number(size) || 20;
    setPageSize(n);
    setPageIndex(1);
  }, []);

  const handleResetFilters = () => {
    setStatusFilter("OPEN");
    setAssignedAgentFilter("");
    setDateFilter("");
    setSearch("");
    setPageIndex(1);
  };

  const handleAddComplaint = async () => {
    if (!formData.customerId || !formData.message) {
      setAlert({
        show: true,
        type: "error",
        message: "Please fill in all required fields",
      });
      return;
    }

    try {
      await createComplaint(formData);
      setAlert({
        show: true,
        type: "success",
        message: "Complaint added successfully",
      });
      setShowAddModal(false);
      resetForm();
      fetchComplaints(); // This will also update status counts
    } catch (err) {
      setAlert({
        show: true,
        type: "error",
        message: err?.response?.data?.error || "Failed to add complaint",
      });
    }
  };

  const handleUpdateComplaint = async () => {
    if (!selectedComplaint) return;

    try {
      await updateComplaint(selectedComplaint.id, formData);
      setAlert({
        show: true,
        type: "success",
        message: "Complaint updated successfully",
      });
      setShowEditModal(false);
      resetForm();
      fetchComplaints(); // This will also update status counts
    } catch (err) {
      setAlert({
        show: true,
        type: "error",
        message: err?.response?.data?.error || "Failed to update complaint",
      });
    }
  };

  const handleDeleteComplaint = async (id) => {
    if (!window.confirm("Are you sure you want to delete this complaint?")) {
      return;
    }

    try {
      await deleteComplaint(id);
      setAlert({
        show: true,
        type: "success",
        message: "Complaint deleted successfully",
      });
      fetchComplaints(); // This will also update status counts
    } catch (err) {
      setAlert({
        show: true,
        type: "error",
        message: err?.response?.data?.error || "Failed to delete complaint",
      });
    }
  };

  const handleEditClick = (complaint) => {
    setSelectedComplaint(complaint);
    setFormData({
      customerId: complaint.customerId,
      message: complaint.message,
      status: complaint.status,
      assignedAgentId: complaint.assignedAgentId || "",
    });
    setSelectedCustomer({
      id: complaint.customerId,
      fullName: complaint.customerName,
      phone: complaint.customerPhone,
      address: complaint.customerAddress,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      customerId: "",
      message: "",
      status: "OPEN",
      assignedAgentId: "",
    });
    setSelectedCustomer(null);
    setCustomerSearch("");
    setCustomerSearchResults([]);
    setSelectedComplaint(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${day}-${month}-${year} ${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN":
        return "bg-red-100 text-red-700";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-700";
      case "RESOLVED":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusCount = (status) => {
    // Get count from API response
    return statusCounts[status] || 0;
  };

  // Add comment
  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedComplaint) return;

    try {
      await addComplaintComment(selectedComplaint.id, newComment);
      setNewComment("");
      await loadComments();
    } catch (err) {
      setAlert({
        show: true,
        type: "error",
        message: err?.response?.data?.error || "Failed to add comment",
      });
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    if (!selectedComplaint) return;
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      await deleteComplaintComment(selectedComplaint.id, commentId);
      await loadComments();
    } catch (err) {
      setAlert({
        show: true,
        type: "error",
        message: err?.response?.data?.error || "Failed to delete comment",
      });
    }
  };

  // Handle comment icon click
  const handleCommentClick = (complaint) => {
    setSelectedComplaint(complaint);
    setShowCommentModal(true);
    setNewComment("");
  };

  return (
    <Layout>
      <div className="min-h-screen p-4 md:p-6">
        {alert.show && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert({ ...alert, show: false })}
          />
        )}

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Complaints</h1>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Complaint
          </button>
        </div>

        {/* Status Tabs */}
        <div className="mb-4 flex gap-2 border-b border-gray-200">
          {["OPEN", "IN_PROGRESS", "RESOLVED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                statusFilter === status
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {status === "OPEN" ? "Open" : status === "IN_PROGRESS" ? "In Progress" : "Resolved"} (
              {getStatusCount(status)})
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <select
              value={assignedAgentFilter}
              onChange={(e) => setAssignedAgentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Agent</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <DatePicker
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              placeholder="Select Date"
              className="focus:outline-none"
            />
          </div>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <div className="flex-1 min-w-[200px] flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Complaints queries {statusFilter.toLowerCase()}
            </h2>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner loadingTxt="Loading complaints..." size="large" />
            </div>
          ) : error ? (
            <div className="p-4 text-red-500 text-center">{error}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase border border-gray-300">
                        S. No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase border border-gray-300">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase border border-gray-300">
                        Mobile
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase border border-gray-300">
                        Address
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase border border-gray-300">
                        Message
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase border border-gray-300">
                        Agent
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase border border-gray-300">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase border border-gray-300">
                        Start Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase border border-gray-300">
                        Last Update Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase border border-gray-300">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {complaints.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-4 py-8 text-center text-gray-500 border border-gray-300">
                          No complaints found
                        </td>
                      </tr>
                    ) : (
                      complaints.map((complaint, index) => (
                        <tr key={complaint.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900 border border-gray-300">
                            {(pageIndex - 1) * pageSize + index + 1}
                          </td>
                          <td className="px-4 py-3 text-sm border border-gray-300">
                            <button
                              onClick={() => navigate(`/customers/${complaint.customerId}`)}
                              className="text-blue-600 hover:text-blue-800 hover:underline text-left break-words"
                              style={{ wordBreak: "break-word" }}
                            >
                              {complaint.customerName}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 border border-gray-300">
                            {complaint.customerPhone}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 border border-gray-300 text-left break-words" style={{ wordBreak: "break-word", maxWidth: "200px" }}>
                            {complaint.customerAddress}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 border border-gray-300 text-left break-words" style={{ wordBreak: "break-word", maxWidth: "250px" }}>
                            {complaint.message}
                          </td>
                          <td className="px-4 py-3 text-sm border border-gray-300">
                            <select
                              value={complaint.assignedAgentId || ""}
                              onChange={async (e) => {
                                try {
                                  await updateComplaint(complaint.id, {
                                    assignedAgentId: e.target.value || null,
                                  });
                                  fetchComplaints(); // This will also update status counts
                                } catch (err) {
                                  setAlert({
                                    show: true,
                                    type: "error",
                                    message: "Failed to update agent",
                                  });
                                }
                              }}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                            >
                              <option value="">No Agent</option>
                              {agents.map((agent) => (
                                <option key={agent.id} value={agent.id}>
                                  {agent.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3 text-sm border border-gray-300">
                            <select
                              value={complaint.status}
                              onChange={async (e) => {
                                try {
                                  await updateComplaint(complaint.id, { status: e.target.value });
                                  fetchComplaints(); // This will also update status counts
                                } catch (err) {
                                  setAlert({
                                    show: true,
                                    type: "error",
                                    message: "Failed to update status",
                                  });
                                }
                              }}
                              className={`w-full border border-gray-300 rounded px-2 py-1 text-sm font-medium ${getStatusColor(complaint.status)}`}
                            >
                              <option value="OPEN">Open</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="RESOLVED">Resolved</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 border border-gray-300">
                            {formatDate(complaint.createdAt)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 border border-gray-300">
                            {formatDate(complaint.updatedAt)}
                          </td>
                          <td className="px-4 py-3 text-sm border border-gray-300">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDeleteComplaint(complaint.id)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditClick(complaint)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleCommentClick(complaint)}
                                className="text-green-600 hover:text-green-800 p-1"
                                title="Comment"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && (
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((pageIndex - 1) * pageSize) + 1} to {Math.min(pageIndex * pageSize, pagination.totalItems)} of {pagination.totalItems} entries
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pageIndex - 1)}
                      disabled={!pagination.hasPrevious}
                      className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {pageIndex} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pageIndex + 1)}
                      disabled={!pagination.hasNext}
                      className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Add Complaint Modal */}
        {showAddModal && (
          <AddComplaintModal
            formData={formData}
            setFormData={setFormData}
            customerSearch={customerSearch}
            setCustomerSearch={setCustomerSearch}
            customerSearchResults={customerSearchResults}
            setSelectedCustomer={setSelectedCustomer}
            selectedCustomer={selectedCustomer}
            agents={agents}
            onClose={() => {
              setShowAddModal(false);
              resetForm();
            }}
            onSubmit={handleAddComplaint}
          />
        )}

        {/* Edit Complaint Modal */}
        {showEditModal && (
          <EditComplaintModal
            formData={formData}
            setFormData={setFormData}
            selectedCustomer={selectedCustomer}
            agents={agents}
            onClose={() => {
              setShowEditModal(false);
              resetForm();
            }}
            onSubmit={handleUpdateComplaint}
          />
        )}

        {/* Comment Modal */}
        {showCommentModal && selectedComplaint && (
          <CommentModal
            complaint={selectedComplaint}
            comments={comments}
            newComment={newComment}
            setNewComment={setNewComment}
            loadingComments={loadingComments}
            onClose={() => {
              setShowCommentModal(false);
              setSelectedComplaint(null);
              setComments([]);
              setNewComment("");
            }}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
          />
        )}
      </div>
    </Layout>
  );
};

// Add Complaint Modal Component
const AddComplaintModal = ({
  formData,
  setFormData,
  customerSearch,
  setCustomerSearch,
  customerSearchResults,
  setSelectedCustomer,
  selectedCustomer,
  agents,
  onClose,
  onSubmit,
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Add Complaint</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Customer Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Customer
            </label>
            <div className="relative">
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  if (!e.target.value) {
                    setSelectedCustomer(null);
                    setFormData({ ...formData, customerId: "" });
                  }
                }}
                placeholder="Search by name, phone, or code..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            {/* Search Results */}
            {customerSearchResults.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">#</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Name</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Mobile</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Area</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customerSearchResults.map((customer, index) => (
                      <tr
                        key={customer.id}
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setFormData({ ...formData, customerId: customer.id });
                          setCustomerSearch(customer.fullName);
                          setCustomerSearchResults([]);
                        }}
                        className="hover:bg-blue-50 cursor-pointer"
                      >
                        <td className="px-3 py-2 text-sm">{index + 1}</td>
                        <td className="px-3 py-2 text-sm">{customer.fullName}</td>
                        <td className="px-3 py-2 text-sm">{customer.phone}</td>
                        <td className="px-3 py-2 text-sm">{customer.Area?.areaName || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Customer Name (read-only when selected) */}
          {selectedCustomer && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name
              </label>
              <input
                type="text"
                value={selectedCustomer.fullName}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          )}

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status:</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message:</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Please type comment here"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Assign Agent */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assign Agent:</label>
            <select
              value={formData.assignedAgentId}
              onChange={(e) => setFormData({ ...formData, assignedAgentId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Agent</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Complaint
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit Complaint Modal Component
const EditComplaintModal = ({ formData, setFormData, selectedCustomer, agents, onClose, onSubmit }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Edit Complaint</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Customer Name (read-only) */}
          {selectedCustomer && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name
              </label>
              <input
                type="text"
                value={selectedCustomer.fullName}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          )}

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status:</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message:</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Please type comment here"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Assign Agent */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assign Agent:</label>
            <select
              value={formData.assignedAgentId}
              onChange={(e) => setFormData({ ...formData, assignedAgentId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Agent</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Update Complaint
          </button>
        </div>
      </div>
    </div>
  );
};

// Comment Modal Component
const CommentModal = ({
  complaint,
  comments,
  newComment,
  setNewComment,
  loadingComments,
  onClose,
  onAddComment,
  onDeleteComment,
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${day}-${month}-${year} ${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Write Comment Here</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* New Comment Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Comment:
            </label>
            <div className="flex gap-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Please type your comment here"
                rows={3}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <button
                onClick={onAddComment}
                disabled={!newComment.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed self-start"
              >
                Add Comment
              </button>
            </div>
          </div>

          {/* Latest Comments Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Latest Comments:-</h3>
            {loadingComments ? (
              <div className="flex justify-center py-4">
                <Spinner loadingTxt="Loading comments..." size="small" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No comments yet</p>
            ) : (
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <table className="min-w-full border-collapse">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase border border-gray-300">
                        Commented By
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase border border-gray-300">
                        Comment
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase border border-gray-300">
                        Date
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase border border-gray-300">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {comments.map((comment) => (
                      <tr key={comment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900 border border-gray-300">
                          {comment.CreatedBy?.name || "Unknown"}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 border border-gray-300 text-left break-words" style={{ wordBreak: "break-word", maxWidth: "400px" }}>
                          {comment.comment}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 border border-gray-300">
                          {formatDate(comment.createdAt)}
                        </td>
                        <td className="px-4 py-2 text-sm border border-gray-300">
                          <button
                            onClick={() => onDeleteComment(comment.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Complaints;

