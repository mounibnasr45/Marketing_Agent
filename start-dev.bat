@echo off
echo 🚀 Starting BuiltWith Analyzer Full Stack Application...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js is not installed or not in PATH
    echo Please install Node.js 18+ and try again
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    echo Download from: https://python.org/
    pause
    exit /b 1
)

echo ✅ Node.js and Python are installed
echo.

REM Check if backend directory exists
if not exist "backend" (
    echo ❌ Error: backend directory not found
    echo Make sure you're running this from the project root directory
    pause
    exit /b 1
)

REM Start backend in new window
echo � Starting Backend Server...
start "BuiltWith Analyzer Backend" cmd /k "cd /d "%~dp0backend" && start.bat"

REM Wait a moment for backend to start
echo ⏳ Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

REM Check if package.json exists for frontend
if not exist "package.json" (
    echo ❌ Error: package.json not found
    echo Make sure you're running this from the project root directory
    pause
    exit /b 1
)

REM Start frontend
echo 🌐 Starting Frontend Server...
echo.
echo 📍 Application URLs:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8000  
echo   API Docs: http://localhost:8000/docs
echo.

if exist "node_modules" (
    echo 📦 Dependencies found, starting development server...
    npm run dev
) else (
    echo 📦 Installing frontend dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Error: Failed to install frontend dependencies
        echo Try running: npm install
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed successfully
    npm run dev
)

pause
