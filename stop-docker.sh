#!/bin/bash

echo "============================================"
echo "Purchase Pro - Docker Stop Script"
echo "============================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "WARNING: Docker is not running!"
    echo "Containers may already be stopped."
    exit 0
fi

echo "Stopping all Purchase Pro containers..."
echo ""
docker-compose down

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Failed to stop containers!"
    echo "Check the error messages above."
    exit 1
fi

echo ""
echo "============================================"
echo "All containers stopped successfully!"
echo "============================================"
echo ""
echo "To start again: ./start-docker.sh"
echo "To remove all data: docker-compose down -v"
echo ""
