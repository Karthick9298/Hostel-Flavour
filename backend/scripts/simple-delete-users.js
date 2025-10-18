import mongoose from 'mongoose';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import User from '../models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Initialize Firebase Admin SDK
const serviceAccountPath = path.join(__dirname, '../hostel-food-analysis-firebase-adminsdk-fbsvc-346848ceff.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Firebase service account file not found');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID
});

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hostel-food-analysis';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Simple deletion function
const deleteUsersByEmailRange = async () => {
  console.log('🗑️  Starting User Deletion Process');
  console.log('==================================');
  
  try {
    await connectDB();
    
    // Define email patterns to search for
    const emailPatterns = [
      /^32310331001[0-9]@gvpce\.ac\.in$/,           // 10-19
      /^32310331002[0-9]@gvpce\.ac\.in$/,           // 20-29  
      /^32310331003[0-9]@gvpce\.ac\.in$/,           // 30-39
      /^32310331004[0-9]@gvpce\.ac\.in$/,           // 40-49
      /^32310331005[0-9]@gvpce\.ac\.in$/,           // 50-59
      /^323103310060@gvpce\.ac\.in$/,               // 60
      /^323103310061@gvpce\.ac\.in$/,               // 61
      /^323103310062@gvpce\.ac\.in$/,               // 62
      /^323103310063@gvpce\.ac\.in$/,               // 63
      /^323103310064@gvpce\.ac\.in$/,               // 64
      /^323103310065@gvpce\.ac\.in$/,               // 65
      /^323103310066@gvpce\.ac\.in$/,               // 66
      /^323103310067@gvpce\.ac\.in$/,               // 67
      /^323103310068@gvpce\.ac\.in$/                // 68
    ];
    
    // Also check for other possible email domains
    const alternativePatterns = [
      /^32310331001[0-9]@student\.hostel\.edu$/,
      /^32310331002[0-9]@student\.hostel\.edu$/,
      /^32310331003[0-9]@student\.hostel\.edu$/,
      /^32310331004[0-9]@student\.hostel\.edu$/,
      /^32310331005[0-9]@student\.hostel\.edu$/,
      /^323103310060@student\.hostel\.edu$/,
      /^323103310061@student\.hostel\.edu$/,
      /^323103310062@student\.hostel\.edu$/,
      /^323103310063@student\.hostel\.edu$/,
      /^323103310064@student\.hostel\.edu$/,
      /^323103310065@student\.hostel\.edu$/,
      /^323103310066@student\.hostel\.edu$/,
      /^323103310067@student\.hostel\.edu$/,
      /^323103310068@student\.hostel\.edu$/
    ];
    
    const allPatterns = [...emailPatterns, ...alternativePatterns];
    
    // Find users in MongoDB that match any of these patterns
    console.log('🔍 Searching for users in database...');
    const usersToDelete = await User.find({
      $or: allPatterns.map(pattern => ({ email: { $regex: pattern } }))
    });
    
    console.log(`📊 Found ${usersToDelete.length} users to delete`);
    
    if (usersToDelete.length === 0) {
      console.log('✅ No users found matching the criteria');
      return;
    }
    
    // Display users that will be deleted
    console.log('\n👥 Users to be deleted:');
    usersToDelete.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.rollNumber} - ${user.email} (${user.name})`);
    });
    
    // Confirmation
    console.log('\n⚠️  WARNING: This will permanently delete these users!');
    console.log('⚠️  Proceeding in 5 seconds... Press Ctrl+C to cancel');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    let successCount = 0;
    let failCount = 0;
    
    // Delete each user
    for (let i = 0; i < usersToDelete.length; i++) {
      const user = usersToDelete[i];
      console.log(`\n🗑️  [${i + 1}/${usersToDelete.length}] Deleting: ${user.email}`);
      
      try {
        // Delete from Firebase
        if (user.firebaseUid) {
          try {
            await admin.auth().deleteUser(user.firebaseUid);
            console.log('   🔥 Firebase user deleted');
          } catch (fbError) {
            if (fbError.code !== 'auth/user-not-found') {
              console.log(`   ⚠️  Firebase deletion warning: ${fbError.message}`);
            } else {
              console.log('   ⚠️  Firebase user not found (may have been deleted already)');
            }
          }
        }
        
        // Delete from MongoDB
        await User.deleteOne({ _id: user._id });
        console.log('   💾 MongoDB user deleted');
        console.log('   ✅ Deletion completed');
        
        successCount++;
        
        // Small delay to be respectful
        if (i < usersToDelete.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
      } catch (error) {
        console.log(`   ❌ Deletion failed: ${error.message}`);
        failCount++;
      }
    }
    
    // Summary
    console.log('\n🏁 DELETION COMPLETED!');
    console.log('======================');
    console.log(`✅ Successfully deleted: ${successCount} users`);
    console.log(`❌ Failed to delete: ${failCount} users`);
    console.log(`📊 Total processed: ${usersToDelete.length} users`);
    
  } catch (error) {
    console.error('💥 Script failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Script completed');
    process.exit(0);
  }
};

// Handle interruption
process.on('SIGINT', async () => {
  console.log('\n⚠️  Script interrupted');
  await mongoose.disconnect();
  process.exit(0);
});

// Run the deletion
deleteUsersByEmailRange();
