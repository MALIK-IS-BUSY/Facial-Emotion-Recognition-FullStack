#!/bin/bash

# Start Python Flask API for Face Emotion Recognition

echo "🚀 Starting Face Emotion Recognition API..."
echo ""

# Check if we're in the right directory
if [ ! -f "app.py" ]; then
    echo "❌ Error: app.py not found!"
    echo "💡 Make sure you're in the python_api directory"
    exit 1
fi

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: python3 not found!"
    exit 1
fi

# Check if model exists
MODEL_PATH="../face-emotion-model/affectnet_mobilenetv2.h5"
if [ ! -f "$MODEL_PATH" ]; then
    echo "❌ Error: Model file not found at $MODEL_PATH"
    echo "💡 Make sure the model is in the face-emotion-model folder"
    exit 1
fi

echo "✅ Model file found"
echo "📦 Installing/checking dependencies..."
pip3 install -q flask flask-cors numpy tensorflow opencv-python pillow 2>&1 | grep -v "already satisfied" || true

echo ""
echo "🚀 Starting Flask server on port 8000..."
echo "💡 Press Ctrl+C to stop the server"
echo ""

# Start the Flask server
python3 app.py

