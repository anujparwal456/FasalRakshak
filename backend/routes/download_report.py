"""
PDF Download API Route
"""
from flask import Blueprint, request, jsonify, send_file
from utils.pdf_generator import generate_pdf_report

download_report_bp = Blueprint('download_report', __name__)


@download_report_bp.route("/api/download-report", methods=["POST"])
def download_pdf_report():
    """
    Generate and download PDF report
    
    Request JSON:
        {
            "disease": "Crop___Disease_Name",
            "language": "en" or "hi",
            "ai_report": { ... }
        }
    
    Response:
        PDF file with proper headers for download
    """
    try:
        data = request.json
        
        # Extract parameters
        language = data.get("language", "en")
        disease = data.get("disease", "Unknown")
        ai_report = data.get("ai_report", {})
        
        # Validate language
        if language not in ["en", "hi"]:
            language = "en"
        
        # Validate report data exists
        if not ai_report:
            print("⚠️  No AI report provided, using minimal data")
            ai_report = {
                "crop_name": disease.split("___")[0] if "___" in disease else "Unknown",
                "disease_name": disease,
                "severity": "Unknown",
                "symptoms": ["No data available"],
                "treatment": ["Consult agricultural expert"],
                "affected_area": "Unknown",
                "recovery_timeline": "Unknown",
                "prevention_tips": ["Regular monitoring"]
            }
        
        # Prepare report data
        report_data = {
            "disease": disease,
            "ai_report": ai_report
        }
        
        # Output filename
        filename = "disease_report.pdf"
        
        print(f"📄 Generating PDF report...")
        print(f"   Disease: {disease}")
        print(f"   Language: {language}")
        print(f"   Report data keys: {list(ai_report.keys())}")
        
        # Generate PDF
        report_id = generate_pdf_report(report_data, filename, language=language)
        
        print(f"✅ PDF generated successfully - Report ID: {report_id}")
        
        # Send PDF file with proper headers
        return send_file(
            filename,
            mimetype="application/pdf",
            as_attachment=True,
            download_name=f"FasalRakshak_Report_{report_id}.pdf"
        )
        
    except Exception as e:
        print(f"❌ PDF generation error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "error": "Failed to generate PDF",
            "details": str(e)
        }), 500
