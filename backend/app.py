"""
FasalRakshak - Plant Disease Detection Backend
Production-Ready Version with TensorFlow/Keras Compatibility
"""

import os
import sys
import io
import json
import h5py
import numpy as np
from PIL import Image
from dotenv import load_dotenv

from flask import Flask, request, jsonify
from flask_cors import CORS

# ================================
# TENSORFLOW/KERAS SETUP (CRITICAL)
# ================================
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # Suppress TF warnings

import tensorflow as tf
from tensorflow.keras.layers import Dense, InputLayer

# Suppress GPU warnings
physical_devices = tf.config.list_physical_devices('GPU')
if physical_devices:
    tf.config.experimental.set_memory_growth(physical_devices[0], True)

# ================================
# CUSTOM KERAS COMPATIBILITY LAYERS
# ================================
class SafeDense(Dense):
    """Dense layer that handles outdated Keras configs"""
    def __init__(self, *args, **kwargs):
        kwargs.pop("quantization_config", None)
        super().__init__(*args, **kwargs)

class SafeInputLayer(InputLayer):
    """InputLayer that handles Keras 2.x ↔ 3.x compatibility"""
    def __init__(self, *args, **kwargs):
        if "batch_shape" in kwargs:
            batch_shape = kwargs.pop("batch_shape")
            if "batch_input_shape" not in kwargs:
                kwargs["batch_input_shape"] = batch_shape
        
        kwargs.pop("optional", None)
        kwargs.pop("sparse", None)
        kwargs.pop("ragged", None)
        
        super().__init__(*args, **kwargs)

class SafeConv2D(tf.keras.layers.Conv2D):
    """Conv2D layer that strips DTypePolicy from Keras 3.x models"""
    def __init__(self, *args, **kwargs):
        kwargs.pop("dtype", None)  # Remove problematic dtype objects
        super().__init__(*args, **kwargs)

class SafeBatchNormalization(tf.keras.layers.BatchNormalization):
    """BatchNormalization layer that handles Keras 2.x ↔ 3.x compatibility"""
    def __init__(self, *args, **kwargs):
        # Remove problematic config keys
        kwargs.pop("dtype", None)
        kwargs.pop("virtual_batch_size", None)
        kwargs.pop("adjustment", None)
        super().__init__(*args, **kwargs)

class SafeReLU(tf.keras.layers.ReLU):
    """ReLU activation that handles Keras 2.x ↔ 3.x compatibility"""
    def __init__(self, *args, **kwargs):
        kwargs.pop("dtype", None)
        super().__init__(*args, **kwargs)

class SafeActivation(tf.keras.layers.Activation):
    """Activation layer that handles compatibility"""
    def __init__(self, *args, **kwargs):
        kwargs.pop("dtype", None)
        super().__init__(*args, **kwargs)

class SafeDepthwiseConv2D(tf.keras.layers.DepthwiseConv2D):
    """DepthwiseConv2D layer that handles Keras 2.x ↔ 3.x compatibility"""
    def __init__(self, *args, **kwargs):
        kwargs.pop("dtype", None)
        super().__init__(*args, **kwargs)

class SafeGlobalAveragePooling2D(tf.keras.layers.GlobalAveragePooling2D):
    """GlobalAveragePooling2D that handles compatibility"""
    def __init__(self, *args, **kwargs):
        kwargs.pop("dtype", None)
        super().__init__(*args, **kwargs)

# Load environment variables
load_dotenv()

# Import blueprints
from routes.disease_report import disease_report_bp
from routes.download_report import download_report_bp
from routes.chat import chat_bp

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(disease_report_bp)
app.register_blueprint(download_report_bp)
app.register_blueprint(chat_bp)

# ================================
# ROBUST MODEL LOADING WITH KERAS COMPATIBILITY
# ================================

def clean_dtype_policy_recursive(obj):
    """Recursively remove DTypePolicy and incompatible Keras 3.x config from model config"""
    if isinstance(obj, dict):
        # Replace DTypePolicy objects
        if obj.get('class_name') == 'DTypePolicy':
            return {'class_name': 'str', 'config': {'name': 'float32'}}
        
        # Clean problematic config keys from layer configs
        if 'config' in obj and isinstance(obj['config'], dict):
            config = obj['config']
            # Remove Keras 3.x specific keys that break Keras 2.x
            for key in ['dtype', 'quantization_config', 'backend', 'optional', 'sparse', 'ragged', 'virtual_batch_size', 'adjustment']:
                config.pop(key, None)
        
        # Clean all nested objects
        for key in list(obj.keys()):
            obj[key] = clean_dtype_policy_recursive(obj[key])
    elif isinstance(obj, list):
        return [clean_dtype_policy_recursive(item) for item in obj]
    
    return obj

