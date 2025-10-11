#!/bin/bash

# Hostel Food Analysis - Setup and Start Script

echo "🚀 Starting Hostel Food Analysis Platform..."

# Check if MongoDB is running
echo "📊 Checking MongoDB..."
if ! pgrep mongod > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   sudo systemctl start mongod"
    echo "   OR"
    echo "   mongod --dbpath /path/to/your/data/directory"
    exit 1
fi

echo "✅ MongoDB is running"

# Start Backend
echo "🔧 Starting Backend Server..."
cd backend
npm run dev &
BACKEND_PID=$!
echo "✅ Backend started with PID: $BACKEND_PID"

# Wait a moment for backend to start
sleep 3

# Start Frontend
echo "🎨 Starting Frontend Development Server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend started with PID: $FRONTEND_PID"

echo ""
echo "🎉 Both servers are now running!"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:5000"
echo "🏥 Health:   http://localhost:5000/health"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
