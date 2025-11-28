import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  FileText, 
  CreditCard, 
  User, 
  Search, 
  Download, 
  Eye,
  X,
  Calendar,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Users,
  Trash2,
  Receipt,
  Banknote,
  HandCoins
} from 'lucide-react';
import { getInvoiceHistory, getPaymentHistory, getUserHistory, getAreas } from '../api/reportApi';
import { searchCustomers } from '../api/paymentApi';
import { getCompanyById } from '../api/companyApi';
import useApiLoading from '../hooks/useApiLoading';
import Spinner from '../components/Spinner';
import Layout from '../components/Layout';
import useUserStore from '../store/userStore';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import DatePicker from '../components/DatePicker';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useUserStore();
  const apiLoading = useApiLoading();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('invoices');
  
  // State for invoice filters
  const [invoiceFilters, setInvoiceFilters] = useState({
    dateRange: {
      start: new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1).toISOString().split('T')[0], // 3 months ago
      end: new Date().toISOString().split('T')[0] // Today
    },
    searchQuery: '',
    status: '' // Add status filter
  });

  // State for payment filters
  const [paymentFilters, setPaymentFilters] = useState({
    dateRange: {
      start: new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1).toISOString().split('T')[0], // 3 months ago
      end: new Date().toISOString().split('T')[0] // Today
    },
    searchQuery: '',
    method: ''
  });

  // State for data
  const [invoiceData, setInvoiceData] = useState({ invoices: [], pagination: {} });
  const [paymentData, setPaymentData] = useState({ payments: [], pagination: {} });
  const [userHistoryData, setUserHistoryData] = useState(null);
  const [areas, setAreas] = useState([]);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [companyData, setCompanyData] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(false);

  // State for PDF preview
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPaymentPdfPreview, setShowPaymentPdfPreview] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // State for user search
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [userHistoryLoading, setUserHistoryLoading] = useState(false);

  useEffect(() => {
    console.log('Reports component mounted. Auth state:', { 
      isAuthenticated: isAuthenticated(), 
      user: user 
    });
    
    // Check for URL parameters
    const tabParam = searchParams.get('tab');
    const customerIdParam = searchParams.get('customerId');
    const customerNameParam = searchParams.get('customerName');
    const customerCodeParam = searchParams.get('customerCode');
    const customerPhoneParam = searchParams.get('customerPhone');
    const customerAreaParam = searchParams.get('customerArea');
    
    if (tabParam) {
      setActiveTab(tabParam);
    }
    
    if (isAuthenticated()) {
      loadAreas();
      loadCompanyData();
      
      // If customerId is provided in URL, auto-select the user
      if (customerIdParam && customerNameParam) {
        const customer = {
          id: parseInt(customerIdParam),
          fullName: decodeURIComponent(customerNameParam),
          customerCode: customerCodeParam ? decodeURIComponent(customerCodeParam) : '',
          phone: customerPhoneParam ? decodeURIComponent(customerPhoneParam) : '',
          areaName: customerAreaParam ? decodeURIComponent(customerAreaParam) : ''
        };
        setSelectedCustomer(customer);
        // Load user history for the selected customer
        loadUserHistoryForCustomer(customer);
      } else if (activeTab === 'invoices') {
        loadInvoiceData();
      }
    } else {
      console.log('User not authenticated, redirecting to login...');
      // Redirect to login if not authenticated
      window.location.href = '/login';
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'invoices') {
      loadInvoiceData();
    } else if (activeTab === 'payments') {
      loadPaymentData();
    }
  }, [activeTab, invoiceFilters.dateRange.start, invoiceFilters.dateRange.end, invoiceFilters.searchQuery, invoiceFilters.status, paymentFilters.dateRange.start, paymentFilters.dateRange.end, paymentFilters.searchQuery, paymentFilters.method]);

  // Reload company data when user changes
  useEffect(() => {
    if (isAuthenticated()) {
      loadCompanyData();
    }
  }, [user]);

  const loadAreas = async () => {
    try {
      const response = await getAreas();
      setAreas(response.data);
    } catch (error) {
      console.error('Failed to load areas:', error);
    }
  };

  const loadCompanyData = async () => {
    try {
      setCompanyLoading(true);
      const { getCompanyId } = useUserStore.getState();
      const companyId = getCompanyId();
      console.log('Loading company data for companyId:', companyId);
      if (companyId) {
        const response = await getCompanyById(companyId);
        console.log('Company data response:', response);
        setCompanyData(response.data);
      } else {
        console.log('No company ID found in user store');
      }
    } catch (error) {
      console.error('Failed to load company data:', error);
    } finally {
      setCompanyLoading(false);
    }
  };

  const loadInvoiceData = async () => {
    if (!isAuthenticated()) {
      console.log('User not authenticated, skipping API call');
      setError('Please log in to view reports.');
      return;
    }
    
    try {
      console.log('Loading invoice data...');
      setLoading(true);
      setError(null);
      
      const params = {
        startDate: invoiceFilters.dateRange.start,
        endDate: invoiceFilters.dateRange.end,
        search: invoiceFilters.searchQuery,
        status: invoiceFilters.status,
        page: invoiceFilters.page || 1,
        limit: 20
      };

      // If no data found, try without date filters to see if there are any invoices
      if (invoiceFilters.dateRange.start && invoiceFilters.dateRange.end) {
        console.log('Trying with date filters first...');
      }
      
      console.log('API params:', params);
      console.log('API params stringified:', JSON.stringify(params, null, 2));
      const response = await getInvoiceHistory(params);
      console.log('API response:', response);
      console.log('API response data:', response.data);
      
      // If no invoices found and we have date filters, try without date filters
      if ((!response.data?.invoices || response.data.invoices.length === 0) && 
          (invoiceFilters.dateRange.start || invoiceFilters.dateRange.end)) {
        console.log('No invoices found with date filters, trying without date filters...');
        const fallbackParams = {
          search: invoiceFilters.searchQuery,
          status: invoiceFilters.status,
          page: 1,
          limit: 20
        };
        console.log('Fallback params:', fallbackParams);
        const fallbackResponse = await getInvoiceHistory(fallbackParams);
        console.log('Fallback response:', fallbackResponse);
        setInvoiceData(fallbackResponse.data || { invoices: [], pagination: {} });
      } else {
        setInvoiceData(response.data || { invoices: [], pagination: {} });
      }
    } catch (error) {
      console.error('Failed to load invoice data:', error);
      setError('Failed to load invoice data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        startDate: paymentFilters.dateRange.start,
        endDate: paymentFilters.dateRange.end,
        search: paymentFilters.searchQuery,
        method: paymentFilters.method,
        page: paymentFilters.page || 1,
        limit: 20
      };
      
      const response = await getPaymentHistory(params);
      setPaymentData(response.data || { payments: [], pagination: {} });
    } catch (error) {
      console.error('Failed to load payment data:', error);
      setError('Failed to load payment data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const searchCustomersHandler = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const response = await searchCustomers({ query: searchQuery });
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to search customers:', error);
    }
  };

  const loadUserHistoryForCustomer = async (customer) => {
    try {
      setUserHistoryLoading(true);
      const response = await getUserHistory(customer.id, {
        startDate: invoiceFilters.dateRange.start,
        endDate: invoiceFilters.dateRange.end
      });
      setUserHistoryData(response.data);
    } catch (error) {
      console.error('Failed to load user history:', error);
    } finally {
      setUserHistoryLoading(false);
    }
  };

  const selectCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setShowUserSearch(false);
    setSearchQuery('');
    
    try {
      setUserHistoryLoading(true);
      const response = await getUserHistory(customer.id, {
        startDate: invoiceFilters.dateRange.start,
        endDate: invoiceFilters.dateRange.end
      });
      setUserHistoryData(response.data);
    } catch (error) {
      console.error('Failed to load user history:', error);
    } finally {
      setUserHistoryLoading(false);
    }
  };

  const handleInvoiceFilterChange = (field, value) => {
    setInvoiceFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateRangeChange = (field, value) => {
    setInvoiceFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value
      }
    }));
  };

  const handlePaymentDateRangeChange = (field, value) => {
    setPaymentFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value
      }
    }));
  };

  const handlePaymentFilterChange = (field, value) => {
    setPaymentFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePageChange = (page) => {
    if (activeTab === 'invoices') {
      setInvoiceFilters(prev => ({ ...prev, page }));
      // Reload data with new page
      setTimeout(() => loadInvoiceData(), 0);
    } else if (activeTab === 'payments') {
      setPaymentFilters(prev => ({ ...prev, page }));
      // Reload data with new page
      setTimeout(() => loadPaymentData(), 0);
    }
  };

  const formatCurrency = (amount) => {
    console.log('formatCurrency called with amount:', amount, 'type:', typeof amount);
    const numAmount = parseFloat(amount) || 0;
    console.log('Parsed amount:', numAmount);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(numAmount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      case 'PARTIALLY_PAID': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const generatePDF = async (invoice) => {
    console.log('Generating PDF for invoice:', invoice);
    console.log('Company data when generating PDF:', companyData);
    console.log('Invoice amounts:', {
      amountDue: invoice.amountDue,
      amountTotal: invoice.amountTotal,
      taxAmount: invoice.taxAmount,
      totalPaid: invoice.totalPaid,
      balance: invoice.balance,
      discounts: invoice.discounts
    });
    setSelectedInvoice(invoice);
    setShowPdfPreview(true);
  };

  const generatePaymentPDF = async (payment) => {
    setSelectedPayment(payment);
    setShowPaymentPdfPreview(true);
  };

  const downloadPDF = async () => {
    if (!selectedInvoice) return;

    const pdfContent = document.getElementById('pdf-content');
    if (!pdfContent) return;

    try {
      const canvas = await html2canvas(pdfContent, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Invoice-${selectedInvoice.id}.pdf`);
      setShowPdfPreview(false);
      setSelectedInvoice(null);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const downloadPaymentPDF = async () => {
    if (!selectedPayment) return;

    const pdfContent = document.getElementById('payment-pdf-content');
    if (!pdfContent) return;

    try {
      const canvas = await html2canvas(pdfContent, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Payment-${selectedPayment.id}.pdf`);
      setShowPaymentPdfPreview(false);
      setSelectedPayment(null);
    } catch (error) {
      console.error('Error generating payment PDF:', error);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-full mx-auto">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600 mt-2">View detailed reports and analytics</p>
          </div>

          {/* Tabs */}
          <div className="bg-white border-b border-gray-200">
            <div className="px-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => {
                    setActiveTab('invoices');
                    // Clear URL parameters when switching away from user tab
                    if (activeTab === 'user') {
                      setSearchParams({});
                    }
                  }}
                  className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                    activeTab === 'invoices'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FileText className="w-4 h-4 inline mr-2" />
                  Invoice
                </button>
                <button
                  onClick={() => {
                    setActiveTab('payments');
                    // Clear URL parameters when switching away from user tab
                    if (activeTab === 'user') {
                      setSearchParams({});
                    }
                  }}
                  className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                    activeTab === 'payments'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <CreditCard className="w-4 h-4 inline mr-2" />
                  Payment
                </button>
                <button
                  onClick={() => setActiveTab('user')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                    activeTab === 'user'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <User className="w-4 h-4 inline mr-2" />
                  User
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'invoices' && (
              <>
                {/* Search & Filters */}
                <div className="bg-white p-4 rounded-xl shadow mb-4">
                  <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-4">
                    {/* Search */}
                    <div className="w-full sm:flex-1 sm:max-w-md">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-700">Search Customer</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder="Search by customer name..."
                            value={invoiceFilters.searchQuery}
                            onChange={(e) => handleInvoiceFilterChange('searchQuery', e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Date Range */}
                    <div className="w-full sm:w-auto">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex flex-col gap-1 w-full sm:w-auto">
                          <label className="text-xs font-medium text-gray-700">Start Date</label>
                          <DatePicker
                            value={invoiceFilters.dateRange.start}
                            onChange={(e) => handleDateRangeChange('start', e.target.value)}
                            className="text-sm w-full sm:w-auto"
                          />
                        </div>
                        <div className="flex flex-col gap-1 w-full sm:w-auto">
                          <label className="text-xs font-medium text-gray-700">End Date</label>
                          <DatePicker
                            value={invoiceFilters.dateRange.end}
                            onChange={(e) => handleDateRangeChange('end', e.target.value)}
                            className="text-sm w-full sm:w-auto"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Status Filter */}
                    <div className="w-full sm:w-auto">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-700">Invoice Status</label>
                        <select
                          value={invoiceFilters.status}
                          onChange={(e) => handleInvoiceFilterChange('status', e.target.value)}
                          className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">All Status</option>
                          <option value="PENDING">Pending</option>
                          <option value="PAID">Paid</option>
                          <option value="PARTIALLY_PAID">Partially Paid</option>
                          <option value="OVERDUE">Overdue</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
                      ×
                    </button>
                  </div>
                )}

                {/* Data */}
                                  {(loading || apiLoading) ? (
                    <Spinner loadingTxt="Loading invoices..." size="large" />
                  ) : (
                  <>
                    {/* Desktop Table Layout */}
                    <div className="hidden lg:block">
                      {/* Desktop Header Row */}
                      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-3">
                        <div className="overflow-x-auto max-w-full">
                          <div className="grid grid-cols-8 gap-4 px-6 py-4 bg-gray-50 w-full min-w-[1100px]">
                            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">CUSTOMER</div>
                            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">INVOICE NO</div>
                            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">STATUS</div>
                            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider col-span-2">PERIOD</div>
                            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">DUE DATE</div>
                            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">TOTAL AMOUNT</div>
                            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">ACTIONS</div>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Data Rows */}
                      <div className="space-y-3 w-full">
                        {invoiceData.invoices?.length === 0 ? (
                          <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
                            No invoices found
                          </div>
                        ) : (
                          invoiceData.invoices?.map((invoice) => (
                            <div
                              key={invoice.id}
                              className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow duration-200"
                            >
                              <div className="grid grid-cols-8 gap-4 items-center w-full min-w-[1100px]">
                                {/* CUSTOMER */}
                                <div className="flex items-center min-w-0">
                                  <div className="min-w-0 w-full">
                                    <div className="text-sm font-semibold text-gray-900 truncate">{invoice.customer.name}</div>
                                    <div className="text-xs text-gray-500 truncate">{invoice.customer.phone || 'N/A'}</div>
                                  </div>
                                </div>

                                {/* INVOICE NO */}
                                <div className="flex items-center min-w-0">
                                  <div className="font-medium text-gray-900 truncate w-full">{invoice.id}</div>
                                </div>

                                {/* STATUS */}
                                <div className="flex items-center min-w-0">
                                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)} truncate text-center`}>
                                    {invoice.status}
                                  </span>
                                </div>

                                {/* PERIOD */}
                                <div className="flex items-center min-w-0 col-span-2">
                                  <div className="text-sm text-gray-700 truncate w-full">
                                    {invoice.periodStart && invoice.periodEnd ? 
                                      `${formatDateForDisplay(invoice.periodStart)} to ${formatDateForDisplay(invoice.periodEnd)}` : 
                                      'N/A'
                                    }
                                  </div>
                                </div>

                                {/* DUE DATE */}
                                <div className="flex items-center min-w-0">
                                  <div className="text-sm text-gray-700 truncate w-full">
                                    {invoice.dueDate ? formatDateForDisplay(invoice.dueDate) : 'N/A'}
                                  </div>
                                </div>

                                {/* TOTAL AMOUNT */}
                                <div className="flex items-center min-w-0">
                                  <div className="font-medium text-gray-900 truncate w-full">₹{Math.round(parseFloat(invoice.amountTotal) || 0)}</div>
                                </div>

                                {/* ACTIONS */}
                                <div className="flex items-center justify-end min-w-0">
                                  <button
                                    onClick={() => generatePDF(invoice)}
                                    className="inline-flex items-center justify-center w-10 h-10 rounded-md transition-all cursor-pointer
                                               hover:shadow-sm text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50
                                               group relative border border-gray-200"
                                    title="Download Invoice"
                                  >
                                    <Download className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Mobile Cards */}
                    <div className="lg:hidden">
                      {invoiceData.invoices?.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
                          No invoices found
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {invoiceData.invoices?.map((invoice) => (
                            <div
                              key={invoice.id}
                              className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow duration-200"
                            >
                              {/* Top Section - Status */}
                              <div className="flex items-center justify-between mb-4">
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  Invoice #{invoice.id}
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                                  {invoice.status}
                                </span>
                              </div>

                              {/* Two Column Layout for Data */}
                              <div className="grid grid-cols-2 gap-6 mb-4">
                                {/* Left Column */}
                                <div className="space-y-4">
                                  {/* Customer Name and Phone */}
                                  <div>
                                    <div className="text-sm font-semibold text-gray-900 mb-1">{invoice.customer.name}</div>
                                    <div className="text-xs text-gray-500">{invoice.customer.phone || 'N/A'}</div>
                                  </div>

                                  {/* Period */}
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">Period</div>
                                    <div className="text-sm text-gray-900">
                                      {invoice.periodStart && invoice.periodEnd ? (
                                        <div className="space-y-1">
                                          <div>From: {formatDateForDisplay(invoice.periodStart)}</div>
                                          <div>To: {formatDateForDisplay(invoice.periodEnd)}</div>
                                        </div>
                                      ) : (
                                        'N/A'
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                  {/* Due Date */}
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">Due Date</div>
                                    <div className="text-sm text-gray-900">
                                      {invoice.dueDate ? formatDateForDisplay(invoice.dueDate) : 'N/A'}
                                    </div>
                                  </div>

                                  {/* Total Amount */}
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">Total Amount</div>
                                    <div className="text-lg font-bold text-gray-900">₹{Math.round(parseFloat(invoice.amountTotal) || 0)}</div>
                                  </div>
                                </div>
                              </div>

                              {/* Action Button */}
                              <div className="flex items-center justify-center pt-4 border-t border-gray-100">
                                <button
                                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-sm font-medium"
                                  onClick={() => generatePDF(invoice)}
                                >
                                  <Download className="w-4 h-4" />
                                  Download Invoice
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Pagination */}
                    {invoiceData.pagination && (
                      <div className="bg-white mt-2 p-3 rounded-xl shadow">
                        {/* Desktop Pagination */}
                        <div className="hidden sm:flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="text-sm text-gray-700">
                            Showing{" "}
                            <span className="font-medium">
                              {invoiceData.pagination.total > 0 ? (invoiceData.pagination.page - 1) * invoiceData.pagination.limit + 1 : 0}
                            </span>{" "}
                            to{" "}
                            <span className="font-medium">
                              {Math.min(invoiceData.pagination.page * invoiceData.pagination.limit, invoiceData.pagination.total)}
                            </span>{" "}
                            of <span className="font-medium">{invoiceData.pagination.total}</span> results
                          </div>

                          <div className="flex items-center gap-3">
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                              <button
                                onClick={() => handlePageChange(invoiceData.pagination.page - 1)}
                                disabled={!invoiceData.pagination.hasPrevious}
                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm
                                           font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <ChevronLeft className="w-5 h-5" />
                              </button>

                              {Array.from({ length: invoiceData.pagination.totalPages }, (_, i) => i + 1)
                                .filter((p) => {
                                  const cur = invoiceData.pagination.page;
                                  const total = invoiceData.pagination.totalPages;
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
                                          p === invoiceData.pagination.page
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
                                onClick={() => handlePageChange(invoiceData.pagination.page + 1)}
                                disabled={!invoiceData.pagination.hasNext}
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
                              {invoiceData.pagination.total > 0 ? (invoiceData.pagination.page - 1) * invoiceData.pagination.limit + 1 : 0}
                            </span>{" "}
                            to{" "}
                            <span className="font-medium">
                              {Math.min(invoiceData.pagination.page * invoiceData.pagination.limit, invoiceData.pagination.total)}
                            </span>{" "}
                            of <span className="font-medium">{invoiceData.pagination.total}</span> results
                          </div>

                          {/* Mobile Navigation */}
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handlePageChange(invoiceData.pagination.page - 1)}
                              disabled={!invoiceData.pagination.hasPrevious}
                              className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>

                            {/* Current Page Indicator */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-emerald-500 bg-emerald-50 text-emerald-700 font-medium text-sm">
                              {invoiceData.pagination.page}
                            </div>

                            <span className="text-sm text-gray-500 mx-2">of {invoiceData.pagination.totalPages}</span>

                            <button
                              onClick={() => handlePageChange(invoiceData.pagination.page + 1)}
                              disabled={!invoiceData.pagination.hasNext}
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
              </>
            )}
            
            {activeTab === 'payments' && (
              <>
                {/* Search & Filters */}
                <div className="bg-white p-4 rounded-xl shadow mb-4">
                  <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-4">
                    {/* Search */}
                    <div className="w-full sm:flex-1 sm:max-w-md">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-700">Search Customer</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder="Search by customer name..."
                            value={paymentFilters.searchQuery}
                            onChange={(e) => handlePaymentFilterChange('searchQuery', e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Date Range */}
                    <div className="w-full sm:w-auto">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex flex-col gap-1 w-full sm:w-auto">
                          <label className="text-xs font-medium text-gray-700">Start Date</label>
                          <DatePicker
                            value={paymentFilters.dateRange.start}
                            onChange={(e) => handlePaymentDateRangeChange('start', e.target.value)}
                            className="text-sm w-full sm:w-auto"
                          />
                        </div>
                        <div className="flex flex-col gap-1 w-full sm:w-auto">
                          <label className="text-xs font-medium text-gray-700">End Date</label>
                          <DatePicker
                            value={paymentFilters.dateRange.end}
                            onChange={(e) => handlePaymentDateRangeChange('end', e.target.value)}
                            className="text-sm w-full sm:w-auto"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Method Filter */}
                    <div className="w-full sm:w-auto">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-700">Payment Method</label>
                        <select
                          value={paymentFilters.method || ''}
                          onChange={(e) => handlePaymentFilterChange('method', e.target.value)}
                          className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">All Methods</option>
                          <option value="CASH">Cash</option>
                          <option value="CARD">Card</option>
                          <option value="UPI">UPI</option>
                          <option value="BANK_TRANSFER">Bank Transfer</option>
                          <option value="CHEQUE">Cheque</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
                      ×
                    </button>
                  </div>
                )}

                {/* Data */}
                                  {(loading || apiLoading) ? (
                    <Spinner loadingTxt="Loading payments..." size="large" />
                  ) : (
                  <>
                    {/* Desktop Table Layout */}
                    <div className="hidden lg:block">
                      {/* Desktop Header Row */}
                      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-3">
                        <div className="overflow-x-auto max-w-full">
                          <div className="grid grid-cols-7 gap-4 px-6 py-4 bg-gray-50 w-full min-w-[1200px]">
                            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">CUSTOMER</div>
                            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">PAYMENT ID</div>
                            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">INVOICE ID</div>
                            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">AMOUNT</div>
                            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">METHOD</div>
                            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">DATE</div>
                            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">ACTIONS</div>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Data Rows */}
                      <div className="space-y-3 w-full">
                        {paymentData.payments?.length === 0 ? (
                          <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
                            No payments found
                          </div>
                        ) : (
                          paymentData.payments?.map((payment) => (
                            <div
                              key={payment.id}
                              className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow duration-200"
                            >
                              <div className="grid grid-cols-7 gap-4 items-center w-full min-w-[1200px]">
                                {/* CUSTOMER */}
                                <div className="flex items-center min-w-0">
                                  <div className="min-w-0 w-full">
                                    <div className="text-sm font-semibold text-gray-900 truncate">{payment.customer.name}</div>
                                    <div className="text-xs text-gray-500 truncate">{payment.customer.phone || 'N/A'}</div>
                                  </div>
                                </div>

                                {/* PAYMENT ID */}
                                <div className="flex items-center min-w-0">
                                  <div className="font-medium text-gray-900 truncate w-full">{payment.id}</div>
                                </div>

                                {/* INVOICE ID */}
                                <div className="flex items-center min-w-0">
                                  <div className="font-medium text-gray-900 truncate w-full">{payment.invoiceId || 'N/A'}</div>
                                </div>

                                {/* AMOUNT */}
                                <div className="flex items-center min-w-0">
                                  <div className="font-medium text-gray-900 truncate w-full">₹{Math.round(parseFloat(payment.amount) || 0)}</div>
                                </div>

                                {/* METHOD */}
                                <div className="flex items-center min-w-0">
                                  <div className="text-sm text-gray-700 truncate w-full">{payment.method}</div>
                                </div>

                                {/* DATE */}
                                <div className="flex items-center min-w-0">
                                  <div className="text-sm text-gray-700 truncate w-full">
                                    {new Date(payment.collectedAt).toLocaleDateString()}
                                  </div>
                                </div>

                                {/* ACTIONS */}
                                <div className="flex items-center justify-end min-w-0">
                                  <button
                                    onClick={() => generatePaymentPDF(payment)}
                                    className="inline-flex items-center justify-center w-10 h-10 rounded-md transition-all cursor-pointer
                                               hover:shadow-sm text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50
                                               group relative border border-gray-200"
                                    title="Download Receipt"
                                  >
                                    <Download className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Mobile Cards */}
                    <div className="lg:hidden">
                      {paymentData.payments?.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
                          No payments found
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {paymentData.payments?.map((payment) => (
                            <div
                              key={payment.id}
                              className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow duration-200"
                            >
                              {/* Top Section - Payment ID and Method */}
                              <div className="flex items-center justify-between mb-4">
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  Payment #{payment.id}
                                </div>
                                <span className="text-sm font-semibold text-green-600">
                                  {payment.method}
                                </span>
                              </div>

                              {/* Two Column Layout for Data */}
                              <div className="grid grid-cols-2 gap-6 mb-4">
                                {/* Left Column */}
                                <div className="space-y-4">
                                  {/* Customer Name and Phone */}
                                  <div>
                                    <div className="text-sm font-semibold text-gray-900 mb-1">{payment.customer.name}</div>
                                    <div className="text-xs text-gray-500">{payment.customer.phone || 'N/A'}</div>
                                  </div>

                                  {/* Invoice ID */}
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">Invoice ID</div>
                                    <div className="text-sm text-gray-900">{payment.invoiceId || 'N/A'}</div>
                                  </div>

                                  {/* Amount */}
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">Amount</div>
                                    <div className="text-lg font-bold text-gray-900">₹{Math.round(parseFloat(payment.amount) || 0)}</div>
                                  </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                  {/* Date */}
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">Date</div>
                                    <div className="text-sm text-gray-900">
                                      {new Date(payment.collectedAt).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Action Button */}
                              <div className="flex items-center justify-center pt-4 border-t border-gray-100">
                                <button
                                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-sm font-medium"
                                  onClick={() => generatePaymentPDF(payment)}
                                >
                                  <Download className="w-4 h-4" />
                                  Download Receipt
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Pagination */}
                    {paymentData.pagination && (
                      <div className="bg-white mt-2 p-3 rounded-xl shadow">
                        {/* Desktop Pagination */}
                        <div className="hidden sm:flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="text-sm text-gray-700">
                            Showing{" "}
                            <span className="font-medium">
                              {paymentData.pagination.total > 0 ? (paymentData.pagination.page - 1) * paymentData.pagination.limit + 1 : 0}
                            </span>{" "}
                            to{" "}
                            <span className="font-medium">
                              {Math.min(paymentData.pagination.page * paymentData.pagination.limit, paymentData.pagination.total)}
                            </span>{" "}
                            of <span className="font-medium">{paymentData.pagination.total}</span> results
                          </div>

                          <div className="flex items-center gap-3">
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                              <button
                                onClick={() => handlePageChange(paymentData.pagination.page - 1)}
                                disabled={!paymentData.pagination.hasPrevious}
                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm
                                           font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <ChevronLeft className="w-5 h-5" />
                              </button>

                              {Array.from({ length: paymentData.pagination.totalPages }, (_, i) => i + 1)
                                .filter((p) => {
                                  const cur = paymentData.pagination.page;
                                  const total = paymentData.pagination.totalPages;
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
                                          p === paymentData.pagination.page
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
                                onClick={() => handlePageChange(paymentData.pagination.page + 1)}
                                disabled={!paymentData.pagination.hasNext}
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
                              {paymentData.pagination.total > 0 ? (paymentData.pagination.page - 1) * paymentData.pagination.limit + 1 : 0}
                            </span>{" "}
                            to{" "}
                            <span className="font-medium">
                              {Math.min(paymentData.pagination.page * paymentData.pagination.limit, paymentData.pagination.total)}
                            </span>{" "}
                            of <span className="font-medium">{paymentData.pagination.total}</span> results
                          </div>

                          {/* Mobile Navigation */}
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handlePageChange(paymentData.pagination.page - 1)}
                              disabled={!paymentData.pagination.hasPrevious}
                              className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>

                            {/* Current Page Indicator */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-emerald-500 bg-emerald-50 text-emerald-700 font-medium text-sm">
                              {paymentData.pagination.page}
                            </div>

                            <span className="text-sm text-gray-500 mx-2">of {paymentData.pagination.totalPages}</span>

                            <button
                              onClick={() => handlePageChange(paymentData.pagination.page + 1)}
                              disabled={!paymentData.pagination.hasNext}
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
              </>
            )}
            
            {activeTab === 'user' && (
              <div className="space-y-6">
                {/* User Selection Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">User History</h2>
                    <button
                      onClick={() => setShowUserSearch(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:via-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
                    >
                      <Users className="w-4 h-4" />
                      Select User
                    </button>
                  </div>

                  {selectedCustomer ? (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedCustomer.fullName}</h3>
                          <p className="text-sm text-gray-600">Code: {selectedCustomer.customerCode || 'N/A'} | Phone: {selectedCustomer.phone || 'N/A'}</p>
                          <p className="text-sm text-gray-600">Area: {selectedCustomer.areaName || selectedCustomer.area || 'N/A'}</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedCustomer(null);
                            setUserHistoryData(null);
                            // Clear URL parameters
                            setSearchParams({});
                          }}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Clear Selection
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Select a user to view their transaction history</p>
                      <button
                        onClick={() => setShowUserSearch(true)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:via-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
                      >
                        Select User
                      </button>
                    </div>
                  )}
                </div>

                {/* User History Data */}
                {selectedCustomer && userHistoryData && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Balance History</h3>
                      <button
                        onClick={() => {/* TODO: Implement download functionality */}}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:via-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                    
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-600">{userHistoryData.summary.totalInvoices}</div>
                        <div className="text-sm text-blue-700">Total Invoices</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-600">{userHistoryData.summary.totalPayments}</div>
                        <div className="text-sm text-green-700">Total Payments</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-purple-600">₹{Math.round(userHistoryData.summary.totalAmount)}</div>
                        <div className="text-sm text-purple-700">Total Amount</div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-orange-600">₹{Math.round(userHistoryData.summary.outstandingBalance)}</div>
                        <div className="text-sm text-orange-700">Outstanding Balance</div>
                      </div>
                    </div>

                    {/* Balance History Table */}
                    <div className="space-y-4">
                      <h4 className="text-md font-semibold text-gray-900">Transaction History</h4>
                      {userHistoryData.activities.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No transactions found for this user
                        </div>
                      ) : (
                        <>
                          {/* Desktop Table */}
                          <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="border-b border-gray-200">
                                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">DATE</th>
                                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">TRANSACTION AMOUNT</th>
                                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">FINAL</th>
                                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">ACTION</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(() => {
                                  let runningBalance = 0;
                                  return userHistoryData.activities.map((activity, index) => {
                                    // Calculate running balance
                                    if (activity.type === 'INVOICE') {
                                      runningBalance += activity.amount;
                                    } else if (activity.type === 'PAYMENT') {
                                      runningBalance -= activity.amount;
                                    }
                                    
                                    // Determine transaction icon and color
                                    let icon, amountColor, amountPrefix;
                                    if (activity.type === 'INVOICE') {
                                      icon = <Receipt className="w-5 h-5 text-blue-600" />;
                                      amountColor = 'text-green-600';
                                      amountPrefix = '(+)';
                                    } else if (activity.type === 'PAYMENT') {
                                      icon = <Banknote className="w-5 h-5 text-green-600" />;
                                      amountColor = 'text-red-600';
                                      amountPrefix = '(-)';
                                    } else {
                                      icon = <HandCoins className="w-5 h-5 text-purple-600" />;
                                      amountColor = 'text-purple-600';
                                      amountPrefix = '';
                                    }

                                    // Format date for display
                                    const formatTransactionDate = (date) => {
                                      const d = new Date(date);
                                      return d.toLocaleDateString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: '2-digit'
                                      });
                                    };

                                    const formatRecordedDate = (date) => {
                                      const d = new Date(date);
                                      return d.toLocaleDateString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                      });
                                    };

                                    return (
                                      <tr key={`${activity.type}-${activity.id}-${index}`} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-4 px-4">
                                          {icon}
                                        </td>
                                        <td className="py-4 px-4">
                                          <div>
                                            <div className="text-sm font-medium text-gray-900">
                                              {activity.type === 'INVOICE' && `Bill From ${formatTransactionDate(activity.periodStart || activity.date)} To ${formatTransactionDate(activity.periodEnd || activity.date)}`}
                                              {activity.type === 'PAYMENT' && `Payment On ${formatTransactionDate(activity.date)}`}
                                              {activity.type === 'ADJUSTMENT' && activity.description}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              {activity.type === 'INVOICE' && `Billed On ${formatRecordedDate(activity.date)}`}
                                              {activity.type === 'PAYMENT' && `Recorded On ${formatRecordedDate(activity.date)}`}
                                              {activity.type === 'ADJUSTMENT' && `Changed On ${formatRecordedDate(activity.date)}`}
                                            </div>
                                          </div>
                                        </td>
                                        <td className="py-4 px-4">
                                          <span className={`text-sm font-medium ${amountColor}`}>
                                            {amountPrefix} ₹ {Math.round(activity.amount)}
                                          </span>
                                        </td>
                                        <td className="py-4 px-4">
                                          <div className="text-sm font-medium text-gray-900">
                                            ₹ {Math.round(runningBalance)}
                                            {runningBalance > 0 && <span className="text-green-600 ml-1">Due</span>}
                                            {runningBalance === 0 && <span className="text-gray-500 ml-1">Paid</span>}
                                            {runningBalance < 0 && <span className="text-blue-600 ml-1">Credit</span>}
                                          </div>
                                        </td>
                                        <td className="py-4 px-4">
                                          {activity.type === 'PAYMENT' && (
                                            <button
                                              onClick={() => {/* TODO: Implement delete functionality */}}
                                              className="text-red-600 hover:text-red-800 transition-colors"
                                              title="Delete Payment"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  });
                                })()}
                              </tbody>
                            </table>
                          </div>

                          {/* Mobile Cards */}
                          <div className="lg:hidden space-y-4">
                            {(() => {
                              let runningBalance = 0;
                              return userHistoryData.activities.map((activity, index) => {
                                // Calculate running balance
                                if (activity.type === 'INVOICE') {
                                  runningBalance += activity.amount;
                                } else if (activity.type === 'PAYMENT') {
                                  runningBalance -= activity.amount;
                                }
                                
                                // Determine transaction icon and color
                                let icon, amountColor, amountPrefix;
                                if (activity.type === 'INVOICE') {
                                  icon = <Receipt className="w-5 h-5 text-blue-600" />;
                                  amountColor = 'text-green-600';
                                  amountPrefix = '(+)';
                                } else if (activity.type === 'PAYMENT') {
                                  icon = <Banknote className="w-5 h-5 text-green-600" />;
                                  amountColor = 'text-red-600';
                                  amountPrefix = '(-)';
                                } else {
                                  icon = <HandCoins className="w-5 h-5 text-purple-600" />;
                                  amountColor = 'text-purple-600';
                                  amountPrefix = '';
                                }

                                // Format date for display
                                const formatTransactionDate = (date) => {
                                  const d = new Date(date);
                                  return d.toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: '2-digit'
                                  });
                                };

                                const formatRecordedDate = (date) => {
                                  const d = new Date(date);
                                  return d.toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  });
                                };

                                return (
                                  <div key={`${activity.type}-${activity.id}-${index}`} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-start gap-3">
                                        {icon}
                                        <div className="flex-1">
                                          <div className="text-sm font-medium text-gray-900 mb-1">
                                            {activity.type === 'INVOICE' && `Bill From ${formatTransactionDate(activity.periodStart || activity.date)} To ${formatTransactionDate(activity.periodEnd || activity.date)}`}
                                            {activity.type === 'PAYMENT' && `Payment On ${formatTransactionDate(activity.date)}`}
                                            {activity.type === 'ADJUSTMENT' && activity.description}
                                          </div>
                                          <div className="text-xs text-gray-500 mb-2">
                                            {activity.type === 'INVOICE' && `Billed On ${formatRecordedDate(activity.date)}`}
                                            {activity.type === 'PAYMENT' && `Recorded On ${formatRecordedDate(activity.date)}`}
                                            {activity.type === 'ADJUSTMENT' && `Changed On ${formatRecordedDate(activity.date)}`}
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <span className={`text-sm font-medium ${amountColor}`}>
                                              {amountPrefix} ₹ {Math.round(activity.amount)}
                                            </span>
                                            <div className="text-sm font-medium text-gray-900">
                                              ₹ {Math.round(runningBalance)}
                                              {runningBalance > 0 && <span className="text-green-600 ml-1">Due</span>}
                                              {runningBalance === 0 && <span className="text-gray-500 ml-1">Paid</span>}
                                              {runningBalance < 0 && <span className="text-blue-600 ml-1">Credit</span>}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      {activity.type === 'PAYMENT' && (
                                        <button
                                          onClick={() => {/* TODO: Implement delete functionality */}}
                                          className="text-red-600 hover:text-red-800 transition-colors ml-2"
                                          title="Delete Payment"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Loading State */}
                                  {selectedCustomer && (userHistoryLoading || apiLoading) && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <Spinner loadingTxt="Loading user history..." size="large" />
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* PDF Preview Modal */}
          {showPdfPreview && selectedInvoice && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-[9999] p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Invoice Preview - Bill #{selectedInvoice.id}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={downloadPDF}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:via-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
                    >
                      Download PDF
                    </button>
                    <button
                      onClick={() => {
                        setShowPdfPreview(false);
                        setSelectedInvoice(null);
                      }}
                      className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
                  <div id="pdf-content" className="bg-white p-8 border border-gray-200">
                    {/* Company Header */}
                    <div className="text-center mb-8">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {companyLoading ? 'Loading...' : (companyData?.name || 'BroadbandX')}
                      </h1>
                      <p className="text-gray-600">{companyData?.description || 'Internet Service Provider'}</p>
                      <p className="text-gray-600">GST No: {companyData?.gstNumber || '27AABCB1234Z1Z5'}</p>
                    </div>

                    {/* Invoice Details */}
                    <div className="flex justify-between mb-8">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">INVOICE</h2>
                        <div className="space-y-2">
                          <p><strong>Bill No:</strong> {selectedInvoice.id}</p>
                          <p><strong>Customer:</strong> {selectedInvoice.customer.name}</p>
                          <p><strong>Customer Code:</strong> {selectedInvoice.customer.customerCode}</p>
                          <p><strong>Area:</strong> {selectedInvoice.customer.area}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="space-y-2">
                          <p><strong>Bill From:</strong> {formatDateForDisplay(selectedInvoice.periodStart)}</p>
                          <p><strong>Bill To:</strong> {formatDateForDisplay(selectedInvoice.periodEnd)}</p>
                          <p><strong>Billed On:</strong> {formatDateForDisplay(selectedInvoice.createdAt)}</p>
                          <p><strong>Due Date:</strong> {formatDateForDisplay(selectedInvoice.dueDate)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Invoice Items */}
                    <div className="mb-8">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                            <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-300 px-4 py-2">Internet Service Charges</td>
                            <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(selectedInvoice.amountDue)}</td>
                          </tr>
                          {selectedInvoice.discounts > 0 && (
                            <tr>
                              <td className="border border-gray-300 px-4 py-2">Discounts</td>
                              <td className="border border-gray-300 px-4 py-2 text-right">-{formatCurrency(selectedInvoice.discounts)}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Tax Summary */}
                    <div className="flex justify-end mb-8">
                      <div className="w-64 space-y-2">
                        <div className="flex justify-between">
                          <span>Sub Total:</span>
                          <span>{formatCurrency(selectedInvoice.amountDue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>SGST (9%):</span>
                          <span>{formatCurrency(selectedInvoice.taxAmount / 2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>CGST (9%):</span>
                          <span>{formatCurrency(selectedInvoice.taxAmount / 2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>Total:</span>
                          <span>{formatCurrency(selectedInvoice.amountTotal)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Status */}
                    <div className="mb-8">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Payment Status</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p><strong>Total Paid:</strong> {formatCurrency(selectedInvoice.totalPaid)}</p>
                            <p><strong>Balance:</strong> {formatCurrency(selectedInvoice.balance)}</p>
                          </div>
                          <div>
                            <p><strong>Status:</strong> 
                              <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedInvoice.status)}`}>
                                {selectedInvoice.status}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center text-gray-600 text-sm">
                      <p>Thank you for your business!</p>
                      <p>For any queries, please contact us at support@broadbandx.com</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment PDF Preview Modal */}
          {showPaymentPdfPreview && selectedPayment && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-[9999] p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Payment Receipt - #{selectedPayment.id}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={downloadPaymentPDF}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:via-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
                    >
                      Download PDF
                    </button>
                    <button
                      onClick={() => {
                        setShowPaymentPdfPreview(false);
                        setSelectedPayment(null);
                      }}
                      className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
                  <div id="payment-pdf-content" className="bg-white p-8 border border-gray-200">
                    {/* Company Header */}
                    <div className="text-center mb-8">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {companyLoading ? 'Loading...' : (companyData?.name || 'BroadbandX')}
                      </h1>
                      <p className="text-gray-600">{companyData?.description || 'Internet Service Provider'}</p>
                      <p className="text-gray-600">GST No: {companyData?.gstNumber || '27AABCB1234Z1Z5'}</p>
                    </div>

                    {/* Payment Details */}
                    <div className="flex justify-between mb-8">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">PAYMENT RECEIPT</h2>
                        <div className="space-y-2">
                          <p><strong>Receipt No:</strong> {selectedPayment.id}</p>
                          <p><strong>Customer:</strong> {selectedPayment.customer.name}</p>
                          <p><strong>Customer Code:</strong> {selectedPayment.customer.customerCode}</p>
                          <p><strong>Area:</strong> {selectedPayment.customer.area}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="space-y-2">
                          <p><strong>Payment Date:</strong> {formatDateForDisplay(selectedPayment.collectedAt)}</p>
                          <p><strong>Payment Method:</strong> {selectedPayment.method}</p>
                          <p><strong>Collected By:</strong> {selectedPayment.collector}</p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="mb-8">
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-4">Payment Summary</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-lg">Amount Paid:</span>
                            <span className="text-2xl font-bold text-green-600">{formatCurrency(selectedPayment.amount)}</span>
                          </div>
                          <div className="border-t pt-3">
                            <p className="text-sm text-gray-600">
                              <strong>Payment Method:</strong> {selectedPayment.method.toUpperCase()}
                            </p>
                            {selectedPayment.comments && (
                              <p className="text-sm text-gray-600 mt-1">
                                <strong>Comments:</strong> {selectedPayment.comments}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center text-gray-600 text-sm">
                      <p>Thank you for your payment!</p>
                      <p>For any queries, please contact us at support@broadbandx.com</p>
                      <p className="mt-4 text-xs">This is a computer generated receipt and does not require a signature.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Search Modal */}
          {showUserSearch && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-[9999] p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Select User
                  </h3>
                  <button
                    onClick={() => {
                      setShowUserSearch(false);
                      setSearchQuery('');
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

                  {/* Search Results */}
                  <div className="max-h-96 overflow-y-auto">
                    {apiLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Spinner loadingTxt="Searching customers..." size="medium" />
                      </div>
                    ) : customers.length === 0 ? (
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
                                <div className="text-sm text-gray-500">{customer.areaName || customer.area || 'No area assigned'}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">₹{customer.balance || 0}</div>
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
      </div>
    </Layout>
  );
};

export default Reports;
