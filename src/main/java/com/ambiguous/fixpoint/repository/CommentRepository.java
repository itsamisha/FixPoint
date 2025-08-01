package com.ambiguous.fixpoint.repository;

import com.ambiguous.fixpoint.entity.Comment;
import com.ambiguous.fixpoint.entity.Report;
import com.ambiguous.fixpoint.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    List<Comment> findByReportOrderByCreatedAtAsc(Report report);
    
    List<Comment> findByUserOrderByCreatedAtDesc(User user);
    
    @Query("SELECT c FROM Comment c WHERE c.report = :report ORDER BY c.createdAt ASC")
    List<Comment> findCommentsByReport(@Param("report") Report report);
    
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.report = :report")
    Long countByReport(@Param("report") Report report);
    
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.user = :user")
    Long countByUser(@Param("user") User user);
}
