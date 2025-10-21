#!/usr/bin/env python3
"""
Enhanced Weekly Analysis Service for Hostel Food Analysis
Analyzes feedback data for a specific week with comprehensive metrics
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.database import DatabaseConnection, get_date_range, safe_json_output, handle_error
from datetime import datetime, timedelta
from collections import Counter, defaultdict
import statistics

def generate_weekly_overall_summary(weekly_data, daily_summaries):
    """Generate AI-powered weekly summary with strategic insights"""
    
    if not weekly_data["all_ratings"]:
        return {
            "key_weekly_insights": [],
            "critical_weekly_actions": [],
            "week_performance_status": "NO DATA",
            "weekly_performance_summary": "No feedback available for analysis"
        }
    
    avg_rating = sum(weekly_data["all_ratings"]) / len(weekly_data["all_ratings"])
    total_feedback = len(weekly_data["all_ratings"])
    
    # Calculate weekly trends
    daily_ratings = [summary["avg_rating"] for summary in daily_summaries.values() if summary["avg_rating"] > 0]
    trend_direction = "stable"
    if len(daily_ratings) >= 2:
        if daily_ratings[-1] > daily_ratings[0] + 0.2:
            trend_direction = "improving"
        elif daily_ratings[-1] < daily_ratings[0] - 0.2:
            trend_direction = "declining"
    
    # Rating distribution analysis
    rating_counts = Counter(weekly_data["all_ratings"])
    poor_ratings = rating_counts[1] + rating_counts[2]
    excellent_ratings = rating_counts[4] + rating_counts[5]
    poor_percentage = (poor_ratings / total_feedback) * 100
    excellent_percentage = (excellent_ratings / total_feedback) * 100
    
    # Find consistently problematic patterns
    problematic_patterns = []
    
    # Check for Monday issues
    monday_ratings = [summary["avg_rating"] for date, summary in daily_summaries.items() 
                     if summary["day_name"] == "Monday" and summary["avg_rating"] > 0]
    if monday_ratings and statistics.mean(monday_ratings) < avg_rating - 0.3:
        problematic_patterns.append("Monday Blues Pattern")
    
    # Check for weekend quality drops
    weekend_ratings = [summary["avg_rating"] for date, summary in daily_summaries.items() 
                      if summary["day_name"] in ["Saturday", "Sunday"] and summary["avg_rating"] > 0]
    weekday_ratings = [summary["avg_rating"] for date, summary in daily_summaries.items() 
                      if summary["day_name"] not in ["Saturday", "Sunday"] and summary["avg_rating"] > 0]
    
    if weekend_ratings and weekday_ratings:
        weekend_avg = statistics.mean(weekend_ratings)
        weekday_avg = statistics.mean(weekday_ratings)
        if weekend_avg < weekday_avg - 0.25:
            problematic_patterns.append("Weekend Quality Drop")
    
    # Analyze meal consistency across the week
    meal_names = {'morning': 'Breakfast', 'afternoon': 'Lunch', 'evening': 'Dinner', 'night': 'Night Snacks'}
    worst_performing_meals = []
    best_performing_meals = []
    
    for meal_type, meal_name in meal_names.items():
        meal_ratings = weekly_data["meal_ratings"][meal_type]
        if meal_ratings:
            meal_avg = sum(meal_ratings) / len(meal_ratings)
            poor_count = len([r for r in meal_ratings if r <= 2])
            poor_rate = (poor_count / len(meal_ratings)) * 100
            
            if meal_avg < 3.0 or poor_rate > 30:
                worst_performing_meals.append(f"{meal_name} (avg: {meal_avg:.1f})")
            elif meal_avg >= 3.8 and poor_rate < 15:
                best_performing_meals.append(f"{meal_name} (avg: {meal_avg:.1f})")
    
    # Generate key weekly insights
    key_insights = []
    
    # Insight 1: Overall weekly performance
    if avg_rating >= 4.0:
        key_insights.append(f"🟢 EXCELLENT WEEK: {avg_rating:.1f}/5 average with {excellent_percentage:.0f}% positive feedback - outstanding performance!")
    elif avg_rating >= 3.5:
        key_insights.append(f"🟡 GOOD WEEK: {avg_rating:.1f}/5 average shows solid performance with improvement opportunities")
    elif avg_rating >= 3.0:
        key_insights.append(f"🟠 MIXED WEEK: {avg_rating:.1f}/5 average indicates inconsistent quality - needs attention")
    else:
        key_insights.append(f"🔴 CRITICAL WEEK: {avg_rating:.1f}/5 average with {poor_percentage:.0f}% poor ratings - immediate intervention required")
    
    # Insight 2: Weekly trend analysis
    if trend_direction == "improving":
        key_insights.append(f"📈 POSITIVE TREND: Quality improving through the week - great momentum!")
    elif trend_direction == "declining":
        key_insights.append(f"📉 CONCERNING TREND: Quality declining through the week - investigate causes")
    else:
        if len(daily_ratings) >= 3:
            consistency = statistics.stdev(daily_ratings)
            if consistency > 0.5:
                key_insights.append(f"⚡ INCONSISTENT WEEK: High daily variation ({consistency:.1f} std dev) - focus on standardization")
    
    # Insight 3: Pattern-based insights
    if problematic_patterns:
        if "Monday Blues Pattern" in problematic_patterns:
            key_insights.append("🔵 MONDAY PROBLEM: Consistently poor Monday performance - weekend prep issues detected")
        if "Weekend Quality Drop" in problematic_patterns:
            key_insights.append("📅 WEEKEND CHALLENGE: Quality drops on weekends - staffing/supply chain issues")
    
    # Insight 4: Meal-specific insights
    if worst_performing_meals:
        key_insights.append(f"🍽️ MEAL ALERTS: {', '.join(worst_performing_meals)} need immediate review")
    elif best_performing_meals:
        key_insights.append(f"⭐ MEAL SUCCESSES: {', '.join(best_performing_meals)} performing excellently")
    
    # Generate critical weekly actions
    critical_actions = []
    
    if avg_rating < 3.0:
        critical_actions.extend([
            "Schedule emergency kitchen staff meeting for next Monday",
            "Implement daily quality monitoring system for entire next week",
            "Conduct immediate supplier quality audit"
        ])
    elif avg_rating < 3.5:
        critical_actions.extend([
            "Establish weekly menu review process with student representatives",
            "Implement mid-week quality check protocols",
            "Enhanced staff training on consistency standards"
        ])
    
    if "Monday Blues Pattern" in problematic_patterns:
        critical_actions.append("Implement Sunday evening prep checklist and Monday morning quality verification")
    
    if "Weekend Quality Drop" in problematic_patterns:
        critical_actions.append("Review weekend staffing levels and establish weekend quality standards")
    
    if worst_performing_meals:
        critical_actions.append(f"Priority focus on {worst_performing_meals[0].split('(')[0].strip()} preparation and service")
    
    if not critical_actions:
        critical_actions.extend([
            "Maintain current quality standards",
            "Continue weekly performance monitoring",
            "Explore menu variety enhancements"
        ])
    
    # Weekly performance status
    status = "EXCELLENT" if avg_rating >= 4.0 else "GOOD" if avg_rating >= 3.5 else "NEEDS IMPROVEMENT" if avg_rating >= 2.5 else "CRITICAL"
    
    performance_summary = f"📊 Week Status: {status} | Trend: {trend_direction.upper()} | Average: {avg_rating:.1f}/5 | Total Responses: {total_feedback} | {excellent_percentage:.0f}% positive, {poor_percentage:.0f}% poor"
    
    return {
        "key_weekly_insights": key_insights[:4],
        "critical_weekly_actions": critical_actions[:4],
        "week_performance_status": status,
        "weekly_performance_summary": performance_summary,
        "weekly_trends": {
            "direction": trend_direction,
            "consistency_score": 1 - (statistics.stdev(daily_ratings) / 5) if len(daily_ratings) > 1 else 1,
            "problematic_patterns": problematic_patterns
        }
    }

def analyze_weekly_feedback(date_str):
    """
    Perform comprehensive weekly analysis
    """
    db_conn = DatabaseConnection()
    
    if not db_conn.connect():
        handle_error("Failed to connect to database", "DATABASE_ERROR")
        return
    
    try:
        # Get week date range (Monday to Sunday)
        start_date, end_date = get_date_range(date_str, "week")
        
        # Get collections
        feedback_collection = db_conn.get_feedback_collection()
        users_collection = db_conn.get_users_collection()
        
        # Fetch week's feedback data
        feedback_cursor = feedback_collection.find({
            "date": {
                "$gte": start_date,
                "$lt": end_date
            }
        })
        
        feedback_data = list(feedback_cursor)
        total_students = users_collection.count_documents({"isAdmin": False})
        
        if not feedback_data:
            result = create_empty_weekly_result(date_str, start_date, end_date)
            safe_json_output(result)
            return
        
        # Initialize analysis structure
        meal_types = ['morning', 'afternoon', 'evening', 'night']
        weekly_analysis = {
            "overview": {},
            "dailyBreakdown": {},
            "mealTrends": {},
            "participationAnalysis": {},
            "weeklyInsights": [],
            "weeklyAlerts": [],
            "patterns": {},
            "comparisons": {}
        }
        
        # Group data by day
        daily_data = defaultdict(lambda: {
            "date": None,
            "feedback_count": 0,
            "ratings": {meal: [] for meal in meal_types},
            "comments": {meal: [] for meal in meal_types},
            "participants": set()
        })
        
        for feedback in feedback_data:
            date_key = feedback['date'].strftime('%Y-%m-%d')
            day_name = feedback['date'].strftime('%A')
            
            daily_data[date_key]["date"] = feedback['date']
            daily_data[date_key]["day_name"] = day_name
            daily_data[date_key]["feedback_count"] += 1
            daily_data[date_key]["participants"].add(str(feedback['user']))
            
            for meal_type in meal_types:
                meal_feedback = feedback['meals'].get(meal_type, {})
                rating = meal_feedback.get('rating')
                comment = meal_feedback.get('comment', '').strip()
                
                if rating is not None:
                    daily_data[date_key]["ratings"][meal_type].append(rating)
                    if comment:
                        daily_data[date_key]["comments"][meal_type].append(comment)
        
        # Calculate daily metrics
        week_ratings = []
        week_participation = []
        daily_breakdown = {}
        
        for date_key, day_data in daily_data.items():
            day_ratings = []
            day_meal_performance = {}
            
            for meal_type in meal_types:
                meal_ratings = day_data["ratings"][meal_type]
                if meal_ratings:
                    avg_rating = statistics.mean(meal_ratings)
                    day_meal_performance[meal_type] = {
                        "averageRating": round(avg_rating, 2),
                        "participants": len(meal_ratings),
                        "ratingDistribution": dict(Counter(meal_ratings))
                    }
                    day_ratings.extend(meal_ratings)
                else:
                    day_meal_performance[meal_type] = {
                        "averageRating": 0,
                        "participants": 0,
                        "ratingDistribution": {}
                    }
            
            day_avg_rating = statistics.mean(day_ratings) if day_ratings else 0
            day_participation = len(day_data["participants"])
            day_participation_rate = (day_participation / total_students * 100) if total_students > 0 else 0
            
            daily_breakdown[date_key] = {
                "date": date_key,
                "dayName": day_data.get("day_name", ""),
                "averageRating": round(day_avg_rating, 2),
                "participatingStudents": day_participation,
                "participationRate": round(day_participation_rate, 1),
                "totalRatings": len(day_ratings),
                "mealPerformance": day_meal_performance
            }
            
            week_ratings.extend(day_ratings)
            week_participation.append(day_participation)
        
        # Calculate weekly overview
        week_avg_rating = statistics.mean(week_ratings) if week_ratings else 0
        week_avg_participation = statistics.mean(week_participation) if week_participation else 0
        total_week_feedbacks = sum(len(day_data["participants"]) for day_data in daily_data.values())
        
        # Find best and worst days
        best_day = max(daily_breakdown.items(), key=lambda x: x[1]["averageRating"]) if daily_breakdown else None
        worst_day = min(daily_breakdown.items(), key=lambda x: x[1]["averageRating"] if x[1]["averageRating"] > 0 else float('inf')) if daily_breakdown else None
        
        weekly_analysis["overview"] = {
            "weekStart": start_date.strftime('%Y-%m-%d'),
            "weekEnd": (end_date - timedelta(days=1)).strftime('%Y-%m-%d'),
            "totalStudents": total_students,
            "averageRating": round(week_avg_rating, 2),
            "averageParticipation": round(week_avg_participation, 1),
            "averageParticipationRate": round((week_avg_participation / total_students * 100), 1) if total_students > 0 else 0,
            "totalFeedbacks": total_week_feedbacks,
            "totalRatings": len(week_ratings),
            "bestDay": {
                "date": best_day[0],
                "dayName": best_day[1]["dayName"],
                "rating": best_day[1]["averageRating"]
            } if best_day else None,
            "worstDay": {
                "date": worst_day[0], 
                "dayName": worst_day[1]["dayName"],
                "rating": worst_day[1]["averageRating"]
            } if worst_day else None
        }
        
        weekly_analysis["dailyBreakdown"] = daily_breakdown
        
        # Analyze meal trends across the week
        meal_trends = {}
        for meal_type in meal_types:
            meal_daily_ratings = []
            meal_daily_participation = []
            
            for date_key in sorted(daily_breakdown.keys()):
                meal_data = daily_breakdown[date_key]["mealPerformance"][meal_type]
                meal_daily_ratings.append(meal_data["averageRating"])
                meal_daily_participation.append(meal_data["participants"])
            
            meal_avg_rating = statistics.mean([r for r in meal_daily_ratings if r > 0]) if [r for r in meal_daily_ratings if r > 0] else 0
            meal_avg_participation = statistics.mean(meal_daily_participation)
            
            meal_trends[meal_type] = {
                "weeklyAverage": round(meal_avg_rating, 2) if meal_avg_rating > 0 else 0,
                "averageParticipation": round(meal_avg_participation, 1),
                "dailyRatings": meal_daily_ratings,
                "dailyParticipation": meal_daily_participation,
                "trend": calculate_trend(meal_daily_ratings),
                "consistency": calculate_consistency(meal_daily_ratings),
                "bestDay": get_best_day_for_meal(daily_breakdown, meal_type),
                "worstDay": get_worst_day_for_meal(daily_breakdown, meal_type)
            }
        
        weekly_analysis["mealTrends"] = meal_trends
        
        # Analyze participation patterns
        weekly_analysis["participationAnalysis"] = analyze_weekly_participation(daily_breakdown)
        
        # Generate insights and alerts
        weekly_analysis["weeklyInsights"] = generate_weekly_insights(weekly_analysis)
        weekly_analysis["weeklyAlerts"] = generate_weekly_alerts(weekly_analysis)
        
        # Identify patterns
        weekly_analysis["patterns"] = identify_weekly_patterns(daily_breakdown, meal_trends)
        
        # Final result
        result = {
            "error": False,
            "weekStart": start_date.strftime('%Y-%m-%d'),
            "weekEnd": (end_date - timedelta(days=1)).strftime('%Y-%m-%d'),
            "timestamp": datetime.now().isoformat(),
            "data": weekly_analysis
        }
        
        safe_json_output(result)
        
    except Exception as e:
        handle_error(f"Weekly analysis failed: {str(e)}", "ANALYSIS_ERROR")
    finally:
        db_conn.close()

def create_empty_weekly_result(date_str, start_date, end_date):
    """Create empty result when no data is found"""
    return {
        "error": False,
        "weekStart": start_date.strftime('%Y-%m-%d'),
        "weekEnd": (end_date - timedelta(days=1)).strftime('%Y-%m-%d'),
        "message": "No feedback data found for this week",
        "data": {
            "overview": {
                "totalStudents": 0,
                "averageRating": 0,
                "averageParticipation": 0,
                "totalFeedbacks": 0,
                "bestDay": None,
                "worstDay": None
            },
            "dailyBreakdown": {},
            "mealTrends": {},
            "weeklyInsights": [],
            "weeklyAlerts": []
        }
    }

def calculate_trend(ratings):
    """Calculate trend direction from daily ratings"""
    valid_ratings = [r for r in ratings if r > 0]
    if len(valid_ratings) < 2:
        return "insufficient_data"
    
    # Simple linear trend calculation
    x = list(range(len(valid_ratings)))
    if len(valid_ratings) > 1:
        # Calculate slope manually
        n = len(valid_ratings)
        sum_x = sum(x)
        sum_y = sum(valid_ratings)
        sum_xy = sum(x[i] * valid_ratings[i] for i in range(n))
        sum_x2 = sum(xi * xi for xi in x)
        slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x * sum_x)
    else:
        slope = 0
    
    if slope > 0.1:
        return "improving"
    elif slope < -0.1:
        return "declining"
    else:
        return "stable"

def calculate_consistency(ratings):
    """Calculate consistency score (lower variance = more consistent)"""
    valid_ratings = [r for r in ratings if r > 0]
    if len(valid_ratings) < 2:
        return 0
    
    variance = statistics.variance(valid_ratings)
    # Convert to consistency score (0-100, higher = more consistent)
    consistency = max(0, 100 - (variance * 25))
    return round(consistency, 1)

def get_best_day_for_meal(daily_breakdown, meal_type):
    """Find best performing day for a specific meal"""
    best_day = None
    best_rating = 0
    
    for date_key, day_data in daily_breakdown.items():
        meal_rating = day_data["mealPerformance"][meal_type]["averageRating"]
        if meal_rating > best_rating:
            best_rating = meal_rating
            best_day = {
                "date": date_key,
                "dayName": day_data["dayName"],
                "rating": meal_rating
            }
    
    return best_day

def get_worst_day_for_meal(daily_breakdown, meal_type):
    """Find worst performing day for a specific meal"""
    worst_day = None
    worst_rating = float('inf')
    
    for date_key, day_data in daily_breakdown.items():
        meal_rating = day_data["mealPerformance"][meal_type]["averageRating"]
        if 0 < meal_rating < worst_rating:
            worst_rating = meal_rating
            worst_day = {
                "date": date_key,
                "dayName": day_data["dayName"],
                "rating": meal_rating
            }
    
    return worst_day

def analyze_weekly_participation(daily_breakdown):
    """Analyze participation patterns across the week"""
    participation_data = []
    for date_key, day_data in daily_breakdown.items():
        participation_data.append({
            "date": date_key,
            "dayName": day_data["dayName"],
            "participationRate": day_data["participationRate"],
            "participatingStudents": day_data["participatingStudents"]
        })
    
    # Sort by day of week
    day_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    participation_data.sort(key=lambda x: day_order.index(x["dayName"]) if x["dayName"] in day_order else 7)
    
    avg_participation = statistics.mean([p["participationRate"] for p in participation_data])
    
    return {
        "dailyParticipation": participation_data,
        "averageParticipationRate": round(avg_participation, 1),
        "highestParticipationDay": max(participation_data, key=lambda x: x["participationRate"]),
        "lowestParticipationDay": min(participation_data, key=lambda x: x["participationRate"])
    }

def generate_weekly_insights(analysis_data):
    """Generate actionable insights from weekly analysis"""
    insights = []
    
    overview = analysis_data["overview"]
    meal_trends = analysis_data["mealTrends"]
    
    # Overall performance insight
    if overview["averageRating"] >= 4.0:
        insights.append({
            "type": "positive",
            "message": f"Excellent week! Average rating: {overview['averageRating']:.1f}⭐",
            "impact": "high"
        })
    elif overview["averageRating"] >= 3.5:
        insights.append({
            "type": "positive", 
            "message": f"Good week overall. Average rating: {overview['averageRating']:.1f}⭐",
            "impact": "medium"
        })
    else:
        insights.append({
            "type": "negative",
            "message": f"Week needs improvement. Average rating: {overview['averageRating']:.1f}⭐",
            "impact": "high"
        })
    
    # Best and worst meal insights
    best_meal = max(meal_trends.items(), key=lambda x: x[1]["weeklyAverage"])
    worst_meal = min(meal_trends.items(), key=lambda x: x[1]["weeklyAverage"] if x[1]["weeklyAverage"] > 0 else float('inf'))
    
    if best_meal[1]["weeklyAverage"] > 0:
        insights.append({
            "type": "positive",
            "message": f"Best performing meal: {best_meal[0].title()} ({best_meal[1]['weeklyAverage']:.1f}⭐)",
            "impact": "medium"
        })
    
    if worst_meal[1]["weeklyAverage"] > 0 and worst_meal[1]["weeklyAverage"] < 3.5:
        insights.append({
            "type": "negative",
            "message": f"Needs attention: {worst_meal[0].title()} ({worst_meal[1]['weeklyAverage']:.1f}⭐)",
            "impact": "high"
        })
    
    # Trend insights
    improving_meals = [meal for meal, data in meal_trends.items() if data["trend"] == "improving"]
    declining_meals = [meal for meal, data in meal_trends.items() if data["trend"] == "declining"]
    
    if improving_meals:
        insights.append({
            "type": "positive",
            "message": f"Improving meals: {', '.join(improving_meals)}",
            "impact": "medium"
        })
    
    if declining_meals:
        insights.append({
            "type": "warning",
            "message": f"Declining meals: {', '.join(declining_meals)}",
            "impact": "high"
        })
    
    return insights

def generate_weekly_alerts(analysis_data):
    """Generate alerts from weekly analysis"""
    alerts = []
    
    meal_trends = analysis_data["mealTrends"]
    overview = analysis_data["overview"]
    
    # Low rating alerts
    for meal_type, meal_data in meal_trends.items():
        if meal_data["weeklyAverage"] > 0 and meal_data["weeklyAverage"] < 3.0:
            alerts.append({
                "type": "critical",
                "meal": meal_type,
                "message": f"{meal_type.title()} consistently poor this week ({meal_data['weeklyAverage']:.1f}⭐)",
                "action": "Urgent review of preparation process required"
            })
        elif meal_data["weeklyAverage"] > 0 and meal_data["weeklyAverage"] < 3.5:
            alerts.append({
                "type": "warning",
                "meal": meal_type,
                "message": f"{meal_type.title()} below expectations ({meal_data['weeklyAverage']:.1f}⭐)",
                "action": "Review and improve preparation"
            })
    
    # Participation alerts
    if overview["averageParticipationRate"] < 70:
        alerts.append({
            "type": "warning",
            "message": f"Low weekly participation: {overview['averageParticipationRate']:.1f}%",
            "action": "Investigate timing and food availability"
        })
    
    return alerts

def identify_weekly_patterns(daily_breakdown, meal_trends):
    """Identify patterns in weekly data"""
    patterns = {}
    
    # Day of week patterns
    day_performance = {}
    for date_key, day_data in daily_breakdown.items():
        day_name = day_data["dayName"]
        if day_name not in day_performance:
            day_performance[day_name] = []
        day_performance[day_name].append(day_data["averageRating"])
    
    # Calculate average for each day of week
    day_averages = {day: statistics.mean(ratings) for day, ratings in day_performance.items() if ratings}
    best_day_of_week = max(day_averages.items(), key=lambda x: x[1]) if day_averages else None
    worst_day_of_week = min(day_averages.items(), key=lambda x: x[1]) if day_averages else None
    
    patterns["dayOfWeekPerformance"] = {
        "averagesByDay": {day: round(avg, 2) for day, avg in day_averages.items()},
        "bestDay": {"day": best_day_of_week[0], "rating": round(best_day_of_week[1], 2)} if best_day_of_week else None,
        "worstDay": {"day": worst_day_of_week[0], "rating": round(worst_day_of_week[1], 2)} if worst_day_of_week else None
    }
    
    # Weekend vs weekday pattern
    weekday_ratings = []
    weekend_ratings = []
    
    for date_key, day_data in daily_breakdown.items():
        if day_data["dayName"] in ["Saturday", "Sunday"]:
            weekend_ratings.append(day_data["averageRating"])
        else:
            weekday_ratings.append(day_data["averageRating"])
    
    patterns["weekendVsWeekday"] = {
        "weekdayAverage": round(statistics.mean(weekday_ratings), 2) if weekday_ratings else 0,
        "weekendAverage": round(statistics.mean(weekend_ratings), 2) if weekend_ratings else 0,
        "difference": round(statistics.mean(weekend_ratings) - statistics.mean(weekday_ratings), 2) if weekend_ratings and weekday_ratings else 0
    }
    
    return patterns

if __name__ == "__main__":
    if len(sys.argv) != 2:
        handle_error("Usage: python weekly_analysis.py <date_string>", "USAGE_ERROR")
    
    date_string = sys.argv[1]
    analyze_weekly_feedback(date_string)
