# ✅ Test Feedback Generation - Pre-Flight Checklist

## 📋 Script Analysis: `generate-test-feedback.js`

### ✅ **VERIFIED - Script Configuration**

#### 1. **MongoDB Connection** ✅
```javascript
const mongoUri = process.env.MONGODB_URI;
await mongoose.connect(mongoUri);
```
- ✅ Uses `MONGODB_URI` from `.env`
- ✅ Will connect to MongoDB Atlas (your Atlas connection string)
- ✅ No hardcoded local database

#### 2. **Date Range** ✅
```javascript
// Create dates from Oct 12 to Oct 18, 2025
for (let day = 12; day <= 18; day++) {
  const date = new Date(2025, 9, day); // Month is 0-indexed (9 = October)
  date.setHours(0, 0, 0, 0);
  dates.push(date);
}
```
- ✅ Generates dates: **October 12-18, 2025** (7 days)
- ✅ Sets time to 00:00:00 (midnight UTC)
- ✅ Matches the date range you're trying to view in admin dashboard

#### 3. **User Range** ✅
```javascript
const users = await User.find({ 
  isAdmin: false,
  rollNumber: {
    $gte: '323103310001',
    $lte: '323103310150'
  }
}).select('_id rollNumber name');
```
- ✅ Fetches users: **323103310001 to 323103310150**
- ✅ Only non-admin users
- ✅ Matches your user registration range

#### 4. **Collection Name** ⚠️ **IMPORTANT**
```javascript
export default mongoose.model('Feedback', feedbackSchema);
```
- ✅ Model name: `Feedback`
- ✅ Mongoose will pluralize this to: **`feedbacks`**
- ⚠️ Python script expects: **`feedbacks`** (line 60 in `database.py`)
- ✅ **COLLECTIONS MATCH!**

#### 5. **Data Structure** ✅
```javascript
const feedback = new Feedback({
  user: user._id,
  date: currentDate,  // Date object (midnight UTC)
  meals: {
    morning: { rating, comment, submittedAt },
    afternoon: { rating, comment, submittedAt },
    evening: { rating, comment, submittedAt },
    night: { rating, comment, submittedAt }
  }
});
```
- ✅ Correct schema structure
- ✅ Date stored as Date object
- ✅ All 4 meals included
- ✅ Random participation (realistic data)

---

## 🔧 **Prerequisites to Run the Script**

### ✅ 1. Users Must Exist in Database
**Check if users exist:**
```bash
cd /home/karthikeya/Viswa/Projects/HFa/backend
node -e "
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
const User = require('./models/User');
User.countDocuments({
  isAdmin: false,
  rollNumber: { \$gte: '323103310001', \$lte: '323103310150' }
}).then(count => {
  console.log('Users in range 323103310001-150:', count);
  if (count === 0) {
    console.log('⚠️  NO USERS FOUND! Run bulk-register-users.js first!');
  } else {
    console.log('✅ Users exist. Ready to generate feedback.');
  }
  process.exit(0);
});
"
```

**If no users exist, run registration first:**
```bash
node scripts/bulk-register-users.js
```

---

### ✅ 2. MongoDB Atlas Connection
**Verify connection:**
```bash
node -e "
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to:', mongoose.connection.db.databaseName);
    console.log('✅ Host:', mongoose.connection.host);
    process.exit(0);
  })
  .catch(err => {
    console.log('❌ Connection failed:', err.message);
    process.exit(1);
  });
"
```

---

### ✅ 3. Clean Slate (Optional)
**Delete existing feedback (if any):**
```bash
node scripts/delete-all-feedback.js
```

---

## 🚀 **Running the Script**

### Step 1: Verify Prerequisites
Run the checks above to ensure:
- ✅ Users exist in the database
- ✅ MongoDB Atlas connection works
- ✅ You're ready to generate feedback

### Step 2: Run the Script
```bash
cd /home/karthikeya/Viswa/Projects/HFa/backend
node scripts/generate-test-feedback.js
```

