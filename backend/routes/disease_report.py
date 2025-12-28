"""
Disease Report API Route
"""
from flask import Blueprint, request, jsonify
from gemini_service import generate_disease_report

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
        data = request.json
        disease_full_name = data.get("disease")
        
        if not disease_full_name:
            return jsonify({"error": "Disease name required"}), 400
        
        # Extract crop and disease from format "Crop___Disease"
        parts = disease_full_name.split("___")
        crop_name = parts[0] if len(parts) > 0 else "Unknown"
        disease_name = parts[1] if len(parts) > 1 else disease_full_name
        
        print(f"📋 Generating report for: {crop_name} - {disease_name}")
        
        # Generate report using Gemini
        report = generate_disease_report(crop_name, disease_name)
        
        # Validate report contains required fields
        if not report:
            print("❌ Report generation returned None")
            return jsonify({"error": "Failed to generate report"}), 500
        
        required_fields = ["crop_name", "disease_name", "symptoms", "severity"]
        missing_fields = [field for field in required_fields if field not in report]
        
        if missing_fields:
            print(f"❌ Report missing required fields: {missing_fields}")
            return jsonify({
                "error": "Incomplete report",
                "missing_fields": missing_fields
            }), 500
        
        # Log successful generation
        print("✅ Report generated successfully")
        print(f"   Crop: {report.get('crop_name')}")
        print(f"   Disease: {report.get('disease_name')}")
        print(f"   Severity: {report.get('severity')}")
        print(f"   Symptoms count: {len(report.get('symptoms', []))}")
        
        # Return successful response
        return jsonify({
            "disease": disease_full_name,
            "ai_report": report
        }), 200
        
    except Exception as e:
        print(f"❌ Disease report API error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
