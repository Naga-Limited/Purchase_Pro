#!/bin/bash

echo "============================================"
echo "Purchase Pro - Docker Startup Script"
echo "============================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "ERROR: Docker is not running!"
    echo "Please start Docker and try again."
    exit 1
fi

echo "[1/5] Docker is running..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "[2/5] Creating .env file from .env.docker..."
    cp .env.docker .env
    echo "Please review and update .env file with your settings."
    echo ""
else
    echo "[2/5] .env file already exists..."
    echo ""
fi

echo "[3/5] Building and starting Docker containers..."
echo "This may take 5-10 minutes on first run..."
echo ""
docker-compose up -d --build

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Failed to start containers!"
    echo "Check the error messages above."
    exit 1
fi

echo ""
echo "[4/5] Waiting for services to initialize (30 seconds)..."
sleep 30

echo ""
echo "[5/5] Checking service status..."
docker-compose ps

echo ""
echo "============================================"
echo "Purchase Pro is starting up!"
echo "============================================"
echo ""
echo "Services:"
echo "  Frontend:    http://localhost:3000"
echo "  Backend API: http://localhost:8080"
echo "  phpMyAdmin:  http://localhost:8081"
echo ""
echo "Credentials for phpMyAdmin:"
echo "  Server:   db"
echo "  Username: purchase_user"
echo "  Password: purchase_password"
echo ""
echo "To view logs:     docker-compose logs -f"
echo "To stop:          docker-compose down"
echo "To restart:       docker-compose restart"
echo ""
echo "Note: First startup may take a few more minutes"
echo "      for installing dependencies."
echo ""

# Ask if user wants to see logs
read -p "Would you like to view the logs now? (y/n): " view_logs
if [ "$view_logs" = "y" ] || [ "$view_logs" = "Y" ]; then
    echo ""
    echo "Viewing logs (Press Ctrl+C to exit)..."
    docker-compose logs -f
fi
