#!/usr/bin/env python3
"""
Convert H5 model to SavedModel format (more compatible)
"""
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

import tensorflow as tf
import warnings
warnings.filterwarnings('ignore')

MODEL_PATH = "models/MobileNetV2_best.h5"
SAVED_MODEL_PATH = "models/MobileNetV2_saved_model"

print("\n[*] Converting H5 to SavedModel format...")

try:
    # Try to load the H5 model with maximal compatibility
    print("[*] Loading H5 model with custom objects...")
    
    # Use the safe loading approach
    model = tf.keras.models.load_model(
        MODEL_PATH,
        compile=False,
        custom_objects={},
    )
    
    print("[+] H5 model loaded successfully!")
    
    # Save as SavedModel
    print("[*] Saving as SavedModel...")
    model.save(SAVED_MODEL_PATH, save_format='tf')
    
    print(f"[+] SavedModel saved to {SAVED_MODEL_PATH}")
    print(f"[+] Input shape: {model.input_shape}")
    
except Exception as e:
    print(f"[!] Error: {e}")
    print("\n[*] Trying alternative approach...")
    exit(1)

print("\n[+] Conversion complete!")
