# Enhanced AI Setup Instructions

## Setting up OpenAI API for Enhanced Image Descriptions

### 1. Get OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in to your account
3. Click "Create new secret key"
4. Copy the generated API key (starts with `sk-`)

### 2. Configure the API Key
1. Open `src/main/resources/application.properties`
2. Replace `your_openai_api_key_here` with your actual API key:
   ```properties
   openai.api.key=sk-your-actual-api-key-here
   ```

### 3. Enhanced AI Features

The new EnhancedAIService provides:

#### **Category-Specific Analysis**
- Roads & Infrastructure: Focuses on cracks, potholes, traffic signs
- Sanitation & Waste: Identifies garbage types, overflow issues
- Street Lighting: Analyzes lighting conditions, pole damage
- Water & Drainage: Detects flooding, blocked drains, leaks
- Traffic & Parking: Traffic violations, illegal parking
- Public Safety: Safety hazards, emergency situations
- Environmental: Pollution, tree damage, air quality

#### **Smart Priority Assessment**
- HIGH: Emergency situations, safety hazards
- MEDIUM: Standard maintenance issues
- LOW: Minor cosmetic problems

#### **Fallback System**
- If OpenAI fails, falls back to basic AI analysis
- If both fail, provides helpful manual description prompts

### 4. API Endpoints

#### Enhanced Analysis
```
POST /api/ai/analyze-image-enhanced
Parameters:
- image: MultipartFile (max 10MB)
- category: String (e.g., "ROADS_INFRASTRUCTURE")

Response:
{
  "success": true,
  "description": "Detailed category-specific description...",
  "suggestedPriority": "HIGH",
  "category": "ROADS_INFRASTRUCTURE",
  "enhancedFeatures": {
    "aiGenerated": true,
    "categorySpecific": true,
    "priorityAssessment": true
  }
}
```

#### AI Capabilities
```
GET /api/ai/capabilities
Response:
{
  "enhancedDescriptions": true,
  "categorySpecificAnalysis": true,
  "priorityAssessment": true,
  "supportedCategories": [...],
  "maxFileSize": "10MB",
  "supportedFormats": ["JPEG", "PNG", "WebP"]
}
```

### 5. Frontend Integration

The ReportForm now:
1. **Requires category selection** before AI analysis for better results
2. **Automatically sets priority** based on AI assessment
3. **Shows enhanced success messages** indicating analysis quality
4. **Falls back gracefully** if enhanced AI is unavailable

### 6. Usage Instructions

1. **Upload an image** of the civic issue
2. **Select the category** that best describes the problem
3. **Click "Generate AI Description"** for enhanced analysis
4. **Review the generated description** and suggested priority
5. **Edit if needed** and submit the report

### 7. Cost Considerations

OpenAI Vision API pricing (as of 2024):
- **GPT-4 Vision**: ~$0.01 per 1000 tokens
- **Image processing**: Additional cost based on image size
- **Estimated cost per analysis**: $0.01-0.05

### 8. Testing

To test the enhanced AI:
1. Start the application with your API key configured
2. Go to report form and upload a test image
3. Select a category (e.g., "Roads & Infrastructure")
4. Click "Generate AI Description"
5. Check console logs for detailed analysis process

### 9. Troubleshooting

**Common Issues:**
- **"OpenAI API key not configured"**: Check application.properties
- **"Rate limit exceeded"**: Wait or upgrade OpenAI plan
- **"Image too large"**: Resize image under 10MB
- **Falls back to basic AI**: OpenAI service temporarily unavailable

**Debug Logs:**
Check application console for detailed error messages and API responses.

---

## Next Suggested AI Enhancements

1. **Smart Category Detection**: Auto-detect category from image
2. **Location-Based Insights**: Use GPS for location-specific analysis
3. **Severity Assessment**: AI-powered urgency scoring
4. **Similar Issue Detection**: Find similar reports in the database
5. **Automated Routing**: Route to appropriate departments
6. **Progress Tracking**: AI-powered status updates
7. **Citizen Feedback Analysis**: Sentiment analysis on comments
8. **Performance Analytics**: AI insights on resolution patterns
