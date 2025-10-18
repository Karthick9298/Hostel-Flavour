import mongoose from 'mongoose';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import User from '../models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

// Firebase config for client SDK
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase Client SDK
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Firebase Admin SDK
const serviceAccountPath = path.join(__dirname, '../hostel-food-analysis-firebase-adminsdk-fbsvc-346848ceff.json');
let adminApp;

try {
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    console.log('✅ Firebase Admin SDK initialized successfully');
  } else {
    console.error('❌ Firebase service account file not found at:', serviceAccountPath);
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
  process.exit(1);
}

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hostel-food-analysis';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Generate user emails to delete
const generateUserEmailsToDelete = (startRoll, endRoll, emailDomain = '@gvpce.ac.in') => {
  const emails = [];
  
  for (let rollNum = startRoll; rollNum <= endRoll; rollNum++) {
    const rollNumber = rollNum.toString();
    emails.push(`${rollNumber}${emailDomain}`);
  }
  
  console.log(`📋 Generated ${emails.length} email addresses for deletion`);
  return emails;
};

// Delete single user from Firebase and MongoDB
const deleteUser = async (email, index, total) => {
  try {
    const progressPercent = ((index + 1) / total * 100).toFixed(1);
    console.log(`\n🗑️  [${index + 1}/${total}] (${progressPercent}%) Deleting: ${email}`);
    
    let firebaseUid = null;
    let mongoUser = null;
    
    // Step 1: Find user in MongoDB to get Firebase UID
    console.log('   🔍 Looking up user in MongoDB...');
    mongoUser = await User.findOne({ email: email });
    
    if (mongoUser) {
      firebaseUid = mongoUser.firebaseUid;
      console.log(`   ✅ Found MongoDB user: ${mongoUser.rollNumber} (UID: ${firebaseUid})`);
    } else {
      console.log('   ⚠️  User not found in MongoDB');
    }
    
    // Step 2: Delete from Firebase using Admin SDK
    if (firebaseUid) {
      console.log('   🔥 Deleting from Firebase...');
      try {
        await admin.auth().deleteUser(firebaseUid);
        console.log('   ✅ Firebase user deleted successfully');
      } catch (firebaseError) {
        if (firebaseError.code === 'auth/user-not-found') {
          console.log('   ⚠️  Firebase user not found (may have been deleted already)');
        } else {
          throw firebaseError;
        }
      }
    } else {
      // Try to find user by email in Firebase directly
      console.log('   🔍 Searching Firebase by email...');
      try {
        const firebaseUser = await admin.auth().getUserByEmail(email);
        firebaseUid = firebaseUser.uid;
        console.log(`   ✅ Found Firebase user with UID: ${firebaseUid}`);
        
        await admin.auth().deleteUser(firebaseUid);
        console.log('   ✅ Firebase user deleted successfully');
      } catch (firebaseError) {
        if (firebaseError.code === 'auth/user-not-found') {
          console.log('   ⚠️  Firebase user not found');
        } else {
          console.error(`   ❌ Firebase error: ${firebaseError.message}`);
        }
      }
    }
    
    // Step 3: Delete from MongoDB
    if (mongoUser) {
      console.log('   💾 Deleting from MongoDB...');
      await User.deleteOne({ email: email });
      console.log('   ✅ MongoDB user deleted successfully');
    }
    
    console.log(`   🎉 User ${email} deletion completed!`);
    
    return { 
      success: true, 
      email: email,
      rollNumber: mongoUser?.rollNumber || 'Unknown',
      firebaseUid: firebaseUid,
      hadMongoRecord: !!mongoUser,
      hadFirebaseRecord: !!firebaseUid
    };
    
  } catch (error) {
    console.error(`   ❌ Deletion failed for ${email}:`);
    console.error(`   📝 Error: ${error.message}`);
    
    return { 
      success: false, 
      email: email,
      error: error.message,
      errorCode: error.code 
    };
  }
};

