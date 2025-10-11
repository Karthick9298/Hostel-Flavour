import React, { useState, useEffect } from 'react';
import { feedbackAPI } from '../../config/api';
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
  FaTimesCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState(null);
  const [submissionStats, setSubmissionStats] = useState(null);
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
      time: 'After 9:00 AM'
    },
    {
      key: 'afternoon',
      name: 'Afternoon',
      icon: FaCloudSun,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      time: 'After 12:00 PM'
    },
    {
      key: 'evening',
      name: 'Evening',
      icon: FaCloudSun,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      time: 'After 5:00 PM'
    },
    {
      key: 'night',
      name: 'Night',
      icon: FaMoon,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      time: 'After 8:00 PM'
    }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [feedbackResponse, statsResponse] = await Promise.all([
        feedbackAPI.getMyFeedback(),
        feedbackAPI.getSubmissionStats()
      ]);

      if (feedbackResponse.status === 'success') {
        setFeedback(feedbackResponse.data);
      }

      if (statsResponse.status === 'success') {
        setSubmissionStats(statsResponse.data);
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
    const hour = now.getHours();

    switch (mealType) {
      case 'morning':
        return hour >= 9;
      case 'afternoon':
        return hour >= 12;
      case 'evening':
        return hour >= 17;
      case 'night':
        return hour >= 20;
      default:
        return false;
    }
  };

  const getMealStatus = (mealType) => {
    const mealData = feedback?.feedback?.meals?.[mealType];
    const hasSubmitted = mealData?.rating !== null && mealData?.rating !== undefined;
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
