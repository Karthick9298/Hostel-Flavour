// Debug script to check date handling
import mongoose from 'mongoose';

// MongoDB connection string
const mongoURI = 'mongodb://localhost:27017/hostel-food-analysis';

// Feedback schema (simplified)
const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, required: true }, // Only date part, no time
  meals: {
    morning: {
      rating: { type: Number, min: 0, max: 5, default: null },
      comment: { type: String, default: '' },
      submittedAt: { type: Date, default: null }
    },
    afternoon: {
      rating: { type: Number, min: 0, max: 5, default: null },
      comment: { type: String, default: '' },
      submittedAt: { type: Date, default: null }
    },
    evening: {
      rating: { type: Number, min: 0, max: 5, default: null },
      comment: { type: String, default: '' },
      submittedAt: { type: Date, default: null }
    },
    night: {
      rating: { type: Number, min: 0, max: 5, default: null },
      comment: { type: String, default: '' },
      submittedAt: { type: Date, default: null }
    }
  }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

async function debugDates() {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Get current date in IST (date only, no time)
    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    const currentDate = new Date(istTime.getFullYear(), istTime.getMonth(), istTime.getDate());
    currentDate.setHours(0, 0, 0, 0); // Ensure time is 00:00:00.000

    console.log('=== DATE DEBUG INFO ===');
    console.log('Current UTC time:', now.toISOString());
    console.log('IST time:', istTime.toLocaleString());
    console.log('Current date (IST, no time):', currentDate.toISOString());

    // Find all feedback documents
    const allFeedbacks = await Feedback.find({}).sort({ date: -1 });
    console.log('\n=== ALL FEEDBACK DOCUMENTS ===');
    allFeedbacks.forEach((feedback, index) => {
      console.log(`${index + 1}. User: ${feedback.user}, Date: ${feedback.date.toISOString()}`);
      console.log(`   Morning: ${feedback.meals.morning.rating}, Afternoon: ${feedback.meals.afternoon.rating}`);
      console.log(`   Evening: ${feedback.meals.evening.rating}, Night: ${feedback.meals.night.rating}`);
    });

    // Find today's feedback
    const todayFeedbacks = await Feedback.find({ date: currentDate });
    console.log('\n=== TODAY\'S FEEDBACK ===');
    console.log(`Found ${todayFeedbacks.length} feedback documents for today (${currentDate.toISOString()})`);
    todayFeedbacks.forEach((feedback, index) => {
      console.log(`${index + 1}. User: ${feedback.user}`);
      console.log(`   Morning: ${feedback.meals.morning.rating}, Afternoon: ${feedback.meals.afternoon.rating}`);
      console.log(`   Evening: ${feedback.meals.evening.rating}, Night: ${feedback.meals.night.rating}`);
    });

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugDates();
