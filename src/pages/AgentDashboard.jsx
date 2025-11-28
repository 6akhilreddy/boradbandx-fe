import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Users,
  IndianRupee,
  Calendar,
  Activity,
  RefreshCw,
  Clock,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { getDashboardStats } from '../api/dashboardApi';
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
import { Bar, Pie, Line } from 'react-chartjs-2';
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

const AgentDashboard = () => {
  const { user } = useUserStore();
  const apiLoading = useApiLoading();
  const navigate = useNavigate();
  
  // State for dashboard data
  const [dashboardData, setDashboardData] = useState(null);
  const [showAreaPopup, setShowAreaPopup] = useState(false);
  const [showPlanPopup, setShowPlanPopup] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const response = await getDashboardStats();
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

  const getMonthlyTrendChartData = () => {
    if (!dashboardData?.charts?.monthlyTrend) return null;
    
    return {
      labels: dashboardData.charts.monthlyTrend.map(item => item.month),
      datasets: [
        {
          label: 'Collection Amount (₹)',
          data: dashboardData.charts.monthlyTrend.map(item => item.amount),
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
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ₹${formatNumber(context.parsed.y || context.parsed)}`;
          },
        },
      },
      datalabels: {
        display: false,
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
        display: false,
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
        return item.area;
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
                      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]
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

    if (apiLoading && !dashboardData) {
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
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Agent Dashboard</h1>
                <p className="text-gray-600 mt-2">Overview of your performance</p>
              </div>
              
              {/* Refresh Button */}
              <div className="mt-4 md:mt-0">
                <button
                  onClick={loadDashboardData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {dashboardData ? (
            <>
              {/* Statistics Cards - Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* Total Collection */}
                <div 
                  onClick={() => navigate('/collection')}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-md"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <IndianRupee className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Collection</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(dashboardData.stats?.totalCollection || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Month Total Collection */}
                <div 
                  onClick={() => navigate('/collection')}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-md"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">This Month Collection</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(dashboardData.stats?.monthTotalCollection || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Today's Collection */}
                <div 
                  onClick={() => navigate('/collection')}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-md"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Today's Collection</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(dashboardData.stats?.todaysCollection || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pending Amount */}
                <div 
                  onClick={() => navigate('/collection')}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-md"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Pending Amount</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(dashboardData.stats?.pendingAmount || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics Cards - Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* Today's Renewals */}
                <div 
                  onClick={() => navigate('/customers?renewalStatus=today')}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-md"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-orange-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Today's Renewals</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(dashboardData.stats?.todaysRenewals || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* This Month Renewals */}
                <div 
                  onClick={() => navigate('/customers?renewalStatus=thisMonth')}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-md"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-yellow-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">This Month Renewals</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(dashboardData.stats?.thisMonthRenewals || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Upcoming Renewals */}
                <div 
                  onClick={() => navigate('/customers?renewalStatus=upcoming')}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-md"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Upcoming Renewals</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(dashboardData.stats?.upcomingRenewals || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expired Renewals */}
                <div 
                  onClick={() => navigate('/customers?renewalStatus=expired')}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-md"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Expired Renewals</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(dashboardData.stats?.expiredRenewals || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics Cards - Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Follow Up Customers */}
                <div 
                  onClick={() => navigate('/customers?followUpStatus=today')}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-md"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-pink-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Follow Up Customers</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(dashboardData.stats?.followUpCustomers || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Total Customers */}
                <div 
                  onClick={() => navigate('/customers')}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-md"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Customers</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(dashboardData.stats?.totalCustomers || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Active Customers */}
                <div 
                  onClick={() => navigate('/customers')}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-md"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Activity className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Active Customers</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(dashboardData.stats?.totalActiveCustomers || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Open Complaints */}
                <div 
                  onClick={() => navigate('/complaints')}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-md"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-orange-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Assigned Complaints</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(dashboardData.stats?.openComplaints || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Trend Chart */}
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            isOpen={showPlanPopup}
            onClose={() => setShowPlanPopup(false)}
            title="All Plans Subscriptions"
            data={dashboardData?.charts?.planWiseSubscriptions || []}
            type="count"
          />
        </div>
    </Layout>
  );
};

export default AgentDashboard;

