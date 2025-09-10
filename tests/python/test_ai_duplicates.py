import requests
import json

def test_ai_duplicate_detection():
    url = "http://localhost:8080/api/reports/check-duplicates"
    headers = {"Content-Type": "application/json"}
    
    # Test case that should definitely trigger AI analysis
    test_data = {
        "title": "Asphalt deterioration issue",
        "description": "The pavement has multiple holes and cracks making it dangerous",
        "category": "ROADS_INFRASTRUCTURE", 
        "latitude": 23.8103,
        "longitude": 90.4125
    }
    
    print("🧪 Testing AI Duplicate Detection")
    print(f"📝 Test description: '{test_data['description']}'")
    print("🔍 Looking for matches against existing 'pothole' reports...")
    print()
    
    try:
        response = requests.post(url, headers=headers, json=test_data)
        result = response.json()
        
        print(f"✅ Response received!")
        print(f"📊 Has duplicates: {result.get('hasDuplicates', False)}")
        print(f"📈 Duplicate count: {result.get('duplicateCount', 0)}")
        
        if result.get('duplicates'):
            print("\n🎯 Found duplicates:")
            for i, dup in enumerate(result['duplicates'][:3]):  # Show first 3
                print(f"   {i+1}. '{dup['title']}' - {dup['similarity']}% similar")
                print(f"      Description: '{dup['description']}'")
        
        print("\n💡 This should show AI analysis logs in the server console!")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_ai_duplicate_detection()
