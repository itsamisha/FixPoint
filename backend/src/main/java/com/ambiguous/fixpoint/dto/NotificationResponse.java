package com.ambiguous.fixpoint.dto;

import com.ambiguous.fixpoint.entity.Notification;
import java.time.LocalDateTime;

public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private Notification.NotificationType type;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    private Integer progressPercentage;
    private String actionUrl;
    
    // Related entities (simplified)
    private Long reportId;
    private String reportTitle;
    private Long commentId;
    private UserSummary sender; // For chat notifications

    // Constructors
    public NotificationResponse() {}

    public NotificationResponse(Notification notification) {
        this.id = notification.getId();
        this.title = notification.getTitle();
        this.message = notification.getMessage();
        this.type = notification.getType();
        this.isRead = notification.getIsRead();
        this.createdAt = notification.getCreatedAt();
        this.readAt = notification.getReadAt();
        this.progressPercentage = notification.getProgressPercentage();
        this.actionUrl = notification.getActionUrl();
        
        if (notification.getReport() != null) {
            this.reportId = notification.getReport().getId();
            this.reportTitle = notification.getReport().getTitle();
        }
        
        if (notification.getComment() != null) {
            this.commentId = notification.getComment().getId();
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Notification.NotificationType getType() { return type; }
    public void setType(Notification.NotificationType type) { this.type = type; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }

    public Integer getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Integer progressPercentage) { this.progressPercentage = progressPercentage; }

    public String getActionUrl() { return actionUrl; }
    public void setActionUrl(String actionUrl) { this.actionUrl = actionUrl; }

    public Long getReportId() { return reportId; }
    public void setReportId(Long reportId) { this.reportId = reportId; }

    public String getReportTitle() { return reportTitle; }
    public void setReportTitle(String reportTitle) { this.reportTitle = reportTitle; }

    public Long getCommentId() { return commentId; }
    public void setCommentId(Long commentId) { this.commentId = commentId; }

    public UserSummary getSender() { return sender; }
    public void setSender(UserSummary sender) { this.sender = sender; }
}
