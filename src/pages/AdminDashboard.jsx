import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  IndianRupee, 
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { getDashboardStats, getAreaWiseCollection, getAgentWiseCollection } from '../api/dashboardApi';
import useApiLoading from '../hooks/useApiLoading';
import Spinner from '../components/Spinner';
import Layout from '../components/Layout';
import useUserStore from '../store/userStore';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Doughnut, Line } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  ChartDataLabels
);

const AdminDashboard = () => {
  const loading = useApiLoading();
  const { user } = useUserStore();
  const apiLoading = useApiLoading();
  
  // State for dashboard data
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isMobile, setIsMobile] = useState(false);
  const [showAreaPopup, setShowAreaPopup] = useState(false);
  const [showAgentPopup, setShowAgentPopup] = useState(false);
  const [showPlanPopup, setShowPlanPopup] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [selectedMonth, selectedYear, user]);

  const loadDashboardData = async () => {
    try {
      const response = await getDashboardStats({
        month: selectedMonth,
        year: selectedYear
      });
      setDashboardData(response.data || response);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-IN').format(number);
  };

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  // Chart configurations
  const getAreaWiseChartData = () => {
    if (!dashboardData?.charts?.areaWiseCollection) return null;
    
    // Get only top 4 areas
    const top4Areas = dashboardData.charts.areaWiseCollection.slice(0, 4);
    
    return {
      labels: top4Areas.map(item => item.area),
      datasets: [
        {
          label: 'Collection Amount (₹)',
          data: top4Areas.map(item => item.amount),
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
          ],
          borderColor: [
            'rgba(59, 130, 246, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(239, 68, 68, 1)',
          ],
          borderWidth: 2,
          borderRadius: 8,
        },
      ],
    };
  };

  const getAgentWiseChartData = () => {
    if (!dashboardData?.charts?.agentWiseCollection) return null;
    
    // Get only top 4 agents
    const top4Agents = dashboardData.charts.agentWiseCollection.slice(0, 4);
    
    return {
      labels: top4Agents.map(item => item.agent),
      datasets: [
        {
          label: 'Collection Amount (₹)',
          data: top4Agents.map(item => item.amount),
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(239, 68, 68, 1)',
          ],
          borderWidth: 2,
          borderRadius: 8,
        },
      ],
    };
  };

  const getPlanWiseChartData = () => {
    if (!dashboardData?.charts?.planWiseSubscriptions) return null;
    
    // Get only top 4 plans
    const top4Plans = dashboardData.charts.planWiseSubscriptions.slice(0, 4);
    
    return {
      labels: top4Plans.map(item => item.plan),
      datasets: [
        {
          data: top4Plans.map(item => item.count),
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
          ],
          borderColor: [
            'rgba(59, 130, 246, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(239, 68, 68, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const getPaymentMethodChartData = () => {
    if (!dashboardData?.charts?.paymentMethodBreakdown) return null;
    
    // Get only top 4 payment methods
    const top4Methods = dashboardData.charts.paymentMethodBreakdown.slice(0, 4);
    
    return {
      labels: top4Methods.map(item => item.method),
      datasets: [
        {
          data: top4Methods.map(item => item.amount),
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(239, 68, 68, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const getMonthlyTrendChartData = () => {
    if (!dashboardData?.charts?.monthlyTrend) return null;
    
    let trendData = dashboardData.charts.monthlyTrend;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // 1-based month
    
    // If selected year is current year, show only till current month
    if (selectedYear === currentYear) {
      trendData = dashboardData.charts.monthlyTrend.slice(0, currentMonth);
    }
    
    // For mobile, show only last 3 months from selected month
    if (isMobile) {
      const selectedDate = new Date(selectedYear, selectedMonth - 1);
      const threeMonthsAgo = new Date(selectedYear, selectedMonth - 4);
      
      trendData = dashboardData.charts.monthlyTrend.filter((item, index) => {
        const itemDate = new Date(selectedYear, index);
        return itemDate >= threeMonthsAgo && itemDate <= selectedDate;
      });
    }
    
    return {
      labels: trendData.map(item => item.month),
      datasets: [
        {
          label: 'Collection Amount (₹)',
          data: trendData.map(item => item.amount),
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
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend since we'll show top 4 values separately
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ₹${formatNumber(context.parsed.y || context.parsed)}`;
          },
        },
      },
      datalabels: {
        display: false, // Hide all data labels on bars
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + formatNumber(value);
          },
        },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
      datalabels: {
        display: false, // Hide numbers on pie charts
      },
    },
  };

  // Popup Modal Component
  const PopupModal = ({ isOpen, onClose, title, data, type }) => {
    if (!isOpen) return null;

    const getFormattedValue = (item) => {
      if (type === 'amount') {
        return formatCurrency(item.amount);
      } else if (type === 'count') {
        return formatNumber(item.count);
      }
      return item.value;
    };

    const getItemLabel = (item) => {
      if (type === 'amount') {
        return item.area || item.agent || item.method;
      } else if (type === 'count') {
        return item.plan;
      }
      return item.label;
    };

    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-gray-900/30 flex items-center justify-center z-50 p-4">
        <div className="bg-white/95 backdrop-blur-md rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl border border-gray-200/50">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="space-y-3">
              {data.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full" style={{
                      backgroundColor: type === 'amount' 
                        ? ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]
                        : ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]
                    }}></div>
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {getItemLabel(item)}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {getFormattedValue(item)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

    if ((loading || apiLoading) && !dashboardData) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner loadingTxt="Loading dashboard..." size="large" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen p-4 md:p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-2">Overview of your business performance</p>
              </div>
              
              {/* Month/Year Selector */}
              <div className="mt-4 md:mt-0 flex space-x-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month}>
                      {getMonthName(month)}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {dashboardData ? (
            <>
              {/* Global Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Customers */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Customers</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(dashboardData.globalStats?.totalCustomers || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Total Collected */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <IndianRupee className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Collected</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(dashboardData.globalStats?.totalCollected || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Total Plans */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Plans</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(dashboardData.globalStats?.totalPlans || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Total Agents */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Activity className="w-5 h-5 text-orange-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Agents</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(dashboardData.globalStats?.totalAgents || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* New Customers This Month */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">New Customers</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(dashboardData.monthlyStats?.newCustomersThisMonth || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Invoice Amount This Month */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <IndianRupee className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Invoice Amount</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(dashboardData.monthlyStats?.totalInvoiceAmountThisMonth || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Collected This Month */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Collected Amount</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(dashboardData.monthlyStats?.totalCollectedThisMonth || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pending Amount */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-red-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Pending Amount</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(dashboardData.monthlyStats?.pendingAmountThisMonth || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

                                      {/* Monthly Trend - First */}
            <div className="mb-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Monthly Collection Trend</h3>
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
              <div className="h-80">
                {getMonthlyTrendChartData() ? (
                  <Line data={getMonthlyTrendChartData()} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No data available
                  </div>
                )}
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Area-wise Collection */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 space-y-2 md:space-y-0">
                  <h3 className="text-lg font-semibold text-gray-900">Area-wise Collection</h3>
                  <button
                    onClick={() => setShowAreaPopup(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg w-full md:w-auto cursor-pointer"
                  >
                    View More
                  </button>
                </div>
                <div className="h-80">
                  {getAreaWiseChartData() ? (
                    <Bar data={getAreaWiseChartData()} options={chartOptions} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No data available
                    </div>
                  )}
                </div>
              </div>

              {/* Agent-wise Collection */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 space-y-2 md:space-y-0">
                  <h3 className="text-lg font-semibold text-gray-900">Agent-wise Collection</h3>
                  <button
                    onClick={() => setShowAgentPopup(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg w-full md:w-auto cursor-pointer"
                  >
                    View More
                  </button>
                </div>
                <div className="h-80">
                  {getAgentWiseChartData() ? (
                    <Bar data={getAgentWiseChartData()} options={chartOptions} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No data available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Plan-wise Subscriptions */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 space-y-2 md:space-y-0">
                  <h3 className="text-lg font-semibold text-gray-900">Plan-wise Subscriptions</h3>
                  <button
                    onClick={() => setShowPlanPopup(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg w-full md:w-auto cursor-pointer"
                  >
                    View More
                  </button>
                </div>
                <div className="h-80">
                  {getPlanWiseChartData() ? (
                    <Pie data={getPlanWiseChartData()} options={pieChartOptions} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No data available
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method Breakdown */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 space-y-2 md:space-y-0">
                  <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
                  <button
                    onClick={() => setShowPaymentPopup(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg w-full md:w-auto cursor-pointer"
                  >
                    View More
                  </button>
                </div>
                <div className="h-80">
                  {getPaymentMethodChartData() ? (
                    <Doughnut data={getPaymentMethodChartData()} options={pieChartOptions} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No data available
                    </div>
                  )}
                </div>
              </div>
            </div>
            </>
          ) : (
            <div className="bg-white rounded-xl p-12 text-center">
              <p className="text-gray-500">No dashboard data available</p>
            </div>
          )}

          {/* Popup Modals */}
          <PopupModal
            isOpen={showAreaPopup}
            onClose={() => setShowAreaPopup(false)}
            title="All Areas Collection"
            data={dashboardData?.charts?.areaWiseCollection || []}
            type="amount"
          />
          <PopupModal
            isOpen={showAgentPopup}
            onClose={() => setShowAgentPopup(false)}
            title="All Agents Collection"
            data={dashboardData?.charts?.agentWiseCollection || []}
            type="amount"
          />
          <PopupModal
            isOpen={showPlanPopup}
            onClose={() => setShowPlanPopup(false)}
            title="All Plans Subscriptions"
            data={dashboardData?.charts?.planWiseSubscriptions || []}
            type="count"
          />
          <PopupModal
            isOpen={showPaymentPopup}
            onClose={() => setShowPaymentPopup(false)}
            title="All Payment Methods"
            data={dashboardData?.charts?.paymentMethodBreakdown || []}
            type="amount"
          />
        </div>
    </Layout>
  );
};

export default AdminDashboard;