import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, 
  User, 
  IndianRupee, 
  Calendar, 
  MessageSquare, 
  Send,
  X,
  ChevronDown,
  Clock,
  Filter
} from 'lucide-react';
import { searchCustomers, getCustomerPaymentDetails, recordPayment } from '../api/paymentApi';
import { getAreas } from '../api/reportApi';
import useApiLoading from '../hooks/useApiLoading';
import Spinner from '../components/Spinner';
import Layout from '../components/Layout';

const Payments = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const loading = useApiLoading();
  
  // State for customer search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [customers, setCustomers] = useState([]);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  
  // State for selected customer
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  
  // State for payment form
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    discount: 0,
    method: 'CASH',
    comments: ''
  });
  
  // State for areas
  const [areas, setAreas] = useState([]);
  
  // State for success alert
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  
  // Check if customer is pre-selected from URL
  const preSelectedCustomerId = searchParams.get('customerId');

  useEffect(() => {
    loadAreas();
    if (preSelectedCustomerId) {
      loadCustomerDetails(preSelectedCustomerId);
    }
  }, [preSelectedCustomerId]);

  const loadAreas = async () => {
    try {
      const response = await getAreas();
      setAreas(response.data);
    } catch (error) {
      console.error('Failed to load areas:', error);
    }
  };

  const loadCustomerDetails = async (customerId) => {
    try {
      const response = await getCustomerPaymentDetails(customerId);
      setCustomerDetails(response.data);
      setSelectedCustomer(response.data.customer);
    } catch (error) {
      console.error('Failed to load customer details:', error);
    }
  };

  const searchCustomersHandler = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const params = { query: searchQuery };
      if (selectedArea) params.areaId = selectedArea;
      
      const response = await searchCustomers(params);
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to search customers:', error);
    }
  };

  const selectCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerSearch(false);
    setSearchQuery('');
    setSelectedArea('');
    setCustomers([]);
    await loadCustomerDetails(customer.id);
  };

  const handlePaymentFormChange = (field, value) => {
    setPaymentForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateTotalPayment = () => {
    return (parseFloat(paymentForm.amount) || 0) + (parseFloat(paymentForm.discount) || 0);
  };

  const calculateNewBalance = () => {
    if (!customerDetails) return 0;
    const currentBalance = customerDetails.balanceAmount;
    const totalPayment = calculateTotalPayment();
    return Math.max(0, currentBalance - totalPayment);
  };

  const handleRecordPayment = async () => {
    if (!selectedCustomer || !paymentForm.amount) {
      alert('Please select a customer and enter payment amount');
      return;
    }

    try {
      const paymentData = {
        customerId: selectedCustomer.id,
        amount: paymentForm.amount,
        discount: paymentForm.discount,
        method: paymentForm.method,
        comments: paymentForm.comments
      };

      await recordPayment(paymentData);
      
      // Reset form and reload customer details
      setPaymentForm({
        amount: 0,
        discount: 0,
        method: 'CASH',
        comments: ''
      });
      
      await loadCustomerDetails(selectedCustomer.id);
      
      // Show success alert
      setShowSuccessAlert(true);
      
      // Auto-hide alert after 5 seconds
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 5000);
      
    } catch (error) {
      console.error('Failed to record payment:', error);
      alert('Failed to record payment. Please try again.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-600 mt-2">Record payments and manage customer collections</p>
          </div>

          {/* Success Alert */}
          {showSuccessAlert && (
            <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Payment recorded successfully!</span>
              </div>
              <button 
                onClick={() => setShowSuccessAlert(false)}
                className="text-green-700 hover:text-green-900 text-lg font-bold"
              >
                ×
              </button>
            </div>
          )}

          {/* Customer Selection - Full Width */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Customer</h3>
              <button
                onClick={() => setShowCustomerSearch(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Search className="w-4 h-4" />
                Select Customer
              </button>
            </div>

            {selectedCustomer ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-blue-900">{selectedCustomer.fullName}</p>
                    <p className="text-sm text-blue-700">{selectedCustomer.customerCode} • {selectedCustomer.phone}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCustomer(null);
                      setCustomerDetails(null);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Select a customer to record payment</p>
                <button
                  onClick={() => setShowCustomerSearch(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Select Customer
                </button>
              </div>
            )}
          </div>

          {/* Two Column Layout - Only show when customer is selected */}
          {selectedCustomer && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Account Summary */}
              <div className="space-y-4">
                {customerDetails ? (
                  <>
                    {/* Balance Amount Card */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Balance Amount</h3>
                          <p className="text-2xl font-bold text-gray-900 mt-1">
                            {formatCurrency(customerDetails.balanceAmount)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Till Date: {formatDate(new Date())}
                          </p>
                        </div>
                        <button className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          edits
                        </button>
                      </div>
                    </div>

                    {/* Last Bill Amount Card */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                      <h3 className="text-sm font-medium text-gray-500">Last Bill Amount</h3>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {formatCurrency(customerDetails.lastBillAmount)}
                      </p>
                    </div>

                    {/* Last Payment Card */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                      <h3 className="text-sm font-medium text-gray-500">Last Payment</h3>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {formatCurrency(customerDetails.lastPayment?.amount || 0)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Collected on: {formatDate(customerDetails.lastPayment?.date)}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
                    <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Loading customer details...</p>
                  </div>
                )}
              </div>

              {/* Right Column - Payment Form */}
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Record Payment</h3>
                  
                  <div className="space-y-4">
                    {/* Paid Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Paid Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          ₹
                        </span>
                        <input
                          type="number"
                          value={paymentForm.amount}
                          onChange={(e) => handlePaymentFormChange('amount', e.target.value)}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Discount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          ₹
                        </span>
                        <input
                          type="number"
                          value={paymentForm.discount}
                          onChange={(e) => handlePaymentFormChange('discount', e.target.value)}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Discount"
                        />
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mode
                      </label>
                      <div className="relative">
                        <select
                          value={paymentForm.method}
                          onChange={(e) => handlePaymentFormChange('method', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        >
                          <option value="CASH">CASH</option>
                          <option value="CARD">CARD</option>
                          <option value="UPI">UPI</option>
                          <option value="BANK_TRANSFER">BANK TRANSFER</option>
                          <option value="CHEQUE">CHEQUE</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                      </div>
                    </div>

                    {/* Record Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Record Time
                      </label>
                      <div className="relative">
                        <input
                          type="datetime-local"
                          value={new Date().toISOString().slice(0, 16)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          readOnly
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      </div>
                    </div>

                    {/* Comments */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comment
                      </label>
                      <textarea
                        value={paymentForm.comments}
                        onChange={(e) => handlePaymentFormChange('comments', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Add any additional notes..."
                      />
                    </div>

                    {/* Summary */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Payment:</span>
                        <span className="text-sm font-medium text-gray-900 bg-gray-200 px-2 py-1 rounded">
                          {formatCurrency(calculateTotalPayment())}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">New Balance:</span>
                        <span className="text-sm font-medium text-gray-900 bg-gray-200 px-2 py-1 rounded">
                          {formatCurrency(calculateNewBalance())}
                        </span>
                      </div>
                    </div>

                    {/* Record Button */}
                    <button
                      onClick={handleRecordPayment}
                      disabled={loading || !paymentForm.amount}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <Spinner size="sm" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Record
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Customer Search Modal */}
        {showCustomerSearch && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Select Customer
                </h3>
                <button
                  onClick={() => {
                    setShowCustomerSearch(false);
                    setSearchQuery('');
                    setSelectedArea('');
                    setCustomers([]);
                  }}
                  className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                {/* Search Input */}
                <div className="mb-6">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search by customer name or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && searchCustomersHandler()}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={searchCustomersHandler}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:via-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer flex items-center gap-2"
                    >
                      <Search className="w-4 h-4 md:hidden" />
                      <span className="hidden md:inline">Search</span>
                    </button>
                  </div>
                </div>

                {/* Area Filter */}
                <div className="mb-6">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <select
                        value={selectedArea}
                        onChange={(e) => setSelectedArea(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Areas</option>
                        {areas.map((area) => (
                          <option key={area.id} value={area.id}>
                            {area.areaName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Search Results */}
                <div className="max-h-96 overflow-y-auto">
                  {customers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {searchQuery ? 'No customers found. Try a different search term.' : 'Enter a search term to find customers.'}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {customers.map((customer) => (
                        <div
                          key={customer.id}
                          onClick={() => selectCustomer(customer)}
                          className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-bold text-gray-900">{customer.fullName}</div>
                              <div className="text-sm text-gray-600">
                                Code: {customer.customerCode} | Phone: {customer.phone}
                              </div>
                              <div className="text-sm text-gray-500">{customer.areaName || 'No area assigned'}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">₹{customer.balanceAmount || 0}</div>
                              <div className="text-xs text-gray-500">Balance</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Payments;
