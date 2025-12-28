import os
import shutil
import random

RAW_DIR = "dataset/raw"
TRAIN_DIR = "dataset/train"
VAL_DIR = "dataset/val"
SPLIT_RATIO = 0.8  # 80% train, 20% val

os.makedirs(TRAIN_DIR, exist_ok=True)
os.makedirs(VAL_DIR, exist_ok=True)

for class_name in os.listdir(RAW_DIR):
    class_path = os.path.join(RAW_DIR, class_name)
    if not os.path.isdir(class_path):
        continue

    images = os.listdir(class_path)
    random.shuffle(images)

    split_point = int(len(images) * SPLIT_RATIO)
    train_images = images[:split_point]
    val_images = images[split_point:]

    os.makedirs(os.path.join(TRAIN_DIR, class_name), exist_ok=True)
    os.makedirs(os.path.join(VAL_DIR, class_name), exist_ok=True)

    for img in train_images:
        shutil.copy(
            os.path.join(class_path, img),
            os.path.join(TRAIN_DIR, class_name, img)
        )

    for img in val_images:
        shutil.copy(
            os.path.join(class_path, img),
            os.path.join(VAL_DIR, class_name, img)
        )

print("✅ Dataset split completed successfully")
