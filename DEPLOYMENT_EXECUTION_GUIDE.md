# Deployment Execution Guide

**Status**: Ready for Production Deployment  
**Date**: $(date)  
**System**: Hostel Food Analysis

---

## ✅ Pre-Deployment Verification Checklist

- [x] Firebase credentials migrated to environment variables
- [x] All sensitive files blocked in `.gitignore`
- [x] Firebase service account JSON file removed from filesystem
- [x] Admin deletion scripts updated to use environment variables
- [x] `.env.example` created for developer onboarding
- [ ] All tracked sensitive files removed from git history
- [ ] MongoDB Atlas connection string ready
- [ ] Production environment variables ready

---

## 🔥 STEP 1: Delete All Firebase Users

### Option A: Bulk Delete (Recommended - Faster)
```bash
cd /home/karthikeya/Viswa/Projects/HFa/backend
node scripts/bulk-delete-users.js
```

**Expected Output:**
```
Starting bulk user deletion process...
Found X users to delete
Deleted users (batch 1): uid1, uid2, uid3...
✓ Successfully deleted all X users from Firebase
```

### Option B: Simple Delete (Safer - With Confirmation)
```bash
cd /home/karthikeya/Viswa/Projects/HFa/backend
node scripts/simple-delete-users.js
```

**Expected Output:**
```
Starting user deletion process...
Deleting user: uid1 (email@example.com)
Deleting user: uid2 (email2@example.com)
✓ Successfully deleted X users
```

### ⚠️ Verification
```bash
# This will show 0 users if successful
node -e "
require('dotenv').config();
const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
  })
});
admin.auth().listUsers().then(r => {
  console.log('Users remaining:', r.users.length);
  process.exit(0);
});
"
```

---

## 🗄️ STEP 2: Migrate to MongoDB Atlas

### 2.1 Update Backend Environment Variables
Edit `/home/karthikeya/Viswa/Projects/HFa/backend/.env`:

```bash
# OLD (Local MongoDB)
# MONGODB_URI=mongodb://localhost:27017/hostel_food_db

# NEW (MongoDB Atlas)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority
```

**Replace with your actual Atlas connection string from:**
1. Log into MongoDB Atlas
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<username>`, `<password>`, and `<database>`

### 2.2 Test MongoDB Atlas Connection
```bash
cd /home/karthikeya/Viswa/Projects/HFa/backend
node -e "
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✓ Connected to MongoDB Atlas successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('✗ Connection failed:', err.message);
    process.exit(1);
  });
"
```

**Expected Output:**
```
✓ Connected to MongoDB Atlas successfully!
```

---

## 👥 STEP 3: Run User Registration Script

### 3.1 Prepare User Data
Ensure your user registration script is ready. The script should:
- Read user data (from CSV, JSON, or hardcoded)
- Create users in Firebase Authentication
- Create corresponding user documents in MongoDB

### 3.2 Execute Registration
```bash
cd /home/karthikeya/Viswa/Projects/HFa/backend
node scripts/register-users.js
# OR
node scripts/bulk-user-creation.js
# (use whatever script you have for this)
```

### 3.3 Verify Users Created

**Check Firebase:**
```bash
node -e "
require('dotenv').config();
const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
  })
});
admin.auth().listUsers().then(r => {
  console.log('Firebase users:', r.users.length);
  r.users.forEach(u => console.log('  -', u.email));
  process.exit(0);
});
"
```

**Check MongoDB:**
```bash
node -e "
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
const User = require('./models/user');
User.find().then(users => {
  console.log('MongoDB users:', users.length);
  users.forEach(u => console.log('  -', u.email));
  process.exit(0);
});
"
```

---

## 🧹 STEP 4: Clean Git History (Remove Sensitive Files)

### 4.1 Check What's Currently Tracked
```bash
cd /home/karthikeya/Viswa/Projects/HFa
git status
git ls-files | grep -E '\.env$|\.json$|test-analysis'
```

### 4.2 Remove Sensitive Files from Git Tracking

**Option A: Remove from tracking (keep local files)**
```bash
# Remove .env files from tracking
git rm --cached backend/.env 2>/dev/null || true
git rm --cached frontend/.env 2>/dev/null || true
git rm --cached analytics-service/.env 2>/dev/null || true

# Remove test data
git rm --cached test-analysis-integration.json 2>/dev/null || true

# Commit the removal
git add .gitignore
git commit -m "security: Remove sensitive files from git tracking"
```

**Option B: Remove from git history completely (if already committed)**
```bash
# Use git filter-branch or BFG Repo-Cleaner
# WARNING: This rewrites history!

# Install BFG (easier method)
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Run BFG to remove sensitive files
java -jar bfg.jar --delete-files '*.env' .
java -jar bfg.jar --delete-files 'test-analysis-integration.json' .
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

