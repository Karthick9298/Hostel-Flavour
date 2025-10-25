#!/bin/bash

echo "🔍 COMPREHENSIVE DIAGNOSTIC CHECK"
echo "===================================="
echo ""

echo "📁 1. CHECK WORKSPACE STRUCTURE"
echo "--------------------------------"
cd /home/karthikeya/Viswa/Projects/HFa
echo "Current directory: $(pwd)"
echo "Backend exists: $([ -d backend ] && echo 'YES' || echo 'NO')"
echo "Analytics-service exists: $([ -d analytics-service ] && echo 'YES' || echo 'NO')"
echo ""

echo "📝 2. CHECK .ENV FILE"
echo "--------------------"
if [ -f backend/.env ]; then
    echo "✅ .env file exists"
    echo "MONGODB_URI exists: $(grep -q 'MONGODB_URI' backend/.env && echo 'YES' || echo 'NO')"
    echo "URI type: $(grep 'MONGODB_URI' backend/.env | grep -q 'mongodb+srv' && echo 'MongoDB Atlas' || echo 'Local MongoDB')"
else
    echo "❌ .env file NOT FOUND"
fi
echo ""

echo "🗄️  3. CHECK MONGODB CONNECTION (Node.js)"
echo "----------------------------------------"
cd backend
node << 'EOF'
require('dotenv').config();
const mongoose = require('mongoose');

console.log('MONGODB_URI set:', !!process.env.MONGODB_URI);
console.log('URI:', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 50) + '...' : 'NOT SET');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connection successful');
    console.log('Database:', mongoose.connection.db.databaseName);
    console.log('Host:', mongoose.connection.host);
    
    const Feedback = require('./models/Feedback');
    const count = await Feedback.countDocuments({});
    console.log('Total feedback documents:', count);
    
    if (count > 0) {
      const sample = await Feedback.findOne().sort({date: 1});
      console.log('First feedback date:', sample.date);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.log('❌ Connection failed:', err.message);
    process.exit(1);
  });
EOF
echo ""

echo "🐍 4. CHECK PYTHON ENVIRONMENT"
echo "-----------------------------"
cd ../analytics-service
python3 << 'EOF'
import os
import sys
from dotenv import load_dotenv

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), '..', 'backend', '.env')
load_dotenv(env_path)

print(f"Python version: {sys.version}")
print(f"Env file path: {env_path}")
print(f"Env file exists: {os.path.exists(env_path)}")
print(f"MONGODB_URI loaded: {'Yes' if os.getenv('MONGODB_URI') else 'No'}")

try:
    from pymongo import MongoClient
    print("✅ pymongo is installed")
    
    mongo_uri = os.getenv('MONGODB_URI')
    if mongo_uri:
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        # Extract database name
        uri_parts = mongo_uri.split('/')
        if len(uri_parts) > 3:
            db_name = uri_parts[-1].split('?')[0]
            if db_name:
                db = client[db_name]
            else:
                db = client['hostel-food-analysis']
        else:
            db = client['hostel-food-analysis']
        
        db.command('ping')
        print(f"✅ MongoDB connection successful")
        print(f"Database: {db.name}")
        print(f"Feedback count: {db.feedbacks.count_documents({})}")
        
        # Check sample feedback
        sample = db.feedbacks.find_one()
        if sample:
            print(f"Sample feedback date: {sample.get('date')}")
        
except ImportError:
    print("❌ pymongo is NOT installed")
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")
EOF
echo ""

echo "🧪 5. TEST PYTHON DAILY ANALYSIS SCRIPT"
echo "---------------------------------------"
python3 services/daily_analysis.py 2025-10-12 2>&1 | head -20
echo ""

echo "📊 6. CHECK BACKEND API"
echo "----------------------"
echo "Is backend server running?"
curl -s http://localhost:5000/api/health 2>&1 | head -5
echo ""

echo "✅ DIAGNOSTIC COMPLETE"
echo "======================"
