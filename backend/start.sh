#!/bin/bash

echo "Starting BuiltWith Analyzer Backend..."
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed or not in PATH"
    echo "Please install Python 3.8+ and try again"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo
    echo "WARNING: .env file not found!"
    echo "Please copy .env.example to .env and fill in your API keys:"
    echo "  - APIFY_API_TOKEN"
    echo "  - BUILTWITH_API_KEY"
    echo "  - OPENROUTER_API_KEY"
    echo "  - SUPABASE_URL"
    echo "  - SUPABASE_KEY"
    echo
    echo "The server will start with mock data for testing..."
    echo
fi

# Start the server
echo "Starting FastAPI server..."
echo "Server will be available at: http://localhost:8000"
echo "Health check: http://localhost:8000/health"
echo "API docs: http://localhost:8000/docs"
echo
uvicorn main:app --reload --host 0.0.0.0 --port 8000
