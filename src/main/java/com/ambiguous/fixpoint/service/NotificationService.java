package com.ambiguous.fixpoint.service;

import com.ambiguous.fixpoint.dto.NotificationResponse;
import com.ambiguous.fixpoint.entity.Notification;
import com.ambiguous.fixpoint.entity.User;
import com.ambiguous.fixpoint.entity.Report;
import com.ambiguous.fixpoint.entity.Comment;
import com.ambiguous.fixpoint.entity.Organization;
import com.ambiguous.fixpoint.repository.NotificationRepository;
import com.ambiguous.fixpoint.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Create a progress update notification
     */
    public void createProgressNotification(Report report, User recipient, int progressPercentage) {
        String title = "Progress Update: " + report.getTitle();
        String message = String.format("Report progress updated to %d%%. %s", 
            progressPercentage, 
            progressPercentage == 100 ? "Task completed!" : "Work in progress...");
        
        Notification notification = new Notification(title, message, Notification.NotificationType.PROGRESS_UPDATE, recipient, report);
        notification.setProgressPercentage(progressPercentage);
        notification.setActionUrl("/reports/" + report.getId());
        
        Notification saved = notificationRepository.save(notification);
        
        // Send real-time notification
        sendRealTimeNotification(recipient, saved);
    }

    /**
     * Create progress update notifications for both reporter and organization admins
     */
    public void createProgressNotificationForAll(Report report, int progressPercentage) {
        // Notify the reporter
        if (report.getReporter() != null) {
            createProgressNotification(report, report.getReporter(), progressPercentage);
        }
        
        // Notify organization admins
        if (report.getTargetOrganizations() != null && !report.getTargetOrganizations().isEmpty()) {
            for (Organization org : report.getTargetOrganizations()) {
                // Find admin users for this organization
                List<User> admins = userRepository.findByOrganizationAndUserType(org, User.UserType.ORGANIZATION_ADMIN);
                for (User admin : admins) {
                    if (!admin.getId().equals(report.getReporter().getId())) { // Don't duplicate for reporter
                        String adminTitle = "Progress Update on Assigned Report: " + report.getTitle();
                        String adminMessage = String.format("Report progress updated to %d%% by staff member. %s", 
                            progressPercentage, 
                            progressPercentage == 100 ? "Task completed!" : "Work in progress...");
                        
                        Notification adminNotification = new Notification(adminTitle, adminMessage, 
                            Notification.NotificationType.PROGRESS_UPDATE, admin, report);
                        adminNotification.setProgressPercentage(progressPercentage);
                        adminNotification.setActionUrl("/reports/" + report.getId());
                        
                        Notification savedAdmin = notificationRepository.save(adminNotification);
                        sendRealTimeNotification(admin, savedAdmin);
                    }
                }
            }
        }
    }

    /**
     * Create a new comment notification
     */
    public void createCommentNotification(Comment comment, User recipient) {
        String title = "New Comment on: " + comment.getReport().getTitle();
        String message = String.format("%s commented: %s", 
            comment.getUser().getFullName(), 
            comment.getContent().length() > 50 ? 
                comment.getContent().substring(0, 50) + "..." : 
                comment.getContent());
        
        Notification notification = new Notification(title, message, Notification.NotificationType.NEW_COMMENT, recipient, comment.getReport());
        notification.setComment(comment);
        notification.setActionUrl("/reports/" + comment.getReport().getId());
        
        Notification saved = notificationRepository.save(notification);
        
        // Send real-time notification
        sendRealTimeNotification(recipient, saved);
    }

    /**
     * Create comment notifications for both reporter and organization admins
     */
    public void createCommentNotificationForAll(Comment comment) {
        Report report = comment.getReport();
        User commenter = comment.getUser();
        
        // Notify the reporter (if not the commenter)
        if (report.getReporter() != null && !report.getReporter().getId().equals(commenter.getId())) {
            createCommentNotification(comment, report.getReporter());
        }
        
        // Notify organization admins (if not the commenter and not already notified as reporter)
        if (report.getTargetOrganizations() != null && !report.getTargetOrganizations().isEmpty()) {
            for (Organization org : report.getTargetOrganizations()) {
                List<User> admins = userRepository.findByOrganizationAndUserType(org, User.UserType.ORGANIZATION_ADMIN);
                for (User admin : admins) {
                    if (!admin.getId().equals(commenter.getId()) && 
                        (report.getReporter() == null || !admin.getId().equals(report.getReporter().getId()))) {
                        
                        String adminTitle = "New Comment on Assigned Report: " + report.getTitle();
                        String adminMessage = String.format("%s commented on a report assigned to your organization: %s", 
                            commenter.getFullName(), 
                            comment.getContent().length() > 50 ? 
                                comment.getContent().substring(0, 50) + "..." : 
                                comment.getContent());
                        
                        Notification adminNotification = new Notification(adminTitle, adminMessage, 
                            Notification.NotificationType.NEW_COMMENT, admin, report);
                        adminNotification.setComment(comment);
                        adminNotification.setActionUrl("/reports/" + report.getId());
                        
                        Notification savedAdmin = notificationRepository.save(adminNotification);
                        sendRealTimeNotification(admin, savedAdmin);
                    }
                }
            }
        }
    }

    /**
     * Create a comment reply notification
     */
    public void createCommentReplyNotification(Comment reply, User recipient) {
        String title = "Reply to Your Comment";
        String message = String.format("%s replied to your comment: %s", 
            reply.getUser().getFullName(), 
            reply.getContent().length() > 50 ? 
                reply.getContent().substring(0, 50) + "..." : 
                reply.getContent());
        
        Notification notification = new Notification(title, message, Notification.NotificationType.COMMENT_REPLY, recipient, reply.getReport());
        notification.setComment(reply);
        notification.setActionUrl("/reports/" + reply.getReport().getId());
        
        Notification saved = notificationRepository.save(notification);
        
        // Send real-time notification
        sendRealTimeNotification(recipient, saved);
    }

    /**
     * Create a chat message notification
     */
    public void createChatNotification(User sender, User recipient, String messageContent, Report report) {
        String title = "New Message from " + sender.getFullName();
        String message = messageContent.length() > 100 ? 
            messageContent.substring(0, 100) + "..." : 
            messageContent;
        
        Notification notification = new Notification(title, message, Notification.NotificationType.NEW_CHAT_MESSAGE, recipient, report);
        notification.setActionUrl("/chat/" + sender.getId());
        
        Notification saved = notificationRepository.save(notification);
        
        // Send real-time notification
        sendRealTimeNotification(recipient, saved);
    }

    /**
     * Create a report assignment notification
     */
    public void createReportAssignmentNotification(Report report, User assignee) {
        String title = "New Task Assigned: " + report.getTitle();
        String message = String.format("You have been assigned to work on: %s", report.getTitle());
        
        Notification notification = new Notification(title, message, Notification.NotificationType.REPORT_ASSIGNED, assignee, report);
        notification.setActionUrl("/reports/" + report.getId());
        
        Notification saved = notificationRepository.save(notification);
        
        // Send real-time notification
        sendRealTimeNotification(assignee, saved);
    }

    /**
     * Create a report status change notification
     */
    public void createStatusChangeNotification(Report report, User recipient, Report.Status oldStatus, Report.Status newStatus) {
        String title = "Status Update: " + report.getTitle();
        String message = String.format("Report status changed from %s to %s", 
            oldStatus.toString().replace("_", " "), 
            newStatus.toString().replace("_", " "));
        
        Notification notification = new Notification(title, message, Notification.NotificationType.REPORT_STATUS_CHANGE, recipient, report);
        notification.setActionUrl("/reports/" + report.getId());
        
        Notification saved = notificationRepository.save(notification);
        
        // Send real-time notification
        sendRealTimeNotification(recipient, saved);
    }

    /**
     * Create status change notifications for both reporter and organization admins
     */
    public void createStatusChangeNotificationForAll(Report report, Report.Status oldStatus, Report.Status newStatus) {
        // Notify the reporter
        if (report.getReporter() != null) {
            createStatusChangeNotification(report, report.getReporter(), oldStatus, newStatus);
        }
        
        // Notify organization admins
        if (report.getTargetOrganizations() != null && !report.getTargetOrganizations().isEmpty()) {
            for (Organization org : report.getTargetOrganizations()) {
                List<User> admins = userRepository.findByOrganizationAndUserType(org, User.UserType.ORGANIZATION_ADMIN);
                for (User admin : admins) {
                    if (report.getReporter() == null || !admin.getId().equals(report.getReporter().getId())) {
                        String adminTitle = "Status Update on Assigned Report: " + report.getTitle();
                        String adminMessage = String.format("Report status changed from %s to %s by staff member", 
                            oldStatus.toString().replace("_", " "), 
                            newStatus.toString().replace("_", " "));
                        
                        Notification adminNotification = new Notification(adminTitle, adminMessage, 
                            Notification.NotificationType.REPORT_STATUS_CHANGE, admin, report);
                        adminNotification.setActionUrl("/reports/" + report.getId());
                        
                        Notification savedAdmin = notificationRepository.save(adminNotification);
                        sendRealTimeNotification(admin, savedAdmin);
                    }
                }
            }
        }
    }

    /**
     * Create a report resolution notification
     */
    public void createReportResolvedNotification(Report report, User recipient) {
        String title = "Report Resolved: " + report.getTitle();
        String message = "Your report has been successfully resolved. Thank you for your contribution!";
        
        Notification notification = new Notification(title, message, Notification.NotificationType.REPORT_RESOLVED, recipient, report);
        notification.setActionUrl("/reports/" + report.getId());
        
        Notification saved = notificationRepository.save(notification);
        
        // Send real-time notification
        sendRealTimeNotification(recipient, saved);
    }

    /**
     * Get all notifications for a user
     */
    @Transactional(readOnly = true)
    public Page<Notification> getUserNotifications(User user, Pageable pageable) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user, pageable);
    }

    /**
     * Get unread notifications for a user
     */
    @Transactional(readOnly = true)
    public List<Notification> getUnreadNotifications(User user) {
        return notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
    }

    /**
     * Get unread notification count for a user
     */
    public long getUnreadNotificationCount(User user) {
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    /**
     * Mark notification as read
     */
    public void markAsRead(Long notificationId) {
        notificationRepository.markAsRead(notificationId, LocalDateTime.now());
    }

    /**
     * Mark all notifications as read for a user
     */
    public void markAllAsRead(User user) {
        notificationRepository.markAllAsReadForUser(user, LocalDateTime.now());
    }

    /**
     * Get recent notifications (last 7 days)
     */
    public List<Notification> getRecentNotifications(User user) {
        LocalDateTime since = LocalDateTime.now().minusDays(7);
        return notificationRepository.findRecentNotifications(user, since);
    }

    /**
     * Clean up old notifications (older than 30 days)
     */
    public void cleanupOldNotifications() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);
        notificationRepository.deleteOldNotifications(cutoffDate);
    }

    /**
     * Clear all notifications for a user (for testing purposes)
     */
    public void clearAllNotifications(Long userId) {
        notificationRepository.deleteByUserId(userId);
    }

    /**
     * General purpose notification creation method (for testing and custom notifications)
     */
    public Notification createNotification(User user, String title, String message, 
                                         Notification.NotificationType type, Report report, 
                                         Comment comment, Integer progressPercentage) {
        Notification notification = new Notification(title, message, type, user, report);
        if (comment != null) {
            // Set comment if provided
            notification.setComment(comment);
        }
        if (progressPercentage != null) {
            notification.setProgressPercentage(progressPercentage);
        }
        
        Notification saved = notificationRepository.save(notification);
        
        // Send real-time notification
        sendRealTimeNotification(user, saved);
        
        return saved;
    }

    /**
     * Send real-time notification via WebSocket
     */
    private void sendRealTimeNotification(User user, Notification notification) {
        try {
            NotificationResponse response = new NotificationResponse(notification);
            messagingTemplate.convertAndSendToUser(
                user.getId().toString(),
                "/queue/notifications",
                response
            );
        } catch (Exception e) {
            // Log error but don't fail the main operation
            System.err.println("Failed to send real-time notification: " + e.getMessage());
        }
    }
}
