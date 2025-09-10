package com.ambiguous.fixpoint.service;

import com.ambiguous.fixpoint.entity.ChatbotConversation;
import com.ambiguous.fixpoint.repository.ChatbotConversationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@Service
public class ChatbotService {

    @Autowired
    private ChatbotConversationRepository conversationRepository;

    @Autowired
    private MultiAIService multiAIService;

    /**
     * Generate chatbot response using AI service
     */
    public String generateResponse(String message, String context, String username) {
        try {
            // Build simple system prompt
            String systemPrompt = buildSystemPrompt(context, username);
            String fullPrompt = systemPrompt + "\n\nUser: " + message;
            
            // Get AI response
            String aiResponse = multiAIService.generateChatResponse(fullPrompt);
            
            if (aiResponse != null && !aiResponse.trim().isEmpty()) {
                // Save conversation if username is not anonymous and not a temporary session
                if (!"anonymous".equals(username) && !username.startsWith("session_")) {
                    saveConversation(username, message, aiResponse);
                }
                return aiResponse;
            }
        } catch (Exception e) {
            System.err.println("AI service error: " + e.getMessage());
        }
        
        // Simple fallback only if AI completely fails
        return "🤖 I'm having trouble connecting to my AI services right now. " +
               "Please try again in a moment! If the issue persists, contact support.";
    }

    /**
     * Build system prompt for AI
     */
    private String buildSystemPrompt(String context, String username) {
        return """
            You are FixPoint AI, a helpful assistant for civic engagement in Bangladesh.
            
            You help users with:
            • Civic issues and reporting problems to authorities
            • Government services and procedures in Bangladesh
            • Educational questions and career guidance
            • Technology support and troubleshooting
            • General life advice and information
            
            CRITICAL INSTRUCTIONS:
            • Be helpful, direct, and informative
            • Use UPPERCASE for emphasis instead of HTML tags
            • Use emojis to make responses engaging and friendly 🤖
            • Use bullet points (•) and numbered lists for organization
            • Provide specific, actionable advice
            • When relevant, mention FixPoint's reporting features
            • For Bangladesh-specific questions, provide local context
            • NEVER TRUNCATE - Always complete your full response
            • Write detailed, comprehensive answers with full explanations
            • Always finish all points you start making
            • Use line breaks and spacing for readability
            • Avoid any HTML tags or special formatting that might get encoded
            • PRIORITY: Complete responses over brevity - give full detailed answers
            • Continue until you've covered the topic thoroughly
            
            User: """ + (username != null && !username.equals("anonymous") ? username : "Citizen");
    }

    /**
     * Save conversation to database
     */
    private void saveConversation(String username, String userMessage, String botResponse) {
        try {
            ChatbotConversation conversation = new ChatbotConversation();
            conversation.setUsername(username);
            conversation.setUserMessage(userMessage);
            conversation.setBotResponse(botResponse);
            conversation.setCreatedAt(LocalDateTime.now());
            conversationRepository.save(conversation);
        } catch (Exception e) {
            System.err.println("Error saving conversation: " + e.getMessage());
        }
    }

    /**
     * Get conversation history for a user
     */
    public List<ChatbotConversation> getConversationHistory(String username, int limit) {
        return conversationRepository.findByUsernameOrderByCreatedAtDesc(username)
                .stream()
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * Get conversation history for API response
     */
    public List<Map<String, Object>> getConversationHistory(String sessionId) {
        try {
            List<ChatbotConversation> conversations = conversationRepository.findByUsernameOrderByCreatedAtDesc(sessionId)
                    .stream()
                    .limit(20)
                    .collect(Collectors.toList());
            
            return conversations.stream().map(conv -> {
                Map<String, Object> convMap = new HashMap<>();
                convMap.put("id", conv.getId());
                convMap.put("userMessage", conv.getUserMessage());
                convMap.put("botResponse", conv.getBotResponse());
                convMap.put("timestamp", conv.getCreatedAt().toString());
                convMap.put("sessionId", conv.getUsername()); // Using username field for sessionId
                return convMap;
            }).collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error getting conversation history: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Get service status
     */
    public ChatbotStatusResponse getStatus() {
        ChatbotStatusResponse status = new ChatbotStatusResponse();
        status.setAvailable(true);
        status.setModel("Multi-AI (Gemini/OpenAI)");
        status.setFeatures(List.of("Civic Assistance", "Education", "Career", "Technology", "General Help"));
        return status;
    }

    /**
     * Response class for status
     */
    public static class ChatbotStatusResponse {
        private boolean available;
        private String model;
        private List<String> features;

        public boolean isAvailable() { return available; }
        public void setAvailable(boolean available) { this.available = available; }
        public String getModel() { return model; }
        public void setModel(String model) { this.model = model; }
        public List<String> getFeatures() { return features; }
        public void setFeatures(List<String> features) { this.features = features; }
    }
}
