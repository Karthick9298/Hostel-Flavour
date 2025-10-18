#!/usr/bin/env python3
"""
Test script for analytics API endpoints
"""

import requests
import json
import sys

BASE_URL = "http://localhost:5000/api/analytics"

def test_endpoint(endpoint, method="GET", data=None):
    """Test an analytics endpoint"""
    url = f"{BASE_URL}/{endpoint}"
    print(f"\n🧪 Testing: {method} {url}")
    
    try:
        if method == "GET":
            response = requests.get(url, timeout=30)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=30)
        else:
            print(f"❌ Unsupported method: {method}")
            return False
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success!")
            if 'data' in result:
                print(f"📈 Data keys: {list(result['data'].keys()) if isinstance(result['data'], dict) else 'Non-dict data'}")
            return True
        else:
            print(f"❌ Failed: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {str(e)}")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ JSON decode error: {str(e)}")
        return False

def main():
    print("🚀 Analytics API Testing")
    print("=" * 50)
    
    # Note: These will fail with auth errors, but we can see if the endpoints exist
    test_cases = [
        ("daily/2025-10-14", "GET"),
        ("weekly/2025-10-14", "GET"), 
        ("historical/comparison?startDate=2025-10-09&endDate=2025-10-15", "GET"),
        ("dashboard/quick-stats", "GET"),
        ("alerts", "GET"),
        ("system/health", "GET")
    ]
    
    results = []
    for endpoint, method in test_cases:
        success = test_endpoint(endpoint, method)
        results.append((endpoint, success))
    
    print("\n📊 SUMMARY:")
    print("=" * 50)
    for endpoint, success in results:
        status = "✅ Working" if success else "❌ Auth Required/Failed"
        print(f"{status}: {endpoint}")

if __name__ == "__main__":
    main()
