#!/usr/bin/env bash

set -e

BACKEND_PORT=4000
FRONTEND_PORT=5173

echo "🚀 Starting AI Gig Insurance Platform..."

kill_port() {
PORT=$1
PID=$(lsof -t -i:$PORT || true)

if [ ! -z "$PID" ]; then
echo "⚠ Port $PORT already in use. Killing process $PID..."
kill -9 $PID
sleep 2
else
echo "✅ Port $PORT is free"
fi
}

kill_port $BACKEND_PORT
kill_port $FRONTEND_PORT

if [ ! -d "backend/target" ]; then
echo "📦 Building backend..."
(cd backend && mvn clean install -DskipTests)
else
echo "✅ Backend already built"
fi

if [ ! -d "frontend/node_modules" ]; then
echo "📦 Installing frontend dependencies..."
(cd frontend && npm install)
else
echo "✅ Frontend dependencies already installed"
fi

echo "🖥 Starting Spring Boot backend..."

(
cd backend
mvn spring-boot:run
) &

BACK_PID=$!

echo "Backend running on port $BACKEND_PORT (PID=$BACK_PID)"

sleep 6

echo "🌐 Starting frontend..."

(
cd frontend
npm run dev
) &

FRONT_PID=$!

echo "Frontend running on port $FRONTEND_PORT (PID=$FRONT_PID)"

echo ""
echo "✅ Application started successfully!"
echo "Frontend → [http://localhost:$FRONTEND_PORT](http://localhost:$FRONTEND_PORT)"
echo "Backend → [http://localhost:$BACKEND_PORT](http://localhost:$BACKEND_PORT)"
echo ""
echo "Press Ctrl+C to stop services."

wait $BACK_PID
wait $FRONT_PID