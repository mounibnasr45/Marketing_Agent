#!/usr/bin/env python3
"""
Test BuiltWith Integration

This script tests our BuiltWith integration by calling our FastAPI endpoint
and verifying that BuiltWith data is included in the response.
"""

import httpx
import asyncio
import json
from main import BuiltWithClient
from dotenv import load_dotenv
import os

async def test_builtwith_client():
    """Test the BuiltWith client directly"""
    load_dotenv()
    api_key = os.getenv("BUILTWITH_API_KEY")
    client = BuiltWithClient(api_key=api_key)
    
    print("🧪 Testing BuiltWith Client")
    print("=" * 50)
        
    test_domains = ["github.com", "linkedin.com", "ooredoo.com"]
    
    for domain in test_domains:
        print(f"\n📊 Testing domain: {domain}")
        result = await client.analyze_domain(domain)
        print(f"✅ Domain: {result.domain}")
        print(f"✅ Technologies found: {len(result.technologies)}")
        print("✅ Sample technologies:")
        for tech in result.technologies[:5]:  # Show first 5
            version_info = f" v{tech.version}" if tech.version else ""
            popularity_info = f" (popularity: {tech.popularity})" if tech.popularity else ""
            print(f"   • {tech.name}{version_info} ({tech.tag}){popularity_info}")
        
        if len(result.technologies) > 5:
            print(f"   ... and {len(result.technologies) - 5} more")

async def test_fastapi_endpoints():
    """Test the FastAPI endpoints"""
    print("\n🚀 Testing FastAPI Endpoints")
    print("=" * 50)
    
    base_url = "http://localhost:8000"
    
    async with httpx.AsyncClient() as client:
        # Test health endpoint
        print("\n📊 Testing health endpoint...")
        try:
            response = await client.get(f"{base_url}/health")
            if response.status_code == 200:
                data = response.json()
                print("✅ Health check passed")
                print(f"   Status: {data['status']}")
                print("   Services:")
                for service, status in data['services'].items():
                    print(f"     - {service}: {status}")
            else:
                print(f"❌ Health check failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Could not connect to FastAPI server: {e}")
            print("   Make sure the server is running with: uvicorn main:app --reload")
            return
        
        # Test SimilarWeb analysis endpoint
        print("\n📊 Testing SimilarWeb analysis endpoint...")
        try:
            request_data = {
                "websites": ["github.com", "linkedin.com"],
                "userId": "test-user-123"
            }
            
            response = await client.post(f"{base_url}/api/analyze", json=request_data)
            if response.status_code == 200:
                data = response.json()
                print("✅ SimilarWeb analysis passed")
                print(f"   Success: {data['success']}")
                print(f"   Websites analyzed: {data['count']}")
                print(f"   Note: {data['note']}")
                
                # Show sample data
                if data['data']:
                    sample = data['data'][0]
                    print(f"   Sample website: {sample['name']}")
                    print(f"   Global rank: #{sample['globalRank']}")
                    print(f"   Monthly visits: {sample['totalVisits']}")
            else:
                print(f"❌ SimilarWeb analysis failed: {response.status_code}")
                print(f"   Response: {response.text}")
        except Exception as e:
            print(f"❌ Error testing SimilarWeb endpoint: {e}")
        
        # Test BuiltWith tech stack analysis endpoint
        print("\n🔧 Testing BuiltWith tech stack analysis endpoint...")
        try:
            request_data = {
                "websites": ["github.com", "linkedin.com"],
                "userId": "test-user-123"
            }
            
            response = await client.post(f"{base_url}/api/analyze-tech-stack", json=request_data)
            if response.status_code == 200:
                data = response.json()
                print("✅ BuiltWith tech stack analysis passed")
                print(f"   Success: {data['success']}")
                print(f"   Websites analyzed: {data['count']}")
                print(f"   Note: {data['note']}")
                
                # Show sample technology data
                if data['data']:
                    sample = data['data'][0]
                    print(f"   Sample website: {sample['name']}")
                    if sample.get('builtwith_result') and sample['builtwith_result'].get('technologies'):
                        techs = sample['builtwith_result']['technologies'][:3]
                        print(f"   Sample technologies: {', '.join([t['name'] for t in techs])}")
                    else:
                        print("   No BuiltWith data found")
            else:
                print(f"❌ BuiltWith analysis failed: {response.status_code}")
                print(f"   Response: {response.text}")
        except Exception as e:
            print(f"❌ Error testing BuiltWith endpoint: {e}")
        
        # Test chat endpoint
        print("\n💬 Testing chat endpoint...")
        try:
            request_data = {
                "message": "What are the main traffic sources for these websites?",
                "analysis_data": {
                    "data": [
                        {
                            "name": "GitHub",
                            "globalRank": 64,
                            "totalVisits": 1200000000,
                            "bounceRate": 0.28,
                            "trafficSources": {
                                "directVisitsShare": 0.55,
                                "organicSearchVisitsShare": 0.30
                            }
                        }
                    ]
                }
            }
            
            response = await client.post(f"{base_url}/api/chat", json=request_data)
            if response.status_code == 200:
                data = response.json()
                print("✅ Chat endpoint passed")
                print(f"   Response length: {len(data['response'])} characters")
                print(f"   Suggestions provided: {len(data.get('suggestions', []))}")
                print(f"   Sample response: {data['response'][:100]}...")
            else:
                print(f"❌ Chat endpoint failed: {response.status_code}")
                print(f"   Response: {response.text}")
        except Exception as e:
            print(f"❌ Error testing chat endpoint: {e}")

async def main():
    """Run all tests"""
    print("🚀 BuiltWith Analyzer Backend Test Suite")
    print("=" * 70)
    
    # Test 1: BuiltWith Client
    await test_builtwith_client()
    
    # Test 2: FastAPI Endpoints
    await test_fastapi_endpoints()
    
    print("\n🎉 Test suite completed!")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(main())
