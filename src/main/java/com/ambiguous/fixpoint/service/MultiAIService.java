package com.ambiguous.fixpoint.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import com.ambiguous.fixpoint.entity.Report;

import java.util.*;
import java.util.Base64;

@Service
public class MultiAIService {

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${openai.api.key:}")
    private String openaiApiKey;

    @Value("${ai.provider:gemini}")
    private String aiProvider;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Generate enhanced description using the configured AI provider
     */
    public String generateEnhancedDescription(MultipartFile image, String category) {
        try {
            // Try primary AI provider
            if ("gemini".equalsIgnoreCase(aiProvider) && isGeminiConfigured()) {
                return generateWithGemini(image, category);
            } else if ("openai".equalsIgnoreCase(aiProvider) && isOpenAIConfigured()) {
                return generateWithOpenAI(image, category);
            }
            
            // Fallback to available provider
            if (isGeminiConfigured()) {
                System.out.println("Primary provider unavailable, falling back to Gemini");
                return generateWithGemini(image, category);
            } else if (isOpenAIConfigured()) {
                System.out.println("Primary provider unavailable, falling back to OpenAI");
                return generateWithOpenAI(image, category);
            }
            
            // If no API keys configured, use enhanced fallback
            return generateEnhancedFallback(image, category);
            
        } catch (Exception e) {
            System.err.println("AI generation failed: " + e.getMessage());
            return generateEnhancedFallback(image, category);
        }
    }

    /**
     * Generate description using Google Gemini Vision API
     */
    private String generateWithGemini(MultipartFile image, String category) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;
        
        String base64Image = Base64.getEncoder().encodeToString(image.getBytes());
        String prompt = buildPromptForCategory(category);
        
        Map<String, Object> requestBody = new HashMap<>();
        
        // Build the contents array
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();
        
        List<Map<String, Object>> parts = new ArrayList<>();
        
