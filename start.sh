#!/usr/bin/env bash

echo "===================================="
echo "Starting AI Gig Insurance Platform"
echo "===================================="

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install

# Build backend
echo "Building backend..."
cd ../backend
mvn clean install -DskipTests

# Start backend
echo "Starting backend..."
mvn spring-boot:run &
BACKEND_PID=$!

# Start frontend
echo "Starting frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "===================================="
echo "Backend: http://localhost:4000"
echo "Frontend: http://localhost:5173"
echo "===================================="

# Wait few seconds for servers to start
sleep 5

# Detect OS and open browser
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:5173
elif [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:5173
elif [[ "$OSTYPE" == "msys"* ]] || [[ "$OSTYPE" == "cygwin"* ]]; then
    start http://localhost:5173
fi

wait $BACKEND_PID $FRONTEND_PID