package com.ambiguous.fixpoint.repository;

import com.ambiguous.fixpoint.entity.ChatbotConversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChatbotConversationRepository extends JpaRepository<ChatbotConversation, Long> {
    
    // Find conversations by user ID, ordered by creation date (most recent first)
    List<ChatbotConversation> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    // Find conversations by username, ordered by creation date (most recent first)
    List<ChatbotConversation> findByUsernameOrderByCreatedAtDesc(String username);
    
    // Find conversations by user ID with pagination
    Page<ChatbotConversation> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    // Find conversations by username with pagination
    Page<ChatbotConversation> findByUsernameOrderByCreatedAtDesc(String username, Pageable pageable);
    
    // Find conversations by session ID
    List<ChatbotConversation> findBySessionIdOrderByCreatedAtAsc(String sessionId);
    
    // Find recent conversations by user (last N conversations)
    @Query("SELECT c FROM ChatbotConversation c WHERE c.userId = :userId ORDER BY c.createdAt DESC")
    List<ChatbotConversation> findRecentConversationsByUser(@Param("userId") Long userId, Pageable pageable);
    
    // Find recent conversations by username (last N conversations)
    @Query("SELECT c FROM ChatbotConversation c WHERE c.username = :username ORDER BY c.createdAt DESC")
    List<ChatbotConversation> findRecentConversationsByUsername(@Param("username") String username, Pageable pageable);
    
    // Find conversations within a date range
    List<ChatbotConversation> findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            Long userId, LocalDateTime startDate, LocalDateTime endDate);
    
    // Count conversations by user
    Long countByUserId(Long userId);
    
    // Count conversations by username
    Long countByUsername(String username);
    
    // Delete old conversations (for cleanup)
    void deleteByCreatedAtBefore(LocalDateTime cutoffDate);
}
