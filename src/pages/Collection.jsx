import { useEffect, useState } from "react";
import { 
  Filter, 
  RefreshCw, 
  Download,
  AlertCircle,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useCollectionStore from "../store/collectionStore";
import Layout from "../components/Layout";
import Spinner from "../components/Spinner";
import useApiLoading from "../hooks/useApiLoading";
import DatePicker from "../components/DatePicker";

const Collection = () => {
  const {
    collectionData,
    summary,
    areas,
    loading,
    error,
    filters,
    setFilters,
    resetFilters,
    fetchAllCollectionData,
    fetchAreas,
    clearError
  } = useCollectionStore();
  const apiLoading = useApiLoading();
  const navigate = useNavigate();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    startDate: null,
    endDate: null,
    areaId: null,
    paymentMethod: null,
  });

  // Initialize with current month
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const initialFilters = {
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0]
    };
    
    setFilters(initialFilters);
    setLocalFilters(initialFilters);
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    if (filters.startDate && filters.endDate) {
      fetchAllCollectionData();
    }
  }, [filters]);

  // Fetch areas on component mount
  useEffect(() => {
    fetchAreas();
  }, []);

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setFilters(localFilters);
  };

  const handleClearFilters = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const resetFilters = {
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0],
      areaId: null,
      paymentMethod: null,
    };
    
    setLocalFilters(resetFilters);
    setFilters(resetFilters);
  };

  const handleRefresh = () => {
    fetchAllCollectionData();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.round(amount || 0));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Process data to group by area for payment details
  const getAreaPaymentDetails = (dayData) => {
    const areaGroups = {};
    
    dayData.customers.forEach(customer => {
      const areaName = customer.area || 'Unknown Area';
      if (!areaGroups[areaName]) {
        areaGroups[areaName] = {};
      }
      
      const method = customer.paymentMethod || 'UNKNOWN';
      if (!areaGroups[areaName][method]) {
        areaGroups[areaName][method] = {
          method,
          customers: 0,
          amount: 0,
          discount: 0,
          payment: 0
        };
      }
      
      areaGroups[areaName][method].customers++;
      areaGroups[areaName][method].amount += customer.paidAmount || 0;
      areaGroups[areaName][method].discount += customer.discount || 0;
      areaGroups[areaName][method].payment += (customer.paidAmount || 0) + (customer.discount || 0);
    });
    
    return areaGroups;
  };

  const handleCustomerClick = (customerId) => {
    navigate(`/customers/${customerId}`);
  };

  if ((loading || apiLoading) && !collectionData.length) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Spinner loadingTxt="Loading collection data..." size="large" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Collection Dashboard</h1>
            <p className="text-xs text-gray-600 mt-1">Track daily collections and payment summaries</p>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center px-3 py-1.5 text-xs bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-3 h-3 mr-1.5" />
              Filters
            </button>
            <button
              onClick={handleRefresh}
              className="flex items-center px-3 py-1.5 text-xs bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-3 h-3 mr-1.5" />
              Refresh
            </button>
            <button className="flex items-center px-3 py-1.5 text-xs bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 transition-colors">
              <Download className="w-3 h-3 mr-1.5" />
              Export
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-red-400 mr-2" />
              <p className="text-xs text-red-800">{error}</p>
              <button
                onClick={clearError}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        {isFilterOpen && (
          <div className="bg-white rounded shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Filters & Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <DatePicker
                  value={localFilters.startDate || ''}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <DatePicker
                  value={localFilters.endDate || ''}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Area
                </label>
                <select
                  value={localFilters.areaId || ''}
                  onChange={(e) => handleFilterChange('areaId', e.target.value || null)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Areas</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.areaName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={localFilters.paymentMethod || ''}
                  onChange={(e) => handleFilterChange('paymentMethod', e.target.value || null)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Methods</option>
                  <option value="UPI">UPI</option>
                  <option value="CASH">Cash</option>
                  <option value="BHIM">BHIM</option>
                  <option value="PhonePe">PhonePe</option>
                  <option value="CARD">Card</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={handleApplyFilters}
                className="w-full sm:w-auto px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={handleClearFilters}
                className="w-full sm:w-auto px-3 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Daily Collections */}
        <div className="space-y-4">
          {(loading || apiLoading) ? (
            <div className="flex items-center justify-center h-32">
              <Spinner loadingTxt="Loading collection data..." size="medium" />
            </div>
          ) : collectionData.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <p className="text-xs">No collection data found for the selected period.</p>
            </div>
          ) : (
            collectionData.map((dayData) => {
              const areaPaymentDetails = getAreaPaymentDetails(dayData);
              const totalCustomers = dayData.totalCustomers || dayData.customers.length;
              const totalAmount = dayData.customers.reduce((sum, c) => sum + (c.paidAmount || 0), 0);
              const totalDiscount = dayData.customers.reduce((sum, c) => sum + (c.discount || 0), 0);
              const totalPayment = totalAmount + totalDiscount;

              return (
                <div key={dayData.date} className="bg-white rounded shadow-sm border border-gray-200">
                  {/* Date Header */}
                  <div className="px-4 py-2 bg-blue-600 text-white">
                    <h3 className="text-sm font-semibold text-center">
                      {formatDate(dayData.date)}
                    </h3>
                  </div>

                  {/* Layout: 2 rows */}
                  <div className="p-4 flex flex-col">
                    {/* Row 1: Summary Table */}
                    <div className="mb-2">
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left font-medium text-gray-700 border border-gray-200">Customer</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-700 border border-gray-200">Amount</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-700 border border-gray-200">Discount</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-700 border border-gray-200">Total Payment</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white">
                            <tr>
                              <td className="px-3 py-2 border border-gray-200">{totalCustomers}</td>
                              <td className="px-3 py-2 border border-gray-200">{formatCurrency(totalAmount)}</td>
                              <td className="px-3 py-2 border border-gray-200">{formatCurrency(totalDiscount)}</td>
                              <td className="px-3 py-2 border border-gray-200">{formatCurrency(totalPayment)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Row 2: Two Columns */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Column 1: Area Cards */}
                      <div className="col-span-1 space-y-3">
                        {Object.entries(areaPaymentDetails).map(([areaName, methods]) => {
                          const areaTotalCustomers = Object.values(methods).reduce((sum, m) => sum + m.customers, 0);
                          const areaTotalAmount = Object.values(methods).reduce((sum, m) => sum + m.amount, 0);
                          const areaTotalDiscount = Object.values(methods).reduce((sum, m) => sum + m.discount, 0);
                          const areaTotalPayment = Object.values(methods).reduce((sum, m) => sum + m.payment, 0);

                          return (
                            <div key={areaName} className="bg-white border border-gray-200 rounded shadow-sm">
                              <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                                <h4 className="text-xs font-medium text-gray-700">{areaName} Area Payment Details</h4>
                              </div>
                              <div className="p-3">
                                <div className="overflow-x-auto">
                                  <table className="min-w-full text-xs">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="px-2 py-1.5 text-left font-medium text-gray-700 border border-gray-200">Mode</th>
                                        <th className="px-2 py-1.5 text-left font-medium text-gray-700 border border-gray-200">Customer</th>
                                        <th className="px-2 py-1.5 text-left font-medium text-gray-700 border border-gray-200">Amount</th>
                                        <th className="px-2 py-1.5 text-left font-medium text-gray-700 border border-gray-200">Discount</th>
                                        <th className="px-2 py-1.5 text-left font-medium text-gray-700 border border-gray-200">Payment</th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                      {Object.values(methods).map((methodData, idx) => (
                                        <tr key={idx}>
                                          <td className="px-2 py-1.5 border border-gray-200">{methodData.method}</td>
                                          <td className="px-2 py-1.5 border border-gray-200">{methodData.customers}</td>
                                          <td className="px-2 py-1.5 border border-gray-200">{formatCurrency(methodData.amount)}</td>
                                          <td className="px-2 py-1.5 border border-gray-200">{formatCurrency(methodData.discount)}</td>
                                          <td className="px-2 py-1.5 border border-gray-200">{formatCurrency(methodData.payment)}</td>
                                        </tr>
                                      ))}
                                      <tr className="bg-gray-50 font-medium">
                                        <td className="px-2 py-1.5 border border-gray-200">Area Total</td>
                                        <td className="px-2 py-1.5 border border-gray-200">{areaTotalCustomers}</td>
                                        <td className="px-2 py-1.5 border border-gray-200">{formatCurrency(areaTotalAmount)}</td>
                                        <td className="px-2 py-1.5 border border-gray-200">{formatCurrency(areaTotalDiscount)}</td>
                                        <td className="px-2 py-1.5 border border-gray-200">{formatCurrency(areaTotalPayment)}</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Column 2: Customer Details Table Card */}
                      <div className="col-span-1">
                        <div className="bg-white border border-gray-200 rounded shadow-sm h-full flex flex-col">
                          <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                            <h4 className="text-xs font-medium text-gray-700">Customer Details</h4>
                          </div>
                          <div className="p-3 flex-1 overflow-auto">
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-xs">
                                <thead className="bg-gray-50 sticky top-0">
                                  <tr>
                                    <th className="px-2 py-1.5 text-left font-medium text-gray-700 border border-gray-200">Name</th>
                                    <th className="px-2 py-1.5 text-left font-medium text-gray-700 border border-gray-200">Area</th>
                                    <th className="px-2 py-1.5 text-left font-medium text-gray-700 border border-gray-200">Previous Balance</th>
                                    <th className="px-2 py-1.5 text-left font-medium text-gray-700 border border-gray-200">Paid Amount</th>
                                    <th className="px-2 py-1.5 text-left font-medium text-gray-700 border border-gray-200">Discount</th>
                                    <th className="px-2 py-1.5 text-left font-medium text-gray-700 border border-gray-200">Current Balance</th>
                                    <th className="px-2 py-1.5 text-left font-medium text-gray-700 border border-gray-200">Collected By</th>
                                    <th className="px-2 py-1.5 text-left font-medium text-gray-700 border border-gray-200">Customer Code</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white">
                                  {dayData.customers.map((customer, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                      <td className="px-2 py-1.5 border border-gray-200">
                                        <button
                                          onClick={() => handleCustomerClick(customer.id)}
                                          className="text-blue-600 hover:text-blue-800 hover:underline text-xs"
                                        >
                                          {customer.name}
                                        </button>
                                      </td>
                                      <td className="px-2 py-1.5 border border-gray-200 text-xs">{customer.area}</td>
                                      <td className="px-2 py-1.5 border border-gray-200 text-xs">{formatCurrency(customer.previousBalance)}</td>
                                      <td className="px-2 py-1.5 border border-gray-200 text-xs">{formatCurrency(customer.paidAmount)}</td>
                                      <td className="px-2 py-1.5 border border-gray-200 text-xs">{formatCurrency(customer.discount)}</td>
                                      <td className={`px-2 py-1.5 border border-gray-200 text-xs ${customer.currentBalance > 0 ? 'text-red-600' : ''}`}>
                                        {formatCurrency(customer.currentBalance)}
                                      </td>
                                      <td className="px-2 py-1.5 border border-gray-200 text-xs">{customer.collectedBy}</td>
                                      <td className="px-2 py-1.5 border border-gray-200 text-xs">{customer.customerCode}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Collection;
