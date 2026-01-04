# evaluate.py
import json
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

MODEL_PATH = "affectnet_mobilenetv2.h5"
LABELS_JSON = "labels.json"
TEST_DIR = "data_for_classification/test"
IMG_SIZE = (224,224)
BATCH_SIZE = 32

# load model and label mapping (expected saved by train script)
model = load_model(MODEL_PATH)
with open(LABELS_JSON, "r") as f:
    class_indices = json.load(f)
inv_map = {v:k for k,v in class_indices.items()}
class_names = [inv_map[i] for i in range(len(inv_map))]

test_datagen = ImageDataGenerator(rescale=1./255)
test_gen = test_datagen.flow_from_directory(TEST_DIR, target_size=IMG_SIZE, batch_size=BATCH_SIZE, class_mode='categorical', shuffle=False)

# predictions
y_true = test_gen.classes
y_pred_probs = model.predict(test_gen, verbose=1)
y_pred = np.argmax(y_pred_probs, axis=1)

print("Classification Report:")
print(classification_report(y_true, y_pred, target_names=class_names, digits=4))

cm = confusion_matrix(y_true, y_pred)
print("Confusion matrix:\n", cm)

# optional: plot heatmap
plt.figure(figsize=(10,8))
sns.heatmap(cm, annot=True, fmt='d', xticklabels=class_names, yticklabels=class_names)
plt.xlabel("Predicted")
plt.ylabel("True")
plt.title("Confusion Matrix")
plt.show()
