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
    """Generate AI-powered overall summary with strong insights and actionable recommendations"""
    
    if not all_ratings:
        return {
            "key_insights": [],
            "critical_actions": [],
            "performance_summary": "No feedback available for analysis"
        }
    
    # Calculate comprehensive metrics
    avg_rating = sum(all_ratings) / len(all_ratings)
    total_feedback = len(all_ratings)
    
    # Rating distribution analysis
    rating_counts = Counter(all_ratings)
    poor_ratings = rating_counts[1] + rating_counts[2]  # 1-2 stars
    excellent_ratings = rating_counts[4] + rating_counts[5]  # 4-5 stars
    
    poor_percentage = (poor_ratings / total_feedback) * 100
    excellent_percentage = (excellent_ratings / total_feedback) * 100
    
    # Advanced issue detection with severity scoring
    issue_patterns = {
        "critical_quality": {
            "keywords": ["spoiled", "rotten", "bad smell", "hair found", "insects", "food poisoning", "unsafe"],
            "severity": "CRITICAL",
            "action": "Immediate kitchen hygiene audit required"
        },
        "temperature_issues": {
            "keywords": ["cold", "not hot", "lukewarm", "ice cold", "frozen"],
            "severity": "HIGH", 
            "action": "Check food warming systems and serving protocols"
        },
        "taste_problems": {
            "keywords": ["bland", "tasteless", "too salty", "too spicy", "bitter", "burnt"],
            "severity": "MEDIUM",
            "action": "Review seasoning guidelines and chef training"
        },
        "portion_concerns": {
            "keywords": ["small portion", "not enough", "less quantity", "insufficient"],
            "severity": "MEDIUM",
            "action": "Standardize portion sizes and monitor serving practices"
        },
        "hygiene_issues": {
            "keywords": ["dirty", "unhygienic", "not clean", "stains", "unwashed"],
            "severity": "HIGH",
            "action": "Enhance cleaning protocols and staff hygiene training"
        }
    }
    
    # Analyze all comments for patterns
    all_text = " ".join(all_comments).lower()
    detected_issues = []
    critical_actions = []
    
    for issue_type, config in issue_patterns.items():
        issue_count = sum(1 for keyword in config["keywords"] if keyword in all_text)
        if issue_count > 0:
            severity_indicator = "🔴" if config["severity"] == "CRITICAL" else "🟠" if config["severity"] == "HIGH" else "🟡"
            detected_issues.append(f"{severity_indicator} {issue_type.replace('_', ' ').title()}: {issue_count} mentions")
            if config["severity"] in ["CRITICAL", "HIGH"]:
                critical_actions.append(config["action"])
    
    # Meal performance analysis
    meal_names = {'morning': 'Breakfast', 'afternoon': 'Lunch', 'evening': 'Dinner', 'night': 'Night Snacks'}
    meal_performance = {}
    
    for meal_type, ratings in meal_ratings.items():
        if ratings:
            meal_avg = sum(ratings) / len(ratings)
            meal_performance[meal_names[meal_type]] = {
                "rating": meal_avg,
                "count": len(ratings),
                "poor_count": len([r for r in ratings if r <= 2])
            }
    
    # Generate key insights (3-4 strong points)
    key_insights = []
    
    # Insight 1: Overall performance assessment
    if avg_rating >= 4.0:
        key_insights.append(f"🟢 EXCELLENT: Average {avg_rating:.1f}/5 with {excellent_percentage:.0f}% positive ratings - food quality is outstanding")
    elif avg_rating >= 3.5:
        key_insights.append(f"🟡 GOOD: Average {avg_rating:.1f}/5 shows satisfactory performance with room for improvement")
    else:
        key_insights.append(f"🔴 CRITICAL: Low {avg_rating:.1f}/5 average with {poor_percentage:.0f}% poor ratings - immediate action needed")
    
    # Insight 2: Best/worst meal identification
    if meal_performance:
        best_meal = max(meal_performance.items(), key=lambda x: x[1]["rating"])
        worst_meal = min(meal_performance.items(), key=lambda x: x[1]["rating"])
        
        if best_meal[1]["rating"] - worst_meal[1]["rating"] > 0.8:
            key_insights.append(f"📊 MEAL GAP: {best_meal[0]} excels ({best_meal[1]['rating']:.1f}) while {worst_meal[0]} struggles ({worst_meal[1]['rating']:.1f}) - focus on consistency")
        
        # Identify meals with high complaint rates
        for meal_name, data in meal_performance.items():
            poor_rate = (data["poor_count"] / data["count"]) * 100 if data["count"] > 0 else 0
            if poor_rate > 30:
                key_insights.append(f"⚠️ {meal_name.upper()} ALERT: {poor_rate:.0f}% negative feedback ({data['poor_count']}/{data['count']}) - requires immediate review")
    
    # Insight 3: Participation and engagement
    if total_feedback < 50:
        key_insights.append(f"📉 LOW ENGAGEMENT: Only {total_feedback} responses - implement feedback incentives to get better insights")
    elif poor_percentage > 25:
        key_insights.append(f"🔍 QUALITY CONCERN: {poor_percentage:.0f}% dissatisfied students - systematic quality review needed")
    
    # Insight 4: Most critical issues
    if detected_issues:
        critical_issues = [issue for issue in detected_issues if "🔴" in issue or "🟠" in issue]
        if critical_issues:
            key_insights.append(f"🚨 TOP ISSUES: {', '.join(critical_issues[:2])} - prioritize these fixes")
    
    # Generate actionable recommendations
    if not critical_actions:
        if avg_rating < 3.0:
            critical_actions.append("Conduct immediate quality audit with kitchen staff meeting")
            critical_actions.append("Implement daily quality checks and rating monitoring")
        elif avg_rating < 3.5:
            critical_actions.append("Schedule weekly menu review meetings with student representatives")
            critical_actions.append("Enhance cook training on popular dishes and seasoning")
        else:
            critical_actions.append("Maintain current standards and explore menu diversification")
            critical_actions.append("Implement student feedback appreciation program")
    
    # Performance summary
    status = "EXCELLENT" if avg_rating >= 4.0 else "GOOD" if avg_rating >= 3.5 else "NEEDS IMPROVEMENT" if avg_rating >= 2.5 else "CRITICAL"
    performance_summary = f"📊 Status: {status} | Average: {avg_rating:.1f}/5 | Responses: {total_feedback} | Satisfaction: {excellent_percentage:.0f}% positive, {poor_percentage:.0f}% negative"
    
    return {
        "key_insights": key_insights[:4],  # Top 4 insights
        "critical_actions": critical_actions[:4],  # Top 4 actions
        "performance_summary": performance_summary
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
        
        print(f"Debug: Requested date: {requested_date}, Today: {today}", file=sys.stderr)
        
        # Check if requested date is future (allow today and past)
        if requested_date > today:
            safe_json_output({
                "status": "no_data",
                "message": f"Feedback will be available after {requested_date.strftime('%Y-%m-%d')}",
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
        
        print(f"Debug: Querying collection: {feedback_collection.name}", file=sys.stderr)
        print(f"Debug: Date range: {start_date} to {end_date}", file=sys.stderr)
        
        # Fetch feedback data for the day
        feedback_cursor = feedback_collection.find({
            "date": {
                "$gte": start_date,
                "$lt": end_date
            }
        })
        
        feedback_data = list(feedback_cursor)
        print(f"Debug: Found {len(feedback_data)} feedback documents for {date_str}", file=sys.stderr)
        
        # Additional debug: Show sample dates if no data found
        if len(feedback_data) == 0:
            sample_dates = list(feedback_collection.find({}, {"date": 1}).sort("date", -1).limit(5))
            print(f"Debug: No data found. Sample dates in database:", file=sys.stderr)
            for doc in sample_dates:
                print(f"  - {doc.get('date')}", file=sys.stderr)
            print(f"Debug: Total feedback documents in collection: {feedback_collection.count_documents({})}", file=sys.stderr)
        
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
                    
                    # Always append a comment entry (possibly empty) to keep alignment with ratings
                    meal_comments[meal_type].append(comment.strip() if comment and comment.strip() else '')
                    if comment and comment.strip():
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
        
        # Generate enhanced sentiment analysis for each meal
        sentiment_analysis_per_meal = {}
        for meal_type in meal_types:
            comments = meal_comments[meal_type]
            ratings = meal_ratings[meal_type]
            meal_name = meal_names[meal_type]
            
            if comments and ratings:
                # Calculate sentiment metrics
                avg_rating = sum(ratings) / len(ratings)
                total_ratings = len(ratings)
                
                # Categorize feedback by sentiment
                positive_ratings = [r for r in ratings if r >= 4]  # 4-5 stars
                neutral_ratings = [r for r in ratings if r == 3]   # 3 stars
                negative_ratings = [r for r in ratings if r <= 2]  # 1-2 stars
                
                positive_count = len(positive_ratings)
                neutral_count = len(neutral_ratings)
                negative_count = len(negative_ratings)
                
                # Calculate percentages
                positive_percentage = (positive_count / total_ratings) * 100 if total_ratings > 0 else 0
                negative_percentage = (negative_count / total_ratings) * 100 if total_ratings > 0 else 0
                neutral_percentage = (neutral_count / total_ratings) * 100 if total_ratings > 0 else 0
                
                # Get sample comments for each sentiment
                positive_comments = []
                negative_comments = []
                neutral_comments = []
                
                for i, comment in enumerate(comments):
                    if i < len(ratings) and comment.strip():
                        rating = ratings[i]
                        if rating >= 4:
                            positive_comments.append(comment)
                        elif rating <= 2:
                            negative_comments.append(comment)
                        else:
                            neutral_comments.append(comment)
                
                # Generate sentiment insights
                sentiment_insights = []
                if positive_percentage >= 60:
                    sentiment_insights.append(f"Strong positive sentiment ({positive_percentage:.0f}% satisfied)")
                elif negative_percentage >= 30:
                    sentiment_insights.append(f"Concerning negative feedback ({negative_percentage:.0f}% dissatisfied)")
                else:
                    sentiment_insights.append(f"Mixed feedback - needs attention")
                
                # Identify dominant sentiment
                if positive_count > negative_count and positive_count > neutral_count:
                    dominant_sentiment = "positive"
                    sentiment_color = "green"
                elif negative_count > positive_count and negative_count > neutral_count:
                    dominant_sentiment = "negative" 
                    sentiment_color = "red"
                else:
                    dominant_sentiment = "neutral"
                    sentiment_color = "yellow"
                
                sentiment_analysis_per_meal[meal_name] = {
                    "average_rating": round(avg_rating, 2),
                    "total_responses": total_ratings,
                    "sentiment_distribution": {
                        "positive": {
                            "count": positive_count,
                            "percentage": round(positive_percentage, 1),
                            "sample_comments": positive_comments[:2]
                        },
                        "negative": {
                            "count": negative_count,
                            "percentage": round(negative_percentage, 1),
                            "sample_comments": negative_comments[:2]
                        },
                        "neutral": {
                            "count": neutral_count,
                            "percentage": round(neutral_percentage, 1),
                            "sample_comments": neutral_comments[:1]
                        }
                    },
                    "dominant_sentiment": dominant_sentiment,
                    "sentiment_color": sentiment_color,
                    "sentiment_score": round(avg_rating * 20, 1),  # Convert to percentage
                    "key_insights": sentiment_insights,
                    "improvement_areas": negative_comments[:2] if negative_comments else [],
                    "positive_highlights": positive_comments[:2] if positive_comments else []
                }
            else:
                sentiment_analysis_per_meal[meal_name] = {
                    "average_rating": 0,
                    "total_responses": 0,
                    "sentiment_distribution": {
                        "positive": {"count": 0, "percentage": 0, "sample_comments": []},
                        "negative": {"count": 0, "percentage": 0, "sample_comments": []},
                        "neutral": {"count": 0, "percentage": 0, "sample_comments": []}
                    },
                    "dominant_sentiment": "none",
                    "sentiment_color": "gray",
                    "sentiment_score": 0,
                    "key_insights": ["No feedback available"],
                    "improvement_areas": [],
                    "positive_highlights": []
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
