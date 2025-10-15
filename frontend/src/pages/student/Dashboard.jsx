import React, { useState, useEffect } from 'react';
import { feedbackAPI, menuAPI } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import StarRating from '../../components/common/StarRating';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  FaSun, 
  FaCloudSun, 
  FaMoon, 
  FaUtensils,
  FaUsers,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendar
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState(null);
  const [submissionStats, setSubmissionStats] = useState(null);
  const [todayMenu, setTodayMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const mealTypes = [
    {
      key: 'morning',
      name: 'Morning',
      icon: FaSun,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      time: '6:00 AM - 12:00 PM'
    },
    {
      key: 'afternoon',
      name: 'Afternoon',
      icon: FaCloudSun,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      time: '11:00 AM - 5:00 PM'
    },
    {
      key: 'evening',
      name: 'Evening',
      icon: FaCloudSun,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      time: '4:00 PM - 10:00 PM'
    },
    {
      key: 'night',
      name: 'Night',
      icon: FaMoon,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      time: '7:00 PM - 2:00 AM'
    }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch feedback and stats first
      const [feedbackResponse, statsResponse] = await Promise.all([
        feedbackAPI.getMyFeedback(),
        feedbackAPI.getSubmissionStats()
      ]);

      if (feedbackResponse.status === 'success') {
        console.log('=== FEEDBACK DEBUG ===');
        console.log('Full feedbackResponse:', JSON.stringify(feedbackResponse, null, 2));
        console.log('feedbackResponse.data:', feedbackResponse.data);
        console.log('feedbackResponse.data.feedback:', feedbackResponse.data.feedback);
        console.log('feedbackResponse.data.feedback.meals:', feedbackResponse.data.feedback?.meals);
        setFeedback(feedbackResponse.data);
      }

      if (statsResponse.status === 'success') {
        setSubmissionStats(statsResponse.data);
      }

      // Fetch today's menu separately to handle errors gracefully
      try {
        console.log('Fetching today\'s menu...');
        console.log('Current time:', new Date().toLocaleString());
        console.log('Making API call to:', import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
        
        const menuResponse = await menuAPI.getToday();
        console.log('Menu API response:', menuResponse);
        
        if (menuResponse && menuResponse.status === 'success') {
          console.log('Menu data received:', menuResponse.data.menu);
          setTodayMenu(menuResponse.data.menu);
        } else {
          console.log('Menu response not successful or empty:', menuResponse);
          setTodayMenu(null);
        }
      } catch (error) {
        console.error('Error fetching menu:', error);
        console.error('Error details:', error.response || error.message);
        setTodayMenu(null);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (mealType, rating, comment) => {
    try {
      setSubmitting(true);
      
      const response = await feedbackAPI.submit({
        mealType,
        rating,
        comment
      });

      if (response.status === 'success') {
        toast.success(response.message);
        // Refresh data
        await fetchData();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(error || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmitMeal = (mealType) => {
    const now = new Date();
    // Convert to IST (UTC+5:30) to match backend
    const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    const hour = istTime.getHours();

    switch (mealType) {
      case 'morning':
        // Morning meal: 9 AM - 11:59 PM
        return hour >= 9;
      case 'afternoon':
        // Afternoon meal: 1 PM - 11:59 PM
        return hour >= 11;
      case 'evening':
        // Evening meal: 5 PM - 11:59 PM
        return hour >= 17;
      case 'night':
        // Night meal: 8 PM - 11:59 PM
        return hour >= 20;
      default:
        return false;
    }
  };

  const getMealStatus = (mealType) => {
    console.log('=== MEAL STATUS DEBUG ===');
    console.log('Current IST time:', new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    console.log('feedback object:', feedback);
    console.log('feedback.feedback:', feedback?.feedback);
    console.log('feedback.feedback.date:', feedback?.feedback?.date);
    console.log('Trying to access meals for:', mealType);
    
    const mealData = feedback?.feedback?.meals?.[mealType]; // This is accessing feedback.feedback.meals
    console.log('mealData for', mealType, ':', mealData);
    
    const hasSubmitted = mealData?.rating !== null && mealData?.rating !== undefined;
    console.log('hasSubmitted for', mealType, ':', hasSubmitted);
    
    if (mealData?.submittedAt) {
      console.log('Submitted at:', new Date(mealData.submittedAt).toLocaleString());
      console.log('Submitted date (IST):', new Date(mealData.submittedAt).toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    }
    
    const canSubmit = canSubmitMeal(mealType);

    if (hasSubmitted) {
      return { status: 'submitted', icon: FaCheckCircle, color: 'text-green-500' };
    } else if (canSubmit) {
      return { status: 'available', icon: FaClock, color: 'text-blue-500' };
    } else {
      return { status: 'locked', icon: FaTimesCircle, color: 'text-gray-400' };
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <FaUtensils className="text-3xl" />
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
            <p className="text-primary-100">
              {user?.rollNumber} • Room {user?.hostelRoom}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-body text-center">
            <FaUsers className="text-3xl text-primary-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">Total Submissions Today</h3>
            <p className="text-2xl font-bold text-primary-600">
              {submissionStats?.totalSubmissionsToday || 0}
            </p>
            <p className="text-sm text-gray-500">Students participated</p>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <FaCheckCircle className="text-3xl text-green-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">Your Progress</h3>
            <p className="text-2xl font-bold text-green-600">
              {feedback?.stats?.submittedMeals || 0}/4
            </p>
            <p className="text-sm text-gray-500">Meals reviewed today</p>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <FaClock className="text-3xl text-orange-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">Pending Reviews</h3>
            <p className="text-2xl font-bold text-orange-600">
              {feedback?.stats?.pendingMeals || 4}
            </p>
            <p className="text-sm text-gray-500">Meals remaining</p>
          </div>
        </div>
      </div>

      {/* Today's Menu Debug Info */}
      {!todayMenu && (
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">📋 Menu Status</h3>
            <p className="text-yellow-700 text-sm">
              Today's menu is not available. Check the browser console for API call details.
            </p>
            <p className="text-yellow-600 text-xs mt-1">
              Current time: {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Today's Menu */}
      {todayMenu && (
        <div className="card">
          <div className="card-body">
            <div className="flex items-center space-x-2 mb-4">
              <FaCalendar className="text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Today's Menu - {todayMenu.dayName?.charAt(0).toUpperCase() + todayMenu.dayName?.slice(1)}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mealTypes.map((mealType) => {
                const mealMenu = todayMenu.meals?.[mealType.key];
                const Icon = mealType.icon;
                
                return (
                  <div key={mealType.key} className={`p-4 rounded-lg border-2 ${mealType.borderColor} ${mealType.bgColor}`}>
                    <div className="flex items-center space-x-2 mb-3">
                      <Icon className={`text-lg ${mealType.color}`} />
                      <h3 className="font-semibold text-gray-900">{mealType.name}</h3>
                    </div>
                    
                    {mealMenu?.items && mealMenu.items.length > 0 ? (
                      <div className="space-y-2">
                        {mealMenu.items.map((item, index) => (
                          <div key={index} className="text-sm">
                            <div className="font-medium text-gray-800">{item.name}</div>
                            {item.description && (
                              <div className="text-gray-600 text-xs">{item.description}</div>
                            )}
                          </div>
                        ))}
                        {mealMenu.special && (
                          <div className="mt-2 p-2 bg-white bg-opacity-50 rounded text-xs font-medium text-gray-700">
                            Special: {mealMenu.special}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">No menu available</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Meal Feedback Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Today's Meal Feedback</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mealTypes.map((meal) => (
            <MealFeedbackCard
              key={meal.key}
              meal={meal}
              feedback={feedback?.feedback?.meals?.[meal.key]}
              status={getMealStatus(meal.key)}
              onSubmit={handleFeedbackSubmit}
              submitting={submitting}
            />
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="card">
        <div className="card-body">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Submit Feedback</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• You can submit feedback for each meal only after the specified time</p>
            <p>• Once submitted, you cannot modify your rating for that meal</p>
            <p>• Feedback can only be submitted for the current day</p>
            <p>• Your feedback helps improve the overall food quality</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual Meal Feedback Card Component
const MealFeedbackCard = ({ meal, feedback, status, onSubmit, submitting }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasSubmitted = feedback?.rating !== null && feedback?.rating !== undefined;
  const canSubmit = status.status === 'available';

  const handleSubmit = async () => {
    if (!rating) {
      toast.error('Please provide a rating');
      return;
    }

    setIsSubmitting(true);
    await onSubmit(meal.key, rating, comment);
    setIsSubmitting(false);
    setRating(0);
    setComment('');
  };

  return (
    <div className={`card ${meal.borderColor} border-2`}>
      <div className="card-body">
        <div className="flex items-center space-x-3 mb-4">
          <div className={`p-3 rounded-lg ${meal.bgColor}`}>
            <meal.icon className={`text-xl ${meal.color}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{meal.name}</h3>
            <p className="text-sm text-gray-500">{meal.time}</p>
          </div>
          <div className="flex items-center space-x-2">
            <status.icon className={`text-sm ${status.color}`} />
            <span className={`text-xs font-medium ${status.color}`}>
              {status.status === 'submitted' && 'Submitted'}
              {status.status === 'available' && 'Available'}
              {status.status === 'locked' && 'Locked'}
            </span>
          </div>
        </div>

        {hasSubmitted ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Your Rating:</span>
              <StarRating rating={feedback.rating} readonly size="sm" showValue />
            </div>
            {feedback.comment && (
              <div>
                <span className="text-sm font-medium text-gray-700">Your Comment:</span>
                <p className="text-sm text-gray-600 mt-1 p-3 bg-gray-50 rounded-lg">
                  {feedback.comment}
                </p>
              </div>
            )}
            <p className="text-xs text-gray-500">
              Submitted at {new Date(feedback.submittedAt).toLocaleTimeString()}
            </p>
          </div>
        ) : canSubmit ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rate this meal:
              </label>
              <StarRating
                rating={rating}
                onChange={setRating}
                size="md"
                showValue
              />
            </div>

            <div>
              <label htmlFor={`comment-${meal.key}`} className="block text-sm font-medium text-gray-700 mb-2">
                Comment (optional):
              </label>
              <textarea
                id={`comment-${meal.key}`}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows="3"
                placeholder="Share your thoughts about this meal..."
                maxLength="500"
              />
              <p className="text-xs text-gray-500 mt-1">{comment.length}/500 characters</p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || isSubmitting || !rating}
              className="btn-primary w-full"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="spinner w-4 h-4 mr-2"></div>
                  Submitting...
                </div>
              ) : (
                'Submit Feedback'
              )}
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <FaTimesCircle className="text-3xl text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              Feedback not available yet
            </p>
            <p className="text-xs text-gray-400">
              Available {meal.time}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
