"""
Gemini AI Service for Plant Disease Report Generation
(PRODUCTION SAFE VERSION)
"""

import os
import json
import re
from dotenv import load_dotenv
from google import genai

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
# Initialize Gemini Client
# =========================
client = genai.Client(api_key=GEMINI_API_KEY)

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
    Generate complete disease report using Gemini 2.5 Flash
    """

    prompt = f"""
You are an expert agricultural scientist and senior government crop advisor.

Generate an ACCURATE and COMPLETE plant disease report for a farmer.

📋 MANDATORY RULES:
1. Respond ONLY in valid JSON format
2. NO markdown, NO explanations, NO extra text
3. EVERY field MUST be filled (never empty, never null)
4. Use simple farmer-friendly language
5. Severity must be: "Low", "Medium", or "High"
6. Crop name must be clearly written as: {crop_name}
7. All array fields must have at least 3 items

🌾 CROP INFORMATION:
Crop Name: {crop_name}
Disease Name: {disease_name}

📝 GENERATE THIS EXACT JSON STRUCTURE:

{{
  "crop_name": "{crop_name}",
  "disease_name": "{disease_name}",
  "severity": "Low or Medium or High",
  "affected_area": "Percentage and body part affected (e.g., 40% of leaves)",
  "recovery_timeline": "Exact time (e.g., 2–4 weeks)",
  "spread_risk": "Low or Medium or High",
  "disease_description": "Clear 2-3 sentence explanation of the disease and its impact",
  "symptoms": [
    "First specific visual symptom",
    "Second visible symptom",
    "Third symptom farmers can observe",
    "Fourth characteristic sign"
  ],
  "treatment": [
    "First immediate action to take",
    "Second treatment method",
    "Third control measure"
  ],
  "organic_treatment": [
    "First organic solution",
    "Second natural remedy"
  ],
  "fertilizer_recommendation": [
    "First fertilizer type with NPK ratio",
    "Second nutrient supplement"
  ],
  "prevention": [
    "First preventive practice",
    "Second prevention method",
    "Third protective measure"
  ]
}}

⚠️ IMPORTANT:
- Do NOT use null, N/A, or "unknown"
- Do NOT leave any field blank
- Do NOT use markdown formatting
- Always include crop_name as "{crop_name}"
- Always include disease_name as "{disease_name}"
- Return ONLY the JSON, nothing else

Now generate the complete JSON report:
"""

    try:
        print("📌 Sending prompt to Gemini 2.5 Flash...")

        response = client.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        raw_text = None

        if hasattr(response, "text") and response.text:
            raw_text = response.text.strip()
        elif hasattr(response, "candidates") and response.candidates:
            raw_text = response.candidates[0].content.parts[0].text.strip()

        if not raw_text:
            raise ValueError("Empty Gemini response")

        print("🔍 Gemini raw response preview:")
        print(raw_text[:300])

        # Extract JSON safely
        match = re.search(r"\{[\s\S]*\}", raw_text)
        if not match:
            raise ValueError("No valid JSON found")

        parsed_report = json.loads(match.group())

        final_report = normalize_report(parsed_report, crop_name, disease_name)

        print("✅ Gemini disease report generated successfully")
        return final_report

    except Exception as e:
        print(f"❌ Gemini generation failed: {e}")
        print("⚠️ Using fallback report")

        return normalize_report({}, crop_name, disease_name)

# =====================================================
# SIMPLE GENERATOR (REQUIRED BY app.py)
# =====================================================
def generate_with_fallback(prompt: str) -> str:
    try:
        response = client.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        if hasattr(response, "text") and response.text:
            return response.text.strip()

        return "AI response unavailable."

    except Exception as e:
        return f"Gemini Error: {str(e)}"
