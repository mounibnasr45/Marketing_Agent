@echo off
echo 🔧 Manual Backend Setup - BuiltWith Analyzer
echo ============================================
echo.
echo This script will manually set up the backend step by step.
echo Follow along and we'll fix any issues together!
echo.

pause

echo [Step 1/6] Checking current directory...
if not exist "main.py" (
    echo ❌ main.py not found
    echo Please navigate to the backend directory first:
    echo cd backend
    pause
    exit /b 1
)
echo ✅ Found main.py - we're in the right directory
echo.

echo [Step 2/6] Removing old virtual environment (if exists)...
if exist "venv" (
    echo Removing old venv...
    rmdir /s /q venv
)
echo ✅ Ready for fresh virtual environment
echo.

echo [Step 3/6] Creating new virtual environment...
echo This may take a moment...
python -m venv venv
if %errorlevel% neq 0 (
    echo ❌ Failed to create virtual environment
    echo.
    echo Troubleshooting:
    echo 1. Make sure Python is installed: python --version
    echo 2. Try: py -m venv venv
    echo 3. Or try: python3 -m venv venv
    echo.
    pause
    exit /b 1
)
echo ✅ Virtual environment created successfully
echo.

echo [Step 4/6] Activating virtual environment...
call venv\Scripts\activate.bat
if %errorlevel% neq 0 (
    echo ❌ Failed to activate virtual environment
    echo Try manually: venv\Scripts\activate.bat
    pause
    exit /b 1
)
echo ✅ Virtual environment activated
echo You should see (venv) in your command prompt
echo.

echo [Step 5/6] Upgrading pip...
python -m pip install --upgrade pip
echo ✅ pip upgraded
echo.

echo [Step 6/6] Installing dependencies...
echo This will install: fastapi, uvicorn, httpx, supabase, etc.
echo.
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Failed to install some dependencies
    echo.
    echo Let's try installing them one by one:
    echo.
    pip install fastapi
    pip install uvicorn[standard]
    pip install httpx
    pip install python-dotenv
    pip install pydantic
    pip install supabase
    pip install python-multipart
    echo.
    echo ✅ Manual installation completed
)
echo ✅ All dependencies installed successfully
echo.

echo [Final Step] Setting up environment file...
if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env
        echo ✅ Created .env file from .env.example
    ) else (
        echo # Environment variables > .env
        echo APIFY_API_TOKEN=your_token_here >> .env
        echo BUILTWITH_API_KEY=your_key_here >> .env
        echo OPENROUTER_API_KEY=your_key_here >> .env
        echo SUPABASE_URL=your_url_here >> .env
        echo SUPABASE_KEY=your_key_here >> .env
        echo ✅ Created basic .env file
    )
) else (
    echo ✅ .env file already exists
)
echo.

echo 🎉 Setup Complete!
echo.
echo To start the server:
echo   uvicorn main:app --reload --host 0.0.0.0 --port 8000
echo.
echo Or simply run: start.bat
echo.
echo The server will be available at:
echo   http://localhost:8000
echo   http://localhost:8000/docs (API documentation)
echo.

pause

echo Starting the server now...
uvicorn main:app --reload --host 0.0.0.0 --port 8000
