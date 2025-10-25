import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Feedback from '../models/Feedback.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MongoDB URI not found in environment variables');
    }
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Connected successfully');
    console.log(`📍 Database: ${mongoose.connection.db.databaseName}`);
    console.log(`🔗 Host: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Delete all feedback
const deleteAllFeedback = async () => {
  console.log('🗑️  DELETE ALL FEEDBACK FROM MONGODB');
  console.log('=====================================');
  console.log('');
  
  try {
    // Connect to database
    await connectDB();
    
    // Count existing feedback
    console.log('📊 Counting existing feedback...');
    const count = await Feedback.countDocuments({});
    console.log(`   Found ${count} feedback documents in the collection`);
    console.log('');
    
    if (count === 0) {
      console.log('✅ No feedback found. Collection is already empty.');
      return;
    }
    
    // Show sample feedback dates
    console.log('📅 Sample feedback dates:');
    const samples = await Feedback.find({}).select('date user').sort({ date: -1 }).limit(10);
    samples.forEach((feedback, index) => {
      console.log(`   ${index + 1}. Date: ${feedback.date.toISOString().split('T')[0]}, User: ${feedback.user}`);
    });
    console.log('');
    
    // Confirmation warning
    console.log('⚠️  WARNING: This will permanently delete ALL feedback data!');
    console.log('⚠️  This action CANNOT be undone!');
    console.log('⚠️  Proceeding in 5 seconds... Press Ctrl+C to cancel');
    console.log('');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Delete all feedback
    console.log('🗑️  Deleting all feedback...');
    const result = await Feedback.deleteMany({});
    
    console.log('');
    console.log('✅ DELETION COMPLETED!');
    console.log('======================');
    console.log(`📊 Total feedback deleted: ${result.deletedCount}`);
    console.log('');
    
    // Verify deletion
    const remainingCount = await Feedback.countDocuments({});
    console.log(`📊 Remaining feedback: ${remainingCount}`);
    
    if (remainingCount === 0) {
      console.log('✅ All feedback successfully deleted!');
    } else {
      console.log('⚠️  Warning: Some feedback may still remain');
    }
    
  } catch (error) {
    console.error('\n💥 DELETION FAILED:');
    console.error(`❌ Error: ${error.message}`);
    console.error('📝 Stack:', error.stack);
  } finally {
    console.log('\n🔌 Disconnecting from MongoDB...');
    await mongoose.disconnect();
    console.log('✅ Database disconnected successfully');
    console.log('👋 Script execution completed');
    process.exit(0);
  }
};

// Handle script interruption
process.on('SIGINT', async () => {
  console.log('\n⚠️  Script interrupted by user');
  console.log('🔌 Cleaning up...');
  await mongoose.disconnect();
  process.exit(0);
});

// Run the deletion
deleteAllFeedback().catch(error => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});
