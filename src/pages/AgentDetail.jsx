import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Layout from "../components/Layout";
import useAgentStore from "../store/agentStore";
import Spinner from "../components/Spinner";
import useApiLoading from "../hooks/useApiLoading";
import Toast from "../components/Toast";
import DatePicker from "../components/DatePicker";
import { getAreas } from "../api/areaApi";
import {
  ArrowLeft,
  Calendar,
  IndianRupee,
  User,
  Phone,
  Mail,
  TrendingUp,
  TrendingDown,
  Clock,
  Edit,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const AgentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentAgent,
    loading,
    error,
    fetchAgentById,
    fetchAgentPaymentHistory,
    fetchAgentMonthlyTrend,
    fetchAgentAreasAndPermissions,
    updateAgentAreasAndPermissions,
    updateAgentAreas,
    updateAgentPermissions,
    editAgent,
    clearError,
  } = useAgentStore();
  const apiLoading = useApiLoading();

  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentPagination, setPaymentPagination] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [trendLoading, setTrendLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const [buttonLoading, setButtonLoading] = useState(false);
  
  // Areas and Permissions state
  const [allAreas, setAllAreas] = useState([]);
  const [assignedAreas, setAssignedAreas] = useState([]);
  const [agentPermissions, setAgentPermissions] = useState([]);
  const [areasPermissionsLoading, setAreasPermissionsLoading] = useState(false);
  const [savingAreasPermissions, setSavingAreasPermissions] = useState(false);

  // Pagination state
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(1);

  // Date filter state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Form hooks
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  // Agent permissions list
  const AGENT_PERMISSIONS = [
    { code: "subscription.update", label: "update subscriptions" },
    { code: "customer.add", label: "add customers" },
    { code: "customer.delete", label: "delete customers" },
    { code: "customer.edit.general", label: "edit general detail" },
    { code: "customer.edit.billing", label: "edit billing detail" },
    { code: "customer.edit.status", label: "edit customer status" },
    { code: "bill.generate", label: "generate bill" },
    { code: "payment.add.anydate", label: "add payment on any date" },
    { code: "bill.cannot.change.date", label: "cannot change date on bill generation" },
    { code: "bill.edit", label: "can edit bill" },
    { code: "balance.adjust", label: "can adjust balance" },
    { code: "balance.delete", label: "can delete bill or payment from balance history" },
    { code: "payment.collect", label: "collect payment" },
    { code: "collection.monthly.show", label: "show monthly collection" },
  ];

  useEffect(() => {
    if (id) {
      fetchAgentById(id);
      fetchPaymentHistory(id, { 
        page: pageIndex, 
        limit: pageSize,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });
      fetchMonthlyTrend(id);
      fetchAreasAndPermissions(id);
      fetchAllAreas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, pageIndex, pageSize, startDate, endDate]);

  const fetchPaymentHistory = async (agentId, params = {}) => {
    setPaymentLoading(true);
    try {
      const response = await fetchAgentPaymentHistory(agentId, params);
      setPaymentHistory(response.payments || []);
      setPaymentPagination(response.pagination || null);
    } catch (error) {
      console.error("Failed to fetch payment history:", error);
    } finally {
      setPaymentLoading(false);
    }
  };

  const fetchMonthlyTrend = async (agentId) => {
    setTrendLoading(true);
    try {
      const response = await fetchAgentMonthlyTrend(agentId);
      setMonthlyTrend(response.monthlyTrend || []);
    } catch (error) {
      console.error("Failed to fetch monthly trend:", error);
    } finally {
      setTrendLoading(false);
    }
  };

  const fetchAllAreas = async () => {
    try {
      const response = await getAreas();
      // Ensure areas have id and areaName
      const areas = Array.isArray(response) 
        ? response.map(area => ({
            id: Number(area.id),
            areaName: area.areaName
          }))
        : [];
      setAllAreas(areas);
    } catch (error) {
      console.error("Failed to fetch all areas:", error);
      setToast({ show: true, type: "error", message: "Failed to load areas. Please refresh the page." });
    }
  };

  const fetchAreasAndPermissions = async (agentId) => {
    setAreasPermissionsLoading(true);
    try {
      const response = await fetchAgentAreasAndPermissions(agentId);
      console.log("Fetched areas and permissions response:", response);
      
      // Ensure assignedAreas is an array of numbers
      const assignedAreasList = Array.isArray(response.assignedAreas) 
        ? response.assignedAreas.map(a => {
            if (typeof a === 'object' && a.id) return Number(a.id);
            return Number(a);
          }).filter(id => !isNaN(id))
        : [];
      console.log("Normalized assignedAreas:", assignedAreasList);
      setAssignedAreas(assignedAreasList);
      
      setAgentPermissions(response.agentPermissions || []);
    } catch (error) {
      console.error("Failed to fetch areas and permissions:", error);
      setToast({ show: true, type: "error", message: "Failed to load assigned areas and permissions. Please refresh the page." });
    } finally {
      setAreasPermissionsLoading(false);
    }
  };

  const handleAreaToggle = (areaId) => {
    const numAreaId = Number(areaId);
    setAssignedAreas((prev) => {
      const normalized = prev.map(id => Number(id));
      const newAreas = normalized.includes(numAreaId)
        ? normalized.filter((id) => id !== numAreaId)
        : [...normalized, numAreaId];
      console.log("Area toggled:", numAreaId, "New assignedAreas:", newAreas);
      return newAreas;
    });
  };

  const handleSelectAllAreas = () => {
    const normalizedAssigned = assignedAreas.map(id => Number(id));
    const allAreaIds = allAreas.map((area) => Number(area.id));
    const allSelected = allAreaIds.length > 0 && 
      allAreaIds.every(id => normalizedAssigned.includes(id));
    
    if (allSelected) {
      setAssignedAreas([]);
    } else {
      setAssignedAreas([...allAreaIds]);
    }
  };

  const handlePermissionToggle = (permissionCode) => {
    setAgentPermissions((prev) => {
      const newPermissions = prev.includes(permissionCode)
        ? prev.filter((code) => code !== permissionCode)
        : [...prev, permissionCode];
      console.log("Permission toggled:", permissionCode, "New agentPermissions:", newPermissions);
      return newPermissions;
    });
  };

  const handleSaveAreas = async () => {
    setSavingAreasPermissions(true);
    try {
      // Ensure assignedAreas is an array of numbers
      const areasToSend = assignedAreas.map(id => Number(id)).filter(id => !isNaN(id));
      console.log("Sending areas to update:", areasToSend);
      console.log("Current assignedAreas state:", assignedAreas);
      
      const result = await updateAgentAreas(id, areasToSend);
      console.log("Update response:", result);
      
      // Use the response from the update call to update state immediately
      if (result && Array.isArray(result.assignedAreas)) {
        const updatedAreas = result.assignedAreas.map(a => {
          if (typeof a === 'object' && a.id) return Number(a.id);
          return Number(a);
        }).filter(id => !isNaN(id));
        
        console.log("Setting assignedAreas to:", updatedAreas);
        setAssignedAreas(updatedAreas);
      } else {
        // If response doesn't have valid assignedAreas, use what we sent (this handles empty arrays from backend)
        console.log("Response missing or invalid assignedAreas, using sent data:", areasToSend);
        setAssignedAreas(areasToSend);
      }
      
      setToast({ show: true, type: "success", message: "Areas updated successfully!" });
    } catch (error) {
      console.error("Failed to update areas:", error);
      setToast({ show: true, type: "error", message: error.response?.data?.error || "Failed to update areas. Please try again." });
    } finally {
      setSavingAreasPermissions(false);
    }
  };

  const handleSavePermissions = async () => {
    setSavingAreasPermissions(true);
    try {
      // Ensure agentPermissions is an array
      const permissionsToSend = Array.isArray(agentPermissions) ? agentPermissions : [];
      console.log("Sending permissions to update:", permissionsToSend);
      console.log("Current agentPermissions state:", agentPermissions);
      
      const result = await updateAgentPermissions(id, permissionsToSend);
      console.log("Update response:", result);
      
      // Use the response from the update call to update state immediately
      if (result && result.agentPermissions) {
        const updatedPermissions = Array.isArray(result.agentPermissions) 
          ? result.agentPermissions 
          : permissionsToSend; // Fallback to what we sent if response is invalid
        
        console.log("Setting agentPermissions to:", updatedPermissions);
        setAgentPermissions(updatedPermissions);
      } else {
        // If response doesn't have agentPermissions, use what we sent
        console.log("Response missing agentPermissions, using sent data:", permissionsToSend);
        setAgentPermissions(permissionsToSend);
      }
      
      setToast({ show: true, type: "success", message: "Permissions updated successfully!" });
    } catch (error) {
      console.error("Failed to update permissions:", error);
      setToast({ show: true, type: "error", message: error.response?.data?.error || "Failed to update permissions. Please try again." });
    } finally {
      setSavingAreasPermissions(false);
    }
  };

  const handlePageChange = useCallback((next) => {
    if (!paymentPagination) return;
    if (next < 1 || next > paymentPagination.totalPages) return;
    setPageIndex(next);
  }, [paymentPagination]);

  const handlePageSizeChange = useCallback((size) => {
    const n = Number(size) || 10;
    setPageSize(n);
    setPageIndex(1);
  }, []);

  const handleDateFilterChange = () => {
    setPageIndex(1); // Reset to first page when filters change
  };

  const clearDateFilters = () => {
    setStartDate("");
    setEndDate("");
    setPageIndex(1);
  };

  const openEditModal = () => {
    if (currentAgent) {
      setValue("name", currentAgent.name || "");
      setValue("email", currentAgent.email || "");
      setValue("phone", currentAgent.phone || "");
      setValue("status", currentAgent.isActive ? "ACTIVE" : "INACTIVE");
      setShowEditModal(true);
    }
  };

  const handleEditAgent = async (data) => {
    setButtonLoading(true);
    try {
      await editAgent(id, data);
      setShowEditModal(false);
      reset();
      setToast({ show: true, type: "success", message: "Agent updated successfully!" });
      // Refresh agent data
      await fetchAgentById(id);
    } catch (error) {
      console.error("Failed to edit agent:", error);
      setToast({ show: true, type: "error", message: "Failed to update agent. Please try again." });
    } finally {
      setButtonLoading(false);
    }
  };



  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    if (status === "ACTIVE") return { text: "Active", class: "bg-emerald-100 text-emerald-700" };
    return { text: "Inactive", class: "bg-red-100 text-red-700" };
  };

  const getPaymentMethodBadge = (method) => {
    const badges = {
      CASH: { text: "Cash", class: "bg-green-100 text-green-700" },
      ONLINE: { text: "Online", class: "bg-blue-100 text-blue-700" },
      CARD: { text: "Card", class: "bg-purple-100 text-purple-700" }
    };
    return badges[method] || { text: method, class: "bg-gray-100 text-gray-700" };
  };

  if (loading || apiLoading) {
    return (
      <Layout>
        <Spinner loadingTxt="Loading agent details..." size="medium" />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-700 hover:text-red-900">
            ×
          </button>
        </div>
      </Layout>
    );
  }

  if (!currentAgent) {
    return (
      <Layout>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Agent not found
        </div>
      </Layout>
    );
  }

  const badge = getStatusBadge(currentAgent.status);

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/agents")}
          className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow-md mb-4
                     bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500
                     hover:from-purple-600 hover:to-cyan-600
                     transition-transform hover:scale-[1.02] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Agents
        </button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{currentAgent.name}</h1>
            <p className="text-gray-600">Agent Details & Payment History</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${badge.class}`}>
              {badge.text}
            </span>
            <button
              onClick={openEditModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg shadow-md
                         bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500
                         hover:from-purple-600 hover:to-cyan-600
                         transition-transform hover:scale-[1.02] text-white cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              Edit Agent
            </button>
          </div>
        </div>
      </div>

      {/* Agent Information Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Agent Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium text-gray-900">{currentAgent.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{currentAgent.email || "Not provided"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium text-gray-900">{currentAgent.phone || "Not provided"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Joined</p>
              <p className="font-medium text-gray-900">
                {currentAgent.createdAt ? formatDate(currentAgent.createdAt) : "Unknown"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Collection Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Collection</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(Math.round(currentAgent.collection?.total || 0))}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <IndianRupee className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Last Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(Math.round(currentAgent.collection?.lastMonth || 0))}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today's Collection</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(Math.round(currentAgent.collection?.today || 0))}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <IndianRupee className="w-5 h-5" />
              Payment Collection History
            </h2>
            
            {/* Date Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-end flex-wrap">
              <div className="w-full sm:w-auto sm:min-w-[200px]">
                <DatePicker
                  label="Start Date"
                  name="startDate"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    handleDateFilterChange();
                  }}
                  placeholder="Select start date"
                  className="text-sm"
                />
              </div>
              <div className="w-full sm:w-auto sm:min-w-[200px]">
                <DatePicker
                  label="End Date"
                  name="endDate"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    handleDateFilterChange();
                  }}
                  placeholder="Select end date"
                  className="text-sm"
                  minDate={startDate || undefined}
                />
              </div>
              {(startDate || endDate) && (
                <button
                  onClick={clearDateFilters}
                  className="px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors whitespace-nowrap h-fit"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {(paymentLoading || apiLoading) ? (
          <div className="p-6">
            <Spinner loadingTxt="Loading payment history..." size="medium" />
          </div>
        ) : paymentHistory.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <IndianRupee className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No payment history found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                      Address
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                      Payment Method
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                      Date & Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((payment) => {
                    const methodBadge = getPaymentMethodBadge(payment.paymentMethod);
                    return (
                      <tr key={payment.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 border-r border-gray-200">
                          <div className="text-sm font-medium text-gray-900">
                            {payment.customer?.name || "Unknown Customer"}
                          </div>
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200">
                          <div className="text-sm text-gray-700 max-w-xs truncate" title={payment.customer?.address || "-"}>
                            {payment.customer?.address || "-"}
                          </div>
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(Math.round(payment.amount))}
                          </div>
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${methodBadge.class}`}>
                            {methodBadge.text}
                          </span>
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200">
                          <div className="text-sm text-gray-900">
                            {formatDate(payment.collectedAt)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {paymentPagination && (
              <div className="bg-gray-50 p-4 border-t border-gray-200">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {paymentPagination.totalItems > 0 ? (paymentPagination.currentPage - 1) * pageSize + 1 : 0}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(paymentPagination.currentPage * pageSize, paymentPagination.totalItems)}
                    </span>{" "}
                    of <span className="font-medium">{paymentPagination.totalItems}</span> results
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-700">Show</label>
                      <select
                        value={pageSize}
                        onChange={(e) => handlePageSizeChange(e.target.value)}
                        className="px-3 py-2 rounded-md bg-white border border-gray-200
                                   focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={30}>30</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="text-sm text-gray-500">per page</span>
                    </div>

                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(paymentPagination.currentPage - 1)}
                        disabled={!paymentPagination.hasPrevious}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm
                                   font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      {Array.from({ length: paymentPagination.totalPages }, (_, i) => i + 1)
                        .filter((p) => {
                          const cur = paymentPagination.currentPage;
                          const total = paymentPagination.totalPages;
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
                                  p === paymentPagination.currentPage
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
                        onClick={() => handlePageChange(paymentPagination.currentPage + 1)}
                        disabled={!paymentPagination.hasNext}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm
                                   font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Monthly Collection Trend Graph */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Collection Trend</h3>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>
        <div className="h-80">
          {trendLoading ? (
            <div className="flex items-center justify-center h-full">
              <Spinner loadingTxt="Loading trend data..." size="medium" />
            </div>
          ) : monthlyTrend.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              No data available
            </div>
          ) : (
            <Line
              data={{
                labels: monthlyTrend.map(item => item.month),
                datasets: [
                  {
                    label: 'Collection Amount (₹)',
                    data: monthlyTrend.map(item => item.amount),
                    borderColor: 'rgba(59, 130, 246, 1)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: 'top',
                  },
                  tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                      label: function(context) {
                        return `${context.label}: ₹${context.parsed.y.toLocaleString('en-IN')}`;
                      },
                    },
                  },
                  datalabels: {
                    display: false, // Hide all data labels on points
                  },
                },
                interaction: {
                  intersect: false,
                  mode: 'index',
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return '₹' + value.toLocaleString('en-IN');
                      },
                    },
                  },
                },
              }}
            />
          )}
        </div>
      </div>

      {/* Agent Areas and Permissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 mt-6">
        {/* Agent Area Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Agent Area</h3>
            <button
              onClick={handleSaveAreas}
              disabled={savingAreasPermissions || areasPermissionsLoading}
              className="px-4 py-2 rounded-lg text-white shadow-md bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 transition-transform hover:scale-[1.02] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {savingAreasPermissions ? (
                <span className="flex items-center gap-2">
                  <Spinner loadingTxt="Saving..." size="small" />
                  Saving...
                </span>
              ) : (
                "Update Areas"
              )}
            </button>
          </div>
          {areasPermissionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner loadingTxt="Loading areas..." size="small" />
            </div>
          ) : (
            <div className="space-y-2">
              {/* Add All Area */}
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    allAreas.length > 0 && 
                    allAreas.every(area => assignedAreas.some(id => Number(id) === Number(area.id)))
                  }
                  onChange={handleSelectAllAreas}
                  className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-900">Add All Area</span>
              </label>
              
              {/* Individual Areas */}
              {allAreas.map((area) => {
                const areaId = Number(area.id);
                // Normalize both sides for comparison
                const normalizedAssigned = assignedAreas.map(id => Number(id));
                const isChecked = normalizedAssigned.includes(areaId);
                return (
                  <label
                    key={area.id}
                    className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer ${
                      isChecked ? "bg-emerald-50" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleAreaToggle(areaId)}
                      className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className={`text-sm ${isChecked ? "text-emerald-900 font-medium" : "text-gray-700"}`}>
                      {area.areaName}
                    </span>
                  </label>
                );
              })}
              
              {allAreas.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No areas available</p>
              )}
            </div>
          )}
        </div>

        {/* Agent Permission Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Agent Permission</h3>
            <button
              onClick={handleSavePermissions}
              disabled={savingAreasPermissions || areasPermissionsLoading}
              className="px-4 py-2 rounded-lg text-white shadow-md bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 transition-transform hover:scale-[1.02] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {savingAreasPermissions ? (
                <span className="flex items-center gap-2">
                  <Spinner loadingTxt="Saving..." size="small" />
                  Saving...
                </span>
              ) : (
                "Update Permissions"
              )}
            </button>
          </div>
          {areasPermissionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner loadingTxt="Loading permissions..." size="small" />
            </div>
          ) : (
            <div className="space-y-2">
              {AGENT_PERMISSIONS.map((permission) => (
                <label
                  key={permission.code}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={agentPermissions.includes(permission.code)}
                    onChange={() => handlePermissionToggle(permission.code)}
                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">{permission.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toast Messages */}
      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ show: false, type: "success", message: "" })}
        />
      )}

      {/* Edit Agent Modal */}
      {showEditModal && currentAgent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Edit Agent</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  reset();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit(handleEditAgent)} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    {...register("name", { required: "Name is required" })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                      errors.name ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    {...register("email", { 
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                      errors.email ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    {...register("phone", { required: "Phone is required" })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                      errors.phone ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    {...register("status")}
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
                  onClick={() => {
                    setShowEditModal(false);
                    reset();
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
                    Update Agent
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

export default AgentDetail;
