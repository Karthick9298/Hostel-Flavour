# Hostel Food Analysis Platform

A comprehensive web application for collecting and analyzing hostel food feedback from students, providing data-driven insights to improve food quality.

## 🚀 Features

### For Students
- **Authentication**: Secure login with Firebase (Email/Password + Google OAuth)
- **Daily Feedback**: Submit ratings (0-5 stars) and comments for 4 daily meals
- **Time-based Submission**: Meal-specific time windows for feedback submission
- **Progress Tracking**: View personal submission statistics
- **Responsive Design**: Mobile-friendly interface

### For Administrators
- **Analytics Dashboard**: Comprehensive data visualization and insights
- **AI-Powered Suggestions**: Intelligent recommendations for food improvement
- **Comment Analysis**: Review and analyze student feedback
- **Export Options**: PDF/Excel reports (coming soon)
- **User Management**: Monitor student participation and engagement

## 🛠️ Tech Stack

### Frontend
- **React 19** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Chart.js** for data visualization
- **Firebase Authentication**
- **Axios** for API calls
- **React Hot Toast** for notifications

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Firebase Admin SDK**
- **Free LLM API** (Hugging Face) for AI suggestions
- **Express Rate Limiting** and security middleware

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Firebase project setup
- Git

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd HFa
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your Firebase configuration
```

### 4. Environment Configuration

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hostel-food-analysis
JWT_SECRET=your-super-secret-jwt-key
HUGGINGFACE_API_KEY=your-huggingface-api-key
FIREBASE_PROJECT_ID=your-firebase-project-id
CORS_ORIGIN=http://localhost:5173
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

### 5. Database Setup

1. Start MongoDB service
2. The application will automatically create the required collections
3. To create an admin user, manually update a user document in MongoDB:
   ```javascript
   c
   ```

### 6. Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication with Email/Password and Google providers
3. For production, configure authorized domains
4. Add your Firebase configuration to the frontend .env file

## 🚀 Running the Application

### Development Mode

#### Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```

#### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 📊 Key Features Explained

### Meal Submission Windows
- **Morning**: Available after 9:00 AM
- **Afternoon**: Available after 12:00 PM
- **Evening**: Available after 5:00 PM
- **Night**: Available after 8:00 PM

### User Roles
- **Students**: Can submit feedback and view submission statistics
- **Admins**: Can view all analytics, comments, and AI suggestions

### Security Features
- JWT-based authentication
- Firebase integration for secure user management
- Rate limiting and input validation
- CORS protection
- Helmet.js for security headers

## 🎯 Usage Guidelines

### For Students
1. Register with your email and student details
2. Login daily to submit meal feedback
3. Rate meals on a 0-5 star scale
4. Add optional comments for detailed feedback
5. View your submission progress

### For Administrators
1. Login with admin credentials
2. Access comprehensive analytics dashboard
3. Review daily and weekly food ratings
4. Analyze student comments and feedback trends
5. Get AI-powered improvement suggestions

## 🔮 Future Enhancements

- [ ] Export functionality (PDF/Excel)
- [ ] Email notifications for low ratings
- [ ] Menu integration and planning
- [ ] Mobile application
- [ ] Advanced analytics and reporting
- [ ] Integration with hostel management systems

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Firebase for authentication services
- MongoDB for database solutions
- Hugging Face for AI/ML capabilities
- React and Node.js communities

---

**Built with ❤️ for GVPCE Students**
