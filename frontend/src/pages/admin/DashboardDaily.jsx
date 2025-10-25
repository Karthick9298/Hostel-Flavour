import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
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
  FaChartLine,
  FaClock,
  FaThumbsUp,
  FaThumbsDown,
  FaUtensils,
  FaCoffee,
  FaLightbulb,
  FaExclamationCircle,
  FaCheckCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const DailyAnalysisDashboard = () => {
  const [dailyData, setDailyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    // Default to yesterday for analysis
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  });

  useEffect(() => {
    fetchDailyData();
  }, [selectedDate]);

  const fetchDailyData = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const getMealIcon = (mealType) => {
    switch (mealType?.toLowerCase()) {
      case 'breakfast': return <FaCoffee className="text-yellow-500" />;
      case 'lunch': return <FaUtensils className="text-orange-500" />;
      case 'dinner': return <FaUtensils className="text-blue-500" />;
      case 'night snacks': return <FaUtensils className="text-green-500" />;
      default: return <FaUtensils className="text-gray-500" />;
    }
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
          <LoadingSpinner text="Loading daily analysis..." />
          <p className="text-sm text-gray-600 mt-2">Analyzing feedback data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between animate-fadeIn">
            <div className="flex items-center space-x-6">
              <div className="p-4 bg-white bg-opacity-20 rounded-2xl shadow-lg backdrop-blur-sm">
                <FaChartBar className="text-4xl animate-pulse" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Daily Analysis Dashboard</h1>
                <p className="text-indigo-100 mt-2">Hostel Food Feedback & Insights</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            <div className="space-y-8">
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

              {/* Handle different data states */}
              {dailyData && dailyData.type === 'no_feedback' && (
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

              {dailyData && dailyData.type === 'future_date' && (
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
              {dailyData && !dailyData.type && (
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
                      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {Object.keys(dailyData.feedbackDistributionPerMeal || {}).map((meal, index) => (
                          <div key={meal} className="animate-fadeIn" style={{ animationDelay: `${0.1 * index}s` }}>
                            <FeedbackDistributionChart 
                              data={dailyData.feedbackDistributionPerMeal}
                              mealName={meal}
                            />
                          </div>
                        ))}
                      </div> */}
                      
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
                        {Object.entries(dailyData.sentimentAnalysisPerMeal || {}).map(([meal, data], index) => {
                          // Determine status based on average rating
                          const avgRating = data.average_rating || 0;
                          const negativePercentage = data.sentiment_distribution?.negative?.percentage || 0;
                          
                          let statusIcon = '🟢';
                          let statusText = 'Performing Well';
                          let statusColor = 'green';
                          let cardBorder = 'border-green-200';
                          let cardBg = 'bg-green-50';
                          
                          if (avgRating < 2.5 || negativePercentage >= 50) {
                            statusIcon = '🔴';
                            statusText = 'Urgent Action Required';
                            statusColor = 'red';
                            cardBorder = 'border-red-300';
                            cardBg = 'bg-red-50';
                          } else if (avgRating < 3.5 || negativePercentage >= 30) {
                            statusIcon = '🟡';
                            statusText = 'Needs Attention';
                            statusColor = 'yellow';
                            cardBorder = 'border-yellow-300';
                            cardBg = 'bg-yellow-50';
                          }
                          
                          return (
                          <div key={meal} className={`bg-white rounded-xl p-6 shadow-md border-2 ${cardBorder} ${cardBg} bg-opacity-30`}>
                            <div className="flex items-start justify-between mb-4">
                              <h5 className="font-bold text-lg text-gray-900 flex items-center space-x-2">
                                {getMealIcon(meal.toLowerCase())}
                                <span>{meal}</span>
                              </h5>
                              <div className="flex flex-col items-end">
                                <span className="text-2xl mb-1">{statusIcon}</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  statusColor === 'green' ? 'bg-green-100 text-green-800' :
                                  statusColor === 'red' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {statusText}
                                </span>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Average Rating:</span>
                                <span className="font-bold text-lg">{data.average_rating}/5.0</span>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Total Responses:</span>
                                <span className="font-medium">{data.total_responses}</span>
                              </div>

                              {/* Sentiment Distribution */}
                              {/* {data.sentiment_distribution && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <h6 className="font-medium text-gray-900 mb-3">Sentiment Breakdown:</h6>
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-green-600 flex items-center">
                                        <FaThumbsUp className="mr-1" /> Positive
                                      </span>
                                      <span className="font-medium text-green-700">
                                        {data.sentiment_distribution.positive.count} ({data.sentiment_distribution.positive.percentage}%)
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-red-600 flex items-center">
                                        <FaThumbsDown className="mr-1" /> Negative
                                      </span>
                                      <span className="font-medium text-red-700">
                                        {data.sentiment_distribution.negative.count} ({data.sentiment_distribution.negative.percentage}%)
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-gray-600 flex items-center">
                                        <FaExclamationCircle className="mr-1" /> Neutral
                                      </span>
                                      <span className="font-medium text-gray-700">
                                        {data.sentiment_distribution.neutral.count} ({data.sentiment_distribution.neutral.percentage}%)
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )} */}

                              {/* Admin Action Items - Only show negative feedback */}
                              {data.improvement_areas && data.improvement_areas.length > 0 ? (
                                <div>
                                  <p className="text-sm font-semibold text-red-700 mb-3 flex items-center">
                                    <FaExclamationTriangle className="mr-2" /> 
                                    Admin Action Required ({data.improvement_areas.length} issues)
                                  </p>
                                  <ul className="text-sm space-y-2">
                                    {data.improvement_areas.slice(0, 3).map((comment, i) => (
                                      <li key={i} className="flex items-start space-x-2 bg-red-50 p-3 rounded-lg border-l-4 border-red-500">
                                        <span className="text-red-600 font-bold text-xs mt-0.5">#{i + 1}</span>
                                        <span className="text-gray-800 flex-1">"{comment}"</span>
                                      </li>
                                    ))}
                                    {data.improvement_areas.length > 3 && (
                                      <li className="text-xs text-gray-500 italic pl-6">
                                        +{data.improvement_areas.length - 3} more complaints - review all feedback
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              ) : (
                                <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                                  <p className="text-sm font-medium text-green-700 flex items-center">
                                    <FaCheckCircle className="mr-2" />
                                    No negative feedback - Continue current standards
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                        })}
                      </div>
                    </div>

                    {/* 5. Enhanced Overall Summary - Priority Action Dashboard */}
                    {dailyData.overallSummary && (
                      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-indigo-200 shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                            <FaChartLine className="text-indigo-600 text-2xl" />
                            <span>Daily Action Dashboard</span>
                          </h4>
                          <div className="text-xs text-gray-500">
                            {new Date().toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              month: 'long', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </div>

                        {/* Performance Summary Banner */}
                        {dailyData.overallSummary.performance_summary && (
                          <div className="bg-white rounded-xl p-4 mb-6 border-l-4 border-indigo-500 shadow-sm">
                            <h5 className="font-bold text-gray-900 mb-2 flex items-center">
                              <FaCheckCircle className="text-indigo-500 mr-2" />
                              Overall Status
                            </h5>
                            <p className="text-gray-700 text-sm font-mono">{dailyData.overallSummary.performance_summary}</p>
                          </div>
                        )}
                        
                        <div className="space-y-6">
                          {/* Priority Actions - Focus on what needs fixing */}
                          {dailyData.overallSummary.critical_actions && dailyData.overallSummary.critical_actions.length > 0 && (
                            <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-red-500">
                              <h5 className="font-bold text-lg text-gray-900 mb-4 flex items-center space-x-2">
                                <FaExclamationTriangle className="text-red-500 text-xl" />
                                <span>🎯 Priority Actions (Do These First)</span>
                              </h5>
                              <div className="space-y-3">
                                {dailyData.overallSummary.critical_actions.slice(0, 3).map((action, index) => {
                                  // Determine priority based on position
                                  const priorityIcon = index === 0 ? '🔴' : index === 1 ? '🟡' : '🟢';
                                  const priorityLabel = index === 0 ? 'CRITICAL' : index === 1 ? 'HIGH' : 'MEDIUM';
                                  const priorityColor = index === 0 ? 'red' : index === 1 ? 'yellow' : 'green';
                                  
                                  return (
                                    <div key={index} className={`flex items-start space-x-3 p-4 rounded-lg border-2 ${
                                      priorityColor === 'red' ? 'bg-red-50 border-red-200' :
                                      priorityColor === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                                      'bg-green-50 border-green-200'
                                    }`}>
                                      <div className="flex-shrink-0 flex flex-col items-center">
                                        <span className="text-2xl mb-1">{priorityIcon}</span>
                                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                                          priorityColor === 'red' ? 'bg-red-200 text-red-800' :
                                          priorityColor === 'yellow' ? 'bg-yellow-200 text-yellow-800' :
                                          'bg-green-200 text-green-800'
                                        }`}>
                                          {priorityLabel}
                                        </span>
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                          <span className="font-bold text-gray-900">Action {index + 1}:</span>
                                        </div>
                                        <p className="text-sm text-gray-800 font-medium leading-relaxed">{action}</p>
                                        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-600">
                                          <span className="flex items-center">
                                            <FaClock className="mr-1" />
                                            Deadline: {index === 0 ? 'Today' : index === 1 ? '2 days' : 'This week'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          
                          {/* Key Focus Areas - Simplified to 2-3 points */}
                          {dailyData.overallSummary.key_insights && dailyData.overallSummary.key_insights.length > 0 && (
                            <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-blue-500">
                              <h5 className="font-bold text-lg text-gray-900 mb-4 flex items-center space-x-2">
                                <FaLightbulb className="text-blue-500 text-xl" />
                                <span>📊 Key Insights (What's Happening)</span>
                              </h5>
                              <div className="space-y-3">
                                {dailyData.overallSummary.key_insights.slice(0, 3).map((insight, index) => (
                                  <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                    <div className="flex-shrink-0">
                                      <span className="flex items-center justify-center w-7 h-7 bg-blue-500 text-white text-sm font-bold rounded-full">
                                        {index + 1}
                                      </span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-800 pt-1">{insight}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Show "All Good" message if no critical actions */}
                          {(!dailyData.overallSummary.critical_actions || dailyData.overallSummary.critical_actions.length === 0) && (
                            <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-green-500">
                              <div className="text-center py-4">
                                <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-3" />
                                <h5 className="font-bold text-xl text-green-800 mb-2">All Systems Good! 🎉</h5>
                                <p className="text-gray-700">No critical issues detected. Continue maintaining quality standards.</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Legacy Support - Show old format if new format not available */}
                        {(!dailyData.overallSummary.key_insights && dailyData.overallSummary.overall_feedback) && (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                            {/* Overall Feedback (Legacy) */}
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                              <h5 className="font-bold text-lg text-gray-900 mb-3 flex items-center space-x-2">
                                <FaComments className="text-blue-500" />
                                <span>Overall Feedback</span>
                              </h5>
                              <p className="text-gray-700">{dailyData.overallSummary.overall_feedback}</p>
                            </div>
                            
                            {/* Common Issues (Legacy) */}
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
                            
                            {/* Positive Highlights (Legacy) */}
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
                            
                            {/* Recommendations (Legacy) */}
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
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Error State */}
              {!dailyData && (
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyAnalysisDashboard;
