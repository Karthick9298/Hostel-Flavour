import mongoose from 'mongoose';
import Feedback from './models/Feedback.js';
import User from './models/User.js';

// MongoDB connection string
const mongoURI = 'mongodb://localhost:27017/hostel-food-analysis';

async function createTestScenario() {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Find a test user or create one
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      console.log('Test user not found. Creating one...');
      testUser = new User({
        name: 'Test Student',
        email: 'test@example.com',
        rollNumber: 'TEST001',
        hostelRoom: 'A-101',
        firebaseUid: 'test-uid-123',
        isAdmin: false,
        isActive: true
      });
      await testUser.save();
      console.log('Test user created:', testUser._id);
    } else {
      console.log('Using existing test user:', testUser._id);
    }

    // Get today's date and yesterday's date in IST
    const now = new Date();
    console.log('System time (UTC):', now.toISOString());
    console.log('System time (IST):', now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    
    // Use the same logic as the backend
    const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    console.log('IST time object:', istTime.toISOString());
    
    // Today's date (using backend logic)
    const todayDate = new Date(istTime.getFullYear(), istTime.getMonth(), istTime.getDate());
    todayDate.setHours(0, 0, 0, 0);
    
    // Yesterday's date
    const yesterdayDate = new Date(istTime.getFullYear(), istTime.getMonth(), istTime.getDate() - 1);
    yesterdayDate.setHours(0, 0, 0, 0);

    console.log('Yesterday date:', yesterdayDate.toISOString());
    console.log('Today date:', todayDate.toISOString());

    // Remove any existing feedback for this user
    await Feedback.deleteMany({ user: testUser._id });
    console.log('Removed existing feedback for test user');

    // Create feedback for yesterday
    const yesterdayFeedback = new Feedback({
      user: testUser._id,
      date: yesterdayDate,
      meals: {
        morning: { 
          rating: 4, 
          comment: 'Good breakfast yesterday', 
          submittedAt: new Date(yesterdayDate.getTime() + 10 * 60 * 60 * 1000) // 10 AM yesterday
        },
        afternoon: { 
          rating: 3, 
          comment: 'Average lunch yesterday', 
          submittedAt: new Date(yesterdayDate.getTime() + 14 * 60 * 60 * 1000) // 2 PM yesterday
        },
        evening: { rating: null, comment: '', submittedAt: null },
        night: { rating: null, comment: '', submittedAt: null }
      }
    });

    await yesterdayFeedback.save();
    console.log('Created yesterday feedback');

    // Check if today's feedback exists
    const todayFeedback = await Feedback.findOne({ user: testUser._id, date: todayDate });
    if (todayFeedback) {
      console.log('Today feedback already exists');
    } else {
      console.log('No feedback for today - this is expected');
    }

    // Test the API query that the frontend uses
    console.log('\n=== TESTING API QUERY ===');
    const apiResult = await Feedback.findOne({
      user: testUser._id,
      date: todayDate
    });

    if (apiResult) {
      console.log('API returned feedback for today:', apiResult.meals);
    } else {
      console.log('API correctly returned null for today (no feedback submitted today)');
    }

    console.log('\n=== TEST SCENARIO CREATED ===');
    console.log('1. Yesterday feedback exists with morning and afternoon ratings');
    console.log('2. Today feedback does not exist');
    console.log('3. Frontend should show "available" status for all meals today');
    console.log(`\nTest user credentials: ${testUser.email} (${testUser.firebaseUid})`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestScenario();
