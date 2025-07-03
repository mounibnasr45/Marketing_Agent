@echo off
echo 🔍 BuiltWith Analyzer - Environment Troubleshooting
echo ================================================
echo.

echo 📋 Checking system requirements...
echo.

REM Check Python
echo [1/4] Python Installation:
python --version 2>nul
if %errorlevel% neq 0 (
    echo ❌ Python not found or not in PATH
    echo    Download from: https://python.org/
    echo    Make sure to check "Add Python to PATH" during installation
) else (
    echo ✅ Python found
    python -c "import sys; print(f'   Location: {sys.executable}')"
    python -c "import sys; print(f'   Version: {sys.version}')"
)
echo.

REM Check Node.js
echo [2/4] Node.js Installation:
node --version 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js not found or not in PATH
    echo    Download from: https://nodejs.org/
) else (
    echo ✅ Node.js found
    node -e "console.log('   Location:', process.execPath)"
    node -e "console.log('   Version:', process.version)"
)
echo.

REM Check pip
echo [3/4] pip (Python package manager):
pip --version 2>nul
if %errorlevel% neq 0 (
    echo ❌ pip not found
    echo    Try: python -m pip --version
    python -m pip --version 2>nul
    if %errorlevel% neq 0 (
        echo ❌ pip still not working
        echo    You may need to reinstall Python
    ) else (
        echo ✅ pip found via python -m pip
    )
) else (
    echo ✅ pip found
)
echo.

REM Check project structure
echo [4/4] Project Structure:
if exist "backend" (
    echo ✅ backend/ directory found
    if exist "backend\main.py" (
        echo ✅ backend\main.py found
    ) else (
        echo ❌ backend\main.py missing
    )
    if exist "backend\requirements.txt" (
        echo ✅ backend\requirements.txt found
    ) else (
        echo ❌ backend\requirements.txt missing
    )
    if exist "backend\.env.example" (
        echo ✅ backend\.env.example found
    ) else (
        echo ❌ backend\.env.example missing
    )
) else (
    echo ❌ backend/ directory not found
    echo    Make sure you're in the project root directory
)

if exist "package.json" (
    echo ✅ package.json found
) else (
    echo ❌ package.json missing
    echo    Make sure you're in the project root directory
)
echo.

echo 🛠️ Common Solutions:
echo.
echo "If Python/pip issues:"
echo "1. Reinstall Python from python.org"
echo "2. Check 'Add Python to PATH' during installation"
echo "3. Restart command prompt after installation"
echo.
echo "If backend won't start:"
echo "1. cd backend"
echo "2. python -m venv venv"
echo "3. venv\Scripts\activate.bat"
echo "4. python -m pip install --upgrade pip"
echo "5. pip install -r requirements.txt"
echo "6. python main.py"
echo.
echo "If frontend won't start:"
echo "1. Make sure you're in the project root"
echo "2. npm install"
echo "3. npm run dev"
echo.

pause
