package com.ambiguous.fixpoint.repository;

import com.ambiguous.fixpoint.entity.Notification;
import com.ambiguous.fixpoint.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Find notifications for a specific user, ordered by latest first
    @Query("SELECT DISTINCT n FROM Notification n " +
           "LEFT JOIN FETCH n.user " +
           "LEFT JOIN FETCH n.report " +
           "LEFT JOIN FETCH n.comment " +
           "WHERE n.user = :user ORDER BY n.createdAt DESC")
    Page<Notification> findByUserOrderByCreatedAtDesc(@Param("user") User user, Pageable pageable);
    
    // Find unread notifications for a user
    @Query("SELECT DISTINCT n FROM Notification n " +
           "LEFT JOIN FETCH n.user " +
           "LEFT JOIN FETCH n.report " +
           "LEFT JOIN FETCH n.comment " +
           "WHERE n.user = :user AND n.isRead = false ORDER BY n.createdAt DESC")
    List<Notification> findByUserAndIsReadFalseOrderByCreatedAtDesc(@Param("user") User user);
    
    // Count unread notifications for a user
    long countByUserAndIsReadFalse(User user);
    
    // Find notifications by type for a user
    @Query("SELECT DISTINCT n FROM Notification n " +
           "LEFT JOIN FETCH n.user " +
           "LEFT JOIN FETCH n.report " +
           "LEFT JOIN FETCH n.comment " +
           "WHERE n.user = :user AND n.type = :type ORDER BY n.createdAt DESC")
    Page<Notification> findByUserAndTypeOrderByCreatedAtDesc(@Param("user") User user, @Param("type") Notification.NotificationType type, Pageable pageable);
    
    // Find notifications for a specific report
    @Query("SELECT DISTINCT n FROM Notification n " +
           "LEFT JOIN FETCH n.user " +
           "LEFT JOIN FETCH n.report " +
           "LEFT JOIN FETCH n.comment " +
           "WHERE n.report.id = :reportId ORDER BY n.createdAt DESC")
    List<Notification> findByReportOrderByCreatedAtDesc(@Param("reportId") Long reportId);
    
    // Mark all notifications as read for a user
    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.user = :user AND n.isRead = false")
    void markAllAsReadForUser(@Param("user") User user, @Param("readAt") LocalDateTime readAt);
    
    // Mark notification as read
    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.id = :id")
    void markAsRead(@Param("id") Long id, @Param("readAt") LocalDateTime readAt);
    
    // Delete old notifications (cleanup)
    @Modifying
    @Transactional
    @Query("DELETE FROM Notification n WHERE n.createdAt < :cutoffDate")
    void deleteOldNotifications(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    // Delete all notifications for a user (for testing)
    @Modifying
    @Transactional
    @Query("DELETE FROM Notification n WHERE n.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
    
    // Find recent notifications for a user (last 7 days)
    @Query("SELECT n FROM Notification n WHERE n.user = :user AND n.createdAt >= :since ORDER BY n.createdAt DESC")
    List<Notification> findRecentNotifications(@Param("user") User user, @Param("since") LocalDateTime since);
}
