@echo off
echo 🚀 Starting BuiltWith Analyzer Backend (Modular)
echo ================================================
echo.

REM Check if we're in the right directory
if not exist "main_new.py" (
    echo ❌ main_new.py not found
    echo Please make sure you're in the backend directory
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist "venv" (
    echo ⚠️ Virtual environment not found
    echo Please run setup-manual.bat first to create the virtual environment
    pause
    exit /b 1
)

REM Activate virtual environment
echo 📦 Activating virtual environment...
call venv\Scripts\activate.bat

REM Start the server
echo 🌐 Starting server on http://localhost:8000
echo.
echo Available endpoints:
echo   - http://localhost:8000/          (API info)
echo   - http://localhost:8000/docs      (API documentation)
echo   - http://localhost:8000/health    (Health check)
echo.
echo Press Ctrl+C to stop the server
echo.

python main_new.py
