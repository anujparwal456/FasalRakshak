"""
Chat API Route for Chatbot Gemini Integration
"""
from flask import Blueprint, request, jsonify
from gemini_service import generate_with_fallback
import os

chat_bp = Blueprint('chat', __name__)


@chat_bp.route("/api/chat/gemini", methods=["POST"])
def chat_gemini():
    """
    Handle chatbot messages and generate responses using Gemini AI
    
    Request JSON:
        {
            "email": "user@example.com",
            "message": "User's question",
            "image": "base64_image_string (optional)"
        }
    
    Response JSON:
        {
            "reply": "AI response from Gemini"
        }
    """
    try:
        data = request.json
        email = data.get("email")
        message = data.get("message", "")
        image = data.get("image")
        
        if not email:
            return jsonify({"error": "Email is required"}), 400
        
        if not message and not image:
            return jsonify({"error": "Message or image is required"}), 400
        
        print(f"📨 Chat request from: {email}")
        print(f"   Message: {message[:100] if message else '(Image only)'}")
        
        # Build prompt with image context if provided
        prompt = message
        if image:
            prompt = f"{message}\n\n[User also uploaded an image for analysis]" if message else "Please analyze this plant image for diseases and provide recommendations."
        
        # Generate response using Gemini
        response_text = generate_with_fallback(prompt)
        
        if not response_text:
            return jsonify({"error": "Failed to generate response"}), 500
        
        print("✅ Chat response generated successfully")
        
        return jsonify({
            "reply": response_text
        }), 200
        
    except Exception as e:
        print(f"❌ Chat API error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@chat_bp.route("/api/chat/image-count", methods=["POST"])
def get_image_count():
    """
    Get the count of images uploaded by a user
    
    Request JSON:
        {
            "email": "user@example.com"
        }
    
    Response JSON:
        {
            "count": 0
        }
    """
    try:
        data = request.json
        email = data.get("email")
        
        if not email:
            return jsonify({"error": "Email is required"}), 400
        
        # TODO: Implement database tracking if needed
        # For now, return 0 to allow initial uploads
        print(f"📊 Image count requested for: {email}")
        
        return jsonify({
            "count": 0
        }), 200
        
    except Exception as e:
        print(f"❌ Image count API error: {e}")
        return jsonify({"error": str(e)}), 500
