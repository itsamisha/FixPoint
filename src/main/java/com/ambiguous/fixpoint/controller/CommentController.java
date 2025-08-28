package com.ambiguous.fixpoint.controller;

import com.ambiguous.fixpoint.dto.CommentRequest;
import com.ambiguous.fixpoint.dto.CommentResponse;
import com.ambiguous.fixpoint.entity.Comment;
import com.ambiguous.fixpoint.entity.Report;
import com.ambiguous.fixpoint.entity.User;
import com.ambiguous.fixpoint.repository.CommentRepository;
import com.ambiguous.fixpoint.repository.ReportRepository;
import com.ambiguous.fixpoint.repository.UserRepository;
import com.ambiguous.fixpoint.security.UserPrincipal;
import com.ambiguous.fixpoint.dto.UserSummary;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports/{reportId}/comments")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CommentController {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<CommentResponse>> listComments(@PathVariable Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        List<Comment> comments = commentRepository.findByReportOrderByCreatedAtAsc(report);
        List<CommentResponse> response = comments.stream().map(this::toResponse).collect(Collectors.toList());
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
        return ResponseEntity.ok(toResponse(saved));
    }

    private CommentResponse toResponse(Comment comment) {
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
        return cr;
    }
}


