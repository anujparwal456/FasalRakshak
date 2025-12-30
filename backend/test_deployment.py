#!/usr/bin/env python3
"""
Pre-deployment verification script for FasalRakshak Backend
Run this before deploying to Render
"""

import sys
import os

print("\n" + "="*70)
print("FasalRakshak Backend - Pre-Deployment Verification")
print("="*70 + "\n")

checks_passed = 0
checks_failed = 0

def check(name, condition, error_msg=""):
    """Helper to check conditions"""
    global checks_passed, checks_failed
    status = "✅ PASS" if condition else "❌ FAIL"
    print(f"{status} | {name}")
    if condition:
        checks_passed += 1
    else:
        checks_failed += 1
        if error_msg:
            print(f"      Error: {error_msg}")

# ============================================
# 1. Python Version
# ============================================
print("1️⃣  Python Version Check")
print("-" * 70)
py_version = sys.version_info
check(
    "Python 3.10+",
    py_version.major >= 3 and py_version.minor >= 10,
    f"Current: {py_version.major}.{py_version.minor}"
)
print()

# ============================================
# 2. Required Files
# ============================================
print("2️⃣  Required Files Check")
print("-" * 70)

required_files = [
    ("app.py", "Main application file"),
    ("requirements.txt", "Dependencies"),
    ("Procfile", "Render configuration"),
    ("runtime.txt", "Python version specification"),
    (".env.example", "Environment template"),
    ("models/MobileNetV2_best.h5", "ML model file"),
    ("routes/disease_report.py", "Disease report API"),
    ("routes/download_report.py", "PDF download API"),
    ("utils/pdf_generator.py", "PDF generator"),
    ("gemini_service.py", "Gemini AI service"),
]

for filename, description in required_files:
    path = os.path.join(".", filename) if "models" not in filename else os.path.join(".", filename)
    exists = os.path.exists(path)
    check(
        f"{description} ({filename})",
        exists,
        f"Not found at {path}"
    )

print()

# ============================================
# 3. Dependencies Import Check
# ============================================
print("3️⃣  Dependencies Import Check")
print("-" * 70)

dependencies = [
    ("flask", "Flask"),
    ("flask_cors", "Flask-CORS"),
    ("tensorflow", "TensorFlow"),
    ("keras", "Keras"),
    ("h5py", "H5py"),
    ("PIL", "Pillow"),
    ("numpy", "NumPy"),
    ("reportlab", "ReportLab"),
    ("qrcode", "QRCode"),
    ("google.generativeai", "Google Generative AI"),
    ("dotenv", "python-dotenv"),
]

for module, name in dependencies:
    try:
        __import__(module)
        check(f"Import {name}", True)
    except ImportError as e:
        check(f"Import {name}", False, str(e))

print()

# ============================================
# 4. Environment Variables
# ============================================
print("4️⃣  Environment Variables Check")
print("-" * 70)

env_required = [
    ("GEMINI_API_KEY", "Gemini API key"),
]

for var, description in env_required:
    exists = var in os.environ
    check(
        f"{description} ({var})",
        exists,
        f"Set {var} in .env file" if not exists else ""
    )

print()

# ============================================
# 5. Model File Size
# ============================================
print("5️⃣  Model File Size Check")
print("-" * 70)

model_path = "models/MobileNetV2_best.h5"
if os.path.exists(model_path):
    size_mb = os.path.getsize(model_path) / (1024*1024)
    check(
        f"Model file size ({size_mb:.1f}MB)",
        50 < size_mb < 500,
        f"Expected 50-500MB, got {size_mb:.1f}MB"
    )
else:
    check("Model file exists", False, f"Not found: {model_path}")

print()

# ============================================
# 6. Configuration Files
# ============================================
print("6️⃣  Configuration Files Check")
print("-" * 70)

config_checks = [
    ("Procfile", b"gunicorn"),
    ("runtime.txt", b"python"),
    ("requirements.txt", b"tensorflow"),
]

for filename, expected_content in config_checks:
    if os.path.exists(filename):
        with open(filename, 'rb') as f:
            content = f.read()
            has_content = expected_content in content
            check(
                f"{filename} contains '{expected_content.decode()}'",
                has_content,
                f"Missing expected content"
            )
    else:
        check(f"{filename} exists", False)

print()

# ============================================
# SUMMARY
# ============================================
print("="*70)
print(f"SUMMARY: {checks_passed} passed, {checks_failed} failed")
print("="*70)

if checks_failed == 0:
    print("\n✅ All checks passed! Backend is ready for deployment.\n")
    sys.exit(0)
else:
    print(f"\n❌ {checks_failed} check(s) failed. Fix issues before deploying.\n")
    sys.exit(1)
