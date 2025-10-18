#!/usr/bin/env python3
"""
Daily Analysis Service for Hostel Food Analysis
Analyzes feedback data for a specific day
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.database import DatabaseConnection, get_date_range, safe_json_output, handle_error
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from collections import Counter

def analyze_daily_feedback(date_str):
    """
    Perform comprehensive daily analysis with enhanced features
    """
    db_conn = DatabaseConnection()
    
    if not db_conn.connect():
        handle_error("Failed to connect to database", "DATABASE_ERROR")
        return
    
    try:
        # Parse the requested date
        try:
            requested_date = datetime.strptime(date_str, '%Y-%m-%d')
        except ValueError:
            handle_error("Invalid date format. Use YYYY-MM-DD", "INVALID_DATE")
            return
        
        # Get current date (today)
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Check if requested date is today or future
        if requested_date >= today:
            safe_json_output({
                "status": "no_data",
                "message": f"Feedback will be available from {(today + timedelta(days=1)).strftime('%Y-%m-%d')}",
                "date": date_str,
                "type": "future_date"
            })
            return
        
        # Get date range for the requested day
        start_date, end_date = get_date_range(date_str, "day")
        
        # Get collections
        feedback_collection = db_conn.get_feedback_collection()
        users_collection = db_conn.get_users_collection()
        
        # Get total registered students
        total_students = users_collection.count_documents({"isAdmin": False})
        
        # Fetch feedback data for the day
        feedback_cursor = feedback_collection.find({
            "date": {
                "$gte": start_date,
                "$lt": end_date
            }
        })
        
        feedback_data = list(feedback_cursor)
        print(f"Debug: Found {len(feedback_data)} feedback documents for {date_str}", file=sys.stderr)
        
        if not feedback_data:
        if not feedback_data:
            safe_json_output({
                "status": "no_data",
                "message": "No feedback found for this date",
                "date": date_str,
                "type": "no_feedback",
                "data": {
                    "overview": {
                        "totalStudents": total_students,
                        "participatingStudents": 0,
                        "participationRate": 0,
                        "overallRating": 0
                    }
                }
            })
            return
        
        # Initialize analysis data structures
        meal_types = ['morning', 'afternoon', 'evening', 'night']
        meal_names = {
            'morning': 'Breakfast',
            'afternoon': 'Lunch', 
            'evening': 'Dinner',
            'night': 'Night Snacks'
        }
        
        # Initialize data structures for analysis
        meal_ratings = {meal: [] for meal in meal_types}
        meal_comments = {meal: [] for meal in meal_types}
        meal_participants = {meal: 0 for meal in meal_types}
        rating_distribution = {meal: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0} for meal in meal_types}
        
        all_ratings = []
        all_comments = []
        participating_students = 0
        
        # Process each feedback document
        for feedback in feedback_data:
            user_has_feedback = False
            
            for meal_type in meal_types:
                meal_data = feedback.get('meals', {}).get(meal_type, {})
                rating = meal_data.get('rating')
                comment = meal_data.get('comment', '')
                
                if rating is not None:
                    meal_ratings[meal_type].append(rating)
                    all_ratings.append(rating)
                    meal_participants[meal_type] += 1
                    rating_distribution[meal_type][rating] += 1
                    user_has_feedback = True
                    
                    if comment and comment.strip():
                        meal_comments[meal_type].append(comment.strip())
                        all_comments.append(comment.strip())
            
            if user_has_feedback:
                participating_students += 1
        
        # Calculate overall metrics
        overall_rating = sum(all_ratings) / len(all_ratings) if all_ratings else 0
        participation_rate = (participating_students / total_students * 100) if total_students > 0 else 0
        
        # Calculate average ratings per meal for pie chart
        average_ratings_per_meal = {}
        for meal_type in meal_types:
            if meal_ratings[meal_type]:
                avg_rating = sum(meal_ratings[meal_type]) / len(meal_ratings[meal_type])
                average_ratings_per_meal[meal_names[meal_type]] = round(avg_rating, 2)
            else:
                average_ratings_per_meal[meal_names[meal_type]] = 0
        
        # Calculate student rating distribution per meal
        student_rating_per_meal = {}
        for meal_type in meal_types:
            student_rating_per_meal[meal_names[meal_type]] = meal_participants[meal_type]
        
        # Prepare feedback distribution data for bar charts
        feedback_distribution_per_meal = {}
        for meal_type in meal_types:
            feedback_distribution_per_meal[meal_names[meal_type]] = {
                "1_star": rating_distribution[meal_type][1],
                "2_star": rating_distribution[meal_type][2], 
                "3_star": rating_distribution[meal_type][3],
                "4_star": rating_distribution[meal_type][4],
                "5_star": rating_distribution[meal_type][5]
            }
        
        # Generate sentiment analysis for each meal (simplified)
        sentiment_analysis_per_meal = {}
        for meal_type in meal_types:
            comments = meal_comments[meal_type]
            meal_name = meal_names[meal_type]
            
            if comments:
                # Simple sentiment analysis based on ratings
                ratings = meal_ratings[meal_type]
                avg_rating = sum(ratings) / len(ratings) if ratings else 0
                
                # Generate insights based on comments and ratings
                positive_comments = [c for i, c in enumerate(comments) if i < len(ratings) and ratings[i] >= 4]
                negative_comments = [c for i, c in enumerate(comments) if i < len(ratings) and ratings[i] <= 2]
                
                sentiment_analysis_per_meal[meal_name] = {
                    "average_rating": round(avg_rating, 2),
                    "total_comments": len(comments),
                    "positive_feedback": positive_comments[:2] if positive_comments else [],
                    "improvement_areas": negative_comments[:2] if negative_comments else [],
                    "sentiment_score": round(avg_rating * 20, 1)  # Convert to percentage
                }
            else:
                sentiment_analysis_per_meal[meal_name] = {
                    "average_rating": 0,
                    "total_comments": 0,
                    "positive_feedback": [],
                    "improvement_areas": [],
                    "sentiment_score": 0
                }
        
        # Generate overall feedback summary and common issues
        overall_summary = generate_overall_summary(all_ratings, all_comments, meal_ratings, meal_comments)
        
        # Prepare final result
        result = {
            "status": "success",
            "date": date_str,
            "data": {
                "overview": {
                    "totalStudents": total_students,
                    "participatingStudents": participating_students,
                    "participationRate": round(participation_rate, 1),
                    "overallRating": round(overall_rating, 2)
                },
                "averageRatingPerMeal": average_ratings_per_meal,
                "studentRatingPerMeal": student_rating_per_meal,
                "feedbackDistributionPerMeal": feedback_distribution_per_meal,
                "sentimentAnalysisPerMeal": sentiment_analysis_per_meal,
                "overallSummary": overall_summary
            }
        }
        
        safe_json_output(result)
                if user_data:
                    user_info = {
                        'rollNumber': user_data.get('rollNumber', 'Unknown'),
                        'name': user_data.get('name', 'Unknown')
                    }
            
            for meal_type in meal_types:
                meal_feedback = feedback['meals'].get(meal_type, {})
                rating = meal_feedback.get('rating')
                comment = meal_feedback.get('comment', '').strip()
                
                if rating is not None:
                    meal_data[meal_type]["ratings"].append(rating)
                    meal_data[meal_type]["participants"] += 1
                    all_ratings.append(rating)
                    
                    if comment:
                        meal_data[meal_type]["comments"].append({
                            "rating": rating,
                            "comment": comment,
                            "student": user_info.get('rollNumber', 'Unknown'),
                            "meal": meal_type
                        })
                        all_comments.append(comment)
        
        # Calculate overview metrics
        participating_students = len(feedback_data)
        participation_rate = (participating_students / total_students * 100) if total_students > 0 else 0
        overall_rating = np.mean(all_ratings) if all_ratings else 0
        positive_ratings = sum(1 for r in all_ratings if r >= 4)
        positive_percentage = (positive_ratings / len(all_ratings) * 100) if all_ratings else 0
        
        analysis_data["overview"] = {
            "date": date_str,
            "totalStudents": total_students,
            "participatingStudents": participating_students,
            "participationRate": round(participation_rate, 1),
            "totalFeedbacks": len(feedback_data),
            "totalRatings": len(all_ratings),
            "overallRating": round(overall_rating, 2),
            "positivePercentage": round(positive_percentage, 1),
            "averageResponseTime": calculate_avg_response_time(feedback_data)
        }
        
        # Analyze each meal
        for meal_type in meal_types:
            meal_ratings = meal_data[meal_type]["ratings"]
            meal_comments = meal_data[meal_type]["comments"]
            participants = meal_data[meal_type]["participants"]
            
            if meal_ratings:
                avg_rating = np.mean(meal_ratings)
                rating_distribution = Counter(meal_ratings)
                
                analysis_data["mealPerformance"][meal_type] = {
                    "averageRating": round(avg_rating, 2),
                    "participants": participants,
                    "participationRate": round((participants / total_students * 100), 1),
                    "ratingDistribution": dict(rating_distribution),
                    "totalComments": len([c for c in meal_comments if c["comment"]]),
                    "sentiment": analyze_meal_sentiment(meal_comments),
                    "trend": get_meal_trend(meal_type, avg_rating),
                    "status": get_meal_status(avg_rating)
                }
                
                # Generate insights and alerts
                if avg_rating < 3.0:
                    analysis_data["alerts"].append({
                        "type": "critical",
                        "meal": meal_type,
                        "message": f"{meal_type.title()} meal rating critically low: {avg_rating:.1f}/5.0",
                        "action": "Immediate kitchen review required"
                    })
                elif avg_rating < 3.5:
                    analysis_data["alerts"].append({
                        "type": "warning", 
                        "meal": meal_type,
                        "message": f"{meal_type.title()} meal needs improvement: {avg_rating:.1f}/5.0",
                        "action": "Review preparation process"
                    })
                
                if participants < (total_students * 0.7):  # Less than 70% participation
                    analysis_data["alerts"].append({
                        "type": "info",
                        "meal": meal_type,
                        "message": f"Low participation in {meal_type}: {participants}/{total_students}",
                        "action": "Check meal timing and availability"
                    })
            else:
                analysis_data["mealPerformance"][meal_type] = {
                    "averageRating": 0,
                    "participants": 0,
                    "participationRate": 0,
                    "ratingDistribution": {},
                    "totalComments": 0,
                    "sentiment": {"positive": 0, "negative": 0, "neutral": 0},
                    "trend": "no_data",
                    "status": "no_data"
                }
        
        # Analyze comments
        positive_comments = [c for c in all_comments if any(word in c.lower() for word in ['good', 'excellent', 'great', 'delicious', 'tasty', 'fresh'])]
        negative_comments = [c for c in all_comments if any(word in c.lower() for word in ['bad', 'terrible', 'cold', 'stale', 'salty', 'bland', 'poor'])]
        
        analysis_data["comments"]["positive"] = positive_comments[:5]  # Top 5
        analysis_data["comments"]["negative"] = negative_comments[:5]  # Top 5
        analysis_data["comments"]["categories"] = categorize_comments(all_comments)
        
        # Generate insights
        analysis_data["insights"] = generate_daily_insights(analysis_data)
        
        # Final result
        result = {
            "error": False,
            "date": date_str,
            "timestamp": datetime.now().isoformat(),
            "data": analysis_data
        }
        
        safe_json_output(result)
        
    except Exception as e:
        handle_error(f"Daily analysis failed: {str(e)}", "ANALYSIS_ERROR")
    finally:
        db_conn.close()

def calculate_avg_response_time(feedback_data):
    """Calculate average response time in minutes"""
    response_times = []
    for feedback in feedback_data:
        meal_types = ['morning', 'afternoon', 'evening', 'night']
        for meal_type in meal_types:
            meal_feedback = feedback['meals'].get(meal_type, {})
            if meal_feedback.get('submittedAt') and feedback.get('date'):
                # Calculate time difference
                submitted_time = meal_feedback['submittedAt']
                base_time = feedback['date']
                diff = (submitted_time - base_time).total_seconds() / 60
                if 0 <= diff <= 1440:  # Within 24 hours
                    response_times.append(diff)
    
    return round(np.mean(response_times), 1) if response_times else 0

def analyze_meal_sentiment(comments):
    """Simple sentiment analysis for meal comments"""
    if not comments:
        return {"positive": 0, "negative": 0, "neutral": 0}
    
    positive_words = ['good', 'excellent', 'great', 'delicious', 'tasty', 'fresh', 'amazing', 'perfect']
    negative_words = ['bad', 'terrible', 'cold', 'stale', 'salty', 'bland', 'poor', 'awful', 'horrible']
    
    sentiment_counts = {"positive": 0, "negative": 0, "neutral": 0}
    
    for comment_data in comments:
        comment = comment_data["comment"].lower()
        positive_score = sum(1 for word in positive_words if word in comment)
        negative_score = sum(1 for word in negative_words if word in comment)
        
        if positive_score > negative_score:
            sentiment_counts["positive"] += 1
        elif negative_score > positive_score:
            sentiment_counts["negative"] += 1
        else:
            sentiment_counts["neutral"] += 1
    
    return sentiment_counts

def get_meal_trend(meal_type, current_rating):
    """Get trend indicator (simplified for now)"""
    # This would compare with previous day's data in a real implementation
    if current_rating >= 4.0:
        return "excellent"
    elif current_rating >= 3.5:
        return "good"
    elif current_rating >= 3.0:
        return "average"
    else:
        return "poor"

def get_meal_status(rating):
    """Get meal status based on rating"""
    if rating >= 4.0:
        return "excellent"
    elif rating >= 3.5:
        return "good" 
    elif rating >= 3.0:
        return "average"
    elif rating >= 2.0:
        return "poor"
    else:
        return "critical"

def categorize_comments(comments):
    """Categorize comments by topic"""
    categories = {
        "taste": [],
        "temperature": [],
        "quantity": [],
        "quality": [],
        "service": []
    }
    
    keywords = {
        "taste": ["taste", "flavor", "spicy", "sweet", "salty", "bitter", "delicious", "bland"],
        "temperature": ["hot", "cold", "warm", "cool", "temperature"],
        "quantity": ["more", "less", "small", "big", "portion", "enough", "quantity"],
        "quality": ["fresh", "stale", "quality", "good", "bad", "excellent", "poor"],
        "service": ["service", "staff", "clean", "dirty", "quick", "slow", "timing"]
    }
    
    for comment in comments:
        comment_lower = comment.lower()
        for category, words in keywords.items():
            if any(word in comment_lower for word in words):
                categories[category].append(comment)
                break
    
    return {cat: len(comments) for cat, comments in categories.items()}

def generate_daily_insights(data):
    """Generate actionable insights from daily data"""
    insights = []
    
    # Best performing meal
    best_meal = max(data["mealPerformance"].items(), 
                   key=lambda x: x[1]["averageRating"] if x[1]["averageRating"] > 0 else 0)
    if best_meal[1]["averageRating"] > 0:
        insights.append({
            "type": "positive",
            "message": f"Best performing meal: {best_meal[0].title()} ({best_meal[1]['averageRating']:.1f}⭐)"
        })
    
    # Worst performing meal
    worst_meals = [meal for meal, data in data["mealPerformance"].items() 
                  if data["averageRating"] > 0 and data["averageRating"] < 3.5]
    if worst_meals:
        insights.append({
            "type": "negative",
            "message": f"Meals needing attention: {', '.join(worst_meals)}"
        })
    
    # Participation insights
    low_participation = [meal for meal, data in data["mealPerformance"].items() 
                        if data["participationRate"] < 70]
    if low_participation:
        insights.append({
            "type": "warning",
            "message": f"Low participation in: {', '.join(low_participation)}"
        })
    
    return insights

if __name__ == "__main__":
    if len(sys.argv) != 2:
        handle_error("Usage: python daily_analysis.py <date_string>", "USAGE_ERROR")
    
    date_string = sys.argv[1]
    analyze_daily_feedback(date_string)
