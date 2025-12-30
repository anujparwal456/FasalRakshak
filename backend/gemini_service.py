"""
Gemini AI Service for Plant Disease Report Generation
(PRODUCTION SAFE VERSION)
"""

import os
import json
import re
from dotenv import load_dotenv
import google.generativeai as genai

# =========================
# Load Environment Variables
# =========================
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError(
        "❌ GEMINI_API_KEY not found.\n"
        "👉 Add GEMINI_API_KEY in backend/.env file"
    )

# =========================
# Initialize Gemini (STABLE)
# =========================
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash")

# =====================================================
# NORMALIZATION (CRITICAL – NEVER REMOVE)
# =====================================================
def normalize_report(report: dict, crop: str, disease: str) -> dict:
    return {
        "crop_name": report.get("crop_name", crop),
        "disease_name": report.get("disease_name", disease),
        "severity": report.get("severity", "Medium"),
        "affected_area": report.get("affected_area", "Leaves"),
        "recovery_timeline": report.get("recovery_timeline", "2–4 weeks"),
        "spread_risk": report.get("spread_risk", "Medium"),
        "disease_description": report.get(
            "disease_description",
            "This disease affects plant health and reduces crop yield."
        ),
        "symptoms": report.get("symptoms") or [
            "Leaf discoloration",
            "Dark spots on leaves",
            "Wilting",
            "Reduced growth"
        ],
        "treatment": report.get("treatment") or [
            "Remove infected plant parts",
            "Apply recommended fungicide or bactericide",
            "Avoid overhead irrigation"
        ],
        "organic_treatment": report.get("organic_treatment") or [
            "Neem oil spray",
            "Trichoderma application"
        ],
        "fertilizer_recommendation": report.get("fertilizer_recommendation") or [
            "Balanced NPK fertilizer",
            "Micronutrient foliar spray"
        ],
        "prevention": report.get("prevention") or [
            "Crop rotation",
            "Use disease-resistant varieties",
            "Maintain proper spacing"
        ]
    }

# =====================================================
# MAIN DISEASE REPORT GENERATOR (STRICT JSON)
# =====================================================
def generate_disease_report(crop_name: str, disease_name: str) -> dict:
    """
    Generate complete disease report using Gemini Flash
    """

    prompt = f"""
You are an expert agricultural scientist and senior government crop advisor.

Generate an ACCURATE and COMPLETE plant disease report for a farmer.

MANDATORY RULES:
1. Respond ONLY in valid JSON format
2. NO markdown, NO explanations, NO extra text
3. EVERY field MUST be filled
4. Severity must be Low, Medium, or High
5. All arrays must have at least 3 items

Crop Name: {crop_name}
Disease Name: {disease_name}

Return this JSON structure exactly.
"""

    try:
        print("📌 Sending prompt to Gemini...")

        response = model.generate_content(prompt)

        raw_text = response.text.strip() if response.text else None

        if not raw_text:
            raise ValueError("Empty Gemini response")

        match = re.search(r"\{[\s\S]*\}", raw_text)
        if not match:
            raise ValueError("No valid JSON found")

        parsed_report = json.loads(match.group())

        print("✅ Gemini disease report generated")
        return normalize_report(parsed_report, crop_name, disease_name)

    except Exception as e:
        print(f"❌ Gemini generation failed: {e}")
        print("⚠️ Using fallback report")

        return normalize_report({}, crop_name, disease_name)

# =====================================================
# SIMPLE GENERATOR (REQUIRED BY app.py)
# =====================================================
def generate_with_fallback(prompt: str) -> str:
    try:
        response = model.generate_content(prompt)
        return response.text.strip() if response.text else "AI response unavailable."
    except Exception as e:
        return f"Gemini Error: {str(e)}"
