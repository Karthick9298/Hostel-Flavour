import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  WeeklyDailyBreakdownChart,
  WeeklyMealTrendsChart,
  WeeklyParticipationChart,
  WeeklyPerformanceRadarChart,
  WeeklyPatternsPieChart
} from '../../components/charts/WeeklyAnalysisCharts';
import { 
  FaChartBar, 
  FaUsers, 
  FaComments, 
  FaRobot,
  FaCalendarAlt,
  FaStar,
  FaExclamationTriangle,
  FaChartLine,
  FaClock,
  FaThumbsUp,
  FaThumbsDown,
  FaUtensils,
  FaCoffee,
  FaLightbulb,
  FaExclamationCircle,
  FaCheckCircle,
  FaArrowUp,
  FaArrowDown,
  FaEquals,
  FaCalendarWeek,
  FaChartPie
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const WeeklyAnalysisDashboard = () => {
  const [weeklyData, setWeeklyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(() => {
    // Default to last week for analysis
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    return lastWeek.toISOString().split('T')[0];
  });

  useEffect(() => {
    fetchWeeklyData();
  }, [selectedWeek]);

  const fetchWeeklyData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/analytics/weekly/${selectedWeek}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('firebaseToken')}`
        }
      });
      const data = await response.json();
      
      if (!data.error) {
        setWeeklyData(data.data);
      } else {
        console.error('Error in weekly analysis:', data.message);
        toast.error(data.message || 'Failed to fetch weekly data');
      }
    } catch (error) {
      console.error('Error fetching weekly data:', error);
      toast.error('Failed to fetch weekly analysis data');
    } finally {
      setLoading(false);
    }
  };

  const getMealIcon = (mealType) => {
    switch (mealType?.toLowerCase()) {
      case 'morning': return <FaCoffee className="text-yellow-500" />;
      case 'afternoon': return <FaUtensils className="text-orange-500" />;
      case 'evening': return <FaUtensils className="text-blue-500" />;
      case 'night': return <FaUtensils className="text-green-500" />;
      default: return <FaUtensils className="text-gray-500" />;
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return <FaArrowUp className="text-green-500" />;
      case 'declining': return <FaArrowDown className="text-red-500" />;
      default: return <FaEquals className="text-gray-500" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'improving': return 'text-green-600 bg-green-50';
      case 'declining': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'positive': return <FaCheckCircle className="text-green-500" />;
      case 'negative': return <FaExclamationTriangle className="text-red-500" />;
      case 'warning': return <FaExclamationCircle className="text-yellow-500" />;
      default: return <FaLightbulb className="text-blue-500" />;
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical': return <FaExclamationTriangle className="text-red-500" />;
      case 'warning': return <FaExclamationCircle className="text-yellow-500" />;
      default: return <FaLightbulb className="text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg">
              <FaCalendarWeek className="text-2xl text-indigo-600 animate-pulse" />
            </div>
          </div>
          <LoadingSpinner text="Loading weekly analysis..." />
          <p className="text-sm text-gray-600 mt-2">Analyzing weekly trends...</p>
        </div>
      </div>
    );
  }

  if (!weeklyData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <FaExclamationCircle className="text-4xl text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Weekly Data Available</h2>
          <p className="text-gray-600">Please try selecting a different week with available feedback data.</p>
        </div>
      </div>
    );
  }

  const overview = weeklyData.overview || {};
  const dailyBreakdown = weeklyData.dailyBreakdown || {};
  const mealTrends = weeklyData.mealTrends || {};
  const weeklyInsights = weeklyData.weeklyInsights || [];
  const weeklyAlerts = weeklyData.weeklyAlerts || [];
  const patterns = weeklyData.patterns || {};
  const participationAnalysis = weeklyData.participationAnalysis || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <FaCalendarWeek className="text-xl text-indigo-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-800">Weekly Food Analysis</h1>
                </div>
                <p className="text-gray-600">
                  Week: {overview.weekStart} to {overview.weekEnd}
                </p>
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{overview.averageRating || 0}/5</div>
                  <div className="text-sm text-gray-600">Avg Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{overview.totalFeedbacks || 0}</div>
                  <div className="text-sm text-gray-600">Total Feedback</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{overview.averageParticipationRate || 0}%</div>
                  <div className="text-sm text-gray-600">Participation</div>
                </div>
              </div>
            </div>
            
            {/* Week Selection */}
            <div className="mt-4 pt-4 border-t">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Week (Monday-Sunday):
              </label>
              <input
                type="date"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Weekly Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaUsers className="text-xl text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Participation</h3>
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {overview.averageParticipation || 0}
            </div>
            <div className="text-sm text-gray-600">Avg daily students</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FaStar className="text-xl text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Best Day</h3>
            </div>
            <div className="text-xl font-bold text-yellow-600 mb-1">
              {overview.bestDay?.dayName || 'N/A'}
            </div>
            <div className="text-sm text-gray-600">
              {overview.bestDay?.rating || 0}/5 rating
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <FaExclamationTriangle className="text-xl text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Needs Attention</h3>
            </div>
            <div className="text-xl font-bold text-red-600 mb-1">
              {overview.worstDay?.dayName || 'N/A'}
            </div>
            <div className="text-sm text-gray-600">
              {overview.worstDay?.rating || 0}/5 rating
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaChartLine className="text-xl text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Total Students</h3>
            </div>
            <div className="text-2xl font-bold text-green-600 mb-1">
              {overview.totalStudents || 0}
            </div>
            <div className="text-sm text-gray-600">Registered</div>
          </div>
        </div>

        {/* Daily Breakdown Chart */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FaCalendarAlt className="text-indigo-600" />
              Daily Breakdown
            </h2>
            <WeeklyDailyBreakdownChart data={dailyBreakdown} />
            
            {/* Daily Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mt-6">
              {Object.entries(dailyBreakdown).map(([date, dayData]) => (
                <div key={date} className="bg-gray-50 rounded-lg p-4 transition-all hover:shadow-md">
                  <div className="text-center">
                    <div className="font-semibold text-gray-800 mb-1">{dayData.dayName}</div>
                    <div className="text-sm text-gray-600 mb-2">{date}</div>
                    <div className="text-lg font-bold text-indigo-600 mb-1">
                      {dayData.averageRating}/5
                    </div>
                    <div className="text-xs text-gray-500">
                      {dayData.participatingStudents} students
                    </div>
                    <div className="text-xs text-green-600 font-medium">
                      {dayData.participationRate}% participation
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Meal Trends with Chart and Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Meal Performance Bar Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FaUtensils className="text-orange-600" />
              Meal Performance Trends
            </h2>
            <WeeklyMealTrendsChart data={mealTrends} />
          </div>

          {/* Meal Performance Radar Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FaChartPie className="text-purple-600" />
              Performance Overview
            </h2>
            <WeeklyPerformanceRadarChart data={mealTrends} />
          </div>
        </div>

        {/* Meal Details Cards */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Meal Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(mealTrends).map(([mealType, mealData]) => (
                <div key={mealType} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 transition-all hover:shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    {getMealIcon(mealType)}
                    <h3 className="font-semibold text-gray-800 capitalize">{mealType}</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg Rating:</span>
                      <span className="font-bold text-lg text-gray-800">{mealData.weeklyAverage || 0}/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Trend:</span>
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getTrendColor(mealData.trend)}`}>
                        {getTrendIcon(mealData.trend)}
                        <span className="capitalize">{mealData.trend}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Consistency:</span>
                      <div className="flex items-center gap-1">
                        <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full"
                            style={{ width: `${mealData.consistency || 0}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-sm">{mealData.consistency || 0}%</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-500">
                        Avg Participation: {mealData.averageParticipation || 0} students
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Weekly Insights and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Enhanced Insights */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FaLightbulb className="text-yellow-500" />
              Weekly Insights
            </h2>
            <div className="space-y-4">
              {weeklyInsights.length > 0 ? (
                weeklyInsights.map((insight, index) => (
                  <div key={index} className="group transition-all duration-200 hover:scale-[1.02]">
                    <div className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all ${
                      insight.type === 'positive' ? 'bg-green-50 border-green-200 hover:border-green-300' :
                      insight.type === 'negative' ? 'bg-red-50 border-red-200 hover:border-red-300' :
                      insight.type === 'warning' ? 'bg-yellow-50 border-yellow-200 hover:border-yellow-300' :
                      'bg-blue-50 border-blue-200 hover:border-blue-300'
                    }`}>
                      <div className="flex-shrink-0 mt-1">
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium leading-relaxed">{insight.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            insight.impact === 'high' ? 'bg-red-100 text-red-700' :
                            insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {insight.impact} impact
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FaLightbulb className="text-4xl text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No insights available</p>
                  <p className="text-sm text-gray-400">Analysis data will appear here when available</p>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Alerts */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FaExclamationTriangle className="text-red-500" />
              Weekly Alerts
            </h2>
            <div className="space-y-4">
              {weeklyAlerts.length > 0 ? (
                weeklyAlerts.map((alert, index) => (
                  <div key={index} className="group transition-all duration-200 hover:scale-[1.02]">
                    <div className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all ${
                      alert.type === 'critical' ? 'bg-red-50 border-red-200 hover:border-red-300' :
                      alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200 hover:border-yellow-300' :
                      'bg-blue-50 border-blue-200 hover:border-blue-300'
                    }`}>
                      <div className="flex-shrink-0 mt-1">
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 font-semibold mb-1">{alert.message}</p>
                        {alert.action && (
                          <p className="text-sm text-gray-600 italic">{alert.action}</p>
                        )}
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            alert.type === 'critical' ? 'bg-red-100 text-red-700' :
                            alert.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {alert.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FaCheckCircle className="text-4xl text-green-500 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">No alerts this week!</p>
                  <p className="text-sm text-gray-500">Everything looks good.</p>
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-green-700 text-sm">✨ All systems running smoothly</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Weekly Patterns with Visualization */}
        {patterns.dayOfWeekPerformance && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaChartBar className="text-purple-600" />
                Weekly Patterns Analysis
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Weekend vs Weekday Chart */}
                <div className="lg:col-span-1">
                  <WeeklyPatternsPieChart data={patterns} />
                </div>

                {/* Day of Week Performance */}
                <div className="lg:col-span-2">
                  <h3 className="font-semibold text-gray-700 mb-4">Day of Week Performance</h3>
                  <div className="space-y-3">
                    {Object.entries(patterns.dayOfWeekPerformance.averagesByDay || {}).map(([day, rating]) => (
                      <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700 font-medium">{day}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full transition-all duration-500"
                              style={{ width: `${(rating / 5) * 100}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-gray-800 w-12 text-right">{rating}/5</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pattern Insights */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        <FaStar className="text-yellow-500" />
                        Best Performance Day
                      </h4>
                      <p className="text-blue-700">
                        {patterns.dayOfWeekPerformance.bestDay?.day}: {patterns.dayOfWeekPerformance.bestDay?.rating}/5
                      </p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                        <FaExclamationTriangle className="text-red-500" />
                        Needs Improvement
                      </h4>
                      <p className="text-red-700">
                        {patterns.dayOfWeekPerformance.worstDay?.day}: {patterns.dayOfWeekPerformance.worstDay?.rating}/5
                      </p>
                    </div>
                  </div>

                  {/* Weekend vs Weekday Comparison */}
                  <div className="mt-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Weekend vs Weekday Analysis</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-blue-600">{patterns.weekendVsWeekday?.weekdayAverage || 0}/5</div>
                        <div className="text-sm text-gray-600">Weekday Average</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-yellow-600">{patterns.weekendVsWeekday?.weekendAverage || 0}/5</div>
                        <div className="text-sm text-gray-600">Weekend Average</div>
                      </div>
                      <div>
                        <div className={`text-lg font-bold ${
                          (patterns.weekendVsWeekday?.difference || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {patterns.weekendVsWeekday?.difference > 0 ? '+' : ''}{patterns.weekendVsWeekday?.difference || 0}
                        </div>
                        <div className="text-sm text-gray-600">Difference</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Participation Analysis with Chart */}
        {participationAnalysis.dailyParticipation && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaUsers className="text-blue-600" />
                Participation Analysis
              </h2>
              
              {/* Participation Trend Chart */}
              <div className="mb-6">
                <WeeklyParticipationChart data={participationAnalysis} />
              </div>

              {/* Daily Participation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-6">
                {participationAnalysis.dailyParticipation.map((day, index) => (
                  <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 text-center transition-all hover:shadow-md">
                    <div className="font-semibold text-gray-800 mb-2">{day.dayName}</div>
                    <div className="relative mb-3">
                      <svg className="w-16 h-16 mx-auto transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="#E5E7EB"
                          strokeWidth="6"
                          fill="transparent"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="#3B82F6"
                          strokeWidth="6"
                          fill="transparent"
                          strokeDasharray={`${(day.participationRate / 100) * 175.929} 175.929`}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-blue-600">{day.participationRate}%</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {day.participatingStudents} students
                    </div>
                  </div>
                ))}
              </div>

              {/* Participation Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <FaArrowUp className="text-green-600" />
                    Highest Participation
                  </h4>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700 mb-1">
                      {participationAnalysis.highestParticipationDay?.participationRate}%
                    </div>
                    <div className="text-green-600 font-medium">
                      {participationAnalysis.highestParticipationDay?.dayName}
                    </div>
                    <div className="text-sm text-green-600 mt-1">
                      {participationAnalysis.highestParticipationDay?.participatingStudents} students
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <FaChartLine className="text-blue-600" />
                    Weekly Average
                  </h4>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-700 mb-1">
                      {participationAnalysis.averageParticipationRate}%
                    </div>
                    <div className="text-blue-600 font-medium">
                      Participation Rate
                    </div>
                    <div className="text-sm text-blue-600 mt-1">
                      Across all days
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-6">
                  <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                    <FaArrowDown className="text-red-600" />
                    Lowest Participation
                  </h4>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-700 mb-1">
                      {participationAnalysis.lowestParticipationDay?.participationRate}%
                    </div>
                    <div className="text-red-600 font-medium">
                      {participationAnalysis.lowestParticipationDay?.dayName}
                    </div>
                    <div className="text-sm text-red-600 mt-1">
                      {participationAnalysis.lowestParticipationDay?.participatingStudents} students
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyAnalysisDashboard;
