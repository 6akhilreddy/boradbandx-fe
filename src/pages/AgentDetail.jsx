import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import useAgentStore from "../store/agentStore";
import Spinner from "../components/Spinner";
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
} from "lucide-react";

const AgentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentAgent,
    loading,
    error,
    fetchAgentById,
    fetchAgentPaymentHistory,
    clearError,
  } = useAgentStore();

  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAgentById(id);
      fetchPaymentHistory(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPaymentHistory = async (agentId) => {
    setPaymentLoading(true);
    try {
      const response = await fetchAgentPaymentHistory(agentId);
      setPaymentHistory(response.payments || []);
    } catch (error) {
      console.error("Failed to fetch payment history:", error);
    } finally {
      setPaymentLoading(false);
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

  if (loading) {
    return (
      <Layout>
        <Spinner loadingTxt="Loading agent details..." />
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
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${badge.class}`}>
            {badge.text}
          </span>
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
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <IndianRupee className="w-5 h-5" />
            Payment Collection History
          </h2>
        </div>

        {paymentLoading ? (
          <div className="p-6">
            <Spinner loadingTxt="Loading payment history..." />
          </div>
        ) : paymentHistory.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <IndianRupee className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No payment history found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paymentHistory.map((payment) => {
                  const methodBadge = getPaymentMethodBadge(payment.paymentMethod);
                  return (
                    <tr key={payment.id} className="hover:bg-gray-50">
                                             <td className="px-6 py-4 whitespace-nowrap">
                         <div className="text-sm font-medium text-gray-900">
                           {payment.customer?.name || "Unknown Customer"}
                         </div>
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(Math.round(payment.amount))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${methodBadge.class}`}>
                          {methodBadge.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(payment.collectedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
        )}
      </div>
    </Layout>
  );
};

export default AgentDetail;
