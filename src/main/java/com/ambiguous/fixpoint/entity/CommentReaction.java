package com.ambiguous.fixpoint.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "comment_reactions", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "comment_id"}))
public class CommentReaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ReactionType type = ReactionType.LIKE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id", nullable = false)
    private Comment comment;

    @CreationTimestamp
    private LocalDateTime createdAt;

    // Constructors
    public CommentReaction() {}

    public CommentReaction(ReactionType type, User user, Comment comment) {
        this.type = type;
        this.user = user;
        this.comment = comment;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ReactionType getType() { return type; }
    public void setType(ReactionType type) { this.type = type; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Comment getComment() { return comment; }
    public void setComment(Comment comment) { this.comment = comment; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public enum ReactionType {
        LIKE, LOVE, HAHA, WOW, SAD, ANGRY
    }
}
