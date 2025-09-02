package com.ambiguous.fixpoint.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "chatbot_conversations")
public class ChatbotConversation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "username")
    private String username;

    @Column(name = "user_message", columnDefinition = "TEXT")
    private String userMessage;

    @Column(name = "bot_response", columnDefinition = "TEXT")
    private String botResponse;

    @Column(name = "context_info", columnDefinition = "TEXT")
    private String contextInfo;

    @Column(name = "response_time_ms")
    private Long responseTimeMs;

    @Column(name = "ai_service_used")
    private String aiServiceUsed;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "session_id")
    private String sessionId;

    public ChatbotConversation() {}

    public ChatbotConversation(Long userId, String username, String userMessage, String botResponse, 
                              String contextInfo, Long responseTimeMs, String aiServiceUsed, 
                              LocalDateTime createdAt, String sessionId) {
        this.userId = userId;
        this.username = username;
        this.userMessage = userMessage;
        this.botResponse = botResponse;
        this.contextInfo = contextInfo;
        this.responseTimeMs = responseTimeMs;
        this.aiServiceUsed = aiServiceUsed;
        this.createdAt = createdAt;
        this.sessionId = sessionId;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getUserMessage() { return userMessage; }
    public void setUserMessage(String userMessage) { this.userMessage = userMessage; }

    public String getBotResponse() { return botResponse; }
    public void setBotResponse(String botResponse) { this.botResponse = botResponse; }

    public String getContextInfo() { return contextInfo; }
    public void setContextInfo(String contextInfo) { this.contextInfo = contextInfo; }

    public Long getResponseTimeMs() { return responseTimeMs; }
    public void setResponseTimeMs(Long responseTimeMs) { this.responseTimeMs = responseTimeMs; }

    public String getAiServiceUsed() { return aiServiceUsed; }
    public void setAiServiceUsed(String aiServiceUsed) { this.aiServiceUsed = aiServiceUsed; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
}
