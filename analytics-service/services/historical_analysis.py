#!/usr/bin/env python3
"""
Historical Analysis Service for Hostel Food Analysis
Analyzes historical feedback data with comparisons and trends
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.database import DatabaseConnection, get_date_range, safe_json_output, handle_error
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from collections import defaultdict
import json

def analyze_historical_data(start_date_str, end_date_str, analysis_type="comparison"):
    """
    Perform historical analysis between two dates or periods
    analysis_type: 'comparison', 'trend', 'pattern'
    """
    db_conn = DatabaseConnection()
    
    if not db_conn.connect():
        handle_error("Failed to connect to database", "DATABASE_ERROR")
        return
    
    try:
        # Parse dates
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
        except ValueError:
            handle_error("Invalid date format. Use YYYY-MM-DD", "DATE_ERROR")
            return
        
        if start_date >= end_date:
            handle_error("Start date must be before end date", "DATE_ERROR")
            return
        
        # Get collections
        feedback_collection = db_conn.get_feedback_collection()
        users_collection = db_conn.get_users_collection()
        
        # Fetch historical data
        feedback_cursor = feedback_collection.find({
            "date": {
                "$gte": start_date,
                "$lt": end_date + timedelta(days=1)
            }
        })
        
        feedback_data = list(feedback_cursor)
        total_students = users_collection.count_documents({"isAdmin": False})
        
        if not feedback_data:
            result = create_empty_historical_result(start_date_str, end_date_str, analysis_type)
            safe_json_output(result)
            return
        
        # Perform analysis based on type
        if analysis_type == "comparison":
            analysis_result = perform_comparison_analysis(feedback_data, start_date, end_date, total_students)
        elif analysis_type == "trend":
            analysis_result = perform_trend_analysis(feedback_data, start_date, end_date, total_students)
        elif analysis_type == "pattern":
            analysis_result = perform_pattern_analysis(feedback_data, start_date, end_date, total_students)
        else:
            handle_error(f"Unknown analysis type: {analysis_type}", "ANALYSIS_ERROR")
            return
        
        # Final result
        result = {
            "error": False,
            "startDate": start_date_str,
            "endDate": end_date_str,
            "analysisType": analysis_type,
            "timestamp": datetime.now().isoformat(),
            "data": analysis_result
        }
        
        safe_json_output(result)
        
    except Exception as e:
        handle_error(f"Historical analysis failed: {str(e)}", "ANALYSIS_ERROR")
    finally:
        db_conn.close()

def perform_comparison_analysis(feedback_data, start_date, end_date, total_students):
    """Compare two periods or specific dates"""
    meal_types = ['morning', 'afternoon', 'evening', 'night']
    
    # Split data into two periods for comparison
    total_days = (end_date - start_date).days
    mid_date = start_date + timedelta(days=total_days // 2)
    
    period1_data = [f for f in feedback_data if f['date'] < mid_date]
    period2_data = [f for f in feedback_data if f['date'] >= mid_date]
    
    period1_analysis = analyze_period(period1_data, meal_types, total_students)
    period2_analysis = analyze_period(period2_data, meal_types, total_students)
    
    # Calculate improvements/declines
    comparisons = {}
    for meal_type in meal_types:
        period1_rating = period1_analysis["mealPerformance"].get(meal_type, {}).get("averageRating", 0)
        period2_rating = period2_analysis["mealPerformance"].get(meal_type, {}).get("averageRating", 0)
        
        change = period2_rating - period1_rating
        comparisons[meal_type] = {
            "period1Rating": period1_rating,
            "period2Rating": period2_rating, 
            "change": round(change, 2),
            "changePercentage": round((change / period1_rating * 100), 1) if period1_rating > 0 else 0,
            "trend": "improved" if change > 0.1 else "declined" if change < -0.1 else "stable"
        }
    
    overall_change = period2_analysis["overview"]["overallRating"] - period1_analysis["overview"]["overallRating"]
    
    return {
        "overview": {
            "period1": {
                "startDate": start_date.strftime('%Y-%m-%d'),
                "endDate": (mid_date - timedelta(days=1)).strftime('%Y-%m-%d'),
                "overallRating": period1_analysis["overview"]["overallRating"],
                "participationRate": period1_analysis["overview"]["participationRate"]
            },
            "period2": {
                "startDate": mid_date.strftime('%Y-%m-%d'),
                "endDate": end_date.strftime('%Y-%m-%d'),
                "overallRating": period2_analysis["overview"]["overallRating"],
                "participationRate": period2_analysis["overview"]["participationRate"]
            },
            "overallChange": round(overall_change, 2),
            "overallTrend": "improved" if overall_change > 0.1 else "declined" if overall_change < -0.1 else "stable"
        },
        "mealComparisons": comparisons,
        "period1Details": period1_analysis,
        "period2Details": period2_analysis,
        "insights": generate_comparison_insights(comparisons, overall_change),
        "recommendations": generate_comparison_recommendations(comparisons)
    }

def perform_trend_analysis(feedback_data, start_date, end_date, total_students):
    """Analyze trends over the historical period"""
    meal_types = ['morning', 'afternoon', 'evening', 'night']
    
    # Group data by day
    daily_data = defaultdict(lambda: {meal: [] for meal in meal_types})
    date_range = []
    
    current_date = start_date
    while current_date <= end_date:
        date_range.append(current_date)
        current_date += timedelta(days=1)
    
    for feedback in feedback_data:
        date_key = feedback['date'].strftime('%Y-%m-%d')
        for meal_type in meal_types:
            meal_feedback = feedback['meals'].get(meal_type, {})
            rating = meal_feedback.get('rating')
            if rating is not None:
                daily_data[date_key][meal_type].append(rating)
    
    # Calculate daily averages
    daily_averages = {}
    for date in date_range:
        date_key = date.strftime('%Y-%m-%d')
        day_data = daily_data[date_key]
        
        daily_averages[date_key] = {
            "date": date_key,
            "dayName": date.strftime('%A'),
            "overallRating": 0,
            "mealRatings": {}
        }
        
        all_day_ratings = []
        for meal_type in meal_types:
            meal_ratings = day_data[meal_type]
            avg_rating = np.mean(meal_ratings) if meal_ratings else 0
            daily_averages[date_key]["mealRatings"][meal_type] = round(avg_rating, 2)
            if meal_ratings:
                all_day_ratings.extend(meal_ratings)
        
        daily_averages[date_key]["overallRating"] = round(np.mean(all_day_ratings), 2) if all_day_ratings else 0
    
    # Calculate trend statistics
    trend_stats = {}
    for meal_type in meal_types:
        ratings_series = [daily_averages[date_key]["mealRatings"][meal_type] 
                         for date_key in sorted(daily_averages.keys())]
        ratings_series = [r for r in ratings_series if r > 0]  # Remove zero ratings
        
        if len(ratings_series) > 1:
            trend_slope = calculate_trend_slope(ratings_series)
            trend_stats[meal_type] = {
                "averageRating": round(np.mean(ratings_series), 2),
                "trendSlope": trend_slope,
                "trendDirection": get_trend_direction(trend_slope),
                "volatility": round(np.std(ratings_series), 2),
                "highestRating": max(ratings_series),
                "lowestRating": min(ratings_series),
                "ratingRange": round(max(ratings_series) - min(ratings_series), 2)
            }
        else:
            trend_stats[meal_type] = {
                "averageRating": 0,
                "trendSlope": 0,
                "trendDirection": "no_data",
                "volatility": 0,
                "highestRating": 0,
                "lowestRating": 0,
                "ratingRange": 0
            }
    
    return {
        "overview": {
            "totalDays": len(date_range),
            "dataAvailableDays": len([d for d in daily_averages.values() if d["overallRating"] > 0]),
            "overallTrendDirection": analyze_overall_trend(daily_averages),
            "averageRating": round(np.mean([d["overallRating"] for d in daily_averages.values() if d["overallRating"] > 0]), 2)
        },
        "dailyAverages": daily_averages,
        "trendAnalysis": trend_stats,
        "insights": generate_trend_insights(trend_stats),
        "recommendations": generate_trend_recommendations(trend_stats)
    }

def perform_pattern_analysis(feedback_data, start_date, end_date, total_students):
    """Identify patterns in historical data"""
    meal_types = ['morning', 'afternoon', 'evening', 'night']
    
    # Analyze day-of-week patterns
    dow_patterns = analyze_day_of_week_patterns(feedback_data, meal_types)
    
    # Analyze monthly patterns (if data spans multiple months)
    monthly_patterns = analyze_monthly_patterns(feedback_data, meal_types)
    
    # Analyze meal time patterns
    meal_time_patterns = analyze_meal_time_patterns(feedback_data, meal_types)
    
    # Analyze participation patterns
    participation_patterns = analyze_participation_patterns(feedback_data, total_students)
    
    return {
        "dayOfWeekPatterns": dow_patterns,
        "monthlyPatterns": monthly_patterns,
        "mealTimePatterns": meal_time_patterns,
        "participationPatterns": participation_patterns,
        "insights": generate_pattern_insights(dow_patterns, monthly_patterns, participation_patterns),
        "recommendations": generate_pattern_recommendations(dow_patterns, monthly_patterns)
    }

def analyze_period(feedback_data, meal_types, total_students):
    """Analyze a specific period of feedback data"""
    if not feedback_data:
        return create_empty_period_analysis()
    
    all_ratings = []
    meal_data = {meal: {"ratings": [], "comments": []} for meal in meal_types}
    participating_students = set()
    
    for feedback in feedback_data:
        participating_students.add(str(feedback['user']))
        for meal_type in meal_types:
            meal_feedback = feedback['meals'].get(meal_type, {})
            rating = meal_feedback.get('rating')
            comment = meal_feedback.get('comment', '').strip()
            
            if rating is not None:
                meal_data[meal_type]["ratings"].append(rating)
                all_ratings.append(rating)
                if comment:
                    meal_data[meal_type]["comments"].append(comment)
    
    # Calculate metrics
    overall_rating = np.mean(all_ratings) if all_ratings else 0
    participation_count = len(participating_students)
    participation_rate = (participation_count / total_students * 100) if total_students > 0 else 0
    
    meal_performance = {}
    for meal_type in meal_types:
        ratings = meal_data[meal_type]["ratings"]
        if ratings:
            meal_performance[meal_type] = {
                "averageRating": round(np.mean(ratings), 2),
                "participants": len(ratings),
                "totalComments": len(meal_data[meal_type]["comments"])
            }
        else:
            meal_performance[meal_type] = {
                "averageRating": 0,
                "participants": 0,
                "totalComments": 0
            }
    
    return {
        "overview": {
            "overallRating": round(overall_rating, 2),
            "participationRate": round(participation_rate, 1),
            "totalFeedbacks": len(feedback_data),
            "totalRatings": len(all_ratings)
        },
        "mealPerformance": meal_performance
    }

def calculate_trend_slope(ratings_series):
    """Calculate trend slope using linear regression"""
    if len(ratings_series) < 2:
        return 0
    
    x = list(range(len(ratings_series)))
    slope = np.polyfit(x, ratings_series, 1)[0]
    return round(slope, 4)

def get_trend_direction(slope):
    """Convert slope to trend direction"""
    if slope > 0.05:
        return "strongly_improving"
    elif slope > 0.02:
        return "improving"
    elif slope > -0.02:
        return "stable"
    elif slope > -0.05:
        return "declining"
    else:
        return "strongly_declining"

def analyze_overall_trend(daily_averages):
    """Analyze overall trend from daily averages"""
    ratings = [d["overallRating"] for d in daily_averages.values() if d["overallRating"] > 0]
    if len(ratings) < 2:
        return "insufficient_data"
    
    slope = calculate_trend_slope(ratings)
    return get_trend_direction(slope)

def analyze_day_of_week_patterns(feedback_data, meal_types):
    """Analyze patterns by day of week"""
    dow_data = defaultdict(lambda: {meal: [] for meal in meal_types})
    
    for feedback in feedback_data:
        day_name = feedback['date'].strftime('%A')
        for meal_type in meal_types:
            meal_feedback = feedback['meals'].get(meal_type, {})
            rating = meal_feedback.get('rating')
            if rating is not None:
                dow_data[day_name][meal_type].append(rating)
    
    # Calculate averages for each day of week
    dow_averages = {}
    for day_name in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']:
        if day_name in dow_data:
            day_data = dow_data[day_name]
            day_averages = {}
            
            for meal_type in meal_types:
                ratings = day_data[meal_type]
                day_averages[meal_type] = round(np.mean(ratings), 2) if ratings else 0
            
            dow_averages[day_name] = day_averages
    
    return dow_averages

def analyze_monthly_patterns(feedback_data, meal_types):
    """Analyze patterns by month"""
    monthly_data = defaultdict(lambda: {meal: [] for meal in meal_types})
    
    for feedback in feedback_data:
        month_key = feedback['date'].strftime('%Y-%m')
        for meal_type in meal_types:
            meal_feedback = feedback['meals'].get(meal_type, {})
            rating = meal_feedback.get('rating')
            if rating is not None:
                monthly_data[month_key][meal_type].append(rating)
    
    # Calculate monthly averages
    monthly_averages = {}
    for month_key, month_data in monthly_data.items():
        month_averages = {}
        for meal_type in meal_types:
            ratings = month_data[meal_type]
            month_averages[meal_type] = round(np.mean(ratings), 2) if ratings else 0
        monthly_averages[month_key] = month_averages
    
    return monthly_averages

def analyze_meal_time_patterns(feedback_data, meal_types):
    """Analyze when students submit feedback for each meal"""
    meal_time_data = {meal: [] for meal in meal_types}
    
    for feedback in feedback_data:
        for meal_type in meal_types:
            meal_feedback = feedback['meals'].get(meal_type, {})
            submitted_at = meal_feedback.get('submittedAt')
            if submitted_at:
                hour = submitted_at.hour
                meal_time_data[meal_type].append(hour)
    
    # Calculate average submission times
    meal_time_averages = {}
    for meal_type, hours in meal_time_data.items():
        if hours:
            avg_hour = np.mean(hours)
            meal_time_averages[meal_type] = {
                "averageHour": round(avg_hour, 1),
                "submissionCount": len(hours),
                "peakHour": max(set(hours), key=hours.count) if hours else 0
            }
        else:
            meal_time_averages[meal_type] = {
                "averageHour": 0,
                "submissionCount": 0,
                "peakHour": 0
            }
    
    return meal_time_averages

def analyze_participation_patterns(feedback_data, total_students):
    """Analyze student participation patterns"""
    daily_participation = defaultdict(set)
    
    for feedback in feedback_data:
        date_key = feedback['date'].strftime('%Y-%m-%d')
        daily_participation[date_key].add(str(feedback['user']))
    
    participation_rates = []
    for date_key, participants in daily_participation.items():
        rate = len(participants) / total_students * 100 if total_students > 0 else 0
        participation_rates.append(rate)
    
    return {
        "averageParticipationRate": round(np.mean(participation_rates), 1) if participation_rates else 0,
        "highestParticipationRate": round(max(participation_rates), 1) if participation_rates else 0,
        "lowestParticipationRate": round(min(participation_rates), 1) if participation_rates else 0,
        "participationVariability": round(np.std(participation_rates), 1) if participation_rates else 0
    }

# Helper functions for insights and recommendations
def generate_comparison_insights(comparisons, overall_change):
    """Generate insights from comparison analysis"""
    insights = []
    
    if overall_change > 0.2:
        insights.append({"type": "positive", "message": f"Significant overall improvement: +{overall_change:.1f} stars"})
    elif overall_change < -0.2:
        insights.append({"type": "negative", "message": f"Overall decline: {overall_change:.1f} stars"})
    
    improved_meals = [meal for meal, data in comparisons.items() if data["trend"] == "improved"]
    declined_meals = [meal for meal, data in comparisons.items() if data["trend"] == "declined"]
    
    if improved_meals:
        insights.append({"type": "positive", "message": f"Improved meals: {', '.join(improved_meals)}"})
    if declined_meals:
        insights.append({"type": "negative", "message": f"Declined meals: {', '.join(declined_meals)}"})
    
    return insights

def generate_comparison_recommendations(comparisons):
    """Generate recommendations from comparison analysis"""
    recommendations = []
    
    for meal, data in comparisons.items():
        if data["trend"] == "declined" and data["change"] < -0.3:
            recommendations.append({
                "priority": "high",
                "meal": meal,
                "action": f"Urgent review needed for {meal} - rating dropped {abs(data['change']):.1f} stars"
            })
        elif data["trend"] == "improved" and data["change"] > 0.3:
            recommendations.append({
                "priority": "medium", 
                "meal": meal,
                "action": f"Replicate success factors from {meal} improvement (+{data['change']:.1f} stars)"
            })
    
    return recommendations

def generate_trend_insights(trend_stats):
    """Generate insights from trend analysis"""
    insights = []
    
    improving_meals = [meal for meal, data in trend_stats.items() if data["trendDirection"] in ["improving", "strongly_improving"]]
    declining_meals = [meal for meal, data in trend_stats.items() if data["trendDirection"] in ["declining", "strongly_declining"]]
    
    if improving_meals:
        insights.append({"type": "positive", "message": f"Consistently improving: {', '.join(improving_meals)}"})
    if declining_meals:
        insights.append({"type": "negative", "message": f"Declining trends: {', '.join(declining_meals)}"})
    
    # Volatility insights
    volatile_meals = [meal for meal, data in trend_stats.items() if data["volatility"] > 0.5]
    if volatile_meals:
        insights.append({"type": "warning", "message": f"Inconsistent quality: {', '.join(volatile_meals)}"})
    
    return insights

def generate_trend_recommendations(trend_stats):
    """Generate recommendations from trend analysis"""
    recommendations = []
    
    for meal, data in trend_stats.items():
        if data["trendDirection"] == "strongly_declining":
            recommendations.append({
                "priority": "critical",
                "meal": meal,
                "action": f"Immediate intervention required for {meal} - strong declining trend"
            })
        elif data["volatility"] > 0.6:
            recommendations.append({
                "priority": "medium",
                "meal": meal,
                "action": f"Improve consistency for {meal} - high quality variation detected"
            })
    
    return recommendations

def generate_pattern_insights(dow_patterns, monthly_patterns, participation_patterns):
    """Generate insights from pattern analysis"""
    insights = []
    
    # Day of week insights
    if dow_patterns:
        day_averages = {}
        for day, meals in dow_patterns.items():
            day_avg = np.mean([rating for rating in meals.values() if rating > 0])
            if not np.isnan(day_avg):
                day_averages[day] = day_avg
        
        if day_averages:
            best_day = max(day_averages.items(), key=lambda x: x[1])
            worst_day = min(day_averages.items(), key=lambda x: x[1])
            
            insights.append({"type": "info", "message": f"Best day: {best_day[0]} ({best_day[1]:.1f}⭐)"})
            insights.append({"type": "info", "message": f"Challenging day: {worst_day[0]} ({worst_day[1]:.1f}⭐)"})
    
    # Participation insights
    if participation_patterns["participationVariability"] > 15:
        insights.append({"type": "warning", "message": "High participation variability detected"})
    
    return insights

def generate_pattern_recommendations(dow_patterns, monthly_patterns):
    """Generate recommendations from pattern analysis"""
    recommendations = []
    
    # Day of week recommendations
    if dow_patterns:
        for day, meals in dow_patterns.items():
            poor_meals = [meal for meal, rating in meals.items() if rating > 0 and rating < 3.0]
            if poor_meals:
                recommendations.append({
                    "priority": "medium",
                    "action": f"Focus on {day} {', '.join(poor_meals)} preparation"
                })
    
    return recommendations

def create_empty_historical_result(start_date, end_date, analysis_type):
    """Create empty result for no data scenarios"""
    return {
        "error": False,
        "startDate": start_date,
        "endDate": end_date,
        "analysisType": analysis_type,
        "message": "No feedback data found for this period",
        "data": {
            "overview": {},
            "insights": [],
            "recommendations": []
        }
    }

def create_empty_period_analysis():
    """Create empty period analysis"""
    return {
        "overview": {
            "overallRating": 0,
            "participationRate": 0,
            "totalFeedbacks": 0,
            "totalRatings": 0
        },
        "mealPerformance": {
            "morning": {"averageRating": 0, "participants": 0, "totalComments": 0},
            "afternoon": {"averageRating": 0, "participants": 0, "totalComments": 0},
            "evening": {"averageRating": 0, "participants": 0, "totalComments": 0},
            "night": {"averageRating": 0, "participants": 0, "totalComments": 0}
        }
    }

if __name__ == "__main__":
    if len(sys.argv) not in [3, 4]:
        handle_error("Usage: python historical_analysis.py <start_date> <end_date> [analysis_type]", "USAGE_ERROR")
    
    start_date_str = sys.argv[1]
    end_date_str = sys.argv[2]
    analysis_type = sys.argv[3] if len(sys.argv) == 4 else "comparison"
    
    analyze_historical_data(start_date_str, end_date_str, analysis_type)
