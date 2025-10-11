import express from 'express';
import axios from 'axios';
import Feedback from '../models/Feedback.js';
import User from '../models/User.js';
import { authenticateFirebaseToken, requireAdmin } from '../middleware/firebaseAuth.js';

const router = express.Router();

// Helper function to get AI suggestions using free Hugging Face API
const getAISuggestions = async (analyticsData) => {
  try {
    if (!process.env.HUGGINGFACE_API_KEY) {
      return "AI suggestions temporarily unavailable. Please configure Hugging Face API key.";
    }

    const { averageRatings, comments, lowRatedMeals } = analyticsData;
    
    // Prepare prompt for AI
    const prompt = `
Based on hostel food feedback data, provide improvement suggestions:

Average Ratings:
- Morning: ${averageRatings.morning}/5
- Afternoon: ${averageRatings.afternoon}/5
- Evening: ${averageRatings.evening}/5
- Night: ${averageRatings.night}/5

Low-rated meals: ${lowRatedMeals.join(', ')}

Recent comments summary: ${comments.slice(0, 10).join('. ')}

Please provide 3-5 specific, actionable suggestions to improve hostel food quality and student satisfaction:`;

    const response = await axios.post(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
      {
        inputs: prompt,
        parameters: {
          max_length: 300,
          temperature: 0.7,
          top_p: 0.9
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    if (response.data && response.data[0] && response.data[0].generated_text) {
      return response.data[0].generated_text.replace(prompt, '').trim();
    }

    // Fallback suggestions if AI fails
    return generateFallbackSuggestions(analyticsData);

  } catch (error) {
    console.error('AI suggestion error:', error);
    return generateFallbackSuggestions(analyticsData);
  }
};

// Fallback suggestions based on data analysis
const generateFallbackSuggestions = (analyticsData) => {
  const { averageRatings, lowRatedMeals } = analyticsData;
  const suggestions = [];

  // Rating-based suggestions
  Object.entries(averageRatings).forEach(([meal, rating]) => {
    if (rating < 2.5) {
      suggestions.push(`${meal.charAt(0).toUpperCase() + meal.slice(1)} meal needs immediate attention - consider menu changes or cooking improvements.`);
    } else if (rating < 3.5) {
      suggestions.push(`${meal.charAt(0).toUpperCase() + meal.slice(1)} meal could be improved - gather specific feedback from students.`);
    }
  });

  // General suggestions
  if (suggestions.length === 0) {
    suggestions.push("Overall ratings are good. Continue maintaining food quality and consider introducing variety in menu.");
  }

  suggestions.push("Conduct regular quality checks and maintain hygiene standards.");
  suggestions.push("Consider student feedback surveys for menu planning.");

  return suggestions.join('\n\n');
};

// @route   GET /api/analytics/dashboard
// @desc    Get analytics dashboard data
// @access  Private/Admin
router.get('/dashboard', [authenticateFirebaseToken, requireAdmin], async (req, res) => {
  try {
    const { period = 'daily', date } = req.query;

    let startDate, endDate;
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);

    // Set date range based on period
    if (period === 'daily') {
      if (date) {
        startDate = new Date(date);
        endDate = new Date(date);
      } else {
        startDate = new Date(istNow.getFullYear(), istNow.getMonth(), istNow.getDate());
        endDate = new Date(istNow.getFullYear(), istNow.getMonth(), istNow.getDate());
      }
    } else if (period === 'weekly') {
      endDate = new Date(istNow.getFullYear(), istNow.getMonth(), istNow.getDate());
      startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 6); // Last 7 days
    }

    // Get feedbacks for the period
    const feedbacks = await Feedback.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate('user', 'name rollNumber hostelRoom');

    // Calculate analytics
    const analytics = calculateAnalytics(feedbacks, period);

    // Get AI suggestions
    const aiSuggestions = await getAISuggestions(analytics);

    res.json({
      status: 'success',
      data: {
        period,
        dateRange: { startDate, endDate },
        analytics,
        aiSuggestions,
        totalFeedbacks: feedbacks.length
      }
    });

  } catch (error) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get analytics data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to calculate analytics
const calculateAnalytics = (feedbacks, period) => {
  const mealTypes = ['morning', 'afternoon', 'evening', 'night'];
  
  // Initialize analytics object
  const analytics = {
    averageRatings: {},
    totalSubmissions: {},
    ratingDistribution: {},
    satisfactionPercentage: {},
    comments: [],
    keyInsights: [],
    trendData: period === 'weekly' ? [] : null
  };

  // Calculate for each meal type
  mealTypes.forEach(mealType => {
    const mealRatings = [];
    const mealComments = [];
    let submissionCount = 0;

    feedbacks.forEach(feedback => {
      if (feedback.meals[mealType].rating !== null) {
        mealRatings.push(feedback.meals[mealType].rating);
        submissionCount++;
        
        if (feedback.meals[mealType].comment) {
          mealComments.push(feedback.meals[mealType].comment);
        }
      }
    });

    // Average rating
    analytics.averageRatings[mealType] = mealRatings.length > 0 
      ? parseFloat((mealRatings.reduce((a, b) => a + b, 0) / mealRatings.length).toFixed(2))
      : 0;

    // Total submissions
    analytics.totalSubmissions[mealType] = submissionCount;

    // Rating distribution
    analytics.ratingDistribution[mealType] = {
      1: mealRatings.filter(r => r >= 0 && r < 1).length,
      2: mealRatings.filter(r => r >= 1 && r < 2).length,
      3: mealRatings.filter(r => r >= 2 && r < 3).length,
      4: mealRatings.filter(r => r >= 3 && r < 4).length,
      5: mealRatings.filter(r => r >= 4 && r <= 5).length
    };

    // Satisfaction percentage (rating >= 3)
    const satisfiedCount = mealRatings.filter(r => r >= 3).length;
    analytics.satisfactionPercentage[mealType] = mealRatings.length > 0 
      ? Math.round((satisfiedCount / mealRatings.length) * 100)
      : 0;

    // Collect comments
    analytics.comments = analytics.comments.concat(mealComments);
  });

  // Generate key insights
  analytics.keyInsights = generateKeyInsights(analytics);

  // Generate trend data for weekly view
  if (period === 'weekly') {
    analytics.trendData = generateTrendData(feedbacks);
  }

  // Low-rated meals for AI suggestions
  analytics.lowRatedMeals = Object.entries(analytics.averageRatings)
    .filter(([meal, rating]) => rating < 3)
    .map(([meal, rating]) => meal);

  return analytics;
};

// Generate key insights from data
const generateKeyInsights = (analytics) => {
  const insights = [];
  const { averageRatings, satisfactionPercentage, totalSubmissions } = analytics;

  // Best and worst performing meals
  const mealEntries = Object.entries(averageRatings);
  if (mealEntries.length > 0) {
    const bestMeal = mealEntries.reduce((a, b) => a[1] > b[1] ? a : b);
    const worstMeal = mealEntries.reduce((a, b) => a[1] < b[1] ? a : b);

    if (bestMeal[1] > 0) {
      insights.push(`Best performing meal: ${bestMeal[0]} with ${bestMeal[1]}/5 rating`);
    }
    if (worstMeal[1] > 0 && worstMeal[1] < 3) {
      insights.push(`Needs improvement: ${worstMeal[0]} with ${worstMeal[1]}/5 rating`);
    }
  }

  // Overall satisfaction
  const overallSatisfaction = Object.values(satisfactionPercentage).reduce((a, b) => a + b, 0) / 4;
  if (overallSatisfaction > 75) {
    insights.push(`High satisfaction rate: ${Math.round(overallSatisfaction)}% of students are satisfied`);
  } else if (overallSatisfaction < 50) {
    insights.push(`Low satisfaction rate: Only ${Math.round(overallSatisfaction)}% of students are satisfied`);
  }

  // Participation rate
  const totalParticipation = Object.values(totalSubmissions).reduce((a, b) => a + b, 0);
  if (totalParticipation < 20) {
    insights.push("Low participation rate - consider encouraging more feedback submissions");
  }

  return insights;
};

// Generate trend data for weekly view
const generateTrendData = (feedbacks) => {
  const trendData = [];
  const groupedByDate = {};

  // Group feedbacks by date
  feedbacks.forEach(feedback => {
    const dateKey = feedback.date.toISOString().split('T')[0];
    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = [];
    }
    groupedByDate[dateKey].push(feedback);
  });

  // Calculate daily averages
  Object.entries(groupedByDate).forEach(([date, dayFeedbacks]) => {
    const mealTypes = ['morning', 'afternoon', 'evening', 'night'];
    const dayData = { date };

    mealTypes.forEach(mealType => {
      const ratings = dayFeedbacks
        .map(f => f.meals[mealType].rating)
        .filter(r => r !== null);
      
      dayData[mealType] = ratings.length > 0 
        ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2))
        : 0;
    });

    trendData.push(dayData);
  });

  return trendData.sort((a, b) => new Date(a.date) - new Date(b.date));
};

// @route   GET /api/analytics/comments
// @desc    Get comment analysis
// @access  Private/Admin
router.get('/comments', [authenticateFirebaseToken, requireAdmin], async (req, res) => {
  try {
    const { date, mealType } = req.query;

    let query = {};
    if (date) {
      query.date = new Date(date);
    }

    const feedbacks = await Feedback.find(query)
      .populate('user', 'name rollNumber')
      .sort({ date: -1 });

    let comments = [];

    feedbacks.forEach(feedback => {
      const mealTypes = mealType ? [mealType] : ['morning', 'afternoon', 'evening', 'night'];
      
      mealTypes.forEach(meal => {
        if (feedback.meals[meal].comment && feedback.meals[meal].comment.trim()) {
          comments.push({
            user: feedback.user,
            date: feedback.date,
            mealType: meal,
            rating: feedback.meals[meal].rating,
            comment: feedback.meals[meal].comment,
            submittedAt: feedback.meals[meal].submittedAt
          });
        }
      });
    });

    // Sort by submission time
    comments.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    res.json({
      status: 'success',
      data: {
        comments,
        totalComments: comments.length
      }
    });

  } catch (error) {
    console.error('Comments analysis error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get comments data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
