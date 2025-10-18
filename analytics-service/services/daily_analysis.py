#!/usr/bin/env python3
"""
Enhanced Daily Analysis Service for Hostel Food Analysis
Analyzes feedback data for a specific day with comprehensive metrics
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.database import DatabaseConnection, get_date_range, safe_json_output, handle_error
from datetime import datetime, timedelta
from collections import Counter

def generate_overall_summary(all_ratings, all_comments, meal_ratings, meal_comments):
    """Generate AI-powered overall summary and common issues"""
    
    if not all_ratings:
        return {
            "overall_feedback": "No feedback available for analysis",
            "common_issues": [],
            "positive_highlights": [],
            "recommendations": []
        }
    
    # Calculate basic metrics
    avg_rating = sum(all_ratings) / len(all_ratings)
    total_feedback = len(all_ratings)
    
    # Identify common issues from low-rated feedback
    common_issues = []
    positive_highlights = []
    
    # Simple keyword analysis for issues
    issue_keywords = {
        "taste": ["bland", "tasteless", "no taste", "bad taste"],
        "temperature": ["cold", "not hot", "lukewarm"],
        "quality": ["stale", "old", "bad quality", "poor quality"],
        "quantity": ["less quantity", "small portion", "not enough"],
        "hygiene": ["dirty", "unhygienic", "not clean"],
        "service": ["slow service", "late", "delay"]
    }
    
    positive_keywords = {
        "taste": ["delicious", "tasty", "good taste", "amazing"],
        "quality": ["fresh", "good quality", "excellent"],
        "service": ["quick", "fast", "good service"]
    }
    
    # Analyze comments
    all_text = " ".join(all_comments).lower()
    
    for category, keywords in issue_keywords.items():
        for keyword in keywords:
            if keyword in all_text:
                common_issues.append(f"{category.title()}: {keyword}")
                break
    
    for category, keywords in positive_keywords.items():
        for keyword in keywords:
            if keyword in all_text:
                positive_highlights.append(f"{category.title()}: {keyword}")
                break
    
    # Generate recommendations
    recommendations = []
    if avg_rating < 3.0:
        recommendations.append("Overall rating is below average. Focus on improving food quality and taste.")
    if avg_rating < 3.5:
        recommendations.append("Consider surveying students for specific improvement areas.")
    if total_feedback < 50:
        recommendations.append("Low participation rate. Consider incentivizing feedback submission.")
    
    # Find best and worst performing meals
    meal_averages = {}
    meal_names = {'morning': 'Breakfast', 'afternoon': 'Lunch', 'evening': 'Dinner', 'night': 'Night Snacks'}
    
    for meal_type, ratings in meal_ratings.items():
        if ratings:
            meal_averages[meal_names[meal_type]] = sum(ratings) / len(ratings)
    
    if meal_averages:
        best_meal = max(meal_averages, key=meal_averages.get)
        worst_meal = min(meal_averages, key=meal_averages.get)
        
        if meal_averages[best_meal] > 4.0:
            positive_highlights.append(f"{best_meal} received excellent ratings")
        if meal_averages[worst_meal] < 3.0:
            common_issues.append(f"{worst_meal} needs immediate attention")
    
    return {
        "overall_feedback": f"Average rating: {avg_rating:.1f}/5.0 based on {total_feedback} responses. " + 
                          ("Food quality is satisfactory." if avg_rating >= 3.5 else "Food quality needs improvement."),
        "common_issues": common_issues[:5],  # Top 5 issues
        "positive_highlights": positive_highlights[:3],  # Top 3 highlights
        "recommendations": recommendations[:3]  # Top 3 recommendations
    }

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
        
    except Exception as e:
        handle_error(f"Daily analysis failed: {str(e)}", "ANALYSIS_ERROR")
    finally:
        db_conn.close()

def main():
    """Main entry point for the daily analysis script"""
    if len(sys.argv) != 2:
        handle_error("Usage: python daily_analysis.py <date_string>", "INVALID_ARGS")
        return
    
    date_str = sys.argv[1]
    analyze_daily_feedback(date_str)

if __name__ == "__main__":
    main()
