#!/usr/bin/env bash

# AI Gig Insurance Platform - Universal Startup Script
# Automatically manages Python venv, dependencies, and multi-service orchestration.

set -e

BACKEND_PORT=4000
FRONTEND_PORT=5173
AI_PORT=8000

echo "----------------------------------------------------------------"
echo "🚀 Starting AI Gig Insurance Platform..."
echo "----------------------------------------------------------------"

# 1. Cleanup existing processes
kill_port() {
  PORT=$1
  PID=$(lsof -t -i:$PORT || true)
  if [ ! -z "$PID" ]; then
    echo "⚠ Port $PORT in use (PID: $PID). Cleaning up..."
    kill -9 $PID >/dev/null 2>&1 || true
    sleep 1
  fi
}

kill_port $BACKEND_PORT
kill_port $FRONTEND_PORT
kill_port $AI_PORT

# 2. Setup & Start AI Microservice (Background)
echo "🤖 [1/3] Starting AI Engine..."
(
  cd ai-model
  # Create venv if missing
  if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
  fi
  
  # Activate and check dependencies
  source venv/bin/activate
  
  # Check if requirements are met, if not install
  # Using a fast check via a temporary file to avoid redundant pip installs
  if [ ! -f "venv/.deps_installed" ]; then
    echo "📦 Installing AI dependencies (FastAPI, Uvicorn)..."
    pip install -q --upgrade pip
    pip install -q -r requirements.txt
    touch venv/.deps_installed
  fi
  
  echo "🧠 AI Model running on port $AI_PORT"
  exec uvicorn main:app --host 0.0.0.0 --port $AI_PORT --no-access-log > ai_model.log 2>&1
) &
AI_PID=$!

# 3. Build/Start Backend (Background)
echo "🖥 [2/3] Starting Spring Boot Backend..."
(
  cd backend
  # Ensure target exists, else build once
  if [ ! -d "target" ]; then
    echo "📦 Initial backend build..."
    mvn clean install -DskipTests -q
  fi
  # Redirecting to log to keep terminal clean
  exec mvn spring-boot:run -q > backend.log 2>&1
) &
BACK_PID=$!

# 4. Start Frontend (Background)
echo "🌐 [3/3] Starting React Frontend..."
(
  cd frontend
  if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install --silent
  fi
  # Vite is usually fast
  exec npm run dev -- --port $FRONTEND_PORT > frontend.log 2>&1
) &
FRONT_PID=$!

# 5. Wait for services to be ready
echo "----------------------------------------------------------------"
echo "⏳ Waiting for services to warm up..."
sleep 5

echo "✅ All services are active!"
echo "🤖 AI Engine → http://localhost:$AI_PORT"
echo "🖥 Backend   → http://localhost:$BACKEND_PORT"
echo "🌐 Frontend  → http://localhost:$FRONTEND_PORT"
echo "----------------------------------------------------------------"
echo "📝 Logs: ai-model/ai_model.log, backend/backend.log"
echo "🛑 Press Ctrl+C to stop all services."
echo "----------------------------------------------------------------"

# Handle Ctrl+C properly
cleanup() {
  echo -e "\n\n🛑 Stopping services..."
  kill $BACK_PID $FRONT_PID $AI_PID $TAIL_PID >/dev/null 2>&1 || true
  exit
}

trap cleanup INT TERM

# Keep the script alive and tail the logs so you can see them!
tail -f ai-model/ai_model.log backend/backend.log frontend/frontend.log &
TAIL_PID=$!

wait $BACK_PID $FRONT_PID $AI_PID