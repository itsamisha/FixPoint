package com.ambiguous.fixpoint.dto;

import com.ambiguous.fixpoint.entity.CommentReaction;
import jakarta.validation.constraints.NotNull;

public class CommentReactionRequest {
    @NotNull
    private CommentReaction.ReactionType type;

    public CommentReaction.ReactionType getType() {
        return type;
    }

    public void setType(CommentReaction.ReactionType type) {
        this.type = type;
    }
}
