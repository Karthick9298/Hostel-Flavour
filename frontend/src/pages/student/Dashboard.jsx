import React, { useState, useEffect } from 'react';
import { feedbackAPI, menuAPI } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import StarRating from '../../components/common/StarRating';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import '../../styles/dashboard-animations.css';
import { 
  FaSun, 
  FaCloudSun, 
  FaMoon, 
  FaUtensils,
  FaUsers,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendar,
  FaAward,
  FaFire,
  FaHeart,
  FaStar,
  FaComments,
  FaThumbsUp,
  FaGift,
  FaChartLine,
  FaTrophy,
  FaMagic,
  FaBookmark,
  FaLeaf,
  FaAppleAlt,
  FaBreadSlice,
  FaCoffee
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
      name: 'Breakfast',
      icon: FaSun,
      color: 'text-yellow-500',
      bgColor: 'from-yellow-400 to-orange-400',
      borderColor: 'border-yellow-300',
      cardBg: 'bg-gradient-to-br from-yellow-50 to-orange-50',
      time: '6:00 AM - 12:00 PM',
      emoji: '🌅',
      description: 'Start your day right'
    },
    {
      key: 'afternoon',
      name: 'Lunch',
      icon: FaCloudSun,
      color: 'text-orange-500',
      bgColor: 'from-orange-400 to-red-400',
      borderColor: 'border-orange-300',
      cardBg: 'bg-gradient-to-br from-orange-50 to-red-50',
      time: '11:00 AM - 5:00 PM',
      emoji: '🌞',
      description: 'Power through your day'
    },
    {
      key: 'evening',
      name: 'Snacks',
      icon: FaCloudSun,
      color: 'text-blue-500',
      bgColor: 'from-blue-400 to-indigo-400',
      borderColor: 'border-blue-300',
      cardBg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      time: '4:00 PM - 10:00 PM',
      emoji: '🌆',
      description: 'Evening refreshments'
    },
    {
      key: 'night',
      name: 'Dinner',
      icon: FaMoon,
      color: 'text-purple-500',
      bgColor: 'from-purple-400 to-pink-400',
      borderColor: 'border-purple-300',
      cardBg: 'bg-gradient-to-br from-purple-50 to-pink-50',
      time: '7:00 PM - 2:00 AM',
      emoji: '🌙',
      description: 'End your day satisfied'
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg">
              <FaUtensils className="text-2xl text-indigo-600 animate-pulse" />
            </div>
          </div>
          <LoadingSpinner text="Loading your feedback dashboard..." />
          <p className="text-sm text-gray-600 mt-2">Getting today's menu and your progress...</p>
        </div>
      </div>
    );
  }

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good Morning", icon: "🌅", color: "from-yellow-400 to-orange-500" };
    if (hour < 17) return { text: "Good Afternoon", icon: "☀️", color: "from-orange-400 to-red-500" };
    if (hour < 20) return { text: "Good Evening", icon: "🌇", color: "from-blue-400 to-purple-500" };
    return { text: "Good Night", icon: "🌙", color: "from-purple-400 to-pink-500" };
  };

  const greeting = getTimeBasedGreeting();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 particles-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Enhanced Welcome Header */}
        <div className={`bg-gradient-to-r ${greeting.color} text-white rounded-2xl p-8 shadow-xl relative overflow-hidden animate-fadeIn`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-5 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="p-4 bg-white bg-opacity-20 rounded-2xl shadow-lg backdrop-blur-sm">
                  <FaUtensils className="text-4xl animate-pulse-custom" />
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold">{greeting.text}, {user?.name}!</h1>
                    <span className="text-2xl">{greeting.icon}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-white text-opacity-90">
                    <div className="flex items-center space-x-2">
                      <FaBookmark className="text-sm" />
                      <span className="text-sm font-medium">{user?.rollNumber}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaHeart className="text-sm" />
                      <span className="text-sm font-medium">Room {user?.hostelRoom}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaClock className="text-sm" />
                      <span className="text-sm">{new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="hidden md:block text-right">
                <div className="text-white text-opacity-75 text-sm mb-1">Your Impact</div>
                <div className="text-2xl font-bold">🌟</div>
                <div className="text-xs text-white text-opacity-60">Making food better!</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="animate-scaleIn stagger-item">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover-lift">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                  <FaUsers className="text-2xl text-blue-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {submissionStats?.totalSubmissionsToday || 0}
                  </div>
                  <div className="text-xs text-blue-500">+12% today</div>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Community Impact</h3>
              <p className="text-sm text-gray-600">Students participated today</p>
            </div>
          </div>

          <div className="animate-scaleIn stagger-item">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover-lift">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
                  <FaTrophy className="text-2xl text-green-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {feedback?.stats?.submittedMeals || 0}/4
                  </div>
                  <div className="text-xs text-green-500">Keep going!</div>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Your Progress</h3>
              <p className="text-sm text-gray-600">Meals reviewed today</p>
            </div>
          </div>

          <div className="animate-scaleIn stagger-item">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover-lift">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl">
                  <FaFire className="text-2xl text-orange-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600">
                    {feedback?.stats?.pendingMeals || 4}
                  </div>
                  <div className="text-xs text-orange-500">Unlock rewards</div>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Pending Reviews</h3>
              <p className="text-sm text-gray-600">Meals awaiting feedback</p>
            </div>
          </div>

          <div className="animate-scaleIn stagger-item">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover-lift">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
                  <FaGift className="text-2xl text-purple-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">127</div>
                  <div className="text-xs text-purple-500">+5 today</div>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Reward Points</h3>
              <p className="text-sm text-gray-600">Earned through feedback</p>
            </div>
          </div>
        </div>

        {/* Enhanced Today's Menu */}
        {todayMenu && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-slideInLeft">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                    <FaCalendar className="text-2xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      Today's Special Menu
                    </h2>
                    <p className="text-indigo-100">
                      {todayMenu.dayName?.charAt(0).toUpperCase() + todayMenu.dayName?.slice(1)} • 
                      Curated with love 💜
                    </p>
                  </div>
                </div>
                <div className="hidden md:block text-right">
                  <FaMagic className="text-3xl text-indigo-200 mb-2" />
                  <div className="text-sm text-indigo-100">Fresh & Delicious</div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mealTypes.map((mealType, index) => {
                  const mealMenu = todayMenu.meals?.[mealType.key];
                  const Icon = mealType.icon;
                  
                  return (
                    <div key={mealType.key} className={`animate-scaleIn stagger-item p-6 rounded-2xl ${mealType.cardBg} border-2 ${mealType.borderColor} hover:shadow-lg transition-all duration-300 hover-scale`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-3 rounded-xl bg-gradient-to-r ${mealType.bgColor} text-white shadow-lg`}>
                            <Icon className="text-xl" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{mealType.name}</h3>
                            <p className="text-xs text-gray-600">{mealType.description}</p>
                          </div>
                        </div>
                        <span className="text-2xl">{mealType.emoji}</span>
                      </div>
                      
                      {mealMenu?.items && mealMenu.items.length > 0 ? (
                        <div className="space-y-3">
                          {mealMenu.items.slice(0, 3).map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-center space-x-3 p-2 bg-white bg-opacity-50 rounded-lg">
                              <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"></div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-800 text-sm">{item.name}</div>
                                {item.description && (
                                  <div className="text-gray-600 text-xs">{item.description}</div>
                                )}
                              </div>
                            </div>
                          ))}
                          
                          {mealMenu.items.length > 3 && (
                            <div className="text-center py-2">
                              <span className="text-xs text-gray-500">+{mealMenu.items.length - 3} more items</span>
                            </div>
                          )}
                          
                          {mealMenu.special && (
                            <div className="mt-3 p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg border border-yellow-200">
                              <div className="flex items-center space-x-2">
                                <FaStar className="text-yellow-500 text-sm" />
                                <span className="text-xs font-bold text-yellow-800">Chef's Special</span>
                              </div>
                              <div className="text-sm text-yellow-700 mt-1">{mealMenu.special}</div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <div className="text-gray-400 text-2xl mb-2">🍽️</div>
                          <div className="text-sm text-gray-500">Menu coming soon</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Menu Status Message */}
        {!todayMenu && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-6 animate-fadeIn">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <FaUtensils className="text-2xl text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-yellow-800 mb-1">📋 Today's Menu</h3>
                <p className="text-yellow-700 text-sm mb-2">
                  We're preparing something special! Today's menu will be available soon.
                </p>
                <div className="flex items-center space-x-4 text-xs text-yellow-600">
                  <span>⏰ Current time: {new Date().toLocaleTimeString()}</span>
                  <span>📅 {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Meal Feedback Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Share Your Experience</h2>
              <p className="text-gray-600 mt-1">Your feedback helps us serve you better every day</p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-2">
                  <FaComments className="text-white text-xl" />
                </div>
                <div className="text-xs text-gray-600 font-medium">Your voice matters</div>
              </div>
            </div>
          </div>
          
          {/* Progress Indicator */}
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Today's Progress</h3>
              <span className="text-xs text-gray-500">
                {feedback?.stats?.submittedMeals || 0} of 4 meals reviewed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${((feedback?.stats?.submittedMeals || 0) / 4) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Start</span>
              <span className="font-medium text-green-600">
                {feedback?.stats?.submittedMeals === 4 ? '🎉 Complete!' : `${Math.round(((feedback?.stats?.submittedMeals || 0) / 4) * 100)}%`}
              </span>
              <span>Complete</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {mealTypes.map((meal, index) => (
              <div key={meal.key} className="animate-slideInLeft stagger-item">
                <MealFeedbackCard
                  meal={meal}
                  feedback={feedback?.feedback?.meals?.[meal.key]}
                  status={getMealStatus(meal.key)}
                  onSubmit={handleFeedbackSubmit}
                  submitting={submitting}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Motivational Section */}
        {feedback?.stats?.submittedMeals === 4 && (
          <div className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-2xl p-8 text-white animate-fadeIn">
            <div className="text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
              <p className="text-green-100 mb-4">
                You've completed all your feedback for today! Your input helps us create better dining experiences.
              </p>
              <div className="flex items-center justify-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <FaTrophy className="text-yellow-300" />
                  <span>Perfect Day</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaGift className="text-pink-300" />
                  <span>+50 Bonus Points</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaHeart className="text-red-300" />
                  <span>Community Hero</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Tips for New Users */}
        {(feedback?.stats?.submittedMeals || 0) === 0 && (
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border border-blue-200 animate-fadeIn">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-100 rounded-xl flex-shrink-0">
                <FaMagic className="text-2xl text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">🌟 Welcome to Feedback!</h3>
                <p className="text-gray-700 text-sm mb-4">
                  This is your first time here! Your honest feedback helps our kitchen team improve meals for everyone.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">Rate meals after eating</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Earn points for feedback</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-600">Help improve food quality</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-600">Build better community</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Instructions */}
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-8 border border-indigo-100 animate-fadeIn">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <FaThumbsUp className="text-2xl text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">How Your Feedback Works</h3>
              <p className="text-gray-600 text-sm">Making every meal better together</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Perfect Timing</h4>
                  <p className="text-sm text-gray-600">Submit feedback only after meal times for authentic reviews</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Once Per Meal</h4>
                  <p className="text-sm text-gray-600">Each meal gets one thoughtful review - make it count!</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Daily Fresh</h4>
                  <p className="text-sm text-gray-600">Feedback resets daily for continuous improvement</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Real Impact</h4>
                  <p className="text-sm text-gray-600">Your reviews directly improve meal quality and variety</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Community Impact Footer */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-fadeIn">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="flex items-center space-x-2">
                <FaUsers className="text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Together we've made</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">2,847</div>
              <div className="text-sm text-gray-600">improvements this month</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl">
                <FaLeaf className="text-2xl text-green-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-green-700">Healthier</div>
                <div className="text-xs text-green-600">More nutritious options</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
                <FaAppleAlt className="text-2xl text-orange-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-orange-700">Tastier</div>
                <div className="text-xs text-orange-600">Enhanced flavors</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                <FaHeart className="text-2xl text-purple-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-purple-700">Happier</div>
                <div className="text-xs text-purple-600">Satisfied community</div>
              </div>
            </div>
            
            <div className="mt-6 text-xs text-gray-500">
              <FaHeart className="inline text-red-400 mx-1" />
              Thank you for being part of our food quality improvement journey
              <FaHeart className="inline text-red-400 mx-1" />
            </div>
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
    <div className={`bg-white rounded-2xl shadow-lg border-2 ${meal.borderColor} hover:shadow-xl transition-all duration-300 hover-lift overflow-hidden`}>
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className={`p-4 rounded-xl bg-gradient-to-r ${meal.bgColor} text-white shadow-lg`}>
            <meal.icon className="text-2xl" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-xl font-bold text-gray-900">{meal.name}</h3>
              <span className="text-xl">{meal.emoji}</span>
            </div>
            <p className="text-sm text-gray-600 mb-1">{meal.description}</p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <FaClock className="text-xs" />
              <span>{meal.time}</span>
            </div>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <status.icon className={`text-lg ${status.color}`} />
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              status.status === 'submitted' ? 'bg-green-100 text-green-700' :
              status.status === 'available' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-500'
            }`}>
              {status.status === 'submitted' && 'Completed'}
              {status.status === 'available' && 'Ready'}
              {status.status === 'locked' && 'Locked'}
            </span>
          </div>
        </div>

        {hasSubmitted ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <FaCheckCircle className="text-green-600" />
                <span className="font-semibold text-green-800">Feedback Submitted</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Your Rating:</span>
                  <div className="flex items-center space-x-2">
                    <StarRating rating={feedback.rating} readonly size="sm" />
                    <span className="text-sm font-bold text-green-600">{feedback.rating}/5</span>
                  </div>
                </div>
                
                {feedback.comment && (
                  <div>
                    <span className="text-sm font-medium text-gray-700 block mb-2">Your Comment:</span>
                    <div className="bg-white p-3 rounded-lg border border-green-200">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        "{feedback.comment}"
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 text-xs text-green-600">
                  <FaClock className="text-xs" />
                  <span>Submitted at {new Date(feedback.submittedAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-100 to-blue-100 p-4 rounded-xl">
              <div className="flex items-center space-x-2 text-green-700">
                <FaHeart className="text-sm" />
                <span className="text-sm font-medium">Thank you for making our food better!</span>
              </div>
            </div>
          </div>
        ) : canSubmit ? (
          <div className="space-y-5">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <FaStar className="text-blue-600" />
                <span className="font-semibold text-blue-800">Share Your Experience</span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    How would you rate this meal?
                  </label>
                  <div className="flex items-center space-x-3">
                    <StarRating
                      rating={rating}
                      onChange={setRating}
                      size="lg"
                    />
                    {rating > 0 && (
                      <div className="flex items-center space-x-1">
                        <span className="text-lg font-bold text-blue-600">{rating}</span>
                        <span className="text-sm text-gray-500">/5</span>
                        <span className="text-sm text-blue-600 font-medium">
                          {rating === 5 ? '🌟 Excellent!' : 
                           rating === 4 ? '😊 Great!' : 
                           rating === 3 ? '👍 Good' : 
                           rating === 2 ? '😐 Okay' : '😞 Poor'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor={`comment-${meal.key}`} className="block text-sm font-medium text-gray-700 mb-2">
                    Tell us more (optional):
                  </label>
                  <div className="relative">
                    <textarea
                      id={`comment-${meal.key}`}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      rows="3"
                      placeholder="What did you think about the taste, presentation, or portion size?"
                      maxLength="500"
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                      {comment.length}/500
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || isSubmitting || !rating}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform ${
                !rating || submitting || isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : `bg-gradient-to-r ${meal.bgColor} hover:scale-105 hover:shadow-lg active:scale-95`
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting your feedback...</span>
                </div>
              ) : rating ? (
                <div className="flex items-center justify-center space-x-2">
                  <FaThumbsUp className="text-lg" />
                  <span>Submit Feedback</span>
                  <FaHeart className="text-sm" />
                </div>
              ) : (
                'Please rate the meal first'
              )}
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full opacity-20"></div>
              <FaTimesCircle className="relative text-4xl text-gray-400 mx-auto mb-3" />
            </div>
            <h4 className="font-semibold text-gray-600 mb-2">Feedback Not Available</h4>
            <p className="text-sm text-gray-500 mb-3">
              Come back during meal time to share your experience
            </p>
            <div className="inline-flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
              <FaClock className="text-xs text-gray-500" />
              <span className="text-xs text-gray-600 font-medium">
                Available {meal.time}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
