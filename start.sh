#!/bin/bash

# Quick Start Script - Starts both backend and frontend

echo "🚀 Starting Hila..."
echo ""

# Check if API key is configured
if grep -q "your_key_here" backend/.env 2>/dev/null; then
    echo "❌ ERROR: GEMINI_API_KEY not configured!"
    echo ""
    echo "Please follow these steps:"
    echo "1. Get your API key from https://aistudio.google.com/"
    echo "2. Edit backend/.env and replace 'your_key_here' with your actual key"
    echo "3. Run this script again"
    echo ""
    exit 1
fi

echo "✅ API key configured"
echo ""

# Start backend in background
echo "🔧 Starting backend server on http://localhost:8000..."
cd backend
venv/bin/python real_main.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend server on http://localhost:3000..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Hila is running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

cd frontend
python3 -m http.server 3000

# Cleanup on exit
kill $BACKEND_PID 2>/dev/null
