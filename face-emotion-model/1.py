# preprocess_yolo_to_classification.py
import os
import cv2
import yaml
import shutil
from pathlib import Path

# Edit these if your dataset folder names differ
DATASET_ROOT = "dataset"  # folder containing train/valid/test subfolders
OUTPUT_ROOT = "data_for_classification"  # will be created/overwritten

# read names from yaml if it exists
yaml_path = os.path.join(DATASET_ROOT, "dataset.yaml")
if not os.path.exists(yaml_path):
    # fallback: default names (must match your dataset)
    class_names = ["Anger","Contempt","Disgust","Fear","Happy","Neutral","Sad","Surprise"]
else:
    with open(yaml_path, "r") as f:
        info = yaml.safe_load(f)
    # prefer 'names' field
    if "names" in info:
        class_names = list(info["names"])
    else:
        # fallback
        class_names = ["Anger","Contempt","Disgust","Fear","Happy","Neutral","Sad","Surprise"]

print("Class names (index -> name):")
for i,n in enumerate(class_names):
    print(i, n)

# dataset partitions
parts = {
    "train": os.path.join(DATASET_ROOT, "train"),
    "val": os.path.join(DATASET_ROOT, "valid"),
    "test": os.path.join(DATASET_ROOT, "test")
}

# prepare output root (remove if exists for a fresh start)
if os.path.exists(OUTPUT_ROOT):
    print("Removing existing", OUTPUT_ROOT)
    shutil.rmtree(OUTPUT_ROOT)
os.makedirs(OUTPUT_ROOT, exist_ok=True)

def process_partition(part_name, part_path):
    images_dir = os.path.join(part_path, "images")
    labels_dir = os.path.join(part_path, "labels")
    if not os.path.isdir(images_dir) or not os.path.isdir(labels_dir):
        print(f"Warning: missing images/labels in {part_path}")
        return

    out_part_dir = os.path.join(OUTPUT_ROOT, part_name)
    # create class subfolders
    for cname in class_names:
        os.makedirs(os.path.join(out_part_dir, cname), exist_ok=True)

    # iterate images
    image_files = [p for p in Path(images_dir).glob("*") if p.suffix.lower() in [".jpg", ".jpeg", ".png", ".bmp"]]
    print(f"Processing {len(image_files)} images in {part_name}...")

    saved_count = 0
    for img_path in image_files:
        img_name = img_path.name
        label_path = os.path.join(labels_dir, Path(img_path).stem + ".txt")
        if not os.path.exists(label_path):
            # no label — skip
            continue

        img = cv2.imread(str(img_path))
        if img is None:
            continue
        h, w = img.shape[:2]

        # parse all boxes, choose the largest area box (if many)
        bboxes = []
        try:
            with open(label_path, "r") as lf:
                for line in lf:
                    parts = line.strip().split()
                    if len(parts) < 5:
                        continue
                    cls = int(parts[0])
                    cx = float(parts[1])
                    cy = float(parts[2])
                    bw = float(parts[3])
                    bh = float(parts[4])
                    # denormalize to pixel coordinates (x1,y1,x2,y2)
                    box_w = max(1, int(bw * w))
                    box_h = max(1, int(bh * h))
                    center_x = int(cx * w)
                    center_y = int(cy * h)
                    x1 = max(0, center_x - box_w // 2)
                    y1 = max(0, center_y - box_h // 2)
                    x2 = min(w, x1 + box_w)
                    y2 = min(h, y1 + box_h)
                    area = (x2 - x1) * (y2 - y1)
                    bboxes.append((area, cls, x1, y1, x2, y2))
        except Exception as e:
            print("Error reading", label_path, e)
            continue

        if not bboxes:
            continue

        # pick largest bbox
        bboxes.sort(reverse=True, key=lambda x: x[0])
        _, cls_idx, x1, y1, x2, y2 = bboxes[0]
        cls_name = class_names[cls_idx] if 0 <= cls_idx < len(class_names) else str(cls_idx)

        # optionally expand the box a bit (10%)
        pad_w = int(0.1 * (x2 - x1))
        pad_h = int(0.1 * (y2 - y1))
        x1 = max(0, x1 - pad_w)
        y1 = max(0, y1 - pad_h)
        x2 = min(w, x2 + pad_w)
        y2 = min(h, y2 + pad_h)

        cropped = img[y1:y2, x1:x2]
        if cropped.size == 0:
            continue

        # save with unique name
        out_fn = os.path.join(out_part_dir, cls_name, img_name)
        cv2.imwrite(out_fn, cropped)
        saved_count += 1

    print(f"Saved {saved_count} cropped images for {part_name}.")

for part_name, part_path in parts.items():
    if os.path.exists(part_path):
        process_partition(part_name, part_path)
    else:
        print("Missing partition", part_name, part_path)

print("Preprocessing complete. Output in:", OUTPUT_ROOT)
