# Face Emotion Recognition API

This Flask API integrates the trained AffectNet MobileNetV2 model for real-time emotion detection.

## Model Location

The model files are located in the `face-emotion-model` folder (parent directory):
- `../face-emotion-model/affectnet_mobilenetv2.h5` - The trained model
- `../face-emotion-model/labels.json` - Emotion labels mapping

## Setup

1. **Install Dependencies:**
   ```bash
   cd python_api
   pip install -r requirements.txt
   ```

2. **Verify Model Files:**
   The API will automatically look for the model in:
   ```
   ../face-emotion-model/affectnet_mobilenetv2.h5
   ../face-emotion-model/labels.json
   ```

3. **Start the API:**
   ```bash
   python app.py
   ```
   
   The API will run on `http://localhost:8000`

## API Endpoints

### GET `/health`
Health check endpoint. Returns API status and model information.

**Response:**
```json
{
  "status": "healthy",
  "message": "Face Emotion Recognition API is running",
  "model_status": "loaded",
  "emotions": ["Anger", "Contempt", "Disgust", "Fear", "Happy", "Neutral", "Sad", "Surprise"]
}
```

### POST `/predict`
Predict emotion from an image frame.

**Request Body:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "client_id": "client_123"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "emotion": "Happy",
  "confidence": 0.95,
  "all_emotions": {
    "Anger": 0.02,
    "Contempt": 0.01,
    "Disgust": 0.01,
    "Fear": 0.01,
    "Happy": 0.95,
    "Neutral": 0.05,
    "Sad": 0.01,
    "Surprise": 0.01
  },
  "bbox": [100, 150, 300, 350]  // Face bounding box
}
```

### POST `/reset`
Reset client state (useful when stopping detection).

**Request Body:**
```json
{
  "client_id": "client_123"  // Optional, defaults to "default"
}
```

## Model Details

- **Model:** AffectNet MobileNetV2
- **Input Size:** 224x224 RGB images
- **Emotions:** 8 classes (Anger, Contempt, Disgust, Fear, Happy, Neutral, Sad, Surprise)
- **Features:**
  - EMA smoothing for stable predictions
  - Emotion locking to prevent flickering
  - Neutral bias for better accuracy
  - Face detection using Haar Cascade

## Integration with Frontend

The frontend sends video frames to this API every 500ms (2 FPS) for real-time emotion detection. The API maintains per-client state for smooth emotion transitions.

## Troubleshooting

1. **Model not loading:**
   - Check that `face-emotion-model/affectnet_mobilenetv2.h5` exists
   - Verify the path is correct (should be in parent directory)
   - Check TensorFlow is installed correctly

2. **Face not detected:**
   - Ensure good lighting
   - Face should be clearly visible
   - Check camera permissions

3. **API connection errors:**
   - Verify the API is running on port 8000
   - Check CORS settings if accessing from different origin
   - Ensure firewall allows connections