---

## 📤 STEP 5: Push to GitHub

### 5.1 Final Security Check
```bash
cd /home/karthikeya/Viswa/Projects/HFa

# Verify .gitignore is working
git status

# Verify no sensitive files are staged
git diff --cached --name-only | grep -E '\.env$|serviceAccount|\.key$|\.pem$' && echo "⚠️  STOP! Sensitive files detected!" || echo "✓ All clear!"
```

### 5.2 Push to GitHub
```bash
# If this is a new remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Or if remote already exists
git remote -v  # Verify remote

# Push to GitHub
git push -u origin main
# OR
git push -u origin master
```

---

## 🚀 STEP 6: Deploy to Production

### Option A: Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create Heroku app (if not exists)
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI="your_mongodb_atlas_connection_string"
heroku config:set FIREBASE_TYPE="service_account"
heroku config:set FIREBASE_PROJECT_ID="your_project_id"
heroku config:set FIREBASE_PRIVATE_KEY_ID="your_private_key_id"
heroku config:set FIREBASE_PRIVATE_KEY="your_private_key"
heroku config:set FIREBASE_CLIENT_EMAIL="your_client_email"
heroku config:set FIREBASE_CLIENT_ID="your_client_id"
heroku config:set FIREBASE_AUTH_URI="https://accounts.google.com/o/oauth2/auth"
heroku config:set FIREBASE_TOKEN_URI="https://oauth2.googleapis.com/token"
heroku config:set FIREBASE_AUTH_PROVIDER_X509_CERT_URL="https://www.googleapis.com/oauth2/v1/certs"
heroku config:set FIREBASE_CLIENT_X509_CERT_URL="your_client_cert_url"

# Deploy
git push heroku main
```

### Option B: Deploy to Render/Railway/Vercel

1. Connect your GitHub repository
2. Set environment variables in the dashboard
3. Deploy automatically on push

### Option C: Deploy to VPS (DigitalOcean, AWS, etc.)

```bash
# SSH into your server
ssh user@your-server-ip

# Clone repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Set up environment variables
nano backend/.env
# (paste all your environment variables)

# Set up process manager (PM2)
npm install -g pm2
pm2 start backend/server.js --name "hostel-food-backend"
pm2 save
pm2 startup
```

---

## ✅ Post-Deployment Verification

### 6.1 Test Backend API
```bash
# Health check
curl https://your-production-url.com/api/health

# Test authentication
curl -X POST https://your-production-url.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 6.2 Test Frontend
1. Visit your production URL in a browser
2. Test user login
3. Test food analysis submission
4. Test feedback viewing

### 6.3 Monitor Logs
```bash
# Heroku
heroku logs --tail

# PM2
pm2 logs hostel-food-backend

# Check for errors
```

---

## 🔐 STEP 7: Revoke Old Firebase Credentials (Optional but Recommended)

Since you've migrated to environment variables, you may want to revoke the old service account key for security:

1. Go to Firebase Console
2. Navigate to Project Settings > Service Accounts
3. Find the old key (you'll see the key ID)
4. Click "Delete" or "Revoke"
5. Generate a new key if needed
6. Update your `.env` with the new credentials

---

## 📊 Deployment Summary Template

After completing all steps, document your deployment:

```
# Deployment Summary
Date: [DATE]
Deployed By: [YOUR NAME]
Version: [VERSION/TAG]

## Checklist:
- [x] Deleted all Firebase users
- [x] Migrated to MongoDB Atlas
- [x] Created new users in Firebase + MongoDB
- [x] Removed sensitive files from git
- [x] Pushed to GitHub
- [x] Deployed to [PLATFORM]
- [x] Verified production functionality
- [ ] Revoked old Firebase credentials

## URLs:
- Frontend: https://your-frontend-url.com
- Backend API: https://your-backend-url.com
- MongoDB Atlas: [Cluster Name]

## Issues Encountered:
[None / List any issues]

## Next Steps:
- Set up monitoring
- Configure backups
- Set up CI/CD pipeline
```

---

## 🆘 Troubleshooting

### MongoDB Connection Issues
```bash
# Test connection with verbose output
node -e "
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.set('debug', true);
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected!')).catch(console.error);
"
```

### Firebase Authentication Issues
- Verify all environment variables are set correctly
- Check for newline issues in `FIREBASE_PRIVATE_KEY`
- Ensure Firebase project has Authentication enabled

### Deployment Failures
- Check build logs for errors
- Verify all dependencies are in `package.json`
- Ensure environment variables are set on the platform

---

## 📞 Support

If you encounter issues during deployment:
1. Check the logs first
2. Verify environment variables
3. Test locally with production environment variables
4. Review Firebase/MongoDB Atlas dashboards

---

**Ready to deploy? Follow the steps in order and check off each one as you complete it!**
