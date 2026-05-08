#!/bin/bash

# Hila Setup Script
# This script sets up the complete Hila environment

echo "🚀 Setting up Hila - Generative UI for Financial Data"
echo ""

# Check if GEMINI_API_KEY is set
if [ -f "backend/.env" ]; then
    if grep -q "your_key_here" backend/.env; then
        echo "⚠️  WARNING: Please add your GEMINI_API_KEY to backend/.env"
        echo "   Edit backend/.env and replace 'your_key_here' with your actual API key"
        echo ""
    else
        echo "✅ Environment file configured"
    fi
else
    echo "⚠️  Creating .env file from template..."
    cp .env.example backend/.env
    echo "   Please edit backend/.env and add your GEMINI_API_KEY"
    echo ""
fi

# Check if virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv backend/venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment exists"
fi

# Install dependencies
echo "📦 Installing Python dependencies..."
backend/venv/bin/pip install -q -r backend/requirements.txt
echo "✅ Dependencies installed"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start Hila:"
echo ""
echo "1. Start the backend server:"
echo "   cd backend && ../backend/venv/bin/python main.py"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   cd frontend && python3 -m http.server 3000"
echo ""
echo "3. Open your browser to http://localhost:3000"
echo ""
echo "📚 See README.md for more details"
