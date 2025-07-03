"""
Test script to verify the modular backend is working correctly
"""

import requests
import json
from datetime import datetime

def test_backend():
    base_url = "http://localhost:8000"
    
    print("🧪 Testing BuiltWith Analyzer Backend")
    print("=" * 50)
    
    # Test 1: Root endpoint
    print("\n[Test 1] Testing root endpoint...")
    try:
        response = requests.get(f"{base_url}/")
        print(f"✅ Status: {response.status_code}")
        print(f"📊 Response: {response.json()}")
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    # Test 2: Health check
    print("\n[Test 2] Testing health check...")
    try:
        response = requests.get(f"{base_url}/health")
        print(f"✅ Status: {response.status_code}")
        print(f"🏥 Health: {response.json()}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 3: CORS preflight (OPTIONS)
    print("\n[Test 3] Testing CORS preflight...")
    try:
        response = requests.options(
            f"{base_url}/api/analyze",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type"
            }
        )
        print(f"✅ Status: {response.status_code}")
        print(f"🌐 CORS Headers: {dict(response.headers)}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 4: SimilarWeb Analysis
    print("\n[Test 4] Testing SimilarWeb analysis...")
    try:
        data = {
            "websites": ["linkedin.com"],
            "userId": f"test-user-{datetime.now().timestamp()}"
        }
        response = requests.post(
            f"{base_url}/api/analyze",
            json=data,
            headers={"Content-Type": "application/json"}
        )
        print(f"✅ Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"📈 Success: {result.get('success')}")
            print(f"📊 Count: {result.get('count')}")
            print(f"📝 Note: {result.get('note')}")
        else:
            print(f"❌ Error response: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 5: Chat endpoint
    print("\n[Test 5] Testing chat endpoint...")
    try:
        data = {
            "message": "Hello, tell me about website analysis",
            "analysis_data": {
                "domain": "test.com",
                "data": [{"name": "Test Website", "globalRank": 1000}]
            }
        }
        response = requests.post(
            f"{base_url}/api/chat",
            json=data,
            headers={"Content-Type": "application/json"}
        )
        print(f"✅ Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"💬 Response: {result.get('response')[:100]}...")
            print(f"💡 Suggestions: {len(result.get('suggestions', []))}")
        else:
            print(f"❌ Error response: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Backend test completed!")
    print("If you see mostly ✅ symbols, the backend is working correctly.")
    print("If you see ❌ symbols, check the server logs for details.")

if __name__ == "__main__":
    test_backend()
