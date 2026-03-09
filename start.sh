#!/usr/bin/env bash
# start.sh - launch backend and frontend services concurrently
# Run from project root: ./start.sh

set -e

# function to start backend
start_backend() {
  echo "Starting backend..."
  cd backend
  mvn spring-boot:run
}

# function to start frontend
start_frontend() {
  echo "Starting frontend..."
  cd frontend
  npm run dev
}

# ensure we have dependencies installed
if [ ! -d "backend/target" ]; then
  echo "Building backend dependencies..."
  (cd backend && mvn clean install)
fi

if [ ! -d "frontend/node_modules" ]; then
  echo "Installing frontend dependencies..."
  (cd frontend && npm install)
fi

# run both in separate background processes
start_backend &
BACK_PID=$!

# give backend a moment to come up before starting frontend
sleep 2

start_frontend &
FRONT_PID=$!

echo "backend PID=${BACK_PID}, frontend PID=${FRONT_PID}"

echo "Press Ctrl+C to stop both services."

# wait for background jobs
wait $BACK_PID
wait $FRONT_PID