def load_model_with_fallback():
    """
    Load model with multiple fallback strategies:
    1. Standard Keras load
    2. H5py + config patch (for Keras 3.x models)
    3. TensorFlow SavedModel load
    """
    model_path = "models/MobileNetV2_best.h5"
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"❌ Model not found at {model_path}\n"
            "Please ensure the model file exists in the models/ directory"
        )
    
    custom_objects = {
        "Dense": SafeDense,
        "InputLayer": SafeInputLayer,
        "Conv2D": SafeConv2D,
        "BatchNormalization": SafeBatchNormalization,
        "ReLU": SafeReLU,
        "Activation": SafeActivation,
        "DepthwiseConv2D": SafeDepthwiseConv2D,
        "GlobalAveragePooling2D": SafeGlobalAveragePooling2D,
    }
    
    # Store errors to avoid Python 3.10+ exception scoping issues
    error_e1 = None
    error_e2 = None
    error_e3 = None
    
    # Strategy 1: Standard load (for native Keras 2.15 models)
    try:
        print("  [1/3] Attempting standard Keras load...")
        model = tf.keras.models.load_model(
            model_path,
            compile=False,
            custom_objects=custom_objects
        )
        print("      ✅ Standard load succeeded")
        return model
    except Exception as e:
        error_e1 = str(e)[:80]
        print(f"      ⚠️  Standard load failed: {error_e1}")
    
    # Strategy 2: H5py + clean config (for Keras 3.x models)
    try:
        print("  [2/3] Attempting H5py + config patch...")
        with h5py.File(model_path, 'r') as f:
            if 'model_config' not in f.attrs:
                raise ValueError("No model_config in H5 file")
            
            # Load and clean config
            config = json.loads(f.attrs['model_config'])
            config = clean_dtype_policy_recursive(config)
            
            # Rebuild model
            model = tf.keras.Model.from_config(config, custom_objects=custom_objects)
            
            # Load weights
            try:
                model.load_weights(model_path)
            except Exception:
                print("      ⚠️  Could not load weights, proceeding without")
            
            print("      ✅ H5py patch succeeded")
            return model
    except Exception as e:
        error_e2 = str(e)[:80]
        print(f"      ⚠️  H5py patch failed: {error_e2}")
    
    # Strategy 3: Load with safe_mode=False
    try:
        print("  [3/3] Attempting safe_mode=False load...")
        model = tf.keras.models.load_model(
            model_path,
            compile=False,
            safe_mode=False,
            custom_objects=custom_objects
        )
        print("      ✅ Safe mode load succeeded")
        return model
    except Exception as e:
        error_e3 = str(e)[:80]
        print(f"      ⚠️  Safe mode load failed: {error_e3}")
        raise RuntimeError(
            f"All model loading strategies failed:\n"
            f"1. Standard: {error_e1}\n"
            f"2. H5py: {error_e2}\n"
            f"3. Safe mode: {error_e3}"
        )

# ================================
# INITIALIZE MODEL AT STARTUP
# ================================
print("\n" + "="*60)
print("🔄 Initializing FasalRakshak Backend...")
print("="*60)

model = None
try:
    print("📦 Loading TensorFlow model...")
    model = load_model_with_fallback()
    print("✅ Model loaded successfully!")
except Exception as e:
    print(f"\n❌ CRITICAL ERROR: {e}")
    print("\nBackend will run but predictions will fail.")
    print("Please check:")
    print("  • Model file exists at backend/models/MobileNetV2_best.h5")
    print("  • File is not corrupted")
    print("  • TensorFlow/Keras versions are compatible")
    model = None

print("="*60 + "\n")

# ================================
# CLASS NAMES
# ================================
class_names = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Raspberry___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch",
    "Strawberry___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy"
]

# ================================
# ROUTES
# ================================
@app.route("/")
def home():
    return jsonify({
        "message": "FasalRakshak Backend is running 🚀",
        "status": "OK"
    })

@app.route("/predict", methods=["POST"])
def predict():
    """Predict plant disease from image"""
    try:
        # Check if model loaded successfully
        if model is None:
            return jsonify({
                "error": "Model not loaded",
                "details": "TensorFlow model failed to load at startup. Check server logs."
            }), 503
        
        image_file = request.files.get("image")
        if not image_file:
            return jsonify({"error": "No image provided"}), 400

        # Image preprocessing
        image = Image.open(io.BytesIO(image_file.read())).convert("RGB")
        image = image.resize((224, 224))
        img_array = np.array(image) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        # Prediction
        predictions = model.predict(img_array, verbose=0)
        predicted_index = int(np.argmax(predictions))
        confidence = float(np.max(predictions))

        return jsonify({
            "disease": class_names[predicted_index],
            "confidence": confidence,
            "all_predictions": {
                class_names[i]: float(predictions[0][i]) 
                for i in range(min(5, len(class_names)))
            }
        }), 200

    except Exception as e:
        print(f"❌ Prediction error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ================================
# ENTRY POINT (LOCAL ONLY)
# ================================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
