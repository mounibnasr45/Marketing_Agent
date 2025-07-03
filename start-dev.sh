#!/bin/bash

echo "Starting BuiltWith Analyzer Full Stack Application..."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed or not in PATH"
    echo "Please install Node.js 18+ and try again"
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed or not in PATH"
    echo "Please install Python 3.8+ and try again"
    exit 1
fi

echo "✅ Node.js and Python are installed"
echo

# Start backend in background
echo "🚀 Starting Backend Server..."
cd backend
./start.sh &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🌐 Starting Frontend Server..."
echo "Frontend will be available at: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo

if [ -d "node_modules" ]; then
    npm run dev
else
    echo "Installing frontend dependencies..."
    npm install
    npm run dev
fi

# Cleanup function
cleanup() {
    echo "Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

wait
