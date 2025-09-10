package com.ambiguous.fixpoint.repository;

import com.ambiguous.fixpoint.entity.Comment;
import com.ambiguous.fixpoint.entity.Report;
import com.ambiguous.fixpoint.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    List<Comment> findByReportOrderByCreatedAtAsc(Report report);
    
    @Query("SELECT c FROM Comment c LEFT JOIN FETCH c.user LEFT JOIN FETCH c.report WHERE c.report = :report AND c.parentComment IS NULL ORDER BY c.createdAt ASC")
    List<Comment> findByReportAndParentCommentIsNullOrderByCreatedAtAscWithRelations(@Param("report") Report report);
    
    List<Comment> findByReportAndParentCommentIsNullOrderByCreatedAtAsc(Report report);
    
    @Query("SELECT c FROM Comment c LEFT JOIN FETCH c.user LEFT JOIN FETCH c.report WHERE c.parentComment = :parentComment ORDER BY c.createdAt ASC")
    List<Comment> findByParentCommentOrderByCreatedAtAscWithRelations(@Param("parentComment") Comment parentComment);
    
    List<Comment> findByParentCommentOrderByCreatedAtAsc(Comment parentComment);
    
    List<Comment> findByUserOrderByCreatedAtDesc(User user);
    
    @Query("SELECT c FROM Comment c WHERE c.report = :report ORDER BY c.createdAt ASC")
    List<Comment> findCommentsByReport(@Param("report") Report report);
    
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.report = :report")
    Long countByReport(@Param("report") Report report);
    
    @Query("SELECT c FROM Comment c LEFT JOIN FETCH c.user LEFT JOIN FETCH c.report LEFT JOIN FETCH c.parentComment WHERE c.id = :id")
    Optional<Comment> findByIdWithRelations(@Param("id") Long id);
    
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.parentComment = :parentComment")
    Long countByParentComment(@Param("parentComment") Comment parentComment);
    
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.user = :user")
    Long countByUser(@Param("user") User user);
}
