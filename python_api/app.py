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
import traceback

# TensorFlow / Keras imports
from tensorflow.keras.models import load_model

app = Flask(__name__)
CORS(app)

# ================== MODEL CONFIG ==================
# Keep the model and labels inside the python_api folder (same folder as this file)
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(CURRENT_DIR, "affectnet_mobilenetv2.h5")
LABELS_JSON = os.path.join(CURRENT_DIR, "labels.json")

IMG_SIZE = (224, 224)

# EMA smoothing configuration
EMA_ALPHA = 0.35
CONF_THRESHOLD = 0.60
NEUTRAL_INDEX = 5  # Neutral is index 5 in labels.json (adjust if your labels differ)
NEUTRAL_BIAS = 0.10
LOCK_FRAMES = 10

# ==================================================

# Global model and labels (loaded once at startup)
model = None
class_indices = None   # mapping label->index
idx_to_label = None    # mapping index->label (int->str)
face_cascade = None

# Per-client state for EMA smoothing and emotion locking
client_states = {}

def load_model_and_labels():
    """Load the emotion recognition model and labels (from current folder)."""
    global model, class_indices, idx_to_label, face_cascade

    try:
        print("\n🔍 Checking model and label files...")
        print(f"📁 Model path: {MODEL_PATH}")
        print(f"📁 Labels path: {LABELS_JSON}")

        if not os.path.exists(MODEL_PATH):
            print(f"❌ Model file not found at: {MODEL_PATH}")
            return False

        if not os.path.exists(LABELS_JSON):
            print(f"❌ Labels file not found at: {LABELS_JSON}")
            return False

        print("📊 Loading model (this may take a few seconds)...")
        model = load_model(MODEL_PATH)
        print("✅ Model loaded successfully!")

        with open(LABELS_JSON, "r") as f:
            class_indices = json.load(f)

        # Ensure indices are ints and build reverse mapping
        try:
            # If labels.json is like {"happy": 0, "sad": 1}
            class_indices = {k: int(v) for k, v in class_indices.items()}
        except Exception:
            # If already ints fine
            pass

        idx_to_label = {int(v): k for k, v in class_indices.items()}
        print(f"✅ Labels loaded: {list(class_indices.keys())}")

        # Load Haar Cascade face detector (from OpenCV install)
        # If you want to bundle cascade locally, put haarcascade_frontalface_default.xml in this folder
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        if not os.path.exists(cascade_path):
            # fallback: local file
            local_cascade = os.path.join(CURRENT_DIR, "haarcascade_frontalface_default.xml")
            if os.path.exists(local_cascade):
                cascade_path = local_cascade

        face_cascade = cv2.CascadeClassifier(cascade_path)
        if face_cascade.empty():
            print("⚠️  Failed to load Haar cascade - face detection will not work.")
            face_cascade = None
        else:
            print("✅ Face detector loaded!")

        return True

    except Exception as e:
        print("❌ Error loading model/labels:")
        traceback.print_exc()
        return False


def preprocess_face(face_image):
    """
    Preprocess face image (RGB uint8 numpy array) for model input.
    Returns: shape (1, H, W, 3) float32 normalized [0,1]
    """
    # Ensure face_image is RGB
    if face_image is None:
        raise ValueError("face_image is None in preprocess_face")

    # If image is grayscale convert to RGB
    if face_image.ndim == 2:
        face_image = cv2.cvtColor(face_image, cv2.COLOR_GRAY2RGB)
    elif face_image.shape[2] == 4:
        face_image = cv2.cvtColor(face_image, cv2.COLOR_RGBA2RGB)

    face_resized = cv2.resize(face_image, IMG_SIZE)
    face_normalized = face_resized.astype("float32") / 255.0
    face_batch = np.expand_dims(face_normalized, axis=0)
    return face_batch


def detect_face_in_image(image_array):
    """
    Detect face in image using Haar Cascade.
    Input: image_array in RGB (H,W,3) or grayscale
    Returns: (face_roi_rgb, bbox) where bbox = (x1,y1,x2,y2) or (None, None)
    """
    if face_cascade is None:
        return None, None

    # Convert to grayscale for detection
    if image_array.ndim == 3 and image_array.shape[2] == 3:
        gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
    elif image_array.ndim == 3 and image_array.shape[2] == 4:
        gray = cv2.cvtColor(image_array, cv2.COLOR_RGBA2GRAY)
    else:
        # already grayscale or unexpected shape
        gray = image_array if image_array.ndim == 2 else cv2.cvtColor(image_array, cv2.COLOR_BGR2GRAY)

    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60))

    if len(faces) > 0:
        faces = sorted(faces, key=lambda b: b[2] * b[3], reverse=True)
        x, y, w, h = faces[0]
        pad_w = int(0.2 * w)
        pad_h = int(0.2 * h)
        x1 = max(0, x - pad_w)
        y1 = max(0, y - pad_h)
        x2 = min(image_array.shape[1], x + w + pad_w)
        y2 = min(image_array.shape[0], y + h + pad_h)

        # Extract ROI in RGB
        roi = image_array[y1:y2, x1:x2].copy()
        # If ROI has alpha channel, convert to RGB
        if roi.ndim == 3 and roi.shape[2] == 4:
            roi = cv2.cvtColor(roi, cv2.COLOR_RGBA2RGB)
        # If grayscale, convert to RGB
        if roi.ndim == 2:
            roi = cv2.cvtColor(roi, cv2.COLOR_GRAY2RGB)

        return roi, (x1, y1, x2, y2)

    return None, None


