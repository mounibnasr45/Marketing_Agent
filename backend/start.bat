@echo off
echo Starting BuiltWith Analyzer Backend...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

echo ✅ Python found
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo Error: Failed to create virtual environment
        echo Make sure you have the latest Python version installed
        pause
        exit /b 1
    )
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat
if %errorlevel% neq 0 (
    echo Error: Failed to activate virtual environment
    pause
    exit /b 1
)

REM Upgrade pip first
echo 📈 Upgrading pip...
python -m pip install --upgrade pip

REM Install dependencies
echo 📦 Installing Python dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    echo Check if requirements.txt exists and is valid
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist ".env" (
    echo.
    echo ⚠️  WARNING: .env file not found!
    echo Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo ✅ .env file created with your API keys
    echo.
) else (
    echo ✅ .env file found
)

REM Start the server
echo.
echo 🚀 Starting FastAPI server...
echo 📍 Server will be available at: http://localhost:8000
echo 🔍 Health check: http://localhost:8000/health
echo 📚 API docs: http://localhost:8000/docs
echo.
echo 💡 Tip: Keep this window open while using the application
echo ⏹️  Press Ctrl+C to stop the server
echo.

uvicorn main:app --reload --host 0.0.0.0 --port 8000
