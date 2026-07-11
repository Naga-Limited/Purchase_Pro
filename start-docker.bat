@echo off
echo ============================================
echo Purchase Pro - Docker Startup Script
echo ============================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [1/5] Docker is running...
echo.

REM Check if .env file exists
if not exist .env (
    echo [2/5] Creating .env file from .env.docker...
    copy .env.docker .env
    echo Please review and update .env file with your settings.
    echo.
) else (
    echo [2/5] .env file already exists...
    echo.
)

echo [3/5] Building and starting Docker containers...
echo This may take 5-10 minutes on first run...
echo.
docker-compose up -d --build

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to start containers!
    echo Check the error messages above.
    pause
    exit /b 1
)

echo.
echo [4/5] Waiting for services to initialize (30 seconds)...
timeout /t 30 /nobreak >nul

echo.
echo [5/5] Checking service status...
docker-compose ps

echo.
echo ============================================
echo Purchase Pro is starting up!
echo ============================================
echo.
echo Services:
echo   Frontend:    http://localhost:3000
echo   Backend API: http://localhost:8080
echo   phpMyAdmin:  http://localhost:8081
echo.
echo Credentials for phpMyAdmin:
echo   Server:   db
echo   Username: purchase_user
echo   Password: purchase_password
echo.
echo To view logs:     docker-compose logs -f
echo To stop:          docker-compose down
echo To restart:       docker-compose restart
echo.
echo Note: First startup may take a few more minutes
echo       for installing dependencies.
echo.

REM Ask if user wants to see logs
set /p view_logs="Would you like to view the logs now? (y/n): "
if /i "%view_logs%"=="y" (
    echo.
    echo Viewing logs (Press Ctrl+C to exit)...
    docker-compose logs -f
)

pause
