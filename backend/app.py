"""
FasalRakshak - Plant Disease Detection Backend
"""

import os
import io
import numpy as np
from PIL import Image
from dotenv import load_dotenv

from flask import Flask, request, jsonify
from flask_cors import CORS

import tensorflow as tf
from tensorflow.keras.layers import Dense

# ================================
# 🔥 SAFE DENSE FIX (IMPORTANT)
# ================================
class SafeDense(Dense):
    def __init__(self, *args, **kwargs):
        # 🔑 REMOVE quantization_config IF PRESENT
        kwargs.pop("quantization_config", None)
        super().__init__(*args, **kwargs)

# ================================
# 🔥 SAFE INPUTLAYER FIX (KERAS COMPATIBILITY)
# ================================
from tensorflow.keras.layers import InputLayer

class SafeInputLayer(InputLayer):
    def __init__(self, *args, **kwargs):
        # Convert batch_shape (old) to batch_input_shape (new)
        if "batch_shape" in kwargs:
            batch_shape = kwargs.pop("batch_shape")
            if "batch_input_shape" not in kwargs:
                kwargs["batch_input_shape"] = batch_shape
        
        # Remove incompatible kwargs from old Keras versions
        kwargs.pop("optional", None)
        kwargs.pop("sparse", None)
        kwargs.pop("ragged", None)
        
        super().__init__(*args, **kwargs)

# Load environment variables
load_dotenv()

# Import blueprints
from routes.disease_report import disease_report_bp
from routes.download_report import download_report_bp

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(disease_report_bp)
app.register_blueprint(download_report_bp)

# ================================
# 🔥 LOAD ML MODEL (FINAL FIX)
# ================================
print("🔄 Loading TensorFlow model...")

model = tf.keras.models.load_model(
    "models/MobileNetV2_best.h5",
    compile=False,
    custom_objects={
        "Dense": SafeDense,
        "InputLayer": SafeInputLayer
    }
)

print("✅ Model loaded successfully")

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
    try:
        image_file = request.files.get("image")
        if not image_file:
            return jsonify({"error": "No image provided"}), 400

        # Image preprocessing
        image = Image.open(io.BytesIO(image_file.read())).convert("RGB")
        image = image.resize((224, 224))
        img_array = np.array(image) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        # Prediction
        predictions = model.predict(img_array)
        predicted_index = int(np.argmax(predictions))

        return jsonify({
            "disease": class_names[predicted_index],
            "confidence": float(np.max(predictions))
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================================
# ENTRY POINT (LOCAL ONLY)
# ================================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
