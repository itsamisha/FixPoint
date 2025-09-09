package com.ambiguous.fixpoint.controller;

import com.ambiguous.fixpoint.dto.CommentRequest;
import com.ambiguous.fixpoint.dto.CommentResponse;
import com.ambiguous.fixpoint.dto.CommentReactionRequest;
import com.ambiguous.fixpoint.entity.Comment;
import com.ambiguous.fixpoint.entity.CommentReaction;
import com.ambiguous.fixpoint.entity.Report;
import com.ambiguous.fixpoint.entity.User;
import com.ambiguous.fixpoint.repository.CommentRepository;
import com.ambiguous.fixpoint.repository.CommentReactionRepository;
import com.ambiguous.fixpoint.repository.ReportRepository;
import com.ambiguous.fixpoint.repository.UserRepository;
import com.ambiguous.fixpoint.security.UserPrincipal;
import com.ambiguous.fixpoint.dto.UserSummary;
import com.ambiguous.fixpoint.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports/{reportId}/comments")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CommentController {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private CommentReactionRepository reactionRepository;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<CommentResponse>> listComments(
            @PathVariable Long reportId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        
        User user = currentUser != null ? 
                userRepository.findById(currentUser.getId()).orElse(null) : null;
        
        List<Comment> comments = commentRepository.findByReportAndParentCommentIsNullOrderByCreatedAtAsc(report);
        List<CommentResponse> response = comments.stream()
                .map(comment -> toResponse(comment, user))
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long reportId,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        Comment comment = new Comment(request.getContent(), report, user);
        Comment saved = commentRepository.save(comment);
        
        // Send notification to report owner and organization admins (if not the commenter)
        notificationService.createCommentNotificationForAll(saved);
        
        return ResponseEntity.ok(toResponse(saved, user));
    }

    @PostMapping("/{commentId}/replies")
    public ResponseEntity<CommentResponse> addReply(
            @PathVariable Long reportId,
            @PathVariable Long commentId,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        Comment parentComment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Parent comment not found"));

        Comment reply = new Comment(request.getContent(), report, user, parentComment);
        Comment saved = commentRepository.save(reply);
        
        // Send notification to parent comment author (if not the same user)
        if (!parentComment.getUser().getId().equals(user.getId())) {
            notificationService.createCommentReplyNotification(saved, parentComment.getUser());
        }
        
        return ResponseEntity.ok(toResponse(saved, user));
    }

    @PostMapping("/{commentId}/reactions")
    public ResponseEntity<CommentResponse> toggleReaction(
            @PathVariable Long reportId,
            @PathVariable Long commentId,
            @Valid @RequestBody CommentReactionRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Check if user already reacted
        CommentReaction existingReaction = reactionRepository.findByUserAndComment(user, comment).orElse(null);
        
        if (existingReaction != null) {
            if (existingReaction.getType() == request.getType()) {
                // Remove reaction if same type
                reactionRepository.delete(existingReaction);
            } else {
                // Update reaction type
                existingReaction.setType(request.getType());
                reactionRepository.save(existingReaction);
            }
        } else {
            // Add new reaction
            CommentReaction reaction = new CommentReaction(request.getType(), user, comment);
            reactionRepository.save(reaction);
        }

        return ResponseEntity.ok(toResponse(comment, user));
    }

    @GetMapping("/{commentId}/replies")
    public ResponseEntity<List<CommentResponse>> getReplies(
            @PathVariable Long reportId,
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Comment parentComment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        User user = currentUser != null ? 
                userRepository.findById(currentUser.getId()).orElse(null) : null;
        
        List<Comment> replies = commentRepository.findByParentCommentOrderByCreatedAtAsc(parentComment);
        List<CommentResponse> response = replies.stream()
                .map(reply -> toResponse(reply, user))
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    private CommentResponse toResponse(Comment comment, User currentUser) {
        CommentResponse cr = new CommentResponse();
        cr.setId(comment.getId());
        cr.setContent(comment.getContent());
        cr.setCreatedAt(comment.getCreatedAt());
        
        User user = comment.getUser();
        UserSummary us = new UserSummary();
        us.setId(user.getId());
        us.setUsername(user.getUsername());
        us.setEmail(user.getEmail());
        us.setFullName(user.getFullName());
        us.setRole(user.getRole());
        us.setIsVolunteer(user.getIsVolunteer());
        cr.setUser(us);

        // Set reaction counts
        Map<CommentReaction.ReactionType, Long> reactionCounts = reactionRepository.findByComment(comment)
                .stream()
                .collect(Collectors.groupingBy(
                        CommentReaction::getType,
                        Collectors.counting()
                ));
        // Ensure reactionCounts is never null
        if (reactionCounts == null) {
            reactionCounts = new java.util.HashMap<>();
        }
        cr.setReactionCounts(reactionCounts);

        // Set user's reaction if logged in
        if (currentUser != null) {
            reactionRepository.findByUserAndComment(currentUser, comment)
                    .ifPresent(reaction -> cr.setUserReaction(reaction.getType()));
        }

        // Set reply count
        Long replyCount = commentRepository.countByParentComment(comment);
        cr.setReplyCount(replyCount);

        return cr;
    }
}


