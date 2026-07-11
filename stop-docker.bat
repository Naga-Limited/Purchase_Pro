@echo off
echo ============================================
echo Purchase Pro - Docker Stop Script
echo ============================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Docker is not running!
    echo Containers may already be stopped.
    pause
    exit /b 0
)

echo Stopping all Purchase Pro containers...
echo.
docker-compose down

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to stop containers!
    echo Check the error messages above.
    pause
    exit /b 1
)

echo.
echo ============================================
echo All containers stopped successfully!
echo ============================================
echo.
echo To start again: run start-docker.bat
echo To remove all data: docker-compose down -v
echo.

pause
