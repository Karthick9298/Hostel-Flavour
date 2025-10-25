#!/bin/bash

# Hostel Food Analysis - Deployment Quick Commands
# Run this script to execute common deployment tasks

set -e  # Exit on error

echo "🚀 Hostel Food Analysis - Deployment Helper"
echo "============================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Project directory
PROJECT_DIR="/home/karthikeya/Viswa/Projects/HFa"
BACKEND_DIR="$PROJECT_DIR/backend"

# Function to display menu
show_menu() {
    echo "Select an option:"
    echo "1) Delete all Firebase users (Bulk)"
    echo "2) Delete all Firebase users (Simple)"
    echo "3) List current Firebase users"
    echo "4) Test MongoDB Atlas connection"
    echo "5) Verify environment variables"
    echo "6) Remove sensitive files from git tracking"
    echo "7) Show git status"
    echo "8) Run security check before push"
    echo "9) Exit"
    echo ""
    read -p "Enter your choice [1-9]: " choice
}

# Function to delete users (bulk)
delete_users_bulk() {
    echo -e "${YELLOW}⚠️  This will delete ALL Firebase users!${NC}"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" == "yes" ]; then
        cd "$BACKEND_DIR"
        echo "Deleting users..."
        node scripts/bulk-delete-users.js
    else
        echo "Operation cancelled."
    fi
}

# Function to delete users (simple)
delete_users_simple() {
    echo -e "${YELLOW}⚠️  This will delete ALL Firebase users!${NC}"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" == "yes" ]; then
        cd "$BACKEND_DIR"
        echo "Deleting users..."
        node scripts/simple-delete-users.js
    else
        echo "Operation cancelled."
    fi
}

# Function to list Firebase users
list_users() {
    echo "Listing Firebase users..."
    cd "$BACKEND_DIR"
    node -e "
    require('dotenv').config();
    const admin = require('firebase-admin');
    admin.initializeApp({
      credential: admin.credential.cert({
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\\\\\\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
      })
    });
    admin.auth().listUsers().then(r => {
      console.log('Total users:', r.users.length);
      r.users.forEach((u, i) => console.log((i+1) + '.', u.email || u.uid));
      process.exit(0);
    });
    "
}

# Function to test MongoDB connection
test_mongodb() {
    echo "Testing MongoDB Atlas connection..."
    cd "$BACKEND_DIR"
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
}

# Function to verify environment variables
verify_env() {
    echo "Verifying environment variables..."
    cd "$BACKEND_DIR"
    node -e "
    require('dotenv').config();
    const vars = [
      'MONGODB_URI',
      'FIREBASE_TYPE',
      'FIREBASE_PROJECT_ID',
      'FIREBASE_PRIVATE_KEY_ID',
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_CLIENT_ID',
      'FIREBASE_AUTH_URI',
      'FIREBASE_TOKEN_URI',
      'FIREBASE_AUTH_PROVIDER_X509_CERT_URL',
      'FIREBASE_CLIENT_X509_CERT_URL'
    ];
    let allSet = true;
    vars.forEach(v => {
      if (process.env[v]) {
        console.log('✓', v);
      } else {
        console.log('✗', v, '(MISSING)');
        allSet = false;
      }
    });
    if (allSet) {
      console.log('\n✓ All environment variables are set!');
    } else {
      console.log('\n✗ Some environment variables are missing!');
      process.exit(1);
    }
    "
}

# Function to remove sensitive files from git
remove_sensitive_files() {
    echo "Removing sensitive files from git tracking..."
    cd "$PROJECT_DIR"
    git rm --cached backend/.env 2>/dev/null || echo "backend/.env not tracked"
    git rm --cached frontend/.env 2>/dev/null || echo "frontend/.env not tracked"
    git rm --cached analytics-service/.env 2>/dev/null || echo "analytics-service/.env not tracked"
    git rm --cached test-analysis-integration.json 2>/dev/null || echo "test-analysis-integration.json not tracked"
    echo -e "${GREEN}✓ Sensitive files removed from tracking${NC}"
    echo "Run 'git commit -m \"security: Remove sensitive files from tracking\"' to commit changes"
}

# Function to show git status
show_git_status() {
    echo "Git status:"
    cd "$PROJECT_DIR"
    git status
}

# Function to run security check
security_check() {
    echo "Running security check..."
    cd "$PROJECT_DIR"
    
    echo ""
    echo "Checking for sensitive files in staging area..."
    if git diff --cached --name-only | grep -E '\.env$|serviceAccount|\.key$|\.pem$'; then
        echo -e "${RED}⚠️  WARNING: Sensitive files detected in staging area!${NC}"
        echo "Do NOT push to GitHub!"
    else
        echo -e "${GREEN}✓ No sensitive files in staging area${NC}"
    fi
    
    echo ""
    echo "Checking .gitignore..."
    if [ -f "backend/.gitignore" ]; then
        echo -e "${GREEN}✓ backend/.gitignore exists${NC}"
        if grep -q ".env" backend/.gitignore; then
            echo -e "${GREEN}✓ .env is in .gitignore${NC}"
        else
            echo -e "${RED}✗ .env is NOT in .gitignore${NC}"
        fi
    else
        echo -e "${RED}✗ backend/.gitignore not found${NC}"
    fi
    
    echo ""
    echo "Checking for .env.example..."
    if [ -f "backend/.env.example" ]; then
        echo -e "${GREEN}✓ backend/.env.example exists${NC}"
    else
        echo -e "${YELLOW}⚠️  backend/.env.example not found${NC}"
    fi
}

# Main loop
while true; do
    echo ""
    show_menu
    
    case $choice in
        1)
            delete_users_bulk
            ;;
        2)
            delete_users_simple
            ;;
        3)
            list_users
            ;;
        4)
            test_mongodb
            ;;
        5)
            verify_env
            ;;
        6)
            remove_sensitive_files
            ;;
        7)
            show_git_status
            ;;
        8)
            security_check
            ;;
        9)
            echo "Goodbye!"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option. Please try again.${NC}"
            ;;
    esac
done
