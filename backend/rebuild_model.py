#!/usr/bin/env python3
"""
Rebuild model from weights and config separately
This creates a clean, compatible model file
"""
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

import warnings
warnings.filterwarnings('ignore')

# Use old TensorFlow API if available
try:
    import tensorflow.compat.v2 as tf
    tf.enable_v2_behavior()
except:
    import tensorflow as tf

import h5py
import json
import numpy as np

print("[*] Attempting to rebuild model from H5 file...")

H5_PATH = "models/MobileNetV2_best.h5"
OUTPUT_PATH = "models/MobileNetV2_rebuilt.h5"

try:
    # Read the original H5 file
    print("[*] Reading original H5 file...")
    with h5py.File(H5_PATH, 'r') as src:
        # Get the model config
        if 'model_config' not in src.attrs:
            print("[!] No model_config in original file")
            exit(1)
        
        config_str = src.attrs['model_config']
        if isinstance(config_str, bytes):
            config_str = config_str.decode('utf-8')
        config = json.loads(config_str)
        
        # Try to create model from config
        print("[*] Creating model from config...")
        try:
            model = tf.keras.Model.from_config(config)
        except Exception as e:
            print(f"[!] Cannot create from config: {e}")
            print("[*] Trying alternate approach...")
            # If config fails, we need to manually rebuild
            # For now, just try loading directly
            model = None
    
    # If we couldn't create from config, load the whole thing
    if model is None:
        print("[*] Attempting direct load with maximum compatibility...")
        model = tf.keras.models.load_model(H5_PATH, compile=False)
    
    # Save in a clean way
    print("[*] Saving cleaned model...")
    model.save(OUTPUT_PATH, save_format='h5', overwrite=True)
    
    print(f"[+] SUCCESS! Model saved to {OUTPUT_PATH}")
    print(f"[+] Input shape: {model.input_shape}")
    
    # Test loading the new file
    print("[*] Testing new model...")
    test_model = tf.keras.models.load_model(OUTPUT_PATH, compile=False)
    print("[+] New model loads successfully!")
    
except Exception as e:
    print(f"[!] Error: {e}")
    import traceback
    traceback.print_exc()
    exit(1)

print("\n[+] Model rebuild complete!")
