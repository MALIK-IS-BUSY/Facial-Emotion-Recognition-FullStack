# real_time.py (STABLE + PROFESSIONAL)

import cv2
import json
import numpy as np
from tensorflow.keras.models import load_model
from collections import deque

# ================== CONFIG ==================
MODEL_PATH = "affectnet_mobilenetv2.h5"
LABELS_JSON = "labels.json"
IMG_SIZE = (224, 224)

CAMERA_INDEX = 0          # use 1 for DroidCam if needed
EMA_ALPHA = 0.35          # smoothing strength (0.2–0.4 ideal)
CONF_THRESHOLD = 0.60     # minimum confidence
NEUTRAL_INDEX = 5         # from your label.json
NEUTRAL_BIAS = 0.10       # boost neutral slightly
LOCK_FRAMES = 10          # frames to lock an emotion

# ============================================

# Load model & labels
model = load_model(MODEL_PATH)

with open(LABELS_JSON, "r") as f:
    class_indices = json.load(f)

idx_to_label = {v: k for k, v in class_indices.items()}

# Face detector
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

# Camera
cap = cv2.VideoCapture(CAMERA_INDEX)
if not cap.isOpened():
    raise RuntimeError("Could not open camera")

# EMA state
ema_probs = None
locked_emotion = None
lock_counter = 0

print("Press 'q' to quit.")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    faces = face_cascade.detectMultiScale(
        gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60)
    )

    if len(faces) > 0:
        # pick largest face
        faces = sorted(faces, key=lambda b: b[2]*b[3], reverse=True)
        x, y, w, h = faces[0]

        # padding
        pad = int(0.2 * w)
        x1 = max(0, x - pad)
        y1 = max(0, y - pad)
        x2 = min(frame.shape[1], x + w + pad)
        y2 = min(frame.shape[0], y + h + pad)

        face = frame_rgb[y1:y2, x1:x2]
        face = cv2.resize(face, IMG_SIZE)
        face = face.astype("float32") / 255.0
        face = np.expand_dims(face, axis=0)

        probs = model.predict(face, verbose=0)[0]

        # 🔥 Neutral bias
        probs[NEUTRAL_INDEX] += NEUTRAL_BIAS
        probs = probs / np.sum(probs)

        # 🔥 EMA smoothing
        if ema_probs is None:
            ema_probs = probs
        else:
            ema_probs = EMA_ALPHA * probs + (1 - EMA_ALPHA) * ema_probs

        pred_idx = int(np.argmax(ema_probs))
        pred_conf = float(ema_probs[pred_idx])
        pred_label = idx_to_label[pred_idx]

        # 🔥 Emotion locking (prevents flicker)
        if locked_emotion is None or lock_counter <= 0:
            if pred_conf >= CONF_THRESHOLD:
                locked_emotion = pred_label
                lock_counter = LOCK_FRAMES
            else:
                locked_emotion = "Neutral"
        else:
            lock_counter -= 1

        # Draw
        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(
            frame,
            f"{locked_emotion} ({pred_conf:.2f})",
            (x1, y1 - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.85,
            (255, 255, 255),
            2
        )

    else:
        # reset when no face
        ema_probs = None
        locked_emotion = None
        lock_counter = 0

    cv2.imshow("AffectNet Emotion (Stable)", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
