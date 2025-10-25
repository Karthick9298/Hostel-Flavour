import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Feedback from './models/Feedback.js';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

console.log('🔍 COMPREHENSIVE DIAGNOSTIC CHECK');
console.log('====================================\n');

async function runDiagnostic() {
  try {
    // 1. Check environment
    console.log('📝 1. ENVIRONMENT CHECK');
    console.log('----------------------');
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('URI type:', process.env.MONGODB_URI?.includes('mongodb+srv') ? 'MongoDB Atlas' : 'Local');
    console.log('');

    // 2. Check MongoDB connection
    console.log('🗄️  2. MONGODB CONNECTION');
    console.log('-----------------------');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected successfully');
    console.log('Database:', mongoose.connection.db.databaseName);
    console.log('Host:', mongoose.connection.host);
    console.log('');

    // 3. Check feedback data
    console.log('📊 3. FEEDBACK DATA CHECK');
    console.log('------------------------');
    const totalCount = await Feedback.countDocuments({});
    console.log('Total feedback documents:', totalCount);
    
    if (totalCount > 0) {
      const allDates = await Feedback.distinct('date');
      console.log('Unique dates:', allDates.length);
      console.log('Date range:');
      const sorted = allDates.sort((a, b) => a - b);
      console.log('  First:', sorted[0].toISOString().split('T')[0]);
      console.log('  Last:', sorted[sorted.length - 1].toISOString().split('T')[0]);
      
      // Check specific dates
      console.log('\nFeedback count by date:');
      for (let day = 12; day <= 18; day++) {
        const targetDate = new Date(2025, 9, day);
        targetDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const count = await Feedback.countDocuments({
          date: { $gte: targetDate, $lt: nextDay }
        });
        console.log(`  Oct ${day}, 2025:`, count, 'documents');
      }
    } else {
      console.log('❌ No feedback found in database!');
    }
    console.log('');

    // 4. Test Python script
    console.log('🐍 4. PYTHON SCRIPT TEST');
    console.log('-----------------------');
    console.log('Testing daily_analysis.py with date: 2025-10-12');
    
    return new Promise((resolve) => {
      const analyticsPath = path.join(__dirname, '../analytics-service');
      const scriptPath = path.join(analyticsPath, 'services', 'daily_analysis.py');
      const pythonProcess = spawn('python3', [scriptPath, '2025-10-12']);
      
      let stdout = '';
      let stderr = '';
      
      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      pythonProcess.on('close', async (code) => {
        console.log('Exit code:', code);
        
        if (stderr) {
          console.log('\nStderr output:');
          console.log(stderr);
        }
        
        if (stdout) {
          console.log('\nStdout output:');
          console.log(stdout.substring(0, 500));
          
          try {
            const result = JSON.parse(stdout);
            console.log('\n✅ Parsed result:');
            console.log('Status:', result.status);
            console.log('Message:', result.message || 'N/A');
            console.log('Type:', result.type || 'N/A');
          } catch (e) {
            console.log('❌ Failed to parse JSON output');
          }
        }
        
        await mongoose.disconnect();
        console.log('\n✅ DIAGNOSTIC COMPLETE');
        resolve();
      });
    });
    
  } catch (error) {
    console.error('\n💥 ERROR:', error.message);
    await mongoose.disconnect();
  }
}

runDiagnostic();
