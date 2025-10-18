# User Management Scripts

This directory contains scripts for bulk user operations in the Hostel Food Analysis system.

## Scripts Available

### 1. `bulk-register-users.js`
Creates multiple user accounts in both Firebase Authentication and MongoDB database.

### 2. `bulk-delete-users.js` (Comprehensive)
Advanced deletion script with multiple safety checks and supports various email domains.

### 3. `simple-delete-users.js` (Recommended for your use case)
Simple, focused deletion script for the specific email range you requested.

## Usage

### To Delete Users (Recommended Method)

```bash
# Navigate to backend directory
cd backend

# Run the simple deletion script
npm run simple-delete

# OR run directly
node scripts/simple-delete-users.js
```

### Target Users for Deletion

The script will delete users with emails from:
- `323103310010@gvpce.ac.in` to `323103310068@gvpce.ac.in`
- Also checks for alternative domains like `@student.hostel.edu`

### What the Script Does

1. **Connects to MongoDB** - Establishes database connection
2. **Searches for Users** - Finds all users matching the email patterns
3. **Displays Found Users** - Shows which users will be deleted
4. **Safety Delay** - 5-second countdown to allow cancellation
5. **Deletes from Firebase** - Removes user from Firebase Authentication
6. **Deletes from MongoDB** - Removes user record from database
7. **Provides Summary** - Shows success/failure statistics

### Safety Features

- **Preview Mode**: Shows users that will be deleted before proceeding
- **Cancellation Window**: 5-second delay to press Ctrl+C and cancel
- **Error Handling**: Continues with other users if one deletion fails
- **Detailed Logging**: Shows progress and any issues encountered
- **Graceful Cleanup**: Properly closes database connections

### Script Configuration

The email patterns are defined in the script. Current configuration targets:

```javascript
// Roll numbers 323103310010 to 323103310068
// With email domains: @gvpce.ac.in, @student.hostel.edu
```

To modify the range, edit the patterns in `simple-delete-users.js`:

```javascript
const emailPatterns = [
  /^32310331001[0-9]@gvpce\.ac\.in$/,  // 10-19
  /^32310331002[0-9]@gvpce\.ac\.in$/,  // 20-29  
  // ... add more patterns as needed
];
```

## Prerequisites

1. **Environment Variables**: Ensure `.env` file exists with:
   - `MONGO_URI`
   - `FIREBASE_PROJECT_ID`

2. **Firebase Service Account**: Make sure the Firebase admin SDK key file exists:
   - `hostel-food-analysis-firebase-adminsdk-fbsvc-346848ceff.json`

3. **Dependencies**: Install required packages:
   ```bash
   npm install
   ```

## Output Example

```
🗑️  Starting User Deletion Process
==================================
✅ MongoDB Connected
🔍 Searching for users in database...
📊 Found 59 users to delete

👥 Users to be deleted:
   1. 323103310010 - 323103310010@gvpce.ac.in (Student 323103310010)
   2. 323103310011 - 323103310011@gvpce.ac.in (Student 323103310011)
   ...

⚠️  WARNING: This will permanently delete these users!
⚠️  Proceeding in 5 seconds... Press Ctrl+C to cancel

🗑️  [1/59] Deleting: 323103310010@gvpce.ac.in
   🔥 Firebase user deleted
   💾 MongoDB user deleted
   ✅ Deletion completed

...

🏁 DELETION COMPLETED!
======================
✅ Successfully deleted: 59 users
❌ Failed to delete: 0 users
📊 Total processed: 59 users
👋 Script completed
```

## Important Notes

- **Irreversible Action**: Deleted users cannot be recovered
- **Firebase Quota**: Large deletions may hit Firebase rate limits
- **Manual Verification**: Always verify the user list before confirming deletion
- **Backup Recommended**: Consider backing up data before running deletion scripts

## Troubleshooting

### Common Issues

1. **"Firebase service account file not found"**
   - Ensure the Firebase admin SDK key file exists in the backend directory

2. **"MongoDB connection failed"**
   - Check if MongoDB is running
   - Verify MONGO_URI in .env file

3. **"Permission denied"**
   - Ensure Firebase service account has proper permissions
   - Check if the project ID matches in .env and service account file

### Getting Help

If you encounter issues:
1. Check the console output for specific error messages
2. Verify all prerequisites are met
3. Test with a small range first before bulk operations
