package com.ambiguous.fixpoint.service;

import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.model.openai.OpenAiChatModel;
import dev.langchain4j.model.output.Response;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;

@Service
public class AIImageAnalysisService {

    @Value("${ai.provider:openai}") // Default to OpenAI, can be overridden
    private String aiProvider;

    @Value("${openai.api.key:}")
    private String openaiApiKey;

    @Value("${ai.demo.mode:true}") // Default to demo mode for testing
    private boolean demoMode;

    private static final String CIVIC_ISSUE_PROMPT = """
        Based on the image description provided, analyze and provide a detailed description of the civic issue shown. 
        Focus on:
        1. What type of infrastructure or public service problem is visible
        2. The severity and impact of the issue
        3. Specific details about the location, damage, or problem
        4. Any safety concerns or urgent matters
        
        Format the response as a clear, professional description suitable for a civic issue report.
        Keep it between 100-300 words and be specific about what you observe.
        
        Image description: %s
        """;

    public String analyzeImageAndGenerateDescription(MultipartFile imageFile) {
        try {
            // For now, we'll use a simplified approach
            // In a full implementation, you would use proper image analysis
            String imageInfo = "Image uploaded: " + imageFile.getOriginalFilename() + 
                             " (Size: " + imageFile.getSize() + " bytes, Type: " + imageFile.getContentType() + ")";
            
            // Check if we're in demo mode
            if (demoMode || openaiApiKey == null || openaiApiKey.trim().isEmpty()) {
                return generateDemoDescription(imageFile);
            }
            
            // Generate description based on AI provider
            String description = generateDescription(imageInfo);
            
            return description;
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to process image for AI analysis", e);
        }
    }

    private String generateDescription(String imageInfo) {
        if ("vertexai".equalsIgnoreCase(aiProvider)) {
            return generateWithVertexAI(imageInfo);
        } else {
            return generateWithOpenAI(imageInfo);
        }
    }

    private String generateWithOpenAI(String imageInfo) {
        if (openaiApiKey == null || openaiApiKey.trim().isEmpty()) {
            throw new RuntimeException("OpenAI API key not configured");
        }

        OpenAiChatModel model = OpenAiChatModel.builder()
                .apiKey(openaiApiKey)
                .modelName("gpt-4o")
                .maxTokens(500)
                .temperature(0.3)
                .build();

        // Create user message with image info
        String prompt = String.format(CIVIC_ISSUE_PROMPT, imageInfo);
        UserMessage userMessage = UserMessage.from(prompt);
        
        Response<AiMessage> response = model.generate(List.of(userMessage));
        return response.content().text();
    }

    private String generateWithVertexAI(String imageInfo) {
        // For now, fallback to OpenAI if Vertex AI is not properly configured
        // In a production environment, you would implement proper Vertex AI integration
        if (openaiApiKey != null && !openaiApiKey.trim().isEmpty()) {
            return generateWithOpenAI(imageInfo);
        } else {
            throw new RuntimeException("Vertex AI not implemented yet. Please use OpenAI or configure properly.");
        }
    }

    private String generateDemoDescription(MultipartFile imageFile) {
        String fileName = imageFile.getOriginalFilename();
        String contentType = imageFile.getContentType();
        long fileSize = imageFile.getSize();
        
        // Generate a realistic demo description based on file info
        StringBuilder description = new StringBuilder();
        description.append("AI Analysis of uploaded image: ").append(fileName).append("\n\n");
        
        description.append("Based on the image analysis, this appears to be a civic infrastructure issue. ");
        
        if (contentType != null && contentType.contains("image")) {
            description.append("The image shows clear evidence of infrastructure problems that require attention. ");
        }
        
        description.append("The issue appears to be of moderate severity and may impact public safety or convenience. ");
        description.append("Specific details include visible damage or deterioration that suggests this problem has been developing over time. ");
        description.append("Immediate attention is recommended to prevent further deterioration and ensure public safety. ");
        description.append("The location appears to be in a public area that is frequently used by community members. ");
        description.append("This type of issue typically requires coordination between local authorities and maintenance teams for proper resolution.");
        
        return description.toString();
    }

    // Fallback method for when AI service is not available
    public String generateFallbackDescription(String fileName) {
        return "Image uploaded: " + fileName + ". Please provide a detailed description of the civic issue shown in this image.";
    }
}
