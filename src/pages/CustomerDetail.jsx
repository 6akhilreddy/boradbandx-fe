import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import useCustomerStore from "../store/customerStore";
import Spinner from "../components/Spinner";
import useApiLoading from "../hooks/useApiLoading";
import AddPendingCharge from "../components/AddPendingCharge";
import { ArrowLeft, Edit, Phone, Mail, MapPin, Calendar, CreditCard, Wifi, HardDrive } from "lucide-react";

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showAddPendingCharge, setShowAddPendingCharge] = useState(false);
  const {
    currentCustomer,
    loading,
    error,
    fetchCustomerById,
    clearError,
    clearCurrentCustomer,
  } = useCustomerStore();
  const apiLoading = useApiLoading();

  useEffect(() => {
    if (id) {
      fetchCustomerById(id);
    }
    return () => {
      clearCurrentCustomer();
    };
  }, [id]);

  if (loading || apiLoading) {
    return (
      <Layout>
        <Spinner loadingTxt="Loading customer details..." size="medium" />
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

  if (!currentCustomer) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Customer not found</p>
        </div>
      </Layout>
    );
  }

  const getBalanceStatus = (balance) => {
    if (balance === 0) return { text: "Paid", class: "bg-green-100 text-green-800" };
    if (balance > 0) return { text: "Unpaid", class: "bg-red-100 text-red-800" };
    return { text: "Credit", class: "bg-blue-100 text-blue-800" };
  };

  const balanceStatus = getBalanceStatus(currentCustomer.latestInvoice?.balance || 0);

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/customers")}
            className="p-2 rounded-lg text-white shadow-md
                       bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500
                       hover:from-purple-600 hover:to-cyan-600
                       transition-transform hover:scale-[1.02] cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{currentCustomer.fullName}</h1>
            <p className="text-gray-500">Customer Code: {currentCustomer.customerCode}</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/customers/${id}/edit`)}
          className="w-full sm:w-auto px-4 py-2 rounded-lg text-white shadow-md
                     bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500
                     hover:from-purple-600 hover:to-cyan-600
                     transition-transform hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Edit Customer
        </button>
      </div>

      {/* Customer Details Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Customer Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-gray-900">{currentCustomer.fullName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Billing Name</label>
                <p className="text-gray-900">{currentCustomer.billingName || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-gray-900">{currentCustomer.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Secondary Phone</label>
                <p className="text-gray-900">{currentCustomer.phoneSecondary || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{currentCustomer.email || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">GST Number</label>
                <p className="text-gray-900">{currentCustomer.gstNumber || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Address Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Address</label>
                <p className="text-gray-900">{currentCustomer.address || "N/A"}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Area</label>
                  <p className="text-gray-900">{currentCustomer.area?.areaName || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Coordinates</label>
                  <p className="text-gray-900">
                    {currentCustomer.latitude && currentCustomer.longitude
                      ? `${currentCustomer.latitude}, ${currentCustomer.longitude}`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              Subscription Information
            </h2>
            {currentCustomer.Subscriptions && currentCustomer.Subscriptions.length > 0 ? (
              <div className="space-y-4">
                {currentCustomer.Subscriptions.map((subscription, index) => (
                  <div key={subscription.id} className="space-y-4">
                    {index > 0 && <hr className="border-gray-200" />}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Plan</label>
                        <p className="text-gray-900">{subscription.Plan?.name || "N/A"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Monthly Price</label>
                        <p className="text-gray-900">₹{subscription.agreedMonthlyPrice}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Billing Type</label>
                        <p className="text-gray-900">{subscription.billingType}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Billing Cycle</label>
                        <p className="text-gray-900">
                          {subscription.billingCycle} ({subscription.billingCycleValue})
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Status</label>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          subscription.status === "ACTIVE" 
                            ? "bg-green-100 text-green-800"
                            : subscription.status === "PAUSED"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {subscription.status}
                        </span>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Start Date</label>
                        <p className="text-gray-900">
                          {subscription.startDate 
                            ? new Date(subscription.startDate).toLocaleDateString()
                            : "N/A"
                          }
                        </p>
                      </div>
                    </div>
                    {subscription.Plan?.benefits && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Plan Benefits</label>
                        <p className="text-gray-900">{subscription.Plan.benefits}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No subscription found</p>
            )}
          </div>

          {/* Hardware Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              Hardware Information
            </h2>
            {currentCustomer.CustomerHardwares && currentCustomer.CustomerHardwares.length > 0 ? (
              <div className="space-y-4">
                {currentCustomer.CustomerHardwares.map((hardware, index) => (
                  <div key={hardware.id} className="space-y-4">
                    {index > 0 && <hr className="border-gray-200" />}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Device Type</label>
                        <p className="text-gray-900">{hardware.deviceType || "N/A"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">MAC Address</label>
                        <p className="text-gray-900 font-mono">{hardware.macAddress || "N/A"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">IP Address</label>
                        <p className="text-gray-900 font-mono">{hardware.ipAddress || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No hardware information found</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Billing Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Billing Status
            </h2>
            {currentCustomer.latestInvoice ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Current Balance</label>
                  <p className="text-2xl font-bold text-gray-900">₹{currentCustomer.latestInvoice.balance || 0}</p>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${balanceStatus.class}`}>
                    {balanceStatus.text}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Due Date</label>
                  <p className="text-gray-900">
                    {currentCustomer.latestInvoice.dueDate 
                      ? new Date(currentCustomer.latestInvoice.dueDate).toLocaleDateString()
                      : "N/A"
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Invoice Amount</label>
                  <p className="text-gray-900">₹{currentCustomer.latestInvoice.amountTotal}</p>
                </div>
                {currentCustomer.latestInvoice.lastPayment && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Payment</label>
                    <p className="text-gray-900">₹{currentCustomer.latestInvoice.lastPayment.amount}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(currentCustomer.latestInvoice.lastPayment.date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No billing information found</p>
            )}
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Additional Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Installation Date</label>
                <p className="text-gray-900">
                  {currentCustomer.installationDate 
                    ? new Date(currentCustomer.installationDate).toLocaleDateString()
                    : "N/A"
                  }
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Security Deposit</label>
                <p className="text-gray-900">₹{currentCustomer.securityDeposit || 0}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Advance Payment</label>
                <p className="text-gray-900">₹{currentCustomer.advance || 0}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  currentCustomer.isActive 
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {currentCustomer.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              {currentCustomer.remarks && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Remarks</label>
                  <p className="text-gray-900">{currentCustomer.remarks}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Pending Charge Modal */}
      {showAddPendingCharge && (
        <AddPendingCharge
          customerId={id}
          onSuccess={(newCharge) => {
            setShowAddPendingCharge(false);
            // Refresh the balance history
            // You might want to add a refresh function to the BalanceHistory component
          }}
          onCancel={() => setShowAddPendingCharge(false)}
        />
      )}
    </Layout>
  );
};

export default CustomerDetail;