### Step 3: Expected Output
```
🎯 Test Feedback Data Generation Script
======================================
🚀 GENERATING TEST FEEDBACK DATA
==================================
📅 Period: October 12-18, 2025 (7 days)
👥 Target: Roll numbers 323103310001-323103310150
🎲 Features: Random user skipping + Random meal skipping
📅 Start Time: ...

🔌 Connecting to MongoDB...
✅ MongoDB Connected successfully
👥 Fetching user accounts in range 323103310001-323103310150...
   Found 150 student accounts in the specified range
📅 Generating feedback for October 12-18, 2025 (7 days):
   1. Sat Oct 12 2025
   2. Sun Oct 13 2025
   3. Mon Oct 14 2025
   4. Tue Oct 15 2025
   5. Wed Oct 16 2025
   6. Thu Oct 17 2025
   7. Fri Oct 18 2025

🗑️  Clearing existing test feedback...
   ✅ Cleared existing feedback data

📊 Day 1/7: Sat Oct 12 2025
   🎭 Scenario: Normal day
   ✅ Day complete: 120 feedbacks, 385 meal ratings
...
📊 GENERATION SUMMARY:
========================
⏱️  Duration: 0m 15s
📋 Total Feedback Documents: 850
🍽️  Total Meal Ratings: 2800
👥 Total Users: 150
📅 Date Range: 7 days
📈 Average Participation: 81.0%
```

---

## 🎯 **What Will Be Created**

### Data Generated:
- **~850 feedback documents** (not all users participate every day)
- **~2800 individual meal ratings** across 7 days
- **Date range:** October 12-18, 2025
- **Realistic participation:** 75-85% daily participation
- **Random meal skipping:** Some users skip certain meals
- **Varied ratings:** Mix of 1-5 stars with realistic distribution

### Collection Structure:
```
Database: hostel-food-analysis
Collection: feedbacks
Documents: ~850
Fields:
  - user: ObjectId (reference to User)
  - date: ISODate("2025-10-12T00:00:00.000Z")
  - meals: {
      morning: { rating, comment, submittedAt },
      afternoon: { rating, comment, submittedAt },
      evening: { rating, comment, submittedAt },
      night: { rating, comment, submittedAt }
    }
```

---

## 🔍 **After Generation - Verification**

### Verify Data in MongoDB Atlas:
```bash
node -e "
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
const Feedback = require('./models/Feedback');
Feedback.find().sort({date: 1}).limit(5).then(docs => {
  console.log('First 5 feedback dates:');
  docs.forEach(d => console.log('  -', d.date.toISOString().split('T')[0]));
  Feedback.countDocuments().then(count => {
    console.log('Total feedback:', count);
    process.exit(0);
  });
});
"
```

---

## 🎨 **Admin Dashboard Testing**

After generating feedback, test in admin dashboard:

1. **Login as admin**
2. **Navigate to Daily Analysis**
3. **Select dates:** October 12, 13, 14, 15, 16, 17, or 18, 2025
4. **Expected result:** 
   - ✅ Analysis data should load
   - ✅ Charts and statistics displayed
   - ✅ Meal-wise ratings shown
   - ✅ Comments visible

---

## ⚠️ **Common Issues & Solutions**

### Issue 1: "No student accounts found"
**Solution:** Run user registration first:
```bash
node scripts/bulk-register-users.js
```

### Issue 2: "No data found" in admin dashboard
**Causes:**
- Date mismatch (viewing wrong dates)
- Collection name mismatch
- Python script not connecting to Atlas

**Debug:**
- Check Python script output in backend logs
- Verify collection name in database.py (should be `feedbacks`)
- Ensure MONGODB_URI in .env includes database name

### Issue 3: Connection timeout
**Solution:** 
- Check MongoDB Atlas network access (whitelist your IP)
- Verify credentials in MONGODB_URI
- Check internet connection

---

## ✅ **Final Checklist Before Running**

- [ ] Users exist in database (323103310001-150)
- [ ] MongoDB Atlas connection verified
- [ ] .env file has correct MONGODB_URI
- [ ] Backend server is running (for testing later)
- [ ] You're ready to generate ~850 feedback documents
- [ ] You understand the script will clear existing feedback

---

## 🚀 **YOU'RE READY TO PROCEED!**

**Your script is correctly configured for:**
✅ MongoDB Atlas connection
✅ Correct date range (Oct 12-18, 2025)
✅ Correct user range (001-150)
✅ Correct collection name (feedbacks)
✅ Proper data structure

**Run the script with:**
```bash
cd /home/karthikeya/Viswa/Projects/HFa/backend
node scripts/generate-test-feedback.js
```

Good luck! 🎉
