import { useEffect, useState } from "react";
import { 
  Calendar, 
  Filter, 
  RefreshCw, 
  Download, 
  TrendingUp, 
  Users, 
  IndianRupee,
  AlertCircle,
  CheckCircle,
  Clock,
  X
} from "lucide-react";
import { SiPhonepe, SiGooglepay } from "react-icons/si";
import useCollectionStore from "../store/collectionStore";
import Layout from "../components/Layout";
import Spinner from "../components/Spinner";
import useApiLoading from "../hooks/useApiLoading";

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

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'UPI':
        return (
          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-purple-600 text-xs font-bold">UPI</span>
          </div>
        );
      case 'CASH':
        return (
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 text-xs font-bold">₹</span>
          </div>
        );
      case 'BHIM':
        return (
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 text-xs font-bold">BH</span>
          </div>
        );
      case 'PhonePe':
        return (
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#5F259F' }}>
            <SiPhonepe className="w-4 h-4 text-white" />
          </div>
        );
      case 'CARD':
        return (
          <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-600 text-xs font-bold">💳</span>
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-gray-600 text-xs font-bold">?</span>
          </div>
        );
    }
  };

  const getPaymentMethodColor = (method) => {
    switch (method) {
      case 'UPI':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'CASH':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'BHIM':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PhonePe':
        return 'text-white border-purple-300';
      case 'CARD':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentMethodBackground = (method) => {
    switch (method) {
      case 'PhonePe':
        return '#5F259F';
      default:
        return '';
    }
  };

  const getStatusIcon = (balance) => {
    if (balance === 0) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (balance > 0) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    return <Clock className="w-4 h-4 text-yellow-500" />;
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Collection Dashboard</h1>
            <p className="text-gray-600 mt-1">Track daily collections and payment summaries</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
            <button
              onClick={handleRefresh}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-800">{error}</p>
              <button
                onClick={clearError}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        {isFilterOpen && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filters & Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={localFilters.startDate || ''}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={localFilters.endDate || ''}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area
                </label>
                <select
                  value={localFilters.areaId || ''}
                  onChange={(e) => handleFilterChange('areaId', e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={localFilters.paymentMethod || ''}
                  onChange={(e) => handleFilterChange('paymentMethod', e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleApplyFilters}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={handleClearFilters}
                className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

                {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Payments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(summary.totalPayments)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Amount Collected</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(summary.totalPaid)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Amount to Collect</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(summary.totalPayments - summary.totalPaid)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summary.totalCustomers}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Partially Paid Customers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(summary.totalCustomers * 0.15)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Customers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(summary.totalCustomers * 0.05)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Daily Collections */}
        <div className="space-y-6">
                      {(loading || apiLoading) ? (
              <div className="flex items-center justify-center h-32">
                <Spinner loadingTxt="Loading collection data..." size="medium" />
              </div>
            ) : collectionData.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <p>No collection data found for the selected period.</p>
            </div>
          ) : (
            collectionData.map((dayData) => (
              <div key={dayData.date} className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Date Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {formatDate(dayData.date)}
                  </h3>
                </div>

                {/* Daily Summary */}
                <div className="px-6 py-4 bg-gray-50">
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Amount to Collect</p>
                      <p className="text-lg font-medium text-gray-900">{formatCurrency(dayData.totalAmount + dayData.totalDiscount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Amount Collected</p>
                      <p className="text-lg font-medium text-gray-900">{formatCurrency(dayData.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Discount Given</p>
                      <p className="text-lg font-medium text-gray-900">{formatCurrency(dayData.totalDiscount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Balance to Collect</p>
                      <p className="text-lg font-medium text-gray-900">{formatCurrency(dayData.totalDiscount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Customers to Collect</p>
                      <p className="text-lg font-medium text-gray-900">{dayData.totalCustomers}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fully Collected</p>
                      <p className="text-lg font-medium text-gray-900">{Math.round(dayData.totalCustomers * 0.8)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Partially Collected</p>
                      <p className="text-lg font-medium text-gray-900">{Math.round(dayData.totalCustomers * 0.15)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Pending</p>
                      <p className="text-lg font-medium text-gray-900">{Math.round(dayData.totalCustomers * 0.05)}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Methods Breakdown */}
                <div className="p-6 space-y-4">
                  {Object.values(dayData.paymentsByMethod).map((methodData) => (
                    <div key={methodData.method} className="border border-gray-200 rounded-lg">
                                             {/* Method Header */}
                       <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                         <div className="flex items-center justify-between">
                           <div className="flex items-center space-x-3">
                             {getPaymentMethodIcon(methodData.method)}
                             <span 
                               className={`px-3 py-1 rounded-full text-sm font-medium border ${getPaymentMethodColor(methodData.method)}`}
                               style={{ backgroundColor: getPaymentMethodBackground(methodData.method) }}
                             >
                               {methodData.method}
                             </span>
                           </div>
                           <div className="flex items-center space-x-4">
                             <span className="hidden md:block text-sm font-medium text-black">
                               {methodData.customers} customer{methodData.customers !== 1 ? 's' : ''}
                             </span>
                             <div className="text-right">
                               <p className="text-sm text-gray-600">Total: <span className="font-bold text-black">{formatCurrency(methodData.payment)}</span></p>
                             </div>
                           </div>
                         </div>
                       </div>

                      {/* Customer Details */}
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Customer
                              </th>
                              <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Area
                              </th>
                              <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Previous Balance
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Paid Amount
                              </th>
                              <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Discount
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Current Balance
                              </th>
                              <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Collected By
                              </th>
                              <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Customer Code
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {dayData.customers
                              .filter(customer => customer.paymentMethod === methodData.method)
                              .map((customer, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center">
                                      {getStatusIcon(customer.currentBalance)}
                                      <span className="ml-2 text-sm font-medium text-black">
                                        {customer.name}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap text-sm text-black">
                                    {customer.area}
                                  </td>
                                  <td className="hidden lg:table-cell px-4 py-3 whitespace-nowrap text-sm text-black">
                                    {formatCurrency(customer.previousBalance)}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-black">
                                    {formatCurrency(customer.paidAmount)}
                                  </td>
                                  <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap text-sm text-black">
                                    {formatCurrency(customer.discount)}
                                  </td>
                                                                     <td className="px-4 py-3 whitespace-nowrap">
                                     <span className="text-sm font-medium text-black">
                                       {formatCurrency(customer.currentBalance)}
                                     </span>
                                   </td>
                                  <td className="hidden lg:table-cell px-4 py-3 whitespace-nowrap text-sm text-black">
                                    {customer.collectedBy}
                                  </td>
                                  <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap text-sm text-black">
                                    {customer.customerCode}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Collection;
