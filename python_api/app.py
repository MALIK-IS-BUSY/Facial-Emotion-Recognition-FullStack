"""
Face Emotion Recognition API
Integrated with the trained AffectNet MobileNetV2 model
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import cv2
import base64
import json
import os
from io import BytesIO
from PIL import Image
from collections import deque

# TensorFlow imports
from tensorflow.keras.models import load_model

app = Flask(__name__)
CORS(app)

# ================== MODEL CONFIG ==================
# Use model from face-emotion-model folder (parent directory)
# Get the absolute path of this file's directory
# CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
# # Go up one level to get the project root
# PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
# # Model is in face-emotion-model folder
# MODEL_DIR = os.path.join(PROJECT_ROOT, "face-emotion-model")
# MODEL_PATH = os.path.join(MODEL_DIR, "affectnet_mobilenetv2.h5")
# LABELS_JSON = os.path.join(MODEL_DIR, "labels.json")

# ================== MODEL CONFIG ==================
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

# Possible model locations (ordered by priority)
POSSIBLE_MODEL_DIRS = [
    os.path.join(CURRENT_DIR, "..", "face-emotion-model"),   # local dev
    os.path.join(CURRENT_DIR, "face-emotion-model"),         # fallback
    "/app/face-emotion-model",                                # container
]

MODEL_DIR = None
for path in POSSIBLE_MODEL_DIRS:
    path = os.path.abspath(path)
    if os.path.exists(path):
        MODEL_DIR = path
        break

if MODEL_DIR is None:
    raise FileNotFoundError("❌ face-emotion-model folder not found")

MODEL_PATH = os.path.join(MODEL_DIR, "affectnet_mobilenetv2.h5")
LABELS_JSON = os.path.join(MODEL_DIR, "labels.json")

IMG_SIZE = (224, 224)
# ==================================================



IMG_SIZE = (224, 224)

# EMA smoothing configuration
EMA_ALPHA = 0.35
CONF_THRESHOLD = 0.60
NEUTRAL_INDEX = 5  # Neutral is index 5 in labels.json
NEUTRAL_BIAS = 0.10
LOCK_FRAMES = 10

# ==================================================

# Global model and labels (loaded once at startup)
model = None
class_indices = None
idx_to_label = None
face_cascade = None

# Per-client state for EMA smoothing and emotion locking
client_states = {}

def load_model_and_labels():
    """Load the emotion recognition model and labels"""
    global model, class_indices, idx_to_label, face_cascade
    
    try:
        # Check if model file exists
        if not os.path.exists(MODEL_PATH):
            print(f"❌ Model file not found at: {MODEL_PATH}")
            print(f"💡 Expected location: {MODEL_DIR}")
            print(f"💡 Make sure the model is in the face-emotion-model folder")
            return False
        
        if not os.path.exists(LABELS_JSON):
            print(f"❌ Labels file not found at: {LABELS_JSON}")
            print(f"💡 Expected location: {MODEL_DIR}")
            return False
        
        print(f"📁 Model directory: {MODEL_DIR}")
        print(f"📊 Loading model from {MODEL_PATH}...")
        model = load_model(MODEL_PATH)
        print("✅ Model loaded successfully!")
        
        with open(LABELS_JSON, "r") as f:
            class_indices = json.load(f)
        
        idx_to_label = {v: k for k, v in class_indices.items()}
        print(f"✅ Labels loaded: {list(class_indices.keys())}")
        
        # Load face detector
        face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )
        print("✅ Face detector loaded!")
        
        return True
    except Exception as e:
        print(f"❌ Error loading model: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def preprocess_face(face_image):
    """
    Preprocess face image for model input
    Args:
        face_image: RGB image array (numpy array)
    Returns:
        Preprocessed image ready for model prediction
    """
    # Resize to model input size
    face_resized = cv2.resize(face_image, IMG_SIZE)
    
    # Normalize to [0, 1]
    face_normalized = face_resized.astype("float32") / 255.0
    
    # Expand dimensions for batch: (1, 224, 224, 3)
    face_batch = np.expand_dims(face_normalized, axis=0)
    
    return face_batch

def detect_face_in_image(image_array):
    """
    Detect face in image using Haar Cascade
    Returns: (face_roi, bbox) or (None, None)
    """
    if face_cascade is None:
        return None, None
    
    # Convert to grayscale for face detection
    if len(image_array.shape) == 3:
        gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
    else:
        gray = image_array
    
    # Detect faces
    faces = face_cascade.detectMultiScale(
        gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60)
    )
    
    if len(faces) > 0:
        # Pick largest face
        faces = sorted(faces, key=lambda b: b[2]*b[3], reverse=True)
        x, y, w, h = faces[0]
        
        # Add padding (20% of face width/height)
        pad = int(0.2 * w)
        x1 = max(0, x - pad)
        y1 = max(0, y - pad)
        x2 = min(image_array.shape[1], x + w + pad)
        y2 = min(image_array.shape[0], y + h + pad)
        
        # Extract face ROI (RGB)
        face_roi = image_array[y1:y2, x1:x2]
        
        return face_roi, (x1, y1, x2, y2)
    
    return None, None

def predict_emotion_with_smoothing(client_id, face_image):
    """
    Predict emotion with EMA smoothing and emotion locking
    Args:
        client_id: Unique client identifier (for state management)
        face_image: RGB face image array
    Returns:
        dict with emotion, confidence, and all probabilities
    """
    # Preprocess face
    face_batch = preprocess_face(face_image)
    
    # Get model prediction (exactly like original 4.py)
    probs = model.predict(face_batch, verbose=0)[0]
    
    # Ensure numpy array (don't convert type unnecessarily - keep original)
    if not isinstance(probs, np.ndarray):
        probs = np.array(probs, dtype=np.float32)
    
    # Apply neutral bias
    probs[NEUTRAL_INDEX] += NEUTRAL_BIAS
    probs = probs / np.sum(probs)  # Renormalize
    
    # Initialize or get client state
    if client_id not in client_states:
        client_states[client_id] = {
            'ema_probs': None,
            'locked_emotion': None,
            'lock_counter': 0
        }
    
    state = client_states[client_id]
    
    # EMA smoothing (exactly like original 4.py)
    if state['ema_probs'] is None:
        state['ema_probs'] = probs.copy()  # Make a copy to avoid reference issues
    else:
        state['ema_probs'] = EMA_ALPHA * probs + (1 - EMA_ALPHA) * state['ema_probs']
    
    # Get prediction from smoothed probabilities (exactly like original 4.py)
    pred_idx = int(np.argmax(state['ema_probs']))
    pred_conf = float(state['ema_probs'][pred_idx])  # Direct conversion
    pred_label = idx_to_label[pred_idx]
    
    # Emotion locking (prevents flicker)
    if state['locked_emotion'] is None or state['lock_counter'] <= 0:
        if pred_conf >= CONF_THRESHOLD:
            state['locked_emotion'] = pred_label
            state['lock_counter'] = LOCK_FRAMES
        else:
            state['locked_emotion'] = "Neutral"
    else:
        state['lock_counter'] -= 1
    
    # Build all emotions dict (convert numpy types to native Python types for JSON)
    all_emotions = {}
    for i in range(len(idx_to_label)):
        emotion_name = idx_to_label[i]
        emotion_prob = float(state['ema_probs'][i])  # Direct conversion
        all_emotions[emotion_name] = emotion_prob
    
    return {
        'emotion': state['locked_emotion'],
        'confidence': float(state['ema_probs'][pred_idx]),
        'all_emotions': all_emotions,
        'raw_confidence': float(pred_conf)
    }

def reset_client_state(client_id):
    """Reset EMA state for a client (when no face detected)"""
    if client_id in client_states:
        client_states[client_id] = {
            'ema_probs': None,
            'locked_emotion': None,
            'lock_counter': 0
        }

# Load model at startup
if not load_model_and_labels():
    print("⚠️  Warning: Model failed to load. API will not work properly.")

@app.route('/health', methods=['GET'])
@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    model_status = "loaded" if model is not None else "not loaded"
    return jsonify({
        'status': 'healthy',
        'message': 'Face Emotion Recognition API is running',
        'model_status': model_status,
        'emotions': list(class_indices.keys()) if class_indices else []
    })

@app.route('/predict', methods=['POST'])
def predict_emotion():
    """
    Predict emotion from image frame
    Expects JSON with:
    - 'image': base64 encoded image (data URI or raw base64)
    - 'client_id': optional client identifier for state management
    """
    try:
        if model is None:
            return jsonify({
                'success': False,
                'error': 'Model not loaded',
                'emotion': None,
                'confidence': 0.0
            }), 500
        
        data = request.get_json()
        
        if 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400
        
        # Get client ID (use default if not provided)
        client_id = data.get('client_id', 'default')
        
        # Decode base64 image
        image_data = data['image']
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes))
        image_array = np.array(image)
        
        # Convert RGBA to RGB if needed
        if image_array.shape[2] == 4:
            image_array = cv2.cvtColor(image_array, cv2.COLOR_RGBA2RGB)
        elif len(image_array.shape) == 2:
            image_array = cv2.cvtColor(image_array, cv2.COLOR_GRAY2RGB)
        
        # Detect face
        face_roi, bbox = detect_face_in_image(image_array)
        
        if face_roi is None or face_roi.size == 0:
            reset_client_state(client_id)
            return jsonify({
                'success': False,
                'error': 'No face detected',
                'emotion': None,
                'confidence': 0.0,
                'all_emotions': {}
            }), 200  # Return 200 but with success: false
        
        # Predict emotion
        result = predict_emotion_with_smoothing(client_id, face_roi)
        
        # Convert bbox to list of native Python ints (not numpy int64)
        bbox_list = None
        if bbox:
            bbox_list = [int(x) for x in bbox]
        
        # Ensure all values are native Python types for JSON serialization
        return jsonify({
            'success': True,
            'emotion': str(result['emotion']),
            'confidence': float(result['confidence']),
            'all_emotions': {str(k): float(v) for k, v in result['all_emotions'].items()},
            'bbox': bbox_list
        })
        
    except Exception as e:
        error_msg = str(e)
        print(f"Error in /predict: {error_msg}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': error_msg,
            'emotion': None,
            'confidence': 0.0
        }), 500

@app.route('/reset', methods=['POST'])
def reset_state():
    """
    Reset client state (useful when stopping detection)
    """
    try:
        data = request.get_json() or {}
        client_id = data.get('client_id', 'default')
        reset_client_state(client_id)
        return jsonify({
            'success': True,
            'message': f'State reset for client {client_id}'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    print(f"🚀 Starting Face Emotion Recognition API on port {port}")
    print(f"📁 Project root: {PROJECT_ROOT}")
    print(f"📁 Model directory: {MODEL_DIR}")
    print(f"📊 Model path: {MODEL_PATH}")
    print(f"🏷️  Emotions: {list(class_indices.keys()) if class_indices else 'Not loaded'}")
    print(f"\n💡 Make sure the model file exists in: {MODEL_DIR}")
    app.run(host='0.0.0.0', port=port, debug=True, threaded=True)
