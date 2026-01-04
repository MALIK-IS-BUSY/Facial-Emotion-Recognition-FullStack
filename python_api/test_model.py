"""
Test script to verify the model is working correctly
Run this to test the model independently
"""

import os
import sys
import numpy as np
import cv2
import json
from tensorflow.keras.models import load_model

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Model paths
MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "face-emotion-model")
MODEL_PATH = os.path.join(MODEL_DIR, "affectnet_mobilenetv2.h5")
LABELS_JSON = os.path.join(MODEL_DIR, "labels.json")
IMG_SIZE = (224, 224)

print("=" * 60)
print("Testing Face Emotion Recognition Model")
print("=" * 60)

# Check if files exist
print(f"\n1. Checking model files...")
print(f"   Model path: {MODEL_PATH}")
print(f"   Model exists: {os.path.exists(MODEL_PATH)}")
print(f"   Labels path: {LABELS_JSON}")
print(f"   Labels exist: {os.path.exists(LABELS_JSON)}")

if not os.path.exists(MODEL_PATH):
    print("❌ Model file not found!")
    sys.exit(1)

if not os.path.exists(LABELS_JSON):
    print("❌ Labels file not found!")
    sys.exit(1)

# Load labels
print(f"\n2. Loading labels...")
with open(LABELS_JSON, "r") as f:
    class_indices = json.load(f)
idx_to_label = {v: k for k, v in class_indices.items()}
print(f"   ✅ Labels loaded: {list(class_indices.keys())}")
print(f"   Neutral index: {class_indices['Neutral']}")

# Load model
print(f"\n3. Loading model...")
try:
    model = load_model(MODEL_PATH)
    print(f"   ✅ Model loaded successfully!")
    print(f"   Model input shape: {model.input_shape}")
    print(f"   Model output shape: {model.output_shape}")
except Exception as e:
    print(f"   ❌ Error loading model: {e}")
    sys.exit(1)

# Test with dummy image
print(f"\n4. Testing model prediction...")
try:
    # Create a dummy face image (224x224 RGB)
    dummy_face = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
    
    # Preprocess exactly like the original 4.py
    face_normalized = dummy_face.astype("float32") / 255.0
    face_batch = np.expand_dims(face_normalized, axis=0)
    
    print(f"   Input shape: {face_batch.shape}")
    
    # Predict
    probs = model.predict(face_batch, verbose=0)[0]
    
    print(f"   ✅ Prediction successful!")
    print(f"   Output shape: {probs.shape}")
    print(f"   Output sum: {np.sum(probs):.4f} (should be ~1.0)")
    
    # Get top prediction
    pred_idx = int(np.argmax(probs))
    pred_conf = float(probs[pred_idx])
    pred_label = idx_to_label[pred_idx]
    
    print(f"\n5. Prediction results:")
    print(f"   Predicted emotion: {pred_label}")
    print(f"   Confidence: {pred_conf:.4f}")
    print(f"\n   All probabilities:")
    for i, emotion in idx_to_label.items():
        print(f"      {emotion}: {probs[i]:.4f}")
    
    print(f"\n✅ Model is working correctly!")
    
except Exception as e:
    print(f"   ❌ Error during prediction: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n" + "=" * 60)
print("Model test completed successfully!")
print("=" * 60)