// Delay function with progress indicator
const delay = async (seconds, reason = '') => {
  console.log(`   ⏳ Waiting ${seconds} seconds${reason ? ` (${reason})` : ''}...`);
  
  if (seconds >= 3) {
    for (let i = seconds; i > 0; i--) {
      process.stdout.write(`\r   ⏳ ${i} seconds remaining...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log('\r   ✅ Wait complete!                    ');
  } else {
    await new Promise(resolve => setTimeout(resolve, seconds * 1000));
  }
};

// Main bulk deletion function
const bulkDelete = async () => {
  const startTime = new Date();
  console.log('🗑️  BULK USER DELETION STARTED');
  console.log('===============================');
  console.log(`📅 Start Time: ${startTime.toLocaleString()}`);
  console.log('');
  
  try {
    // Connect to database
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();
    console.log('');
    
    // Configuration - you can modify these values
    const startRoll = 323103310010;
    const endRoll = 323103310068;
    
    // Try different email domains in case the format varies
    const emailDomains = [
      '@gvpce.ac.in',
      '@student.hostel.edu',
      '@student.hostel.edu.in'
    ];
    
    console.log('📊 DELETION DETAILS:');
    console.log(`   Range: ${startRoll} → ${endRoll}`);
    console.log(`   Email domains to try: ${emailDomains.join(', ')}`);
    console.log(`   Estimated Time: ~${Math.ceil((endRoll - startRoll + 1) * 2 / 60)} minutes`);
    console.log('');
    
    // Confirm before proceeding
    console.log('⚠️  WARNING: This will permanently delete user accounts!');
    console.log('⚠️  This action cannot be undone!');
    console.log('🔄 Starting deletion in 10 seconds...');
    console.log('💡 Press Ctrl+C to cancel if you change your mind');
    await delay(10, 'final warning');
    console.log('');
    
    const results = {
      success: [],
      failed: [],
      total: 0,
      notFound: 0,
      firebaseDeleted: 0,
      mongoDeleted: 0
    };
    
    // Try each email domain
    for (const domain of emailDomains) {
      console.log(`\n🎯 Processing domain: ${domain}`);
      console.log('================================');
      
      const emails = generateUserEmailsToDelete(startRoll, endRoll, domain);
      results.total += emails.length;
      
      // Check if any users exist with this domain first
      const existingUsers = await User.find({ 
        email: { $regex: `^323103310[0-9]{3}${domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$` }
      });
      
      console.log(`📊 Found ${existingUsers.length} existing users with domain ${domain}`);
      
      if (existingUsers.length === 0) {
        console.log(`⏭️  Skipping domain ${domain} - no users found`);
        continue;
      }
      
      // Process each email with appropriate delays
      for (let i = 0; i < emails.length; i++) {
        const email = emails[i];
        const result = await deleteUser(email, i, emails.length);
        
        if (result.success) {
          results.success.push({
            email: result.email,
            rollNumber: result.rollNumber,
            firebaseUid: result.firebaseUid,
            hadMongoRecord: result.hadMongoRecord,
            hadFirebaseRecord: result.hadFirebaseRecord
          });
          
          if (result.hadFirebaseRecord) results.firebaseDeleted++;
          if (result.hadMongoRecord) results.mongoDeleted++;
        } else {
          results.failed.push({
            email: result.email,
            error: result.error,
            errorCode: result.errorCode
          });
        }
        
        // Add delays to be respectful to Firebase
        if (i < emails.length - 1) {
          let delayTime = 1; // Default 1 second
          let delayReason = 'rate limiting';
          
          // Longer delay every 10 deletions
          if ((i + 1) % 10 === 0) {
            delayTime = 3;
            delayReason = 'batch completion';
          }
          
          // Even longer delay every 25 deletions
          if ((i + 1) % 25 === 0) {
            delayTime = 5;
            delayReason = 'extended break';
            console.log(`\n🎯 Milestone: ${i + 1} users processed from ${domain}!`);
          }
          
          await delay(delayTime, delayReason);
        }
      }
    }
    
    // Final results summary
    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log('\n🏁 BULK DELETION COMPLETED!');
    console.log('=============================');
    console.log(`📅 End Time: ${endTime.toLocaleString()}`);
    console.log(`⏱️  Duration: ${Math.floor(duration / 60)}m ${duration % 60}s`);
    console.log('');
    console.log('📊 FINAL SUMMARY:');
    console.log(`✅ Successful Deletions: ${results.success.length}`);
    console.log(`❌ Failed Deletions: ${results.failed.length}`);
    console.log(`🔥 Firebase Users Deleted: ${results.firebaseDeleted}`);
    console.log(`💾 MongoDB Users Deleted: ${results.mongoDeleted}`);
    console.log(`📈 Success Rate: ${results.total > 0 ? (results.success.length / results.total * 100).toFixed(1) : 0}%`);
    
    // Show successful deletions
    if (results.success.length > 0) {
      console.log('\n✅ SUCCESSFUL DELETIONS:');
      results.success.slice(0, 15).forEach((user, index) => {
        const fb = user.hadFirebaseRecord ? '🔥' : '⚪';
        const mongo = user.hadMongoRecord ? '💾' : '⚪';
        console.log(`   ${index + 1}. ${user.rollNumber || 'Unknown'} - ${user.email} [${fb}${mongo}]`);
      });
      if (results.success.length > 15) {
        console.log(`   ... and ${results.success.length - 15} more users`);
      }
      console.log('\n   Legend: 🔥 = Firebase deleted, 💾 = MongoDB deleted, ⚪ = Not found');
    }
    
    // Show failed deletions
    if (results.failed.length > 0) {
      console.log('\n❌ FAILED DELETIONS:');
      results.failed.forEach((fail, index) => {
        console.log(`   ${index + 1}. ${fail.email}`);
        console.log(`      Error: ${fail.error}`);
      });
    }
    
    console.log('\n🎉 User deletion process completed!');
    
  } catch (error) {
    console.error('\n💥 BULK DELETION FAILED:');
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
  try {
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error disconnecting:', error.message);
  }
  process.exit(0);
});

// Additional safety check function
const confirmDeletion = () => {
  return new Promise((resolve) => {
    console.log('\n🛑 FINAL SAFETY CHECK');
    console.log('====================');
    console.log('You are about to delete users from roll numbers:');
    console.log('323103310010 to 323103310068');
    console.log('');
    console.log('This will remove them from:');
    console.log('- Firebase Authentication');
    console.log('- MongoDB Database');
    console.log('');
    console.log('⚠️  THIS ACTION CANNOT BE UNDONE!');
    console.log('');
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('Type "DELETE USERS" to confirm (or anything else to cancel): ', (answer) => {
      rl.close();
      if (answer === 'DELETE USERS') {
        console.log('✅ Deletion confirmed. Proceeding...');
        resolve(true);
      } else {
        console.log('❌ Deletion cancelled by user.');
        resolve(false);
      }
    });
  });
};

// Run the bulk deletion with confirmation
console.log('🗑️  Firebase Bulk User Deletion Script');
console.log('=======================================');

(async () => {
  try {
    const confirmed = await confirmDeletion();
    if (confirmed) {
      await bulkDelete();
    } else {
      console.log('👋 Script terminated safely');
      process.exit(0);
    }
  } catch (error) {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  }
})();
