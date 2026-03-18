@echo off
echo ============================================
echo  PlantCommerce Resource Downloader
echo ============================================
echo.

REM Check for Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH.
    echo Download Python from https://python.org/downloads
    pause
    exit /b 1
)

REM Install requests if needed
pip show requests >nul 2>&1
if errorlevel 1 (
    echo Installing requests library...
    pip install requests
)

echo.
echo Starting downloads...
echo Files will be saved to: %~dp0downloads\
echo.

python "%~dp0download_resources.py"

echo.
echo Done! Check download_resources.log for details.
pause
