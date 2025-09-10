package com.ambiguous.fixpoint.dto;

import com.ambiguous.fixpoint.entity.CommentReaction;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class CommentResponse {
    private Long id;
    private String content;
    private UserSummary user;
    private LocalDateTime createdAt;
    private Map<CommentReaction.ReactionType, Long> reactionCounts;
    private CommentReaction.ReactionType userReaction;
    private List<CommentResponse> replies;
    private Long replyCount;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public UserSummary getUser() { return user; }
    public void setUser(UserSummary user) { this.user = user; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Map<CommentReaction.ReactionType, Long> getReactionCounts() { return reactionCounts; }
    public void setReactionCounts(Map<CommentReaction.ReactionType, Long> reactionCounts) { this.reactionCounts = reactionCounts; }

    public CommentReaction.ReactionType getUserReaction() { return userReaction; }
    public void setUserReaction(CommentReaction.ReactionType userReaction) { this.userReaction = userReaction; }

    public List<CommentResponse> getReplies() { return replies; }
    public void setReplies(List<CommentResponse> replies) { this.replies = replies; }

    public Long getReplyCount() { return replyCount; }
    public void setReplyCount(Long replyCount) { this.replyCount = replyCount; }
}


