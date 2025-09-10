package com.ambiguous.fixpoint.controller;

import com.ambiguous.fixpoint.dto.NotificationResponse;
import com.ambiguous.fixpoint.entity.Notification;
import com.ambiguous.fixpoint.entity.User;
import com.ambiguous.fixpoint.repository.UserRepository;
import com.ambiguous.fixpoint.security.UserPrincipal;
import com.ambiguous.fixpoint.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get all notifications for the current user
     */
    @GetMapping
    public ResponseEntity<Page<NotificationResponse>> getUserNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userRepository.findByIdWithOrganization(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notifications = notificationService.getUserNotifications(user, pageable);
        Page<NotificationResponse> response = notifications.map(NotificationResponse::new);

        return ResponseEntity.ok(response);
    }

    /**
     * Get unread notifications for the current user
     */
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userRepository.findByIdWithOrganization(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Notification> notifications = notificationService.getUnreadNotifications(user);
        List<NotificationResponse> response = notifications.stream()
                .map(NotificationResponse::new)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get unread notification count
     */
    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadNotificationCount(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        if (currentUser == null) {
            Map<String, Long> response = new HashMap<>();
            response.put("count", 0L);
            return ResponseEntity.ok(response);
        }

        User user = userRepository.findByIdWithOrganization(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        long count = notificationService.getUnreadNotificationCount(user);
        
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Mark a specific notification as read
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<Map<String, String>> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        notificationService.markAsRead(id);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Notification marked as read");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Mark all notifications as read for the current user
     */
    @PutMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userRepository.findByIdWithOrganization(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        notificationService.markAllAsRead(user);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "All notifications marked as read");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get recent notifications (last 7 days)
     */
    @GetMapping("/recent")
    public ResponseEntity<List<NotificationResponse>> getRecentNotifications(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        User user = userRepository.findByIdWithOrganization(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Notification> notifications = notificationService.getRecentNotifications(user);
        List<NotificationResponse> response = notifications.stream()
                .map(NotificationResponse::new)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Clear all notifications for the current user (for testing)
     */
    @DeleteMapping("/clear-all")
    public ResponseEntity<Map<String, String>> clearAllNotifications(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            User user = userRepository.findByIdWithOrganization(currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            notificationService.clearAllNotifications(user.getId());
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "All notifications cleared");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to clear notifications");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Test progress notification endpoint
     */
    @PostMapping("/test-progress")
    public ResponseEntity<NotificationResponse> testProgressNotification(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody Map<String, Object> request) {
        try {
            User user = userRepository.findByIdWithOrganization(currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            String title = (String) request.get("title");
            String message = (String) request.get("message");
            Integer progressPercentage = (Integer) request.get("progressPercentage");
            String type = (String) request.get("type");
            
            Notification notification = notificationService.createNotification(
                user, 
                title, 
                message, 
                Notification.NotificationType.valueOf(type),
                null, // no specific report
                null, // no specific comment
                progressPercentage
            );
            
            return ResponseEntity.ok(new NotificationResponse(notification));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Test comment notification endpoint
     */
    @PostMapping("/test-comment")
    public ResponseEntity<NotificationResponse> testCommentNotification(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody Map<String, Object> request) {
        try {
            User user = userRepository.findByIdWithOrganization(currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            String title = (String) request.get("title");
            String message = (String) request.get("message");
            String type = (String) request.get("type");
            
            Notification notification = notificationService.createNotification(
                user, 
                title, 
                message, 
                Notification.NotificationType.valueOf(type),
                null, // no specific report
                null, // no specific comment
                null  // no progress
            );
            
            return ResponseEntity.ok(new NotificationResponse(notification));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
