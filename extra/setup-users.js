import mongoose from 'mongoose';
import User from '../backend/models/User.js';

const MONGODB_URI = 'mongodb://localhost:27017/hostel-food-analysis';

async function setupTestUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if test user exists
    const existingUser = await User.findOne({ email: 'test@gvpce.ac.in' });
    if (existingUser) {
      console.log('✅ Test user already exists:', existingUser.email);
    } else {
      console.log('❌ Test user not found');
    }

    // Check if admin user exists, if not create one
    let adminUser = await User.findOne({ email: 'admin@gvpce.ac.in' });
    if (!adminUser) {
      adminUser = new User({
        name: 'Admin User',
        email: 'admin@gvpce.ac.in',
        rollNumber: 'ADMIN001',
        hostelRoom: 'A-999',
        firebaseUid: 'admin-firebase-uid-123',
        isAdmin: true
      });
      await adminUser.save();
      console.log('✅ Admin user created');
    } else {
      // Make sure admin user has admin privileges
      if (!adminUser.isAdmin) {
        adminUser.isAdmin = true;
        await adminUser.save();
        console.log('✅ Admin privileges granted to existing user');
      } else {
        console.log('✅ Admin user already exists with admin privileges');
      }
    }

    // List all users
    const users = await User.find({}, 'name email rollNumber isAdmin');
    console.log('\n📋 Current users:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.isAdmin ? 'ADMIN' : 'STUDENT'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

setupTestUsers();
