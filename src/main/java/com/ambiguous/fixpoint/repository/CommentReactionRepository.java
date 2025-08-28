package com.ambiguous.fixpoint.repository;

import com.ambiguous.fixpoint.entity.CommentReaction;
import com.ambiguous.fixpoint.entity.Comment;
import com.ambiguous.fixpoint.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommentReactionRepository extends JpaRepository<CommentReaction, Long> {
    
    Optional<CommentReaction> findByUserAndComment(User user, Comment comment);
    
    List<CommentReaction> findByComment(Comment comment);
    
    List<CommentReaction> findByUser(User user);
    
    @Query("SELECT COUNT(cr) FROM CommentReaction cr WHERE cr.comment = :comment")
    Long countByComment(@Param("comment") Comment comment);
    
    @Query("SELECT COUNT(cr) FROM CommentReaction cr WHERE cr.comment = :comment AND cr.type = :type")
    Long countByCommentAndType(@Param("comment") Comment comment, @Param("type") CommentReaction.ReactionType type);
    
    @Query("SELECT COUNT(cr) FROM CommentReaction cr WHERE cr.user = :user")
    Long countByUser(@Param("user") User user);
    
    Boolean existsByUserAndComment(User user, Comment comment);
}
