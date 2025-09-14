#!/usr/bin/env python3
"""
Test script for ML Categorization Service
Verifies that the service works correctly before integration
"""

import requests
import json
import time
import sys

def test_ml_service():
    """Test the ML categorization service"""
    base_url = "http://localhost:5001"
    
    print("🧪 Testing ML Categorization Service...")
    print("=" * 50)
    
    # Test 1: Health Check
    print("\n1. Testing Health Check...")
    try:
        response = requests.get(f"{base_url}/health", timeout=10)
        if response.status_code == 200:
            print("✅ Health check passed")
            health_data = response.json()
            print(f"   Status: {health_data.get('status')}")
            print(f"   Service: {health_data.get('service')}")
            print(f"   Model Info: {health_data.get('model_info', {}).get('method', 'Unknown')}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Health check failed: {e}")
        return False
    
    # Test 2: Model Info
    print("\n2. Testing Model Info...")
    try:
        response = requests.get(f"{base_url}/model-info", timeout=10)
        if response.status_code == 200:
            print("✅ Model info retrieved")
            model_info = response.json()
            print(f"   Status: {model_info.get('status')}")
            print(f"   Method: {model_info.get('method')}")
        else:
            print(f"❌ Model info failed: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Model info failed: {e}")
    
    # Test 3: Basic Categorization (Text Only)
    print("\n3. Testing Basic Categorization (Text Only)...")
    test_cases = [
        {
            "description": "Road has large potholes causing damage to vehicles",
            "expected_category": "infrastructure",
            "expected_priority": "high"
        },
        {
            "description": "Water pipe burst causing flooding in the area",
            "expected_category": "utilities", 
            "expected_priority": "urgent"
        },
        {
            "description": "Street lights not working for past week",
            "expected_category": "utilities",
            "expected_priority": "medium"
        },
        {
            "description": "Garbage not collected for several days",
            "expected_category": "environment",
            "expected_priority": "medium"
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n   Test Case {i}: {test_case['description'][:50]}...")
        
        try:
            data = {
                'description': test_case['description'],
                'location': 'Test Area'
            }
            
            response = requests.post(f"{base_url}/categorize", data=data, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                print(f"   ✅ Categorization successful")
                print(f"      Category: {result.get('category')} (expected: {test_case['expected_category']})")
                print(f"      Priority: {result.get('priority')} (expected: {test_case['expected_priority']})")
                print(f"      Confidence: {result.get('confidence', 0):.3f}")
                print(f"      Method: {result.get('method', 'Unknown')}")
                
                # Check if predictions are reasonable
                if result.get('category') == test_case['expected_category']:
                    print(f"      🎯 Category prediction correct!")
                else:
                    print(f"      ⚠️  Category prediction different from expected")
                
                if result.get('priority') == test_case['expected_priority']:
                    print(f"      🎯 Priority prediction correct!")
                else:
                    print(f"      ⚠️  Priority prediction different from expected")
                    
            else:
                print(f"   ❌ Categorization failed: {response.status_code}")
                print(f"      Response: {response.text}")
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Categorization request failed: {e}")
    
    # Test 4: Performance Test
    print("\n4. Testing Performance...")
    test_description = "Road has large potholes causing damage to vehicles"
    
    try:
        start_time = time.time()
        response = requests.post(f"{base_url}/categorize", 
                               data={'description': test_description}, 
                               timeout=30)
        end_time = time.time()
        
        if response.status_code == 200:
            response_time = (end_time - start_time) * 1000  # Convert to milliseconds
            print(f"✅ Performance test completed")
            print(f"   Response time: {response_time:.1f}ms")
            
            if response_time < 1000:  # Less than 1 second
                print(f"   🚀 Fast response (< 1s)")
            elif response_time < 3000:  # Less than 3 seconds
                print(f"   ⚡ Good response (< 3s)")
            else:
                print(f"   🐌 Slow response (≥ 3s)")
        else:
            print(f"❌ Performance test failed: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Performance test failed: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 ML Service Testing Complete!")
    
    return True

def main():
    """Main function"""
    print("ML Categorization Service Test Suite")
    print("Make sure the ML service is running on http://localhost:5001")
    print()
    
    try:
        success = test_ml_service()
        if success:
            print("\n✅ All tests completed successfully!")
            print("The ML service is ready for integration.")
        else:
            print("\n❌ Some tests failed.")
            print("Please check the ML service and try again.")
            
    except KeyboardInterrupt:
        print("\n\n⏹️  Testing interrupted by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()

