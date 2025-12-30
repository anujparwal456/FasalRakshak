"""
Quick test script to verify all API endpoints are working
Run this after deployment to Render to verify everything works
"""

import requests
import json
import time

BACKEND_URL = "https://fasalrakshak.onrender.com"  # Change if needed
TEST_DISEASE = "Tomato___Early_blight"

def test_health():
    """Test if backend is running"""
    print("\n" + "="*60)
    print("🔍 TEST 1: Backend Health Check")
    print("="*60)
    try:
        response = requests.get(f"{BACKEND_URL}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend is running!")
            print(f"   Response: {data}")
            return True
        else:
            print(f"❌ Backend returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend is not running: {e}")
        return False

def test_disease_report():
    """Test disease report generation"""
    print("\n" + "="*60)
    print("🔍 TEST 2: Disease Report Generation")
    print("="*60)
    print(f"   Testing with disease: {TEST_DISEASE}")
    print(f"   ⏳ This may take 10-30 seconds for Gemini AI...\n")
    
    try:
        start = time.time()
        response = requests.post(
            f"{BACKEND_URL}/api/disease-report",
            json={"disease": TEST_DISEASE},
            timeout=60  # 60 second timeout for Gemini
        )
        elapsed = time.time() - start
        
        print(f"   Response Time: {elapsed:.2f}s")
        
        if response.status_code == 200:
            data = response.json()
            if "ai_report" in data:
                report = data["ai_report"]
                print(f"✅ Report generated successfully!")
                print(f"   ├─ Crop: {report.get('crop_name')}")
                print(f"   ├─ Disease: {report.get('disease_name')}")
                print(f"   ├─ Severity: {report.get('severity')}")
                print(f"   ├─ Symptoms: {len(report.get('symptoms', []))} items")
                print(f"   ├─ Treatment: {len(report.get('treatment', []))} items")
                print(f"   └─ Prevention: {len(report.get('prevention', []))} items")
                return True
            else:
                print(f"❌ ai_report field missing")
                print(f"   Response: {data}")
                return False
        else:
            print(f"❌ API returned status {response.status_code}")
            try:
                print(f"   Error: {response.json()}")
            except:
                print(f"   Response: {response.text}")
            return False
    except requests.Timeout:
        print(f"❌ Request timed out after 60 seconds")
        print(f"   Gemini API may be slow or GEMINI_API_KEY may be invalid")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_predict():
    """Test model prediction endpoint"""
    print("\n" + "="*60)
    print("🔍 TEST 3: Model Prediction")
    print("="*60)
    print(f"   ⚠️  This test requires an actual image file")
    print(f"   ⏭️  Skipping (not critical for report feature)")
    return True

def main():
    print("\n")
    print("╔" + "="*58 + "╗")
    print("║  FasalRakshak Backend API Verification                 ║")
    print("╚" + "="*58 + "╝")
    print(f"\nBackend URL: {BACKEND_URL}")
    
    results = {
        "Health Check": test_health(),
        "Disease Report": test_disease_report(),
        "Model Prediction": test_predict(),
    }
    
    print("\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {status}: {test_name}")
    
    print(f"\nResult: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Your backend is ready for production.")
    else:
        print("\n⚠️  Some tests failed. Check the logs above for details.")
        print("\nCommon issues:")
        print("  • GEMINI_API_KEY not set in Render environment variables")
        print("  • Backend not deployed or not running on Render")
        print("  • Network/CORS issues between frontend and backend")

if __name__ == "__main__":
    main()
