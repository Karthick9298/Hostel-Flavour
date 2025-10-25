import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 VERIFYING DATA IN BOTH DATABASES');
console.log('====================================\n');

async function verifyData() {
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
    
    // Check test database
    console.log('📊 TEST DATABASE:');
    console.log('================');
    const testDb = testConn.db;
    const testCollections = await testDb.listCollections().toArray();
    
    let testTotal = 0;
    for (const collInfo of testCollections) {
      const collName = collInfo.name;
      const count = await testDb.collection(collName).countDocuments();
      testTotal += count;
      console.log(`  ${collName}: ${count} documents`);
    }
    console.log(`  TOTAL: ${testTotal} documents\n`);
    
    // Check hostel-food-analysis database
    console.log('📊 HOSTEL-FOOD-ANALYSIS DATABASE:');
    console.log('=================================');
    const targetDb = targetConn.db;
    const targetCollections = await targetDb.listCollections().toArray();
    
    let targetTotal = 0;
    for (const collInfo of targetCollections) {
      const collName = collInfo.name;
      const count = await targetDb.collection(collName).countDocuments();
      targetTotal += count;
      console.log(`  ${collName}: ${count} documents`);
      
      // Show sample dates from feedbacks
      if (collName === 'feedbacks' && count > 0) {
        const sample = await targetDb.collection(collName)
          .find({})
          .sort({ date: -1 })
          .limit(5)
          .toArray();
        console.log(`  Sample feedback dates:`);
        sample.forEach(f => {
          console.log(`    - ${f.date?.toISOString()?.split('T')[0] || 'No date'} (User: ${f.userId})`);
        });
      }
    }
    console.log(`  TOTAL: ${targetTotal} documents\n`);
    
    // Recommendations
    console.log('📋 RECOMMENDATIONS:');
    console.log('==================');
    
    if (targetTotal === 0) {
      console.log('❌ hostel-food-analysis database is EMPTY!');
      console.log('⚠️  DO NOT delete test database - migration not completed');
      console.log('💡 Run: node migrate-database.js');
    } else if (testTotal === targetTotal) {
      console.log('✅ Both databases have the same amount of data');
      console.log('✅ Migration appears successful');
      console.log('💡 You can SAFELY delete the test database AFTER:');
      console.log('   1. Verify your backend is working correctly');
      console.log('   2. Verify your admin dashboard shows data');
      console.log('   3. Test creating new feedback');
      console.log('   4. Keep a backup just in case!');
    } else {
      console.log(`⚠️  Data mismatch: test (${testTotal}) vs target (${targetTotal})`);
      console.log('💡 Review migration before deleting test database');
    }
    
    await testConn.close();
    await targetConn.close();
    
  } catch (error) {
    console.error('\n💥 VERIFICATION FAILED:', error.message);
    console.error(error.stack);
  }
}

verifyData();
