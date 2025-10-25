import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔄 MIGRATING DATA FROM test TO hostel-food-analysis');
console.log('===================================================\n');

async function migrateData() {
  try {
    // Get base URI without database name
    const baseUri = process.env.MONGODB_URI.split('?')[0].split('/').slice(0, -1).join('/');
    const params = process.env.MONGODB_URI.split('?')[1];
    
    // Connect to test database
    const testUri = `${baseUri}/test?${params}`;
    console.log('📡 Connecting to test database...');
    const testConn = await mongoose.createConnection(testUri).asPromise();
    console.log('✅ Connected to test database\n');
    
    // Connect to hostel-food-analysis database
    const targetUri = `${baseUri}/hostel-food-analysis?${params}`;
    console.log('📡 Connecting to hostel-food-analysis database...');
    const targetConn = await mongoose.createConnection(targetUri).asPromise();
    console.log('✅ Connected to hostel-food-analysis database\n');
    
    // Get collections from test database
    console.log('📊 Checking data in test database...');
    const testDb = testConn.db;
    const collections = await testDb.listCollections().toArray();
    console.log(`Found ${collections.length} collections:\n`);
    
    for (const collInfo of collections) {
      const collName = collInfo.name;
      console.log(`📁 Collection: ${collName}`);
      
      const testColl = testDb.collection(collName);
      const count = await testColl.countDocuments();
      console.log(`   Documents: ${count}`);
      
      if (count > 0) {
        // Get all documents
        const docs = await testColl.find({}).toArray();
        
        // Insert into target database
        const targetColl = targetConn.db.collection(collName);
        
        // Clear existing data in target
        const existingCount = await targetColl.countDocuments();
        if (existingCount > 0) {
          console.log(`   ⚠️  Found ${existingCount} existing documents in target`);
          console.log(`   🗑️  Deleting existing documents...`);
          await targetColl.deleteMany({});
        }
        
        console.log(`   📤 Copying ${count} documents...`);
        await targetColl.insertMany(docs);
        console.log(`   ✅ Copied successfully\n`);
      } else {
        console.log(`   ⏭️  Skipping (empty)\n`);
      }
    }
    
    // Verify migration
    console.log('\n🔍 VERIFICATION');
    console.log('==============');
    
    const targetDb = targetConn.db;
    const targetCollections = await targetDb.listCollections().toArray();
    
    for (const collInfo of targetCollections) {
      const collName = collInfo.name;
      const count = await targetDb.collection(collName).countDocuments();
      console.log(`✅ ${collName}: ${count} documents`);
    }
    
    await testConn.close();
    await targetConn.close();
    
    console.log('\n🎉 MIGRATION COMPLETE!');
    console.log('======================');
    console.log('✅ All data migrated from test to hostel-food-analysis');
    console.log('📌 Now restart your backend server to use the correct database');
    
  } catch (error) {
    console.error('\n💥 MIGRATION FAILED:', error.message);
    console.error(error.stack);
  }
}

migrateData();
