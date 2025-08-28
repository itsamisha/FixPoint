package com.ambiguous.fixpoint.dto;

import java.time.LocalDateTime;

public class CommentResponse {
    private Long id;
    private String content;
    private UserSummary user;
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public UserSummary getUser() { return user; }
    public void setUser(UserSummary user) { this.user = user; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}


