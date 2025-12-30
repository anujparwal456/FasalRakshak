"""
Disease Report API Route
"""
from flask import Blueprint, request, jsonify
from gemini_service import generate_disease_report
import time

disease_report_bp = Blueprint('disease_report', __name__)


@disease_report_bp.route("/api/disease-report", methods=["POST"])
def get_disease_report():
    """
    Generate AI disease report for given disease
    
    Request JSON:
        {
            "disease": "Crop___Disease_Name"
        }
    
    Response JSON:
        {
            "disease": "Crop___Disease_Name",
            "ai_report": { ... }
        }
    """
    try:
        start_time = time.time()
        data = request.json
        disease_full_name = data.get("disease")
        
        if not disease_full_name:
            print("❌ Disease name missing in request")
            return jsonify({"error": "Disease name required"}), 400
        
        print(f"\n{'='*60}")
        print(f"📋 REQUEST: Generating report for: {disease_full_name}")
        print(f"{'='*60}")
        
        # Extract crop and disease from format "Crop___Disease"
        parts = disease_full_name.split("___")
        crop_name = parts[0] if len(parts) > 0 else "Unknown"
        disease_name = parts[1] if len(parts) > 1 else disease_full_name
        
        # Fallback for simple disease names (no ___ separator)
        if crop_name == "Unknown":
            crop_name = "Crop"
            disease_name = disease_full_name
        
        print(f"   ├─ Crop: {crop_name}")
        print(f"   └─ Disease: {disease_name}")
        
        # Generate report using Gemini (with timeout protection)
        print(f"\n⏳ Calling Gemini API... (this may take 10-30 seconds)")
        report = generate_disease_report(crop_name, disease_name)
        elapsed = time.time() - start_time
        print(f"✅ Gemini responded in {elapsed:.2f}s")
        
        # Validate report contains required fields
        if not report:
            print("❌ Report generation returned None")
            return jsonify({"error": "Failed to generate report"}), 500
        
        required_fields = ["crop_name", "disease_name", "symptoms", "severity"]
        missing_fields = [field for field in required_fields if field not in report]
        
        if missing_fields:
            print(f"❌ Report missing required fields: {missing_fields}")
            print(f"   Available fields: {list(report.keys())}")
            return jsonify({
                "error": "Incomplete report",
                "missing_fields": missing_fields,
                "received_fields": list(report.keys())
            }), 500
        
        # Log successful generation
        print(f"\n✅ REPORT VALIDATED & READY")
        print(f"   ├─ Crop: {report.get('crop_name')}")
        print(f"   ├─ Disease: {report.get('disease_name')}")
        print(f"   ├─ Severity: {report.get('severity')}")
        print(f"   ├─ Symptoms: {len(report.get('symptoms', []))} items")
        print(f"   ├─ Treatment: {len(report.get('treatment', []))} items")
        print(f"   └─ Total response time: {elapsed:.2f}s")
        
        # Return successful response
        response = {
            "disease": disease_full_name,
            "ai_report": report
        }
        print(f"\n📤 Sending response to frontend...")
        return jsonify(response), 200
        
    except Exception as e:
        print(f"\n❌ DISEASE REPORT API ERROR")
        print(f"   Error: {str(e)}")
        import traceback
        print("\n" + traceback.format_exc())
        return jsonify({"error": str(e), "type": type(e).__name__}), 500
