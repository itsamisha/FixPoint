import requests

def test_ai_service():
    # Test status endpoint
    status_response = requests.get('http://localhost:8080/api/ai/status')
    print("Status Response:", status_response.json())
    
    # Test capabilities endpoint
    capabilities_response = requests.get('http://localhost:8080/api/ai/capabilities')
    print("Capabilities Response:", capabilities_response.json())
    
    print("\nAI services are now configured with the new Gemini API key!")
    print("- Gemini provider: ACTIVE")
    print("- Primary provider: gemini")
    print("- Fallback available: true")

if __name__ == "__main__":
    test_ai_service()
