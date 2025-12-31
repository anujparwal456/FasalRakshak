#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Convert MobileNetV2_best.h5 from Keras 3.x to Keras 2.x format
"""

import os
import json
import h5py
import tensorflow as tf
import shutil
from datetime import datetime

MODEL_PATH = "models/MobileNetV2_best.h5"
BACKUP_PATH = f"models/MobileNetV2_best.h5.backup.{datetime.now().strftime('%Y%m%d_%H%M%S')}"

print("\n" + "="*70)
print("[*] CONVERTING MODEL: Keras 3.x to Keras 2.x Compatible")
print("="*70)

if not os.path.exists(MODEL_PATH):
    print(f"[!] Model not found at {MODEL_PATH}")
    exit(1)

# Backup original
print(f"\n[*] Creating backup: {BACKUP_PATH}")
shutil.copy(MODEL_PATH, BACKUP_PATH)

def clean_config_recursively(obj, depth=0):
    """Remove problematic Keras 3.x fields while preserving dtype when needed"""
    if isinstance(obj, dict):
        # Fields that should be removed completely
        remove_keys = [
            'quantization_config', 'backend', 'tf_data_experimental_ops_enabled',
            'experimental_enable_dispatch', 'autocast', 'virtual_batch_size', 'adjustment'
        ]
        for key in remove_keys:
            obj.pop(key, None)
        
        # Recursively clean values
        for key, val in list(obj.items()):
            if isinstance(val, dict):
                clean_config_recursively(val, depth+1)
            elif isinstance(val, list):
                for item in val:
                    if isinstance(item, dict):
                        clean_config_recursively(item, depth+1)
    
    return obj

print("\n[*] Reading model config from H5...")
try:
    with h5py.File(MODEL_PATH, 'r+') as f:
        if 'model_config' not in f.attrs:
            print("[!] No model_config found in H5 file")
            exit(1)
        
        # Read original config
        config_str = f.attrs['model_config']
        if isinstance(config_str, bytes):
            config_str = config_str.decode('utf-8')
        
        config = json.loads(config_str)
        print(f"[+] Config loaded ({len(config_str)} bytes)")
        
        # Clean config
        print("[*] Cleaning Keras 3.x specific fields...")
        config = clean_config_recursively(config)
        
        # Write back cleaned config
        config_str_cleaned = json.dumps(config)
        f.attrs['model_config'] = config_str_cleaned
        print(f"[+] Config cleaned and saved ({len(config_str_cleaned)} bytes)")

except Exception as e:
    print(f"[!] Error: {e}")
    print(f"[*] Restoring from backup...")
    if os.path.exists(BACKUP_PATH):
        shutil.move(BACKUP_PATH, MODEL_PATH)
    exit(1)

# Try to load the model
print("\n[*] Testing if model loads...")
try:
    model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    print(f"[+] SUCCESS! Model loaded.")
    print(f"[+] Input shape: {model.input_shape}")
    print(f"[+] Backup saved to: {BACKUP_PATH}")
except Exception as e:
    print(f"[!] Model still fails to load: {e}")
    print(f"[*] Restoring from backup...")
    shutil.move(BACKUP_PATH, MODEL_PATH)
    exit(1)

print("\n" + "="*70)
print("[+] CONVERSION COMPLETE AND VERIFIED!")
print("="*70 + "\n")
