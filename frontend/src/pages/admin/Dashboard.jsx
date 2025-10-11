import React, { useState, useEffect } from 'react';
import { analyticsAPI, feedbackAPI } from '../../config/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  FaChartBar, 
  FaUsers, 
  FaComments, 
  FaRobot,
  FaCalendarAlt,
  FaStar
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod, selectedDate]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = { 
        period: selectedPeriod,
        ...(selectedPeriod === 'daily' && { date: selectedDate })
      };
      
      const response = await analyticsAPI.getDashboard(params);
      
      if (response.status === 'success') {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading admin dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FaChartBar className="text-3xl" />
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-purple-100">Hostel Food Analysis Overview</p>
            </div>
          </div>
          
          {/* Period Selector */}
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-white text-gray-900 px-3 py-2 rounded-lg text-sm"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
            
            {selectedPeriod === 'daily' && (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white text-gray-900 px-3 py-2 rounded-lg text-sm"
              />
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body text-center">
            <FaUsers className="text-3xl text-blue-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">Total Feedbacks</h3>
            <p className="text-2xl font-bold text-blue-600">
              {analytics?.totalFeedbacks || 0}
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <FaStar className="text-3xl text-yellow-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">Avg Rating</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {analytics?.analytics?.averageRatings ? 
                Object.values(analytics.analytics.averageRatings).reduce((a, b) => a + b, 0) / 4 : 0}
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <FaComments className="text-3xl text-green-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
            <p className="text-2xl font-bold text-green-600">
              {analytics?.analytics?.comments?.length || 0}
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <FaCalendarAlt className="text-3xl text-purple-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">Period</h3>
            <p className="text-2xl font-bold text-purple-600 capitalize">
              {selectedPeriod}
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Content */}
      {analytics && (
        <>
          {/* Average Ratings */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Meal Ratings</h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(analytics.analytics.averageRatings).map(([meal, rating]) => (
                  <div key={meal} className="text-center p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 capitalize">{meal}</h3>
                    <div className="text-2xl font-bold mt-2">
                      <span className={`${rating >= 4 ? 'text-green-600' : rating >= 3 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {rating.toFixed(1)}
                      </span>
                      <span className="text-gray-400 text-sm">/5</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {analytics.analytics.totalSubmissions[meal]} submissions
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Key Insights */}
          {analytics.analytics.keyInsights?.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Key Insights</h2>
              </div>
              <div className="card-body">
                <ul className="space-y-2">
                  {analytics.analytics.keyInsights.map((insight, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-primary-600">•</span>
                      <span className="text-gray-700">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* AI Suggestions */}
          {analytics.aiSuggestions && (
            <div className="card">
              <div className="card-header">
                <div className="flex items-center space-x-2">
                  <FaRobot className="text-lg text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">AI Suggestions</h2>
                </div>
              </div>
              <div className="card-body">
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-gray-700 font-sans">
                    {analytics.aiSuggestions}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Recent Comments */}
          {analytics.analytics.comments?.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Recent Comments</h2>
              </div>
              <div className="card-body">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {analytics.analytics.comments.slice(0, 10).map((comment, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{comment}</p>
                    </div>
                  ))}
                </div>
                {analytics.analytics.comments.length > 10 && (
                  <p className="text-sm text-gray-500 mt-3 text-center">
                    And {analytics.analytics.comments.length - 10} more comments...
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
