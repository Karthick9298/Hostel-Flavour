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
