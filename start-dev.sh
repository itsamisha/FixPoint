#!/bin/bash

# FixPoint Development Startup Script
echo "=========================================="
echo "  FixPoint Development Server Startup"
echo "  Starting both Backend and Frontend"
echo "=========================================="
echo

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Java is available
if ! command -v java &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} Java is not installed. Please install Java 17 or higher."
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

echo -e "${BLUE}[INFO]${NC} Starting FixPoint Development Servers..."
echo

# Function to start backend
start_backend() {
    echo -e "${BLUE}[INFO]${NC} Starting Spring Boot backend on port 8080..."
    if command -v ./mvnw &> /dev/null; then
        ./mvnw spring-boot:run
    else
        mvn spring-boot:run
    fi
}

# Function to start frontend
start_frontend() {
    echo -e "${BLUE}[INFO]${NC} Starting React frontend on port 3000..."
    
    # Check if frontend dependencies are installed
    if [ ! -d "frontend/node_modules" ]; then
        echo -e "${BLUE}[INFO]${NC} Installing frontend dependencies..."
        cd frontend
        npm install
        cd ..
    fi
    
    cd frontend
    npm start
}

# Start backend in background
start_backend &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 5

# Start frontend in background
start_frontend &
FRONTEND_PID=$!

echo
echo -e "${GREEN}[SUCCESS]${NC} Both servers are starting!"
echo
echo "Backend: http://localhost:8080"
echo "Frontend: http://localhost:3000"
echo
echo "Press Ctrl+C to stop both servers..."

# Wait for user to stop
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

# Keep script running
wait
