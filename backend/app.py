"""
FasalRakshak - Plant Disease Detection Backend
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
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


@app.route("/")
def home():
    """Health check endpoint"""
    return jsonify({
        "message": "FasalRakshak Backend is running!",
        "version": "1.0.0",
        "endpoints": [
            "/predict - POST - ML disease prediction",
            "/api/disease-report - POST - AI report generation",
            "/api/download-report - POST - PDF download"
        ]
    })


@app.route("/predict", methods=["POST"])
def predict():
    """
    ML model prediction endpoint
    
    Accepts: multipart/form-data with 'image' file
    Returns: { "disease": "...", "confidence": 0.95 }
    """
    try:
        # Get image from request
        image_file = request.files.get("image")
        if not image_file:
            return jsonify({"error": "No image provided"}), 400
        
        # Preprocess image
        image = Image.open(io.BytesIO(image_file.read())).resize((224, 224))
        img_array = np.array(image) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        # Make prediction
        predictions = model.predict(img_array)
        
        # Debug logging
        print(f"📊 Prediction - Output shape: {predictions.shape}")
        print(f"📊 Prediction - Classes count: {len(class_names)}")
        
        # Get predicted class index
        predicted_index = int(np.argmax(predictions))
        
        # Validate index
        if predicted_index >= len(class_names):
            return jsonify({
                "error": "Prediction index out of range",
                "predicted_index": predicted_index,
                "total_classes": len(class_names)
            }), 500
        
        # Get disease name and confidence
        disease_name = class_names[predicted_index]
        confidence = float(np.max(predictions))
        
        print(f"✅ Prediction successful:")
        print(f"   Disease: {disease_name}")
        print(f"   Confidence: {confidence:.2%}")
        
        return jsonify({
            "disease": disease_name,
            "confidence": confidence
        }), 200
        
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("\n" + "="*50)
    print("🌾 FasalRakshak Backend Server")
    print("="*50)
    print("📍 Running on: http://localhost:5000")
    print("📊 ML Model: MobileNetV2 (38 classes)")
    print("🤖 AI: Google Gemini")
    print("="*50 + "\n")
    
    app.run(port=5000, debug=True)
