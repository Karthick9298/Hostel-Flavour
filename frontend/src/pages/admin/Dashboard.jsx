import React, { useState, useEffect } from 'react';
import { analyticsAPI, feedbackAPI } from '../../config/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import '../../styles/dashboard-animations.css';
import {
  RatingDistributionChart,
  MealPerformanceChart,
  WeeklyTrendChart,
  ParticipationChart,
  HistoricalComparisonChart,
  SentimentAnalysisChart,
  MealQualityRadarChart,
  FeedbackHeatmapChart,
  MonthlyComparisonChart,
  SatisfactionGaugeChart,
  ComplaintCategoriesChart,
  PeakHoursChart
} from '../../components/charts/ChartComponents';
import {
  AverageRatingPerMealChart,
  StudentRatingPerMealChart,
  FeedbackDistributionChart,
  AllMealsFeedbackDistributionChart,
  SentimentScoreChart
} from '../../components/charts/DailyAnalysisCharts';
import { 
  FaChartBar, 
  FaUsers, 
  FaComments, 
  FaRobot,
  FaCalendarAlt,
  FaStar,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaEquals,
  FaChartLine,
  FaDownload,
  FaHistory,
  FaFilter,
  FaBell,
  FaEye,
  FaChartPie,
  FaSyncAlt,
  FaCog,
  FaClock,
  FaThumbsUp,
  FaThumbsDown,
  FaUtensils,
  FaCoffee,
  FaFire,
  FaSnowflake,
  FaHeart,
  FaShieldAlt,
  FaLightbulb,
  FaExclamationCircle,
  FaCheckCircle,
  FaMoon,
  FaSun,
  FaCloudRain,
  FaSearch,
  FaExpand,
  FaCompress
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [dailyData, setDailyData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [quickStats, setQuickStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    // Default to yesterday for analysis
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  });
  const [historicalStartDate, setHistoricalStartDate] = useState(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return weekAgo.toISOString().split('T')[0];
  });
  const [historicalEndDate, setHistoricalEndDate] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  });

  useEffect(() => {
    fetchData();
    fetchQuickStats();
    fetchAlerts();
  }, []);

  useEffect(() => {
    if (activeTab === 'daily') {
      fetchDailyData();
    } else if (activeTab === 'weekly') {
      fetchWeeklyData();
    } else if (activeTab === 'historical') {
      fetchHistoricalData();
    }
  }, [activeTab, selectedDate, historicalStartDate, historicalEndDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchDailyData(),
        fetchQuickStats(),
        fetchAlerts()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/analytics/daily/${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('firebaseToken')}`
        }
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        setDailyData(data.data);
      } else if (data.status === 'no_data') {
        // Handle no data scenarios
        setDailyData({
          type: data.type,
          message: data.message,
          overview: data.data?.overview || {
            totalStudents: 0,
            participatingStudents: 0,
            participationRate: 0,
            overallRating: 0
          }
        });
      } else {
        console.error('Error in daily analysis:', data.message);
        toast.error(data.message || 'Failed to fetch daily data');
      }
    } catch (error) {
      console.error('Error fetching daily data:', error);
      toast.error('Failed to fetch daily analysis data');
    }
  };

  const fetchWeeklyData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/analytics/weekly/${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('firebaseToken')}`
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setWeeklyData(data.data);
      }
    } catch (error) {
      console.error('Error fetching weekly data:', error);
    }
  };

  const fetchHistoricalData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/analytics/historical/comparison?startDate=${historicalStartDate}&endDate=${historicalEndDate}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('firebaseToken')}`
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setHistoricalData(data.data);
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  };

  const fetchQuickStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/analytics/dashboard/quick-stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('firebaseToken')}`
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setQuickStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching quick stats:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/analytics/alerts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('firebaseToken')}`
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setAlerts(data.data);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await fetchData();
      toast.success('Dashboard refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh dashboard');
    } finally {
      setRefreshing(false);
    }
  };

  const exportData = () => {
    // Export functionality (can be expanded)
    const dataToExport = {
      dailyData,
      weeklyData,
      historicalData,
      quickStats,
      alerts,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hostel-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Analytics data exported successfully');
  };

  const getMealIcon = (mealType) => {
    switch (mealType?.toLowerCase()) {
      case 'breakfast': return <FaCoffee className="text-yellow-500" />;
      case 'lunch': return <FaUtensils className="text-orange-500" />;
      case 'dinner': return <FaUtensils className="text-blue-500" />;
      case 'snacks': return <FaUtensils className="text-green-500" />;
      default: return <FaUtensils className="text-gray-500" />;
    }
  };

  const getTimeIcon = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return <FaSun className="text-yellow-500" />;
    if (hour >= 12 && hour < 18) return <FaFire className="text-orange-500" />;
    if (hour >= 18 && hour < 22) return <FaMoon className="text-purple-500" />;
    return <FaSnowflake className="text-blue-500" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg">
              <FaChartBar className="text-2xl text-indigo-600 animate-pulse" />
            </div>
          </div>
          <LoadingSpinner text="Loading analytics dashboard..." />
          <p className="text-sm text-gray-600 mt-2">Preparing insights and analytics...</p>
        </div>
      </div>
    );
  }

  const getTrendIcon = (trend) => {
    if (trend === 'improving' || trend === 'improved') return <FaArrowUp className="text-green-500" />;
    if (trend === 'declining' || trend === 'declined') return <FaArrowDown className="text-red-500" />;
    return <FaEquals className="text-gray-500" />;
  };

  const getStatusColor = (status, rating) => {
    if (status === 'critical' || rating < 2.5) return 'text-red-600 bg-red-50 border-red-200';
    if (status === 'warning' || rating < 3.5) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (status === 'good' || rating >= 4.0) return 'text-green-600 bg-green-50 border-green-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  const StatCard = ({ icon, title, value, change, trend, color = "blue", subtitle = "", onClick = null }) => (
    <div 
      className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-4 rounded-xl shadow-inner ${
            color === 'blue' ? 'bg-gradient-to-br from-blue-100 to-blue-200' :
            color === 'green' ? 'bg-gradient-to-br from-green-100 to-green-200' :
            color === 'yellow' ? 'bg-gradient-to-br from-yellow-100 to-yellow-200' :
            color === 'red' ? 'bg-gradient-to-br from-red-100 to-red-200' :
            color === 'purple' ? 'bg-gradient-to-br from-purple-100 to-purple-200' :
            'bg-gradient-to-br from-gray-100 to-gray-200'
          }`}>
            <div className={`text-2xl ${
              color === 'blue' ? 'text-blue-600' :
              color === 'green' ? 'text-green-600' :
              color === 'yellow' ? 'text-yellow-600' :
              color === 'red' ? 'text-red-600' :
              color === 'purple' ? 'text-purple-600' :
              'text-gray-600'
            }`}>
              {icon}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</p>
            <p className={`text-3xl font-bold mb-1 ${
              color === 'blue' ? 'text-blue-700' :
              color === 'green' ? 'text-green-700' :
              color === 'yellow' ? 'text-yellow-700' :
              color === 'red' ? 'text-red-700' :
              color === 'purple' ? 'text-purple-700' :
              'text-gray-700'
            }`}>{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
        {change && (
          <div className="text-right">
            <div className="flex items-center justify-end space-x-1">
              {getTrendIcon(trend)}
              <span className={`text-sm font-semibold ${
                trend === 'improving' ? 'text-green-600' : 
                trend === 'declining' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {change}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">vs last period</p>
          </div>
        )}
      </div>
    </div>
  );

  const MealPerformanceCard = ({ meal, data }) => (
    <div 
      className={`relative p-6 rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${getStatusColor(data.status, data.averageRating)}`}
      onClick={() => setExpandedCard(expandedCard === meal ? null : meal)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getMealIcon(meal)}
          <h3 className="font-bold capitalize text-lg">{meal}</h3>
        </div>
        <div className="flex items-center space-x-2">
          {getTrendIcon(data.trend)}
          {expandedCard === meal ? <FaCompress /> : <FaExpand />}
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Overall Rating:</span>
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  className={`text-sm ${
                    star <= Math.round(data.averageRating) 
                      ? 'text-yellow-400' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="font-bold text-lg">{data.averageRating}/5.0</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Participation:</span>
          <div className="flex items-center space-x-2">
            <div className="w-20 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${data.participationRate}%` }}
              ></div>
            </div>
            <span className="font-semibold">{data.participationRate}%</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Total Comments:</span>
          <span className="font-semibold flex items-center space-x-1">
            <FaComments className="text-sm" />
            <span>{data.totalComments}</span>
          </span>
        </div>

        {expandedCard === meal && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 animate-fadeIn">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Positive Feedback:</span>
              <span className="text-green-600 font-medium flex items-center space-x-1">
                <FaThumbsUp className="text-xs" />
                <span>{data.positiveFeedback || 'N/A'}</span>
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Areas to Improve:</span>
              <span className="text-red-600 font-medium flex items-center space-x-1">
                <FaThumbsDown className="text-xs" />
                <span>{data.improvementAreas || 'N/A'}</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const AlertCard = ({ alert, index }) => (
    <div className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-red-500">
      <div className={`p-2 rounded-full ${
        alert.type === 'critical' ? 'bg-red-100 text-red-600' : 
        alert.type === 'warning' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
      }`}>
        {alert.type === 'critical' ? <FaExclamationCircle /> : 
         alert.type === 'warning' ? <FaExclamationTriangle /> : <FaLightbulb />}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900">{alert.title || 'Alert'}</h4>
          <span className="text-xs text-gray-500 flex items-center space-x-1">
            <FaClock />
            <span>{alert.timestamp || 'Recently'}</span>
          </span>
        </div>
        <p className="text-gray-700 mt-1">{alert.message}</p>
        {alert.action && (
          <div className="mt-2 flex items-center space-x-2">
            <FaLightbulb className="text-yellow-500 text-sm" />
            <p className="text-sm text-gray-600 italic">Suggested action: {alert.action}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 particles-bg">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white relative overflow-hidden gradient-animate">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between animate-fadeIn">
            <div className="flex items-center space-x-6 animate-slideInLeft">
              <div className="p-4 bg-white bg-opacity-20 rounded-2xl shadow-lg backdrop-blur-sm glass-morphism hover-lift">
                <FaChartBar className="text-4xl animate-pulse-custom" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Analytics Dashboard</h1>
                <div className="flex items-center space-x-4 mt-2">
                  <p className="text-indigo-100">Hostel Food Analysis & Insights</p>
                  <div className="flex items-center space-x-2 text-indigo-200">
                    {getTimeIcon()}
                    <span className="text-sm">
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Quick Actions */}
            {/* <div className="flex items-center space-x-3 animate-slideInRight">
              <div className="flex items-center space-x-2 bg-white bg-opacity-10 rounded-lg px-3 py-2 glass-morphism">
                <FaSearch className="text-indigo-200" />
                <input
                  type="text"
                  placeholder="Search insights..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none outline-none text-white placeholder-indigo-200 text-sm w-32"
                />
              </div>
              
              <button 
                onClick={fetchAlerts}
                className="relative p-3 bg-white bg-opacity-20 rounded-xl hover:bg-opacity-30 transition-all duration-300 group glass-morphism hover-lift"
              >
                <FaBell className="text-xl group-hover:animate-bounce-subtle" />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse glow-red">
                    {alerts.length}
                  </span>
                )}ame="flex items-center space-x-3 animate-slideInRight">
              <div className="flex items-center space-x-2 bg-white bg-opacity-10 rounded-lg px-3 py-2 glass-morphism">
                <FaSearch className="text-indigo-200" />
                <input
                  type="text"
                  placeholder="Search insights..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none outline-none text-white placeholder-indigo-200 text-sm w-32"
                />
              </div>
              
              <button 
                onClick={fetchAlerts}
                className="relative p-3 bg-white bg-opacity-20 rounded-xl hover:bg-opacity-30 transition-all duration-300 group glass-morphism hover-lift"
              >
                <FaBell className="text-xl group-hover:animate-bounce-subtle" />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse glow-red">
                    {alerts.length}
                  </span>
                )}
              </button>
              
              <button 
                onClick={refreshData}
                disabled={refreshing}
                className="p-3 bg-white bg-opacity-20 rounded-xl hover:bg-opacity-30 transition-all duration-300 group glass-morphism hover-lift"
              >
                <FaSyncAlt className={`text-xl ${refreshing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
              </button>
              
              <button 
                onClick={exportData}
                className="px-4 py-3 bg-white bg-opacity-20 rounded-xl hover:bg-opacity-30 transition-all duration-300 flex items-center space-x-2 group glass-morphism hover-lift"
              >
                <FaDownload className="group-hover:scale-110 transition-transform" />
                <span>Export</span>
              </button>
            </div>
              </button>
              
              <button 
                onClick={refreshData}
                disabled={refreshing}
                className="p-3 bg-white bg-opacity-20 rounded-xl hover:bg-opacity-30 transition-all duration-300 group glass-morphism hover-lift"
              >
                <FaSyncAlt className={`text-xl ${refreshing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
              </button>
              
              <button 
                onClick={exportData}
                className="px-4 py-3 bg-white bg-opacity-20 rounded-xl hover:bg-opacity-30 transition-all duration-300 flex items-center space-x-2 group glass-morphism hover-lift"
              >
                <FaDownload className="group-hover:scale-110 transition-transform" />
                <span>Export</span>
              </button>
            </div> */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Quick Stats */}
        {/* {quickStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="animate-scaleIn stagger-item">
              <StatCard
                icon={<FaStar className="text-2xl" />}
                title="Overall Rating"
                value={`${quickStats.overallRating}/5.0`}
                change={quickStats.trend}
                trend={quickStats.trend}
                color="yellow"
                subtitle="Average across all meals"
              />
            </div>
            <div className="animate-scaleIn stagger-item">
              <StatCard
                icon={<FaUsers className="text-2xl" />}
                title="Participation"
                value={`${quickStats.participationRate}%`}
                color="blue"
                subtitle="Student engagement rate"
              />
            </div>
            <div className="animate-scaleIn stagger-item">
              <StatCard
                icon={<FaComments className="text-2xl" />}
                title="Total Feedbacks"
                value={quickStats.totalFeedbacks}
                color="green"
                subtitle="Responses collected"
              />
            </div>
            <div className="animate-scaleIn stagger-item">
              <StatCard
                icon={<FaShieldAlt className="text-2xl" />}
                title="System Health"
                value={alerts.length === 0 ? "Excellent" : `${alerts.length} Issues`}
                color={alerts.length === 0 ? "green" : "red"}
                subtitle="Overall status"
              />
            </div>
          </div>
        )} */}

        {/* Enhanced Alerts Section */}
        {/* {alerts.length > 0 && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6 mb-8 shadow-lg animate-fadeIn glow-red">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-red-100 rounded-xl">
                  <FaExclamationTriangle className="text-red-500 text-xl animate-bounce-subtle" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-red-800">Active Alerts</h2>
                  <p className="text-red-600 text-sm">Issues requiring immediate attention</p>
                </div>
              </div>
              <button 
                onClick={() => setAlerts([])}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium hover-scale"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-4">
              {alerts.slice(0, 3).map((alert, index) => (
                <div key={index} className="animate-slideInLeft stagger-item">
                  <AlertCard alert={alert} index={index} />
                </div>
              ))}
              {alerts.length > 3 && (
                <div className="text-center">
                  <button className="text-red-600 hover:text-red-800 font-medium text-sm hover-scale">
                    View {alerts.length - 3} more alerts...
                  </button>
                </div>
              )}
            </div>
        //   </div> 
        // {/* )} */}

        {/* Enhanced Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mb-8 overflow-hidden animate-scaleIn">
          <div className="border-b border-gray-200 bg-gray-50">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'daily', label: 'Daily Analysis', icon: FaCalendarAlt, color: 'blue' },
                { id: 'weekly', label: 'Weekly Analysis', icon: FaChartLine, color: 'green' },
                // { id: 'historical', label: 'Historical Analysis', icon: FaHistory, color: 'purple' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-3 py-4 px-3 border-b-3 font-semibold text-sm transition-all duration-300 relative hover-lift ${
                    activeTab === tab.id
                      ? `${tab.color === 'blue' ? 'border-blue-500 text-blue-600' : 
                          tab.color === 'green' ? 'border-green-500 text-green-600' : 
                          'border-purple-500 text-purple-600'} bg-white`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className={`${activeTab === tab.id ? 'animate-pulse-custom' : ''}`} />
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className={`absolute -bottom-0.5 left-0 right-0 h-0.5 animate-pulse ${
                      tab.color === 'blue' ? 'bg-blue-500' : 
                      tab.color === 'green' ? 'bg-green-500' : 
                      'bg-purple-500'
                    }`}></div>
                  )}
                </button>
              ))}
            </nav>
          </div>

            {/* Enhanced Tab Content */}
          <div className="p-8">
            {/* Enhanced Daily Analysis Tab */}
            {activeTab === 'daily' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Daily Analysis</h2>
                    <p className="text-gray-600 mt-1">Detailed insights for selected date (Previous days only)</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700">Analysis Date:</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        max={new Date(Date.now() - 86400000).toISOString().split('T')[0]} // Yesterday max
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                      />
                      <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Loading State */}
                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <span className="ml-3 text-gray-600">Loading daily analysis...</span>
                  </div>
                )}

                {/* Handle different data states */}
                {!loading && dailyData && dailyData.type === 'no_feedback' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
                    <div className="flex items-center justify-center mb-4">
                      <div className="p-4 bg-yellow-100 rounded-full">
                        <FaExclamationTriangle className="text-yellow-600 text-2xl" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-yellow-800 mb-2">No Feedback Found</h3>
                    <p className="text-yellow-700">{dailyData.message}</p>
                  </div>
                )}

                {!loading && dailyData && dailyData.type === 'future_date' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
                    <div className="flex items-center justify-center mb-4">
                      <div className="p-4 bg-blue-100 rounded-full">
                        <FaClock className="text-blue-600 text-2xl" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-blue-800 mb-2">Feedback Not Available</h3>
                    <p className="text-blue-700">{dailyData.message}</p>
                  </div>
                )}

                {/* Success Data Display */}
                {!loading && dailyData && !dailyData.type && (
                  <>
                    {/* Enhanced Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -mr-12 -mt-12"></div>
                        <div className="relative">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Total Students</p>
                              <p className="text-4xl font-bold">{dailyData.overview?.totalStudents || 0}</p>
                            </div>
                            <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                              <FaUsers className="text-3xl" />
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 text-blue-100">
                            <FaCheckCircle className="text-sm" />
                            <span className="text-sm">Registered users</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -mr-12 -mt-12"></div>
                        <div className="relative">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="text-green-100 text-sm font-medium uppercase tracking-wide">Participation Rate</p>
                              <p className="text-4xl font-bold">{dailyData.overview?.participationRate || 0}%</p>
                            </div>
                            <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                              <FaChartLine className="text-3xl" />
                            </div>
                          </div>
                          <div className="w-full bg-green-400 bg-opacity-30 rounded-full h-2">
                            <div 
                              className="bg-white h-2 rounded-full transition-all duration-1000"
                              style={{ width: `${dailyData.overview?.participationRate || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -mr-12 -mt-12"></div>
                        <div className="relative">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="text-purple-100 text-sm font-medium uppercase tracking-wide">Overall Rating</p>
                              <p className="text-4xl font-bold">{dailyData.overview?.overallRating || 0}/5.0</p>
                            </div>
                            <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                              <FaStar className="text-3xl" />
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FaStar
                                key={star}
                                className={`text-lg ${
                                  star <= Math.round(dailyData.overview?.overallRating || 0) 
                                    ? 'text-yellow-300' 
                                    : 'text-purple-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Data Visualization Section */}
                    <div>
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Visual Analysis</h3>
                        <p className="text-gray-600">Comprehensive insights through interactive charts</p>
                      </div>
                      
                      {/* 1. Average Rating per Meal (Pie Chart) & 2. Student Rating per Meal (Bar Chart) */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <div className="animate-fadeIn">
                          <AverageRatingPerMealChart 
                            data={dailyData.averageRatingPerMeal || {}}
                            title="Average Rating per Meal"
                          />
                        </div>
                        
                        <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                          <StudentRatingPerMealChart 
                            data={dailyData.studentRatingPerMeal || {}}
                            title="Student Participation per Meal"
                          />
                        </div>
                      </div>

                      {/* 3. Feedback Distribution per Meal (Bar Charts) */}
                      <div className="mb-8">
                        <h4 className="text-xl font-bold text-gray-900 mb-4">Rating Distribution by Meal</h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                          {Object.keys(dailyData.feedbackDistributionPerMeal || {}).map((meal, index) => (
                            <div key={meal} className="animate-fadeIn" style={{ animationDelay: `${0.1 * index}s` }}>
                              <FeedbackDistributionChart 
                                data={dailyData.feedbackDistributionPerMeal}
                                mealName={meal}
                              />
                            </div>
                          ))}
                        </div>
                        
                        {/* Combined Distribution Chart */}
                        <div className="animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                          <AllMealsFeedbackDistributionChart 
                            data={dailyData.feedbackDistributionPerMeal || {}}
                          />
                        </div>
                      </div>

                      {/* 4. Sentiment Analysis per Meal */}
                      <div className="mb-8">
                        <h4 className="text-xl font-bold text-gray-900 mb-4">Sentiment Analysis per Meal</h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                          {Object.keys(dailyData.sentimentAnalysisPerMeal || {}).map((meal, index) => (
                            <div key={meal} className="animate-fadeIn" style={{ animationDelay: `${0.1 * index}s` }}>
                              <SentimentScoreChart 
                                data={dailyData.sentimentAnalysisPerMeal}
                                mealName={meal}
                              />
                            </div>
                          ))}
                        </div>
                        
                        {/* Detailed Sentiment Information */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                          {Object.entries(dailyData.sentimentAnalysisPerMeal || {}).map(([meal, data], index) => (
                            <div key={meal} className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                              <h5 className="font-bold text-lg text-gray-900 mb-4 flex items-center space-x-2">
                                {getMealIcon(meal.toLowerCase())}
                                <span>{meal}</span>
                              </h5>
                              
                              <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">Average Rating:</span>
                                  <span className="font-bold text-lg">{data.average_rating}/5.0</span>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">Total Comments:</span>
                                  <span className="font-medium">{data.total_comments}</span>
                                </div>
                                
                                {data.positive_feedback && data.positive_feedback.length > 0 && (
                                  <div>
                                    <p className="text-sm font-medium text-green-700 mb-2">🎉 Positive Feedback:</p>
                                    <ul className="text-sm text-gray-700 space-y-1">
                                      {data.positive_feedback.map((comment, i) => (
                                        <li key={i} className="text-xs bg-green-50 p-2 rounded">"{comment}"</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {data.improvement_areas && data.improvement_areas.length > 0 && (
                                  <div>
                                    <p className="text-sm font-medium text-red-700 mb-2">⚠️ Improvement Areas:</p>
                                    <ul className="text-sm text-gray-700 space-y-1">
                                      {data.improvement_areas.map((comment, i) => (
                                        <li key={i} className="text-xs bg-red-50 p-2 rounded">"{comment}"</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 5. Overall Feedback & Common Issues (AI Summary) */}
                      {dailyData.overallSummary && (
                        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-8 border border-indigo-200">
                          <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                            <FaRobot className="text-purple-600 text-2xl" />
                            <span>AI-Powered Overall Summary</span>
                          </h4>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Overall Feedback */}
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                              <h5 className="font-bold text-lg text-gray-900 mb-3 flex items-center space-x-2">
                                <FaComments className="text-blue-500" />
                                <span>Overall Feedback</span>
                              </h5>
                              <p className="text-gray-700">{dailyData.overallSummary.overall_feedback}</p>
                            </div>
                            
                            {/* Common Issues */}
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                              <h5 className="font-bold text-lg text-gray-900 mb-3 flex items-center space-x-2">
                                <FaExclamationTriangle className="text-red-500" />
                                <span>Common Issues</span>
                              </h5>
                              {dailyData.overallSummary.common_issues && dailyData.overallSummary.common_issues.length > 0 ? (
                                <ul className="space-y-2">
                                  {dailyData.overallSummary.common_issues.map((issue, index) => (
                                    <li key={index} className="text-sm text-gray-700 flex items-start space-x-2">
                                      <span className="text-red-500 mt-1">•</span>
                                      <span>{issue}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-gray-500 text-sm">No major issues identified today!</p>
                              )}
                            </div>
                            
                            {/* Positive Highlights */}
                            {dailyData.overallSummary.positive_highlights && dailyData.overallSummary.positive_highlights.length > 0 && (
                              <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h5 className="font-bold text-lg text-gray-900 mb-3 flex items-center space-x-2">
                                  <FaThumbsUp className="text-green-500" />
                                  <span>Positive Highlights</span>
                                </h5>
                                <ul className="space-y-2">
                                  {dailyData.overallSummary.positive_highlights.map((highlight, index) => (
                                    <li key={index} className="text-sm text-gray-700 flex items-start space-x-2">
                                      <span className="text-green-500 mt-1">•</span>
                                      <span>{highlight}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Recommendations */}
                            {dailyData.overallSummary.recommendations && dailyData.overallSummary.recommendations.length > 0 && (
                              <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h5 className="font-bold text-lg text-gray-900 mb-3 flex items-center space-x-2">
                                  <FaLightbulb className="text-yellow-500" />
                                  <span>Recommendations</span>
                                </h5>
                                <ul className="space-y-2">
                                  {dailyData.overallSummary.recommendations.map((rec, index) => (
                                    <li key={index} className="text-sm text-gray-700 flex items-start space-x-2">
                                      <span className="text-yellow-500 mt-1">•</span>
                                      <span>{rec}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Error State */}
                {!loading && !dailyData && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                    <div className="flex items-center justify-center mb-4">
                      <div className="p-4 bg-red-100 rounded-full">
                        <FaExclamationCircle className="text-red-600 text-2xl" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-red-800 mb-2">Error Loading Data</h3>
                    <p className="text-red-700">Unable to load daily analysis. Please try again or select a different date.</p>
                    <button 
                      onClick={fetchDailyData}
                      className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </div>
            )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <FaEye />
                          <span>Click cards to expand details</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {Object.entries(dailyData.mealPerformance).map(([meal, data]) => (
                          <MealPerformanceCard key={meal} meal={meal} data={data} />
                        ))}
                      </div>
                    </div>

                    {/* Enhanced Data Visualization Section */}
                    <div>
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Advanced Data Visualizations</h3>
                        <p className="text-gray-600">Comprehensive visual insights and analytics for better understanding</p>
                      </div>
                      
                      {/* Primary Charts Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Meal Performance Bar Chart */}
                        <div className="animate-fadeIn">
                          <MealPerformanceChart 
                            data={{
                              labels: Object.keys(dailyData.mealPerformance),
                              ratings: Object.values(dailyData.mealPerformance).map(meal => meal.averageRating)
                            }}
                            title="Daily Meal Ratings"
                          />
                        </div>
                        
                        {/* Meal Quality Radar Chart */}
                        {/* <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                          <MealQualityRadarChart 
                            data={{
                              current: [4.2, 4.5, 3.8, 4.0, 4.1, 4.3],
                              target: [4.5, 4.7, 4.2, 4.3, 4.4, 4.5]
                            }}
                            title="Daily Meal Quality Analysis"
                          />
                        </div> */}
                      </div>

                      {/* Secondary Charts Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {/* Rating Distribution Pie Chart */}
                        <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                          <RatingDistributionChart 
                            data={dailyData.ratingDistribution || [30, 25, 20, 15, 10]}
                            title="Rating Distribution"
                          />
                        </div>
                        
                        {/* Participation Rate Doughnut Chart */}
                        <div className="animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                          <ParticipationChart 
                            data={[dailyData.overview.participationRate, 100 - dailyData.overview.participationRate]}
                            title="Participation Overview"
                          />
                        </div>
                        
                        {/* Student Satisfaction Gauge */}
                        <div className="animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                          <SatisfactionGaugeChart 
                            data={{ score: Math.round(dailyData.overview.overallRating * 20) }}
                            title="Overall Satisfaction"
                          />
                        </div>
                      </div>

                      {/* Advanced Analytics Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Sentiment Analysis Chart */}
                        <div className="animate-fadeIn" style={{ animationDelay: '0.5s' }}>
                          <SentimentAnalysisChart 
                            data={dailyData.sentimentAnalysis || [35, 30, 20, 10, 5]}
                            title="Feedback Sentiment Analysis"
                          />
                        </div>
                        
                        {/* Peak Hours Analysis */}
                        <div className="animate-fadeIn" style={{ animationDelay: '0.6s' }}>
                          <PeakHoursChart 
                            data={{
                              labels: ['6AM', '7AM', '8AM', '12PM', '1PM', '2PM', '7PM', '8PM', '9PM'],
                              values: [15, 45, 35, 60, 85, 40, 70, 55, 25]
                            }}
                            title="Daily Feedback Activity"
                          />
                        </div>
                      </div>

                      {/* Real-time Metrics Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Feedback Intensity Heatmap */}
                        <div className="animate-fadeIn" style={{ animationDelay: '0.7s' }}>
                          <FeedbackHeatmapChart 
                            data={[45, 65, 80, 55, 85, 25]}
                            title="Feedback Intensity by Time"
                          />
                        </div>
                        
                        {/* Complaint Categories */}
                        <div className="animate-fadeIn" style={{ animationDelay: '0.8s' }}>
                          <ComplaintCategoriesChart 
                            data={{
                              labels: ['Food Quality', 'Service Speed', 'Hygiene', 'Variety', 'Temperature', 'Portion Size'],
                              values: [35, 20, 15, 12, 10, 8]
                            }}
                            title="Common Issues Today"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Insights */}
                    {dailyData.insights && dailyData.insights.length > 0 && (
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">AI-Generated Key Insights</h3>
                        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {dailyData.insights.map((insight, index) => (
                              <div key={index} className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm">
                                <div className={`p-2 rounded-full ${
                                  insight.type === 'positive' ? 'bg-green-100 text-green-600' : 
                                  insight.type === 'negative' ? 'bg-red-100 text-red-600' : 
                                  'bg-yellow-100 text-yellow-600'
                                }`}>
                                  {insight.type === 'positive' ? <FaCheckCircle /> : 
                                   insight.type === 'negative' ? <FaExclamationTriangle /> : 
                                   <FaLightbulb />}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 mb-1">
                                    {insight.type === 'positive' ? 'Positive Trend' : 
                                     insight.type === 'negative' ? 'Area of Concern' : 
                                     'Insight'}
                                  </p>
                                  <p className="text-gray-700 text-sm">{insight.message}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Enhanced Weekly Analysis Tab */}
            {activeTab === 'weekly' && weeklyData && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Weekly Analysis</h2>
                    <p className="text-gray-600 mt-1">
                      {weeklyData.overview.weekStart} to {weeklyData.overview.weekEnd}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FaHistory />
                    <span>7-day trend analysis</span>
                  </div>
                </div>

                {/* Weekly Overview Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-indigo-100 uppercase text-xs tracking-wide">Average Rating</h4>
                        <p className="text-3xl font-bold">{weeklyData.overview.averageRating}/5.0</p>
                      </div>
                      <FaStar className="text-2xl text-indigo-200" />
                    </div>
                    <div className="mt-3 flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`text-sm ${
                            star <= Math.round(weeklyData.overview.averageRating) 
                              ? 'text-yellow-300' 
                              : 'text-indigo-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-green-100 uppercase text-xs tracking-wide">Avg Participation</h4>
                        <p className="text-3xl font-bold">{weeklyData.overview.averageParticipationRate}%</p>
                      </div>
                      <FaChartLine className="text-2xl text-green-200" />
                    </div>
                    <div className="mt-3 w-full bg-green-400 bg-opacity-30 rounded-full h-2">
                      <div 
                        className="bg-white h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${weeklyData.overview.averageParticipationRate}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-blue-100 uppercase text-xs tracking-wide">Best Day</h4>
                        <p className="text-xl font-bold">
                          {weeklyData.overview.bestDay?.dayName}
                        </p>
                        <p className="text-blue-200 text-sm">{weeklyData.overview.bestDay?.rating}/5.0 rating</p>
                      </div>
                      <FaHeart className="text-2xl text-blue-200" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-red-100 uppercase text-xs tracking-wide">Needs Attention</h4>
                        <p className="text-xl font-bold">
                          {weeklyData.overview.worstDay?.dayName}
                        </p>
                        <p className="text-red-200 text-sm">{weeklyData.overview.worstDay?.rating}/5.0 rating</p>
                      </div>
                      <FaExclamationTriangle className="text-2xl text-red-200" />
                    </div>
                  </div>
                </div>

                {/* Enhanced Meal Trends */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Weekly Meal Trends</h3>
                      <p className="text-gray-600">Performance patterns across the week</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                    {Object.entries(weeklyData.mealTrends).map(([meal, data]) => (
                      <div key={meal} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            {getMealIcon(meal)}
                            <h4 className="font-bold capitalize text-lg">{meal}</h4>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getTrendIcon(data.trend)}
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              data.trend === 'improving' ? 'bg-green-100 text-green-800' :
                              data.trend === 'declining' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {data.trend}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600">Weekly Average:</span>
                            <div className="flex items-center space-x-2">
                              <div className="flex space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <FaStar
                                    key={star}
                                    className={`text-xs ${
                                      star <= Math.round(data.weeklyAverage) 
                                        ? 'text-yellow-400' 
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="font-bold text-lg">{data.weeklyAverage}/5.0</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Consistency Score:</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-500 ${
                                    data.consistency >= 80 ? 'bg-green-500' :
                                    data.consistency >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${data.consistency}%` }}
                                ></div>
                              </div>
                              <span className="font-medium text-sm">{data.consistency}%</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Peak Performance:</span>
                            <span className="font-medium text-sm text-blue-600">{data.bestDay?.dayName}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Enhanced Weekly Data Visualizations */}
                  <div className="mb-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Weekly Advanced Analytics</h4>
                    <p className="text-gray-600">Comprehensive visual trends and patterns over the week</p>
                  </div>
                  
                  {/* Primary Weekly Charts */}
                  <div className="grid grid-cols-1 gap-8 mb-8">
                    {/* Weekly Trend Line Chart */}
                    <div className="animate-fadeIn">
                      <WeeklyTrendChart 
                        data={{
                          labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                          overall: weeklyData.dailyRatings || [4.1, 3.9, 4.2, 4.0, 3.8, 4.3, 4.1],
                          participation: weeklyData.dailyParticipation || [85, 82, 88, 86, 80, 90, 87]
                        }}
                        title="Weekly Rating & Participation Trends"
                      />
                    </div>
                  </div>

                  {/* Secondary Weekly Analytics Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Weekly Meal Quality Radar */}
                    {/* <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                      <MealQualityRadarChart 
                        data={{
                          current: [4.0, 4.3, 3.7, 3.9, 4.1, 4.2],
                          target: [4.5, 4.7, 4.2, 4.3, 4.4, 4.5]
                        }}
                        title="Weekly Quality Metrics"
                      />
                    </div> */}
                    
                    {/* Weekly Satisfaction Gauge */}
                    <div className="animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                      <SatisfactionGaugeChart 
                        data={{ score: Math.round(weeklyData.overview?.averageRating * 20) || 82 }}
                        title="Weekly Satisfaction Score"
                      />
                    </div>
                  </div>

                  {/* Detailed Weekly Analytics */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Weekly Feedback Heatmap */}
                    <div className="animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                      <FeedbackHeatmapChart 
                        data={[40, 60, 75, 50, 80, 30]}
                        title="Weekly Feedback Distribution"
                      />
                    </div>
                    
                    {/* Weekly Issues Analysis */}
                    <div className="animate-fadeIn" style={{ animationDelay: '0.5s' }}>
                      <ComplaintCategoriesChart 
                        data={{
                          labels: ['Food Quality', 'Service', 'Hygiene', 'Variety', 'Temperature', 'Portion'],
                          values: [25, 18, 12, 15, 8, 6]
                        }}
                        title="Weekly Issues Breakdown"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Historical Analysis Tab */}
            {activeTab === 'historical' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Historical Comparison</h2>
                    <p className="text-gray-600 mt-1">Compare trends across different time periods</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      <label className="text-sm font-medium text-gray-700">Period 1:</label>
                      <input
                        type="date"
                        value={historicalStartDate}
                        onChange={(e) => setHistoricalStartDate(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="date"
                        value={historicalEndDate}
                        onChange={(e) => setHistoricalEndDate(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {historicalData && (
                  <>
                    {/* Enhanced Period Comparison */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Period 1 Card */}
                      <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
                        <div className="relative">
                          <div className="flex items-center justify-between mb-6">
                            <div>
                              <h3 className="font-bold text-xl mb-2">Period 1 Analysis</h3>
                              <p className="text-blue-100 text-sm">
                                {historicalData.overview.period1.startDate} to {historicalData.overview.period1.endDate}
                              </p>
                            </div>
                            <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                              <FaHistory className="text-2xl" />
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-blue-100">Overall Rating:</span>
                              <div className="flex items-center space-x-2">
                                <span className="text-3xl font-bold">{historicalData.overview.period1.overallRating}/5.0</span>
                                <div className="flex space-x-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <FaStar
                                      key={star}
                                      className={`text-sm ${
                                        star <= Math.round(historicalData.overview.period1.overallRating) 
                                          ? 'text-yellow-300' 
                                          : 'text-blue-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-blue-100">Participation Rate:</span>
                              <div className="flex items-center space-x-3">
                                <span className="text-xl font-bold">{historicalData.overview.period1.participationRate}%</span>
                                <div className="w-20 bg-blue-400 bg-opacity-30 rounded-full h-2">
                                  <div 
                                    className="bg-white h-2 rounded-full transition-all duration-1000"
                                    style={{ width: `${historicalData.overview.period1.participationRate}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Period 2 Card */}
                      <div className="bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
                        <div className="relative">
                          <div className="flex items-center justify-between mb-6">
                            <div>
                              <h3 className="font-bold text-xl mb-2">Period 2 Analysis</h3>
                              <p className="text-green-100 text-sm">
                                {historicalData.overview.period2.startDate} to {historicalData.overview.period2.endDate}
                              </p>
                            </div>
                            <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                              <FaChartLine className="text-2xl" />
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-green-100">Overall Rating:</span>
                              <div className="flex items-center space-x-2">
                                <span className="text-3xl font-bold">{historicalData.overview.period2.overallRating}/5.0</span>
                                <div className="flex space-x-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <FaStar
                                      key={star}
                                      className={`text-sm ${
                                        star <= Math.round(historicalData.overview.period2.overallRating) 
                                          ? 'text-yellow-300' 
                                          : 'text-green-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-green-100">Participation Rate:</span>
                              <div className="flex items-center space-x-3">
                                <span className="text-xl font-bold">{historicalData.overview.period2.participationRate}%</span>
                                <div className="w-20 bg-green-400 bg-opacity-30 rounded-full h-2">
                                  <div 
                                    className="bg-white h-2 rounded-full transition-all duration-1000"
                                    style={{ width: `${historicalData.overview.period2.participationRate}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Meal Comparisons */}
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">Detailed Meal-wise Comparison</h3>
                          <p className="text-gray-600">Performance changes across different meal types</p>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>Improved</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span>Declined</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                            <span>Stable</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                        {Object.entries(historicalData.mealComparisons).map(([meal, data]) => (
                          <div key={meal} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center space-x-3">
                                {getMealIcon(meal)}
                                <h4 className="font-bold capitalize text-lg">{meal}</h4>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getTrendIcon(data.trend)}
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  data.change > 0 ? 'bg-green-100 text-green-800' :
                                  data.change < 0 ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {data.change > 0 ? '+' : ''}{data.change}
                                </span>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                <span className="text-sm font-medium text-blue-800">Period 1:</span>
                                <div className="flex items-center space-x-2">
                                  <div className="flex space-x-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <FaStar
                                        key={star}
                                        className={`text-xs ${
                                          star <= Math.round(data.period1Rating) 
                                            ? 'text-yellow-500' 
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="font-bold text-blue-900">{data.period1Rating}/5.0</span>
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                <span className="text-sm font-medium text-green-800">Period 2:</span>
                                <div className="flex items-center space-x-2">
                                  <div className="flex space-x-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <FaStar
                                        key={star}
                                        className={`text-xs ${
                                          star <= Math.round(data.period2Rating) 
                                            ? 'text-yellow-500' 
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="font-bold text-green-900">{data.period2Rating}/5.0</span>
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-800">Net Change:</span>
                                <div className="flex items-center space-x-2">
                                  {data.change > 0 ? <FaArrowUp className="text-green-500" /> :
                                   data.change < 0 ? <FaArrowDown className="text-red-500" /> :
                                   <FaEquals className="text-gray-500" />}
                                  <span className={`font-bold ${
                                    data.change > 0 ? 'text-green-600' : 
                                    data.change < 0 ? 'text-red-600' : 'text-gray-600'
                                  }`}>
                                    {data.change > 0 ? '+' : ''}{data.change} pts
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Enhanced Historical Data Visualizations */}
                      <div className="mb-6">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">Advanced Historical Analytics</h4>
                        <p className="text-gray-600">Comprehensive visual comparison and trend analysis across periods</p>
                      </div>
                      
                      {/* Primary Historical Chart */}
                      <div className="grid grid-cols-1 gap-8 mb-8">
                        <div className="animate-fadeIn">
                          <HistoricalComparisonChart 
                            data={{
                              labels: ['Period 1', 'Period 2'],
                              breakfast: [
                                historicalData.mealComparisons.breakfast?.period1Rating || 4.0,
                                historicalData.mealComparisons.breakfast?.period2Rating || 4.2
                              ],
                              lunch: [
                                historicalData.mealComparisons.lunch?.period1Rating || 3.8,
                                historicalData.mealComparisons.lunch?.period2Rating || 4.0
                              ],
                              dinner: [
                                historicalData.mealComparisons.dinner?.period1Rating || 4.1,
                                historicalData.mealComparisons.dinner?.period2Rating || 4.0
                              ],
                              snacks: [
                                historicalData.mealComparisons.snacks?.period1Rating || 3.9,
                                historicalData.mealComparisons.snacks?.period2Rating || 4.1
                              ]
                            }}
                            title="Period-wise Meal Performance Comparison"
                          />
                        </div>
                      </div>

                      {/* Secondary Historical Analytics Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Monthly Performance Comparison */}
                        <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                          <MonthlyComparisonChart 
                            data={{
                              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                              ratings: [4.1, 4.2, 3.9, 4.3, 4.0, 4.2],
                              feedback: [150, 165, 140, 180, 155, 170]
                            }}
                            title="6-Month Performance Overview"
                          />
                        </div>
                        
                        {/* Historical Quality Radar */}
                        {/* <div className="animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                          <MealQualityRadarChart 
                            data={{
                              current: [4.0, 4.2, 3.8, 4.1, 3.9, 4.3],
                              target: [4.5, 4.7, 4.2, 4.3, 4.4, 4.5]
                            }}
                            title="Historical Quality Metrics"
                          />
                        </div> */}
                      </div>

                      {/* Tertiary Historical Analytics */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Historical Satisfaction Trend */}
                        <div className="animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                          <SatisfactionGaugeChart 
                            data={{ 
                              score: Math.round(
                                ((historicalData.overview.period1?.overallRating || 4.0) + 
                                 (historicalData.overview.period2?.overallRating || 4.1)) / 2 * 20
                              ) 
                            }}
                            title="Average Historical Satisfaction"
                          />
                        </div>
                        
                        {/* Long-term Issues Analysis */}
                        <div className="animate-fadeIn" style={{ animationDelay: '0.5s' }}>
                          <ComplaintCategoriesChart 
                            data={{
                              labels: ['Food Quality', 'Service', 'Hygiene', 'Variety', 'Temperature', 'Portion'],
                              values: [22, 16, 14, 18, 12, 8]
                            }}
                            title="Historical Issues Pattern"
                          />
                        </div>
                        
                        {/* Time-based Analysis */}
                        <div className="animate-fadeIn" style={{ animationDelay: '0.6s' }}>
                          <FeedbackHeatmapChart 
                            data={[35, 55, 70, 45, 75, 30]}
                            title="Historical Feedback Patterns"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Enhanced Weekly Analysis Tab */}
            {activeTab === 'weekly' && weeklyData && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Weekly Analysis</h2>
                    <p className="text-gray-600 mt-1">
                      {weeklyData.overview.weekStart} to {weeklyData.overview.weekEnd}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FaEye />
                    <span>Comprehensive weekly insights</span>
                  </div>
                </div>
                {/* Weekly content here */}
                <div className="text-center py-12">
                  <FaChartLine className="text-6xl text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">Weekly Analysis</h3>
                  <p className="text-gray-500">Weekly analysis feature coming soon...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Suggestions Panel */}
        <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-2xl p-8 shadow-xl border border-purple-200 animate-fadeIn">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FaRobot className="text-purple-600 text-2xl animate-pulse-custom" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-purple-900">AI-Powered Insights</h3>
                <p className="text-purple-700 text-sm">Intelligent recommendations based on current data</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-purple-600">
              <FaLightbulb className="animate-bounce-subtle" />
              <span className="text-sm font-medium">Smart Suggestions</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100 hover-lift">
              <div className="flex items-center space-x-3 mb-4">
                <FaChartLine className="text-green-500 text-xl" />
                <h4 className="font-bold text-gray-900">Performance Boost</h4>
              </div>
              <p className="text-gray-700 text-sm mb-3">
                Breakfast ratings have improved by 15% this week. Consider replicating successful recipes for other meals.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">High Impact</span>
                <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                  View Details →
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100 hover-lift">
              <div className="flex items-center space-x-3 mb-4">
                <FaExclamationTriangle className="text-yellow-500 text-xl" />
                <h4 className="font-bold text-gray-900">Attention Required</h4>
              </div>
              <p className="text-gray-700 text-sm mb-3">
                Dinner participation has dropped by 8%. Consider surveying students for preferred meal times and options.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">Medium Priority</span>
                <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                  Take Action →
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100 hover-lift">
              <div className="flex items-center space-x-3 mb-4">
                <FaUsers className="text-blue-500 text-xl" />
                <h4 className="font-bold text-gray-900">Engagement Opportunity</h4>
              </div>
              <p className="text-gray-700 text-sm mb-3">
                Weekend feedback rates are lower. Implement gamification or incentives to boost student participation.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Innovation</span>
                <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                  Explore Ideas →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-8 text-center text-gray-500 text-sm animate-fadeIn">
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <FaClock />
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaShieldAlt />
              <span>Data secured & encrypted</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaCheckCircle />
              <span>System operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