        // Add text part
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);
        parts.add(textPart);
        
        // Add image part
        Map<String, Object> imagePart = new HashMap<>();
        Map<String, Object> inlineData = new HashMap<>();
        inlineData.put("mime_type", "image/jpeg");
        inlineData.put("data", base64Image);
        imagePart.put("inline_data", inlineData);
        parts.add(imagePart);
        
        content.put("parts", parts);
        contents.add(content);
        
        requestBody.put("contents", contents);
        
        // Generation config for better responses
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.3);
        generationConfig.put("maxOutputTokens", 1500);
        requestBody.put("generationConfig", generationConfig);
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
        
        return parseGeminiResponse(response.getBody());
    }

    /**
     * Generate description using OpenAI API (fallback)
     */
    private String generateWithOpenAI(MultipartFile image, String category) throws Exception {
        String url = "https://api.openai.com/v1/chat/completions";
        String base64Image = Base64.getEncoder().encodeToString(image.getBytes());
        String prompt = buildPromptForCategory(category);
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + openaiApiKey);
        headers.set("Content-Type", "application/json");
        
        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", List.of(
            Map.of("type", "text", "text", prompt),
            Map.of("type", "image_url", "image_url", 
                Map.of("url", "data:image/jpeg;base64," + base64Image))
        ));
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "gpt-4o");
        requestBody.put("messages", List.of(message));
        requestBody.put("max_tokens", 1500);
        requestBody.put("temperature", 0.3);
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
        
        return parseOpenAIResponse(response.getBody());
    }

    /**
     * Parse Gemini API response
     */
    private String parseGeminiResponse(String responseBody) {
        try {
            // Simple parsing - in production, use proper JSON library
            if (responseBody.contains("\"text\"")) {
                int startIndex = responseBody.indexOf("\"text\": \"") + 9;
                int endIndex = responseBody.indexOf("\"", startIndex);
                if (startIndex > 8 && endIndex > startIndex) {
                    return responseBody.substring(startIndex, endIndex)
                        .replace("\\n", "\n")
                        .replace("\\\"", "\"");
                }
            }
            throw new Exception("Unable to parse Gemini response");
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Gemini response", e);
        }
    }

    /**
     * Parse OpenAI API response
     */
    private String parseOpenAIResponse(String responseBody) {
        try {
            // Simple parsing - in production, use proper JSON library
            if (responseBody.contains("\"content\"")) {
                int startIndex = responseBody.lastIndexOf("\"content\": \"") + 12;
                int endIndex = responseBody.indexOf("\"", startIndex);
                if (startIndex > 11 && endIndex > startIndex) {
                    return responseBody.substring(startIndex, endIndex)
                        .replace("\\n", "\n")
                        .replace("\\\"", "\"");
                }
            }
            throw new Exception("Unable to parse OpenAI response");
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse OpenAI response", e);
        }
    }

    /**
     * Build category-specific prompts
     */
    private String buildPromptForCategory(String category) {
        String basePrompt = "Analyze this civic infrastructure image and provide a detailed, professional description suitable for municipal reporting. ";
        
        switch (category.toUpperCase()) {
            case "ROADS_INFRASTRUCTURE":
                return basePrompt + "Focus on road surface conditions, potholes, cracks, traffic signs, markings, and any structural damage. Include measurements where visible, severity assessment, and potential impact on vehicle safety.";
                
            case "SANITATION_WASTE":
                return basePrompt + "Focus on waste management issues, garbage overflow, illegal dumping, bin conditions, cleanliness of public areas, and any sanitation hazards. Assess impact on public health and environment.";
                
            case "STREET_LIGHTING":
                return basePrompt + "Focus on street light functionality, pole conditions, electrical hazards, lighting adequacy for safety, and any maintenance needs. Consider impact on pedestrian and vehicle safety.";
                
            case "WATER_DRAINAGE":
                return basePrompt + "Focus on water drainage systems, flooding, blocked drains, pipe conditions, water quality issues, and stormwater management. Assess flood risk and infrastructure damage.";
                
            case "TRAFFIC_PARKING":
                return basePrompt + "Focus on traffic violations, illegal parking, traffic signal issues, road markings, pedestrian crossing safety, and traffic flow problems. Consider impact on public safety and traffic efficiency.";
                
            case "PUBLIC_SAFETY":
                return basePrompt + "Focus on safety hazards, security concerns, emergency access issues, dangerous structures, and any threats to public safety. Prioritize immediate risks to citizens.";
                
            case "ENVIRONMENTAL":
                return basePrompt + "Focus on environmental issues like pollution, tree damage, air quality, noise pollution, and ecological concerns. Assess environmental impact and public health implications.";
                
            default:
                return basePrompt + "Provide a comprehensive description of the issue shown, including its potential impact on the community and recommended priority level.";
        }
    }

    /**
     * Enhanced fallback description (no API required)
     */
    private String generateEnhancedFallback(MultipartFile image, String category) {
        String filename = image.getOriginalFilename();
        long fileSize = image.getSize();
        String contentType = image.getContentType();
        
        String categorySpecific = getCategorySpecificFallback(category);
        
        return String.format(
            "Civic infrastructure issue reported in %s category. %s " +
            "Image submitted: %s (Size: %.1f KB, Type: %s). " +
            "Manual review recommended to assess severity and determine appropriate response timeline. " +
            "Please provide additional details about the specific issue observed in the image.",
            category.replace("_", " ").toLowerCase(),
            categorySpecific,
            filename != null ? filename : "image file",
            fileSize / 1024.0,
            contentType != null ? contentType : "unknown"
        );
    }

    /**
     * Category-specific fallback descriptions
     */
    private String getCategorySpecificFallback(String category) {
        switch (category.toUpperCase()) {
            case "ROADS_INFRASTRUCTURE":
                return "This appears to be a road or infrastructure-related issue that may affect vehicle safety and traffic flow. Common issues include potholes, cracks, damaged traffic signs, or road surface deterioration.";
                
            case "SANITATION_WASTE":
                return "This appears to be a sanitation or waste management issue that may impact public health and cleanliness. Common issues include overflowing bins, illegal dumping, or inadequate waste collection.";
                
            case "STREET_LIGHTING":
                return "This appears to be a street lighting issue that may affect public safety and visibility. Common issues include non-functioning lights, damaged poles, or inadequate illumination.";
                
            case "WATER_DRAINAGE":
                return "This appears to be a water or drainage issue that may cause flooding or infrastructure damage. Common issues include blocked drains, pipe leaks, or poor stormwater management.";
                
            case "TRAFFIC_PARKING":
                return "This appears to be a traffic or parking violation that may affect road safety and traffic flow. Common issues include illegal parking, traffic violations, or signal malfunctions.";
                
            case "PUBLIC_SAFETY":
                return "This appears to be a public safety concern that requires immediate attention. Safety issues can pose direct risks to citizens and may require emergency response.";
                
            case "ENVIRONMENTAL":
                return "This appears to be an environmental issue that may impact public health and ecological well-being. Common issues include pollution, tree damage, or environmental hazards.";
                
            default:
                return "This appears to be a general civic issue that requires municipal attention.";
        }
    }

    /**
     * Assess priority using AI or fallback logic
     */
    public Report.Priority assessPriority(String description, String category) {
        try {
            if (isGeminiConfigured() || isOpenAIConfigured()) {
                String priorityPrompt = "Based on this civic issue description: '" + description + "', " +
                    "determine the priority level. Respond with only one word: LOW, MEDIUM, HIGH, or URGENT.";
                
                // Try to get AI assessment (simplified)
                if (isGeminiConfigured()) {
                    // For simplicity, using text-only Gemini
                    return getAIPriority(priorityPrompt, "gemini");
                } else if (isOpenAIConfigured()) {
                    return getAIPriority(priorityPrompt, "openai");
                }
            }
        } catch (Exception e) {
            System.err.println("AI priority assessment failed: " + e.getMessage());
        }
        
        // Fallback priority logic
        return getFallbackPriority(description, category);
    }

    /**
     * Fallback priority assessment
     */
    private Report.Priority getFallbackPriority(String description, String category) {
        String lowerDesc = description.toLowerCase();
        
        // High priority indicators
        if (lowerDesc.contains("emergency") || lowerDesc.contains("danger") || 
            lowerDesc.contains("hazard") || lowerDesc.contains("urgent") ||
            lowerDesc.contains("immediate") || lowerDesc.contains("safety")) {
            return Report.Priority.URGENT;
        }
        
        // Medium-high priority indicators
        if (lowerDesc.contains("large") || lowerDesc.contains("significant") ||
            lowerDesc.contains("major") || lowerDesc.contains("damage")) {
            return Report.Priority.HIGH;
        }
        
        // Category-based priorities
        switch (category.toUpperCase()) {
            case "PUBLIC_SAFETY":
                return Report.Priority.HIGH;
            case "TRAFFIC_PARKING":
            case "WATER_DRAINAGE":
                return Report.Priority.MEDIUM;
            default:
                return Report.Priority.MEDIUM;
        }
    }

    /**
     * Get AI priority assessment
     */
    private Report.Priority getAIPriority(String prompt, String provider) {
        // Simplified implementation - in production, implement full API calls
        return Report.Priority.MEDIUM; // Default fallback
    }

    /**
     * Check if Gemini is configured
     */
    private boolean isGeminiConfigured() {
        return geminiApiKey != null && !geminiApiKey.isEmpty() && 
               !geminiApiKey.equals("your_gemini_api_key_here");
    }

    /**
     * Check if OpenAI is configured
     */
    private boolean isOpenAIConfigured() {
        return openaiApiKey != null && !openaiApiKey.isEmpty() && 
               !openaiApiKey.equals("your_openai_api_key_here") &&
               !openaiApiKey.startsWith("sk-proj-qt6Nwgb7"); // Avoid the quota-exceeded key
    }

    /**
     * Translate text to Bangla using AI
     */
    public String translateTextToBangla(String text) {
        try {
            // Try with configured AI provider
            if ("gemini".equalsIgnoreCase(aiProvider) && isGeminiConfigured()) {
                return translateWithGemini(text);
            } else if ("openai".equalsIgnoreCase(aiProvider) && isOpenAIConfigured()) {
                return translateWithOpenAI(text);
            }
            
            // Fallback to available provider
            if (isGeminiConfigured()) {
                return translateWithGemini(text);
            } else if (isOpenAIConfigured()) {
                return translateWithOpenAI(text);
            }
            
            // If no AI providers available, return a simple fallback translation
            return generateFallbackTranslation(text);
            
        } catch (Exception e) {
            System.err.println("Translation failed with all providers: " + e.getMessage());
            return generateFallbackTranslation(text);
        }
    }

    /**
     * Translate text using Google Gemini
     */
    private String translateWithGemini(String text) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;
        
        String prompt = "Translate the following English text to Bangla (Bengali). Provide only the translation without any additional text or explanations:\n\n" + text;
        
        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();
        List<Map<String, Object>> parts = new ArrayList<>();
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);
        parts.add(textPart);
        content.put("parts", parts);
        contents.add(content);
        requestBody.put("contents", contents);
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        
        ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
        String responseBody = response.getBody();
        
        // Parse the response to extract the translation
        if (responseBody != null && responseBody.contains("\"text\"")) {
            int startIndex = responseBody.indexOf("\"text\": \"") + 9;
            int endIndex = responseBody.indexOf("\"", startIndex);
            if (startIndex > 8 && endIndex > startIndex) {
                return responseBody.substring(startIndex, endIndex)
                    .replace("\\n", "\n")
                    .replace("\\\"", "\"")
                    .trim();
            }
        }
        
        throw new RuntimeException("No translation received from Gemini");
    }

    /**
     * Translate text using OpenAI
     */
    private String translateWithOpenAI(String text) throws Exception {
        String url = "https://api.openai.com/v1/chat/completions";
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "gpt-3.5-turbo");
        requestBody.put("max_tokens", 1000);
        requestBody.put("temperature", 0.3);
        
        List<Map<String, String>> messages = new ArrayList<>();
        Map<String, String> systemMessage = new HashMap<>();
        systemMessage.put("role", "system");
        systemMessage.put("content", "You are a professional translator. Translate the given English text to Bangla (Bengali). Provide only the translation without any additional text or explanations.");
        messages.add(systemMessage);
        
        Map<String, String> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", text);
        messages.add(userMessage);
        
        requestBody.put("messages", messages);
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        headers.set("Authorization", "Bearer " + openaiApiKey);
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
        String responseBody = response.getBody();
        
        // Parse the response to extract the translation
        if (responseBody != null && responseBody.contains("\"content\"")) {
            int startIndex = responseBody.lastIndexOf("\"content\": \"") + 12;
            int endIndex = responseBody.indexOf("\"", startIndex);
            if (startIndex > 11 && endIndex > startIndex) {
                return responseBody.substring(startIndex, endIndex)
                    .replace("\\n", "\n")
                    .replace("\\\"", "\"")
                    .trim();
            }
        }
        
        throw new RuntimeException("No translation received from OpenAI");
    }

    /**
     * Generate a simple fallback translation when AI services are unavailable
     */
    private String generateFallbackTranslation(String text) {
        // This is a very basic fallback - in production you might want to use 
        // a local translation service or provide a more sophisticated fallback
        return "[বাংলা অনুবাদ প্রয়োজন] " + text + " [AI translation service temporarily unavailable - please translate manually]";
    }

    /**
     * Get current AI provider status
     */
    public Map<String, Object> getProviderStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("primaryProvider", aiProvider);
        status.put("geminiConfigured", isGeminiConfigured());
        status.put("openaiConfigured", isOpenAIConfigured());
        status.put("fallbackAvailable", true);
        return status;
    }

    /**
     * Categorize issue using AI analysis
     */
    public Map<String, Object> categorizeIssue(String description, MultipartFile image, String location) {
        try {
            // Try primary AI provider for categorization
            if ("gemini".equalsIgnoreCase(aiProvider) && isGeminiConfigured()) {
                return categorizeWithGemini(description, image, location);
            } else if ("openai".equalsIgnoreCase(aiProvider) && isOpenAIConfigured()) {
                return categorizeWithOpenAI(description, image, location);
            }
            
            // Fallback to available provider
            if (isGeminiConfigured()) {
                System.out.println("Primary provider unavailable for categorization, falling back to Gemini");
                return categorizeWithGemini(description, image, location);
            } else if (isOpenAIConfigured()) {
                System.out.println("Primary provider unavailable for categorization, falling back to OpenAI");
                return categorizeWithOpenAI(description, image, location);
            }
            
            // If no AI providers available, use keyword-based fallback
            return generateFallbackCategorization(description);
            
        } catch (Exception e) {
            System.err.println("Error in AI categorization: " + e.getMessage());
            return generateFallbackCategorization(description);
        }
    }

    private Map<String, Object> categorizeWithGemini(String description, MultipartFile image, String location) {
        try {
            String prompt = buildCategorizationPrompt(description, location);
            
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> contents = new HashMap<>();
            Map<String, Object> parts = new HashMap<>();
            parts.put("text", prompt);
            contents.put("parts", Arrays.asList(parts));
            requestBody.put("contents", Arrays.asList(contents));

            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" + geminiApiKey;
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            
            if (response.getBody() != null) {
                return parseCategorizationResponse(response.getBody());
            }
            
        } catch (Exception e) {
            System.err.println("Gemini categorization error: " + e.getMessage());
        }
        
        return generateFallbackCategorization(description);
    }

    private Map<String, Object> categorizeWithOpenAI(String description, MultipartFile image, String location) {
        try {
            String prompt = buildCategorizationPrompt(description, location);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "gpt-3.5-turbo");
            requestBody.put("max_tokens", 500);
            requestBody.put("temperature", 0.3);
            
            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);
            requestBody.put("messages", Arrays.asList(message));

            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            headers.set("Authorization", "Bearer " + openaiApiKey);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(
                "https://api.openai.com/v1/chat/completions", 
                request, 
                Map.class
            );
            
            if (response.getBody() != null) {
                return parseOpenAICategorizationResponse(response.getBody());
            }
            
        } catch (Exception e) {
            System.err.println("OpenAI categorization error: " + e.getMessage());
        }
        
        return generateFallbackCategorization(description);
    }

    private String buildCategorizationPrompt(String description, String location) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an AI assistant that categorizes community issues and reports. ");
        prompt.append("Analyze the following issue and respond with a JSON object containing category, priority, confidence, and tags.\n\n");
        
        prompt.append("Available categories:\n");
        prompt.append("- infrastructure: Roads, bridges, buildings, public facilities\n");
        prompt.append("- utilities: Water, electricity, gas, sewage, internet\n");
        prompt.append("- safety: Street lighting, security, emergency situations\n");
        prompt.append("- environment: Waste management, pollution, green spaces\n");
        prompt.append("- transport: Public transport, traffic, parking\n");
        prompt.append("- healthcare: Health facilities, medical emergencies\n");
        prompt.append("- education: Schools, libraries, educational facilities\n");
        prompt.append("- social: Community centers, social programs, events\n");
        prompt.append("- other: Issues that don't fit other categories\n\n");
        
        prompt.append("Priority levels: low, medium, high, urgent\n\n");
        
        prompt.append("Issue Description: \"").append(description).append("\"\n");
        if (location != null && !location.trim().isEmpty()) {
            prompt.append("Location: ").append(location).append("\n");
        }
        
        prompt.append("\nRespond with ONLY a JSON object in this exact format:\n");
        prompt.append("{\n");
        prompt.append("  \"category\": \"category_id\",\n");
        prompt.append("  \"priority\": \"priority_level\",\n");
        prompt.append("  \"confidence\": 0.8,\n");
        prompt.append("  \"tags\": [\"tag1\", \"tag2\"],\n");
        prompt.append("  \"reasoning\": \"Brief explanation\"\n");
        prompt.append("}");
        
        return prompt.toString();
    }

    private Map<String, Object> parseCategorizationResponse(Map<String, Object> response) {
        try {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> candidate = candidates.get(0);
                Map<String, Object> content = (Map<String, Object>) candidate.get("content");
                List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                if (parts != null && !parts.isEmpty()) {
                    String text = (String) parts.get(0).get("text");
                    return parseCategorizationJSON(text);
                }
            }
        } catch (Exception e) {
            System.err.println("Error parsing Gemini categorization response: " + e.getMessage());
        }
        return null;
    }

    private Map<String, Object> parseOpenAICategorizationResponse(Map<String, Object> response) {
        try {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            if (choices != null && !choices.isEmpty()) {
                Map<String, Object> choice = choices.get(0);
                Map<String, Object> message = (Map<String, Object>) choice.get("message");
                String content = (String) message.get("content");
                return parseCategorizationJSON(content);
            }
        } catch (Exception e) {
            System.err.println("Error parsing OpenAI categorization response: " + e.getMessage());
        }
        return null;
    }

    private Map<String, Object> parseCategorizationJSON(String jsonText) {
        try {
            // Basic JSON parsing for the categorization response
            jsonText = jsonText.trim();
            if (jsonText.startsWith("```json")) {
                jsonText = jsonText.substring(7);
            }
            if (jsonText.endsWith("```")) {
                jsonText = jsonText.substring(0, jsonText.length() - 3);
            }
            jsonText = jsonText.trim();
            
            // Simple JSON parsing (you might want to use a proper JSON library)
            Map<String, Object> result = new HashMap<>();
            
            // Extract category
            String categoryId = extractJsonValue(jsonText, "category", "other");
            result.put("category", createCategoryObject(categoryId));
            
            // Extract priority
            String priority = extractJsonValue(jsonText, "priority", "medium");
            result.put("priority", createPriorityObject(priority));
            
            // Extract confidence
            String confidenceStr = extractJsonValue(jsonText, "confidence", "0.5");
            double confidence = Double.parseDouble(confidenceStr);
            result.put("confidence", confidence);
            
            // Extract tags
            result.put("suggestedTags", extractJsonArray(jsonText, "tags"));
            
            // Extract reasoning
            result.put("reasoning", extractJsonValue(jsonText, "reasoning", "AI-based categorization"));
            
            return result;
            
        } catch (Exception e) {
            System.err.println("Error parsing categorization JSON: " + e.getMessage());
            return null;
        }
    }

    private String extractJsonValue(String json, String key, String defaultValue) {
        try {
            String pattern = "\"" + key + "\"\\s*:\\s*\"([^\"]+)\"";
            java.util.regex.Pattern p = java.util.regex.Pattern.compile(pattern);
            java.util.regex.Matcher m = p.matcher(json);
            if (m.find()) {
                return m.group(1);
            }
        } catch (Exception e) {
            System.err.println("Error extracting JSON value for key: " + key);
        }
        return defaultValue;
    }

    private List<String> extractJsonArray(String json, String key) {
        try {
            String pattern = "\"" + key + "\"\\s*:\\s*\\[([^\\]]+)\\]";
            java.util.regex.Pattern p = java.util.regex.Pattern.compile(pattern);
            java.util.regex.Matcher m = p.matcher(json);
            if (m.find()) {
                String arrayContent = m.group(1);
                List<String> tags = new ArrayList<>();
                String[] items = arrayContent.split(",");
                for (String item : items) {
                    String tag = item.trim().replaceAll("\"", "");
                    if (!tag.isEmpty()) {
                        tags.add(tag);
                    }
                }
                return tags;
            }
        } catch (Exception e) {
            System.err.println("Error extracting JSON array for key: " + key);
        }
        return new ArrayList<>();
    }

    private Map<String, Object> createCategoryObject(String categoryId) {
        Map<String, Object> category = new HashMap<>();
        
        switch (categoryId.toLowerCase()) {
            case "infrastructure":
                category.put("id", "infrastructure");
                category.put("name", "Infrastructure");
                category.put("description", "Roads, bridges, buildings, public facilities");
                category.put("icon", "🏗️");
                category.put("color", "#3B82F6");
                break;
            case "utilities":
                category.put("id", "utilities");
                category.put("name", "Utilities");
                category.put("description", "Water, electricity, gas, sewage, internet");
                category.put("icon", "⚡");
                category.put("color", "#F59E0B");
                break;
            case "safety":
                category.put("id", "safety");
                category.put("name", "Safety & Security");
                category.put("description", "Street lighting, security, emergency situations");
                category.put("icon", "🚨");
                category.put("color", "#EF4444");
                break;
            case "environment":
                category.put("id", "environment");
                category.put("name", "Environment");
                category.put("description", "Waste management, pollution, green spaces");
                category.put("icon", "🌱");
                category.put("color", "#10B981");
                break;
            case "transport":
                category.put("id", "transport");
                category.put("name", "Transportation");
                category.put("description", "Public transport, traffic, parking");
                category.put("icon", "🚌");
                category.put("color", "#8B5CF6");
                break;
            case "healthcare":
                category.put("id", "healthcare");
                category.put("name", "Healthcare");
                category.put("description", "Health facilities, medical emergencies");
                category.put("icon", "🏥");
                category.put("color", "#EC4899");
                break;
            case "education":
                category.put("id", "education");
                category.put("name", "Education");
                category.put("description", "Schools, libraries, educational facilities");
                category.put("icon", "📚");
                category.put("color", "#6366F1");
                break;
            case "social":
                category.put("id", "social");
                category.put("name", "Social Services");
                category.put("description", "Community centers, social programs, events");
                category.put("icon", "🏛️");
                category.put("color", "#14B8A6");
                break;
            default:
                category.put("id", "other");
                category.put("name", "Other");
                category.put("description", "Issues that don't fit other categories");
                category.put("icon", "📋");
                category.put("color", "#6B7280");
        }
        
        return category;
    }

    private Map<String, Object> createPriorityObject(String priority) {
        Map<String, Object> priorityObj = new HashMap<>();
        priorityObj.put("value", priority.toLowerCase());
        
        switch (priority.toLowerCase()) {
            case "urgent":
                priorityObj.put("color", "#DC2626");
                break;
            case "high":
                priorityObj.put("color", "#EF4444");
                break;
            case "medium":
                priorityObj.put("color", "#F59E0B");
                break;
            case "low":
            default:
                priorityObj.put("color", "#10B981");
        }
        
        return priorityObj;
    }

    private Map<String, Object> generateFallbackCategorization(String description) {
        Map<String, Object> result = new HashMap<>();
        
        // Simple keyword-based categorization
        String lowerDesc = description.toLowerCase();
        String categoryId = "other";
        String priority = "medium";
        
        if (lowerDesc.contains("road") || lowerDesc.contains("bridge") || lowerDesc.contains("building")) {
            categoryId = "infrastructure";
        } else if (lowerDesc.contains("water") || lowerDesc.contains("electricity") || lowerDesc.contains("power")) {
            categoryId = "utilities";
            priority = "high";
        } else if (lowerDesc.contains("light") || lowerDesc.contains("security") || lowerDesc.contains("emergency")) {
            categoryId = "safety";
            priority = "high";
        } else if (lowerDesc.contains("waste") || lowerDesc.contains("garbage") || lowerDesc.contains("pollution")) {
            categoryId = "environment";
        } else if (lowerDesc.contains("bus") || lowerDesc.contains("traffic") || lowerDesc.contains("parking")) {
            categoryId = "transport";
        }
        
        // Check for urgency keywords
        if (lowerDesc.contains("emergency") || lowerDesc.contains("urgent") || lowerDesc.contains("danger")) {
            priority = "urgent";
        } else if (lowerDesc.contains("broken") || lowerDesc.contains("damaged") || lowerDesc.contains("leak")) {
            priority = "high";
        }
        
        result.put("category", createCategoryObject(categoryId));
        result.put("priority", createPriorityObject(priority));
        result.put("confidence", 0.4);
        result.put("suggestedTags", new ArrayList<>());
        result.put("reasoning", "Keyword-based categorization (AI services unavailable)");
        
        return result;
    }
}
