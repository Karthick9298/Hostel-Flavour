#!/usr/bin/env python3
"""
Database connection utility for analytics service
"""

import os
import sys
from pymongo import MongoClient
from dotenv import load_dotenv
import json
from datetime import datetime, timedelta

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', 'backend', '.env'))

class DatabaseConnection:
    def __init__(self):
        self.mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/hostel-food-analysis')
        self.client = None
        self.db = None
        
    def connect(self):
        """Connect to MongoDB"""
        try:
            self.client = MongoClient(self.mongo_uri)
            
            # Extract database name from URI or use default
            # MongoDB Atlas URIs format: mongodb+srv://user:pass@cluster.net/database?params
            # Local URIs format: mongodb://localhost:27017/database
            if '/' in self.mongo_uri:
                # Try to extract database name from URI
                uri_parts = self.mongo_uri.split('/')
                if len(uri_parts) > 3:
                    # Get the part after the last '/' and before any '?'
                    db_part = uri_parts[-1].split('?')[0]
                    if db_part:
                        self.db = self.client[db_part]
                    else:
                        # No database in URI, use default
                        self.db = self.client['hostel-food-analysis']
                else:
                    # Fallback to default database name
                    self.db = self.client['hostel-food-analysis']
            else:
                # No database specified, use default
                self.db = self.client['hostel-food-analysis']
            
            # Test connection
            self.db.command('ping')
            print(f"Debug: Connected to database: {self.db.name}", file=sys.stderr)
            return True
        except Exception as e:
            print(f"Database connection failed: {str(e)}", file=sys.stderr)
            return False
            
    def close(self):
        """Close database connection"""
        if self.client:
            self.client.close()
            
    def get_feedback_collection(self):
        """Get feedback collection"""
        return self.db.feedbacks
        
    def get_users_collection(self):
        """Get users collection"""
        return self.db.users
        
    def get_analytics_collection(self):
        """Get analytics collection (for caching)"""
        return self.db.analytics

def get_date_range(date_str, period_type="day"):
    """
    Get start and end datetime for analysis period
    """
    try:
        target_date = datetime.strptime(date_str, '%Y-%m-%d')
    except ValueError:
        # If invalid date, use yesterday
        target_date = datetime.now() - timedelta(days=1)
    
    if period_type == "day":
        start_date = target_date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = start_date + timedelta(days=1)
    elif period_type == "week":
        # Start from Monday of the week
        days_since_monday = target_date.weekday()
        start_date = target_date - timedelta(days=days_since_monday)
        start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = start_date + timedelta(days=7)
    
    print(f"Debug: Looking for data between {start_date} and {end_date}", file=sys.stderr)
    return start_date, end_date

def safe_json_output(data):
    """
    Safely output JSON data to stdout
    """
    try:
        print(json.dumps(data, default=str, ensure_ascii=False))
    except Exception as e:
        error_output = {
            "error": True,
            "message": f"JSON serialization failed: {str(e)}",
            "data": None
        }
        print(json.dumps(error_output))

def handle_error(error_message, error_type="ANALYSIS_ERROR"):
    """
    Handle and output errors in a consistent format
    """
    error_output = {
        "error": True,
        "type": error_type,
        "message": error_message,
        "timestamp": datetime.now().isoformat(),
        "data": None
    }
    safe_json_output(error_output)
    sys.exit(1)
