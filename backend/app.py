"""
FasalRakshak - Plant Disease Detection Backend
Production-ready Flask backend
"""

import os
import io
import numpy as np
import tensorflow as tf
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Import blueprints
from routes.disease_report import disease_report_bp
from routes.download_report import download_report_bp

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(disease_report_bp)
app.register_blueprint(download_report_bp)

# Load ML model
print("🔄 Loading TensorFlow model...")
model = tf.keras.models.load_model(
    "models/MobileNetV2_best.h5",
    compile=False,
    safe_mode=False
)
print("✅ Model loaded successfully")

# Class names for predictions
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

# ----------------------------
# Health Check Route
# ----------------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "🌾 FasalRakshak Backend is running!",
        "status": "success",
        "version": "1.0.0",
        "endpoints": {
            "predict": "/predict (POST)",
            "disease_report": "/api/disease-report (POST)",
            "download_report": "/api/download-report (POST)"
        }
    })

# ----------------------------
# Prediction Route
# ----------------------------
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

        if predicted_index >= len(class_names):
            return jsonify({"error": "Invalid prediction index"}), 500

        disease_name = class_names[predicted_index]
        confidence = float(np.max(predictions))

        return jsonify({
            "disease": disease_name,
            "confidence": confidence
        }), 200

    except Exception as e:
        print("❌ Prediction Error:", e)
        return jsonify({"error": str(e)}), 500


# ----------------------------
# App Runner (Cloud Compatible)
# ----------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))

    print("\n" + "=" * 50)
    print("🌾 FasalRakshak Backend Server")
    print("=" * 50)
    print(f"📍 Running on: http://0.0.0.0:{port}")
    print("📊 ML Model: MobileNetV2 (38 classes)")
    print("🤖 AI: Gemini + TensorFlow")
    print("=" * 50 + "\n")

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )
