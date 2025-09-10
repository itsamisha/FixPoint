package com.ambiguous.fixpoint.repository;

import com.ambiguous.fixpoint.entity.ChatMessage;
import com.ambiguous.fixpoint.entity.Report;
import com.ambiguous.fixpoint.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    @Query("SELECT m FROM ChatMessage m WHERE (m.sender = :user1 AND m.receiver = :user2) " +
           "OR (m.sender = :user2 AND m.receiver = :user1) ORDER BY m.createdAt ASC")
    List<ChatMessage> findConversationBetweenUsers(@Param("user1") User user1, 
                                                   @Param("user2") User user2);
    
    @Query("SELECT m FROM ChatMessage m WHERE m.report = :report ORDER BY m.createdAt ASC")
    List<ChatMessage> findByReportOrderByCreatedAtAsc(@Param("report") Report report);
    
    @Query("SELECT m FROM ChatMessage m WHERE m.receiver = :user AND m.isRead = false")
    List<ChatMessage> findUnreadMessagesByReceiver(@Param("user") User user);
    
    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.receiver = :user AND m.isRead = false")
    Long countUnreadMessagesByReceiver(@Param("user") User user);
    
    @Query("SELECT DISTINCT m.sender FROM ChatMessage m WHERE m.receiver = :user " +
           "UNION SELECT DISTINCT m.receiver FROM ChatMessage m WHERE m.sender = :user")
    List<User> findConversationParticipants(@Param("user") User user);
}