def predict_emotion_with_smoothing(client_id, face_image):
    """
    Predict emotion with EMA smoothing and emotion locking.
    - face_image must be RGB uint8 numpy array
    Returns: dict with emotion, confidence, all_emotions, raw_confidence
    """
    if model is None:
        raise RuntimeError("Model is not loaded")

    face_batch = preprocess_face(face_image)
    probs = model.predict(face_batch, verbose=0)[0]

    # Ensure numpy array and float type
    probs = np.array(probs, dtype=np.float32)

    # Apply neutral bias if neutral index exists
    if 0 <= NEUTRAL_INDEX < probs.shape[0]:
        probs[NEUTRAL_INDEX] += NEUTRAL_BIAS
        probs = probs / np.sum(probs)

    # Initialize client state
    if client_id not in client_states:
        client_states[client_id] = {
            "ema_probs": None,
            "locked_emotion": None,
            "lock_counter": 0
        }

    state = client_states[client_id]

    # EMA smoothing
    if state["ema_probs"] is None:
        state["ema_probs"] = probs.copy()
    else:
        state["ema_probs"] = EMA_ALPHA * probs + (1 - EMA_ALPHA) * state["ema_probs"]

    pred_idx = int(np.argmax(state["ema_probs"]))
    pred_conf = float(state["ema_probs"][pred_idx])
    pred_label = idx_to_label.get(pred_idx, "Unknown")

    # Emotion locking to prevent flicker
    if state["locked_emotion"] is None or state["lock_counter"] <= 0:
        if pred_conf >= CONF_THRESHOLD:
            state["locked_emotion"] = pred_label
            state["lock_counter"] = LOCK_FRAMES
        else:
            state["locked_emotion"] = "Neutral"
    else:
        state["lock_counter"] -= 1

    all_emotions = {}
    # Use idx_to_label keys sorted to remain stable
    for i in sorted(idx_to_label.keys()):
        label = idx_to_label[i]
        prob_val = float(state["ema_probs"][i]) if i < len(state["ema_probs"]) else 0.0
        all_emotions[label] = prob_val

    return {
        "emotion": state["locked_emotion"],
        "confidence": float(state["ema_probs"][pred_idx]),
        "all_emotions": all_emotions,
        "raw_confidence": float(pred_conf)
    }


def reset_client_state(client_id):
    """Reset EMA state for a client (when no face detected)"""
    client_states[client_id] = {
        "ema_probs": None,
        "locked_emotion": None,
        "lock_counter": 0
    }


# Load model at startup
if not load_model_and_labels():
    print("⚠️  Warning: Model failed to load. API will not work properly.")
else:
    print("✅ Model + labels ready.\n")


@app.route("/health", methods=["GET"])
@app.route("/", methods=["GET"])
def health_check():
    """Health check endpoint"""
    model_status = "loaded" if model is not None else "not loaded"
    return jsonify({
        "status": "healthy",
        "message": "Face Emotion Recognition API is running",
        "model_status": model_status,
        "emotions": list(class_indices.keys()) if class_indices else []
    })


@app.route("/predict", methods=["POST"])
def predict_emotion():
    """
    Predict emotion from image frame.
    Expects JSON with:
      - 'image': base64 encoded image (data URI or raw base64)
      - 'client_id': optional client identifier for state management
    """
    try:
        if model is None:
            return jsonify({
                "success": False,
                "error": "Model not loaded",
                "emotion": None,
                "confidence": 0.0
            }), 500

        data = request.get_json()
        if not data or "image" not in data:
            return jsonify({"error": "No image provided"}), 400

        client_id = data.get("client_id", "default")

        # Decode base64 image (accept data URI or raw base64)
        image_data = data["image"]
        if isinstance(image_data, str) and image_data.startswith("data:image"):
            image_data = image_data.split(",", 1)[1]

        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
        image_array = np.array(image)  # RGB

        # Convert to RGB if needed (PIL convert ensures RGB)
        if image_array.ndim == 2:
            image_array = cv2.cvtColor(image_array, cv2.COLOR_GRAY2RGB)

        # Detect face
        face_roi, bbox = detect_face_in_image(image_array)

        if face_roi is None or getattr(face_roi, "size", 0) == 0:
            reset_client_state(client_id)
            return jsonify({
                "success": False,
                "error": "No face detected",
                "emotion": None,
                "confidence": 0.0,
                "all_emotions": {}
            }), 200

        # Predict emotion with smoothing
        result = predict_emotion_with_smoothing(client_id, face_roi)

        bbox_list = [int(x) for x in bbox] if bbox else None

        return jsonify({
            "success": True,
            "emotion": str(result["emotion"]),
            "confidence": float(result["confidence"]),
            "all_emotions": {str(k): float(v) for k, v in result["all_emotions"].items()},
            "bbox": bbox_list
        })

    except Exception as e:
        print("Error in /predict:", str(e))
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e),
            "emotion": None,
            "confidence": 0.0
        }), 500


@app.route("/reset", methods=["POST"])
def reset_state():
    """
    Reset client state (useful when stopping detection)
    """
    try:
        data = request.get_json() or {}
        client_id = data.get("client_id", "default")
        reset_client_state(client_id)
        return jsonify({
            "success": True,
            "message": f"State reset for client {client_id}"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"🚀 Starting Face Emotion Recognition API on port {port}")
    print(f"📁 Model path: {MODEL_PATH}")
    print(f"📄 Labels path: {LABELS_JSON}")
    print(f"🏷️  Emotions: {list(class_indices.keys()) if class_indices else 'Not loaded'}")
    app.run(host="0.0.0.0", port=port, debug=True, threaded=True)
